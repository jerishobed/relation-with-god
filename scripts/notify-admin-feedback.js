/**
 * Relations With God - Feedback, Testimonies & Prayer Request Admin Notifier
 * 
 * Sends an email notification to jerishbtech@gmail.com whenever
 * a believer submits a feedback, prayer request, testimony, or booklet request on the website.
 * 
 * Runs:
 * - Automatically every 15 minutes via GitHub Actions cron
 * - Can be dispatched manually or via workflow_dispatch
 */

const https = require('https');
const nodemailer = require('nodemailer');
const { execSync } = require('child_process');

const PROJECT_ID = 'jerish-51bd7';
const ADMIN_EMAIL = process.env.ADMIN_REPORT_EMAIL || 'jerishbtech@gmail.com';

async function getAccessToken() {
  if (process.env.GCP_ACCESS_TOKEN) {
    return process.env.GCP_ACCESS_TOKEN.trim();
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      const crypto = require('crypto');
      const now = Math.floor(Date.now() / 1000);
      const claim = {
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      };

      const base64UrlEncode = (str) => Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const header = { alg: 'RS256', typ: 'JWT' };
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedClaim = base64UrlEncode(JSON.stringify(claim));
      const unsignedJwt = `${encodedHeader}.${encodedClaim}`;

      const sign = crypto.createSign('RSA-SHA256');
      sign.update(unsignedJwt);
      sign.end();
      const signature = sign.sign(sa.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const jwt = `${unsignedJwt}.${signature}`;

      const resData = await new Promise((resolve, reject) => {
        const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;
        const req = https.request('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
          });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      if (resData.access_token) return resData.access_token;
    } catch (e) {
      console.warn('Could not derive token from FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }

  try {
    const token = execSync('gcloud auth print-access-token 2>/dev/null', { encoding: 'utf8' }).trim().split('\n')[0];
    if (token) return token;
  } catch {}

  throw new Error('No valid GCP access token found.');
}

function firestoreRequest(path, method = 'GET', body = null, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`);
    const req = https.request(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-goog-user-project': PROJECT_ID,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const res = { id: doc.name.split('/').pop(), _name: doc.name };
  for (const [key, val] of Object.entries(doc.fields)) {
    if (val.stringValue !== undefined) res[key] = val.stringValue;
    else if (val.integerValue !== undefined) res[key] = parseInt(val.integerValue, 10);
    else if (val.booleanValue !== undefined) res[key] = val.booleanValue;
    else if (val.timestampValue !== undefined) res[key] = val.timestampValue;
    else if (val.arrayValue !== undefined) {
      res[key] = (val.arrayValue.values || []).map(v => v.stringValue || v.integerValue || v);
    } else if (val.mapValue !== undefined) {
      const sub = {};
      for (const [mk, mv] of Object.entries(val.mapValue.fields || {})) {
        sub[mk] = mv.stringValue || mv.integerValue || mv.booleanValue || mv;
      }
      res[key] = sub;
    }
  }
  return res;
}

function createTransporter() {
  if (process.env.RESEND_API_KEY) {
    return { isResend: true, apiKey: process.env.RESEND_API_KEY.trim() };
  }
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });
  }
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return null;
}

async function dispatchEmail(transporter, { to, subject, html, text }) {
  if (!transporter) {
    console.log(`[DRY-RUN] To: ${to} | Subject: ${subject}`);
    return { dryRun: true };
  }

  if (transporter.isResend) {
    const payload = {
      from: process.env.RESEND_FROM || 'Relations With God <connect@relationswithgod.in>',
      to: [to],
      subject,
      html
    };
    if (text) payload.text = text;
    const postData = JSON.stringify(payload);

    return new Promise((resolve, reject) => {
      const req = https.request('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${transporter.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body || '{}'));
          } else {
            reject(new Error(`Resend Error ${res.statusCode}: ${body}`));
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  return transporter.sendMail({
    from: `"Relations With God Alerts" <${process.env.GMAIL_USER || 'connect@relationswithgod.in'}>`,
    to,
    subject,
    html,
    text
  });
}

function getCategoryBadge(category) {
  switch (category) {
    case 'testimonial':
      return { labelTa: 'சாட்சி & ஆவிக்குரிய ஆசீர்வாதம்', labelEn: 'Testimonial & Blessing', color: '#B91C1C', bg: '#FEE2E2', icon: '💖' };
    case 'prayer_request':
      return { labelTa: 'ஜெப விண்ணப்பம்', labelEn: 'Prayer Request', color: '#6B21A8', bg: '#F3E8FF', icon: '🙏' };
    case 'suggestion':
      return { labelTa: 'இணையதள யோசனை / ஆலோசனை', labelEn: 'Website Suggestion', color: '#B45309', bg: '#FEF3C7', icon: '💡' };
    case 'question':
      return { labelTa: 'கேள்வி / உதவி', labelEn: 'Question & Help', color: '#1D4ED8', bg: '#DBEAFE', icon: '❓' };
    default:
      return { labelTa: 'கருத்து', labelEn: 'General Feedback', color: '#15803D', bg: '#DCFCE7', icon: '✍️' };
  }
}

async function markFeedbackAsNotified(docId, token) {
  const path = `feedback/${docId}?updateMask.fieldPaths=adminNotified&updateMask.fieldPaths=adminNotifiedAt`;
  const body = {
    fields: {
      adminNotified: { booleanValue: true },
      adminNotifiedAt: { stringValue: new Date().toISOString() }
    }
  };
  return firestoreRequest(path, 'PATCH', body, token);
}

async function markBookletAsNotified(docId, token) {
  const path = `booklet_requests/${docId}?updateMask.fieldPaths=adminNotified&updateMask.fieldPaths=adminNotifiedAt`;
  const body = {
    fields: {
      adminNotified: { booleanValue: true },
      adminNotifiedAt: { stringValue: new Date().toISOString() }
    }
  };
  return firestoreRequest(path, 'PATCH', body, token);
}

async function processFeedbackSubmissions(token, transporter) {
  console.log(`\n--- Checking /feedback collection ---`);
  const rawFeedback = await firestoreRequest('feedback?pageSize=100', 'GET', null, token);
  const items = (rawFeedback?.documents || []).map(parseFirestoreDoc).filter(Boolean);

  console.log(`Total feedback documents in collection: ${items.length}`);
  const pending = items.filter(f => !f.adminNotified);
  console.log(`Unnotified submissions found: ${pending.length}`);

  for (const item of pending) {
    const badge = getCategoryBadge(item.category);
    const starString = '⭐'.repeat(item.rating || 5);
    const senderName = item.fullName || 'Anonymous Believer';
    const senderEmail = item.email || '';
    const dateFormatted = item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' : 'Recently';

    const subject = `🔔 [${badge.icon} ${badge.labelEn.toUpperCase()}] from ${senderName} | Relations With God`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; padding: 24px; color: #2D241E;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7A1C1C, #9B2C2C, #C59A45); padding: 26px 22px; color: #FFFFFF;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
            Relations With God • New Notification Alert
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800;">
            ${badge.icon} New ${badge.labelEn} Received
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 26px 22px;">
          
          <!-- Category Badge & Rating -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
            <span style="background: ${badge.bg}; color: ${badge.color}; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 13px;">
              ${badge.icon} ${badge.labelTa} (${badge.labelEn})
            </span>
            <span style="font-size: 14px;">
              ${starString} <strong style="color: #664D03; font-size: 13px;">(${item.rating || 5}/5)</strong>
            </span>
          </div>

          <!-- Believer Details Card -->
          <div style="background: #FDF9F3; border: 1px solid #EADBCC; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="width: 90px; color: #7A6F66; font-weight: bold;">Sender:</td>
                <td style="color: #2D241E; font-weight: bold;">${senderName}</td>
              </tr>
              <tr>
                <td style="color: #7A6F66; font-weight: bold;">Email:</td>
                <td>
                  ${senderEmail ? `<a href="mailto:${senderEmail}" style="color: #9B2C2C; text-decoration: none; font-weight: bold;">${senderEmail}</a>` : '<span style="color: #999;">Not provided</span>'}
                </td>
              </tr>
              <tr>
                <td style="color: #7A6F66; font-weight: bold;">Time (IST):</td>
                <td style="color: #5C4E43;">${dateFormatted}</td>
              </tr>
            </table>
          </div>

          <!-- Message Content Box -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #7A1C1C; letter-spacing: 0.5px; margin-bottom: 8px;">
              Message / Reflection / Prayer Request:
            </div>
            <div style="background: #FFFFFF; border-left: 4px solid #7A1C1C; padding: 16px; border-radius: 4px 10px 10px 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-size: 14px; line-height: 1.7; color: #2D241E; white-space: pre-wrap;">
${item.message || '(No message content)'}
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="text-align: center; padding-top: 10px;">
            ${senderEmail ? `
              <a href="mailto:${senderEmail}?subject=Re: Your ${badge.labelEn} on Relations With God" style="display: inline-block; background: #7A1C1C; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(122, 28, 28, 0.3); margin-right: 8px;">
                ✉️ Reply to ${senderName}
              </a>
            ` : ''}
            <a href="https://relationswithgod.in/admin" style="display: inline-block; background: #FAF8F5; border: 1px solid #D5C4B1; color: #644D36; text-decoration: none; font-weight: bold; font-size: 13px; padding: 11px 20px; border-radius: 10px;">
              Open Admin Console
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #EADBCC; margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #9A8B80;">
            Relations With God Ministries • Automated Real-time Alert System<br>
            <a href="https://relationswithgod.in" style="color: #9B2C2C; text-decoration: none;">relationswithgod.in</a>
          </div>

        </div>
      </div>
    </div>
    `;

    const text = `[${badge.icon} NEW ${badge.labelEn.toUpperCase()}]\n\nSender: ${senderName} (${senderEmail || 'No email'})\nCategory: ${badge.labelTa} / ${badge.labelEn}\nRating: ${item.rating || 5}/5\nTime: ${dateFormatted}\n\nMessage:\n${item.message}\n\nRelations With God Ministries • https://relationswithgod.in`;

    console.log(`Sending alert for feedback ${item.id} from "${senderName}" to ${ADMIN_EMAIL}...`);
    try {
      await dispatchEmail(transporter, {
        to: ADMIN_EMAIL,
        subject,
        html,
        text
      });
      console.log(`✓ Email delivered to ${ADMIN_EMAIL}`);
      await markFeedbackAsNotified(item.id, token);
      console.log(`✓ Marked ${item.id} as notified in Firestore.`);
    } catch (err) {
      console.error(`❌ Failed to send alert for ${item.id}:`, err.message);
    }
  }
}

async function processBookletSubmissions(token, transporter) {
  console.log(`\n--- Checking /booklet_requests collection ---`);
  const rawBooklets = await firestoreRequest('booklet_requests?pageSize=100', 'GET', null, token);
  const items = (rawBooklets?.documents || []).map(parseFirestoreDoc).filter(Boolean);

  console.log(`Total booklet requests in collection: ${items.length}`);
  const pending = items.filter(b => !b.adminNotified);
  console.log(`Unnotified booklet requests found: ${pending.length}`);

  for (const item of pending) {
    const senderName = item.fullName || 'Anonymous Believer';
    const senderEmail = item.email || '';
    const phone = item.phoneNumber || '';
    const dateFormatted = item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' : 'Recently';
    const hasPrayer = Boolean(item.prayerRequest && item.prayerRequest.trim().length > 0);

    const subject = hasPrayer
      ? `🙏 [BOOKLET & PRAYER REQUEST] from ${senderName} | Relations With God`
      : `📦 [NEW BOOKLET REQUEST] from ${senderName} | Relations With God`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; padding: 24px; color: #2D241E;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1B3B2B, #2A5C43, #C59A45); padding: 26px 22px; color: #FFFFFF;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
            Relations With God • Booklet Dispatch Alert
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800;">
            ${hasPrayer ? '🙏 New Booklet & Prayer Request' : '📦 New Hardcopy Booklet Request'}
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 26px 22px;">
          
          <!-- Details Card -->
          <div style="background: #FDF9F3; border: 1px solid #EADBCC; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="width: 100px; color: #7A6F66; font-weight: bold;">Recipient:</td>
                <td style="color: #2D241E; font-weight: bold;">${senderName}</td>
              </tr>
              <tr>
                <td style="color: #7A6F66; font-weight: bold;">Phone:</td>
                <td><a href="tel:${phone}" style="color: #1B5E20; text-decoration: none; font-weight: bold;">${phone || 'Not provided'}</a></td>
              </tr>
              <tr>
                <td style="color: #7A6F66; font-weight: bold;">Email:</td>
                <td>${senderEmail ? `<a href="mailto:${senderEmail}" style="color: #9B2C2C; text-decoration: none;">${senderEmail}</a>` : 'Not provided'}</td>
              </tr>
              <tr>
                <td style="color: #7A6F66; font-weight: bold;">Address:</td>
                <td style="color: #2D241E;">
                  ${item.addressLine1 || ''}${item.addressLine2 ? ', ' + item.addressLine2 : ''}<br>
                  ${item.city || ''}, ${item.state || ''} - ${item.pincode || ''}<br>
                  ${item.country || 'India'}
                </td>
              </tr>
              <tr>
                <td style="color: #7A6F66; font-weight: bold;">Language:</td>
                <td style="color: #2D241E; font-weight: bold;">${item.languagePreference === 'en' ? 'English' : 'Tamil (தமிழ்)'}</td>
              </tr>
              <tr>
                <td style="color: #7A6F66; font-weight: bold;">Time (IST):</td>
                <td style="color: #5C4E43;">${dateFormatted}</td>
              </tr>
            </table>
          </div>

          <!-- Prayer Request Box (if provided) -->
          ${hasPrayer ? `
            <div style="margin-bottom: 24px;">
              <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #6B21A8; letter-spacing: 0.5px; margin-bottom: 8px;">
                🙏 Believer's Prayer Request:
              </div>
              <div style="background: #FAF5FF; border-left: 4px solid #6B21A8; padding: 16px; border-radius: 4px 10px 10px 4px; font-size: 14px; line-height: 1.7; color: #2D241E; white-space: pre-wrap;">
${item.prayerRequest}
              </div>
            </div>
          ` : ''}

          <!-- Quick Action Buttons -->
          <div style="text-align: center; padding-top: 10px;">
            <a href="https://relationswithgod.in/admin" style="display: inline-block; background: #1B5E20; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(27, 94, 32, 0.3); margin-right: 8px;">
              📦 Open Booklet Manager
            </a>
            ${phone ? `
              <a href="https://wa.me/91${phone.replace(/\D/g, '')}" style="display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 20px; border-radius: 10px;">
                WhatsApp
              </a>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #EADBCC; margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #9A8B80;">
            Relations With God Ministries • Automated Dispatch Alert System<br>
            <a href="https://relationswithgod.in" style="color: #1B5E20; text-decoration: none;">relationswithgod.in</a>
          </div>

        </div>
      </div>
    </div>
    `;

    const text = `[NEW BOOKLET REQUEST]\n\nRecipient: ${senderName}\nPhone: ${phone}\nEmail: ${senderEmail}\nAddress: ${item.addressLine1}, ${item.city}, ${item.state} - ${item.pincode}\nLanguage: ${item.languagePreference}\n\n${hasPrayer ? `Prayer Request:\n${item.prayerRequest}\n\n` : ''}Relations With God Ministries • https://relationswithgod.in`;

    console.log(`Sending alert for booklet request ${item.id} from "${senderName}" to ${ADMIN_EMAIL}...`);
    try {
      await dispatchEmail(transporter, {
        to: ADMIN_EMAIL,
        subject,
        html,
        text
      });
      console.log(`✓ Email delivered to ${ADMIN_EMAIL}`);
      await markBookletAsNotified(item.id, token);
      console.log(`✓ Marked ${item.id} as notified in Firestore.`);
    } catch (err) {
      console.error(`❌ Failed to send alert for booklet ${item.id}:`, err.message);
    }
  }
}

async function runNotifier() {
  console.log(`Starting Relations With God Notification Watcher...`);
  const token = await getAccessToken();
  const transporter = createTransporter();

  await processFeedbackSubmissions(token, transporter);
  await processBookletSubmissions(token, transporter);

  console.log(`Notification check completed successfully.`);
}

runNotifier().catch(err => {
  console.error('Fatal error during notification run:', err);
  process.exit(1);
});
