/**
 * Relations With God - Daily Admin Activity & Progress Report
 * 
 * Sends an executive daily summary to the founder (jerishbtech@gmail.com):
 * - How many completed reading today
 * - Exactly what each member completed (Day #, Tamil & English chapter references)
 * - Notes & reflections submitted today
 * - New members joined today
 * - Community health overview
 */

const https = require('https');
const nodemailer = require('nodemailer');
const { execSync } = require('child_process');
const readingPlan = require('../src/data/readingPlan.json');

const PROJECT_ID = 'jerish-51bd7';
const ADMIN_EMAIL = process.env.ADMIN_REPORT_EMAIL || 'jerishbtech@gmail.com';

function getDayPlanDetails(dayNum) {
  const d = readingPlan.days.find(x => x.day === dayNum);
  if (!d) return { tamilRef: `Day ${dayNum}`, englishRef: `Day ${dayNum}` };
  const tamilRef = d.chapters.map(c => c.tamilRef).join(', ');
  const englishRef = d.chapters.map(c => c.englishRef).join(', ');
  return { tamilRef, englishRef };
}

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
  const res = { id: doc.name.split('/').pop() };
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
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });
  }
  return null;
}

async function dispatchEmail(transporter, { to, subject, html, text }) {
  if (!transporter) return false;
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
    from: `"Relations With God Reports" <${process.env.GMAIL_USER || 'connect@relationswithgod.in'}>`,
    to,
    subject,
    html,
    text
  });
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

async function generateAndSendReport() {
  const todayStr = getTodayString();
  console.log(`Generating Admin Daily Report for ${todayStr}...`);

  const token = await getAccessToken();
  const transporter = createTransporter();

  // 1. Fetch all registered users
  const rawUsers = await firestoreRequest('users?pageSize=100', 'GET', null, token);
  const users = (rawUsers?.documents || []).map(parseFirestoreDoc).filter(Boolean);

  // Exclude founder self from stats if desired, or keep track separately
  const communityUsers = users.filter(u => {
    const em = (u.email || '').toLowerCase();
    return em !== 'jerishbtech@gmail.com' && em !== 'jerishobed@gmail.com' && em !== 'relationswithgod@gmail.com';
  });

  const totalMembers = communityUsers.length;
  const newMembersToday = [];
  const activeMembersToday = [];
  const completedTodayList = [];

  for (const u of communityUsers) {
    const joined = u.joinedDate || '';
    if (joined === todayStr) {
      newMembersToday.push(u);
    }

    const rawProg = await firestoreRequest(`users/${u.id}/progress/current`, 'GET', null, token);
    const prog = parseFirestoreDoc(rawProg);

    const isTodayActive = (u.lastActiveDate === todayStr) || (prog?.lastActiveDate === todayStr);

    if (isTodayActive) {
      activeMembersToday.push({ user: u, prog });

      const completedDays = (prog?.completedDays || []).map(d => parseInt(d, 10)).sort((a, b) => a - b);
      const totalChapters = prog?.completedChapters?.length || u.completedChaptersCount || 0;
      const streak = prog?.currentStreak || u.currentStreak || 0;
      const notes = prog?.notes || {};

      // If user has completed days and active today
      if (completedDays.length > 0) {
        // The most recently completed day is the latest in their completed array
        const latestDay = completedDays[completedDays.length - 1];
        const dayDetails = getDayPlanDetails(latestDay);

        completedTodayList.push({
          name: u.name || 'Anonymous',
          email: u.email,
          latestDay,
          tamilRef: dayDetails.tamilRef,
          englishRef: dayDetails.englishRef,
          totalCompletedDays: completedDays.length,
          totalChapters,
          streak,
          notesCount: Object.keys(notes).length,
          latestNote: notes[latestDay.toString()] || null
        });
      }
    }
  }

  console.log(`Summary:`);
  console.log(`- Total Community Members: ${totalMembers}`);
  console.log(`- New Joined Today: ${newMembersToday.length}`);
  console.log(`- Active Today: ${activeMembersToday.length}`);
  console.log(`- Reading Completed Today: ${completedTodayList.length}`);

  // Format HTML & Plain Text
  const subject = `📊 Daily Bible Reading Report - ${todayStr}: ${completedTodayList.length} Completed | Relations With God`;

  const completedTableRows = completedTodayList.map((item, idx) => `
    <tr style="border-bottom: 1px solid #EADBCC; ${idx % 2 === 1 ? 'background-color: #FDFBF7;' : ''}">
      <td style="padding: 12px 10px; font-weight: bold; color: #2D241E;">
        ${item.name}
        <div style="font-size: 11px; font-weight: normal; color: #7A6F66;">${item.email}</div>
      </td>
      <td style="padding: 12px 10px; text-align: center;">
        <span style="background: #E8F5E9; color: #1B5E20; padding: 4px 10px; border-radius: 12px; font-weight: 800; font-size: 13px;">
          Day ${item.latestDay}
        </span>
      </td>
      <td style="padding: 12px 10px; font-size: 13px; color: #4A3E36;">
        <strong>${item.tamilRef}</strong>
        <div style="font-size: 11px; color: #6E5D53; font-style: italic;">(${item.englishRef})</div>
      </td>
      <td style="padding: 12px 10px; text-align: center; font-size: 12px;">
        <div style="font-weight: bold; color: #7A1C1C;">${item.totalCompletedDays} / 365 Days</div>
        <div style="font-size: 11px; color: #7A6F66;">${item.totalChapters} Ch.</div>
      </td>
      <td style="padding: 12px 10px; text-align: center;">
        ${item.streak > 0 ? `<span style="background: #FFF3CD; color: #856404; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">🔥 ${item.streak}d</span>` : '<span style="color: #999;">-</span>'}
      </td>
      <td style="padding: 12px 10px; font-size: 11.5px; color: #5C4E43; max-width: 180px;">
        ${item.latestNote ? `“<em>${item.latestNote}</em>”` : '<span style="color: #A09388;">No note</span>'}
      </td>
    </tr>
  `).join('');

  const newMembersRows = newMembersToday.map(m => `
    <li style="margin-bottom: 4px; font-size: 13px; color: #2D241E;">
      <strong>${m.name || 'New Believer'}</strong> (${m.email})
    </li>
  `).join('');

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; padding: 24px; color: #2D241E;">
    <div style="max-width: 700px; margin: 0 auto; background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1B3B2B, #2A5C43, #C59A45); padding: 26px 24px; color: #FFFFFF; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">Relations With God • Daily Founder Report</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Reading Activity & Progress Summary • <strong>${todayStr}</strong></p>
      </div>

      <!-- Overview Cards -->
      <div style="padding: 22px 24px;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px;">
          
          <div style="background: #FDFBF7; border: 1px solid #E8DEC8; border-radius: 12px; padding: 12px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; color: #8A7B70; font-weight: bold;">Completed Today</div>
            <div style="font-size: 24px; font-weight: 800; color: #1B5E20; margin-top: 4px;">${completedTodayList.length}</div>
          </div>

          <div style="background: #FDFBF7; border: 1px solid #E8DEC8; border-radius: 12px; padding: 12px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; color: #8A7B70; font-weight: bold;">Active Today</div>
            <div style="font-size: 24px; font-weight: 800; color: #7A1C1C; margin-top: 4px;">${activeMembersToday.length}</div>
          </div>

          <div style="background: #FDFBF7; border: 1px solid #E8DEC8; border-radius: 12px; padding: 12px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; color: #8A7B70; font-weight: bold;">New Registered</div>
            <div style="font-size: 24px; font-weight: 800; color: #C59A45; margin-top: 4px;">${newMembersToday.length}</div>
          </div>

          <div style="background: #FDFBF7; border: 1px solid #E8DEC8; border-radius: 12px; padding: 12px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; color: #8A7B70; font-weight: bold;">Total Members</div>
            <div style="font-size: 24px; font-weight: 800; color: #2D241E; margin-top: 4px;">${totalMembers}</div>
          </div>

        </div>

        <!-- Section: Completed Today Breakdown -->
        <h2 style="font-size: 16px; color: #1B3B2B; border-bottom: 2px solid #EADBCC; padding-bottom: 8px; margin: 24px 0 14px 0;">
          📖 Believers Who Completed Reading Today (${completedTodayList.length})
        </h2>

        ${completedTodayList.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #F7F3EC; border-bottom: 2px solid #E8DEC8; text-align: left; font-size: 11px; color: #6E5D53; text-transform: uppercase;">
                <th style="padding: 10px;">Believer</th>
                <th style="padding: 10px; text-align: center;">Day</th>
                <th style="padding: 10px;">Scripture Chapters</th>
                <th style="padding: 10px; text-align: center;">Progress</th>
                <th style="padding: 10px; text-align: center;">Streak</th>
                <th style="padding: 10px;">Reflection Note</th>
              </tr>
            </thead>
            <tbody>
              ${completedTableRows}
            </tbody>
          </table>
        ` : `
          <p style="font-size: 13px; color: #7A6F66; font-style: italic; background: #FDFBF7; padding: 14px; border-radius: 8px; text-align: center;">
            No completions recorded today yet.
          </p>
        `}

        <!-- Section: New Members Joined -->
        <h2 style="font-size: 16px; color: #1B3B2B; border-bottom: 2px solid #EADBCC; padding-bottom: 8px; margin: 28px 0 12px 0;">
          🌱 New Members Registered Today (${newMembersToday.length})
        </h2>
        ${newMembersToday.length > 0 ? `
          <ul style="padding-left: 20px; margin: 8px 0;">
            ${newMembersRows}
          </ul>
        ` : `
          <p style="font-size: 13px; color: #7A6F66; font-style: italic;">No new registrations today.</p>
        `}

        <div style="margin-top: 30px; padding: 14px; background: #F7F3EC; border-radius: 10px; text-align: center; font-size: 12px; color: #6E5D53;">
          Relations With God Ministries • Automated Founder Daily Digest • <a href="https://relationswithgod.in/dashboard" style="color: #7A1C1C; text-decoration: none; font-weight: bold;">Admin Dashboard</a>
        </div>
      </div>
    </div>
  </div>
  `;

  const text = `Relations With God - Daily Progress Report (${todayStr})\n\n` +
    `Summary:\n` +
    `- Completed Today: ${completedTodayList.length}\n` +
    `- Active Today: ${activeMembersToday.length}\n` +
    `- New Joined Today: ${newMembersToday.length}\n` +
    `- Total Community Members: ${totalMembers}\n\n` +
    `Completed Today Details:\n` +
    completedTodayList.map(c => `* ${c.name} (${c.email}): Day ${c.latestDay} [${c.tamilRef} / ${c.englishRef}] | Overall: ${c.totalCompletedDays}/365 | Streak: ${c.streak}d${c.latestNote ? ` | Note: "${c.latestNote}"` : ''}`).join('\n') +
    `\n\nNew Members Today:\n` +
    (newMembersToday.map(m => `* ${m.name} (${m.email})`).join('\n') || 'None') +
    `\n\nRelations With God Ministries`;

  if (transporter) {
    try {
      await dispatchEmail(transporter, {
        to: ADMIN_EMAIL,
        subject,
        html,
        text
      });
      console.log(`✓ Daily Admin Report successfully dispatched to ${ADMIN_EMAIL}`);
    } catch (err) {
      console.error(`✗ Failed to dispatch Admin Report:`, err.message);
    }
  } else {
    console.log(`[DRY RUN] Would send Admin Report to ${ADMIN_EMAIL}`);
  }
}

generateAndSendReport().catch(err => {
  console.error('Fatal error in report generator:', err);
  process.exit(1);
});
