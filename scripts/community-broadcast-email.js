/**
 * Relations With God - Community Broadcast & Encouragement Email
 * 
 * Sends a personalized weekend encouragement email to believers:
 * - Dynamically includes each believer's next reading day and chapters
 * - Celebrates community milestones (100+ chapters read, Exodus, Job)
 * - Offers direct one-click link to resume reading
 * 
 * Supports:
 *   --mode=test      : Sends a preview email ONLY to jerishbtech@gmail.com
 *   --mode=broadcast : Sends to all registered believers in the community
 */

const https = require('https');
const nodemailer = require('nodemailer');
const { execSync } = require('child_process');
const readingPlan = require('../src/data/readingPlan.json');

const PROJECT_ID = 'jerish-51bd7';
const ADMIN_EMAIL = process.env.ADMIN_REPORT_EMAIL || 'jerishbtech@gmail.com';

// Internal test accounts to skip in full broadcast (keep founder jerishbtech for a copy)
const EXCLUDED_BROADCAST_EMAILS = [
  'jerishobed@gmail.com',
  'relationswithgod@gmail.com'
];

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
    console.log('Using Resend API for email delivery.');
    return { isResend: true, apiKey: process.env.RESEND_API_KEY.trim() };
  }
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    console.log(`Using Gmail SMTP via ${gmailUser}`);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });
  }
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    console.log(`Using Custom SMTP ${smtpHost}`);
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
  console.log('⚠️ No email transport found. Running in DRY-RUN mode.');
  return null;
}

async function dispatchEmail(transporter, { to, subject, html, text }) {
  if (!transporter) {
    console.log(`[DRY-RUN] Would send to ${to}: "${subject}"`);
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
    from: `"Relations With God" <${process.env.GMAIL_USER || 'connect@relationswithgod.in'}>`,
    to,
    subject,
    html,
    text
  });
}

function buildCommunityEncouragementEmail({ name, nextDayNum, completedDaysCount, completedChaptersCount, currentStreak, isTest = false }) {
  const displayName = name || 'Friend in Christ';
  const dayDetails = getDayPlanDetails(nextDayNum);
  const testPrefix = isTest ? '[PREVIEW / TEST] ' : '';

  const subject = `${testPrefix}கிறிஸ்துவுக்குள் அன்பான நண்பரே, வார இறுதி வேத வாசிப்பு உற்சாகம் & உங்கள் Day ${nextDayNum} 📖✨ | Relations With God`;

  const html = `
<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D241E;">
  <div style="background-color: #FAF8F5; padding: 24px 12px;">
    <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
      
      <!-- Premium Hero Header -->
      <div style="background: linear-gradient(135deg, #7A1C1C 0%, #9B2C2C 50%, #C59A45 100%); padding: 36px 24px; text-align: center; color: #FFFFFF;">
        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
          Weekend Community Fellowship
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.2;">
          Relations With God
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; letter-spacing: 0.3px;">
          365-Day Chronological Bible Journey • வேதாகம வாசிப்புப் பயணம்
        </p>
      </div>

      <!-- Main Body Content -->
      <div style="padding: 32px 24px;">
        
        <!-- Salutation -->
        <h2 style="margin-top: 0; color: #7A1C1C; font-size: 19px; line-height: 1.4; font-weight: 700;">
          கிறிஸ்துவுக்குள் அன்பான நண்பரே (${displayName}), அன்பின் வாழ்த்துக்கள்! 🙏
        </h2>
        <p style="font-size: 14px; line-height: 1.7; color: #4A3E36; margin-bottom: 20px;">
          நமது இரட்சகராகிய இயேசு கிறிஸ்துவின் இனிய நாமத்தில் உங்களுக்கு மனமார்ந்த நல்வாழ்த்துக்கள்! இந்த வார இறுதியில், கர்த்தருடைய வார்த்தையோடு அமைதியாக சில நிமிடங்கள் செலவழித்து உங்கள் ஆத்துமாவை பலப்படுத்த இந்த மடல் அன்போடு எழுதப்படுகிறது.
        </p>

        <!-- Scripture Banner -->
        <div style="background: #FDF9F3; border-left: 4px solid #C59A45; padding: 16px 18px; border-radius: 8px; margin: 22px 0;">
          <p style="margin: 0; font-style: italic; font-size: 13.5px; color: #664D03; line-height: 1.6;">
            “உம்முடைய வார்த்தைகள் கிடைத்தவுடனே அவைகளை உட்கொண்டேன்; உம்முடைய வார்த்தை எனக்கு மகிழ்ச்சியும், என் இருதயத்திற்கு ஆனந்தமுமாயிருந்தது...”
            <br>
            <span style="display: block; text-align: right; font-weight: bold; font-style: normal; margin-top: 6px; font-size: 12px; color: #8A6508;">
              — எரேமியா 15:16
            </span>
          </p>
        </div>

        <!-- Community Milestone Section -->
        <div style="background: linear-gradient(180deg, #F9FBF9 0%, #F0F6F0 100%); border: 1px solid #D1E5D1; border-radius: 14px; padding: 18px 20px; margin: 22px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 18px; margin-right: 8px;">🎉</span>
            <strong style="color: #1B5E20; font-size: 14px;">நமது விசுவாச குடும்பத்தின் வெற்றிப் படிகள்:</strong>
          </div>
          <p style="font-size: 13px; line-height: 1.6; color: #2E5A31; margin: 0;">
            நமது வேதாகம வாசிப்புக் குடும்பத்தில் விசுவாசிகள் தொடர்ந்து முன்னேறி வருகிறார்கள்! <strong>100 அதிகாரங்களைத் தாண்டி</strong> யாத்திராகமத்திற்குள் (Exodus) பிரவேசித்தும், யோபுவின் முழு புத்தகத்தை (Book of Job) வாசித்து முடித்தும், ஆதியாகமத்தின் ஆசீர்வாதங்களை சுதந்தரித்தும் விசுவாசிகள் தேவனுடைய வார்த்தையில் தாகமாய் வளர்கிறார்கள்.
          </p>
        </div>

        <!-- Personalized Reading Portion Card -->
        <div style="background: #FFFFFF; border: 2px solid #EADBCC; border-radius: 16px; padding: 22px; margin: 26px 0; box-shadow: 0 4px 16px rgba(122, 28, 28, 0.05);">
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="background: #E8F5E9; color: #1B5E20; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; border: 1px solid #C8E6C9;">
              📍 உங்கள் அடுத்த வேதப் பகுதி (Your Next Portion)
            </span>
          </div>

          <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 26px; font-weight: 900; color: #7A1C1C; margin-bottom: 4px;">
              Day ${nextDayNum}
            </div>
            <div style="font-size: 15px; font-weight: bold; color: #2D241E; margin-bottom: 2px;">
              ${dayDetails.tamilRef}
            </div>
            <div style="font-size: 12px; color: #7A6F66; font-style: italic;">
              (${dayDetails.englishRef})
            </div>
          </div>

          <table style="width: 100%; border-top: 1px solid #EADBCC; padding-top: 12px; margin-top: 12px; font-size: 12px; color: #5C4E43;">
            <tr>
              <td style="text-align: center; padding: 4px 8px; border-right: 1px solid #EADBCC;">
                <div style="font-size: 11px; color: #8A7B70;">முடித்த நாட்கள்</div>
                <div style="font-size: 14px; font-weight: bold; color: #7A1C1C;">${completedDaysCount} நாட்கள்</div>
              </td>
              <td style="text-align: center; padding: 4px 8px; border-right: 1px solid #EADBCC;">
                <div style="font-size: 11px; color: #8A7B70;">வாசித்த அதிகாரங்கள்</div>
                <div style="font-size: 14px; font-weight: bold; color: #7A1C1C;">${completedChaptersCount} chs</div>
              </td>
              <td style="text-align: center; padding: 4px 8px;">
                <div style="font-size: 11px; color: #8A7B70;">தொடர் வாசிப்பு (Streak)</div>
                <div style="font-size: 14px; font-weight: bold; color: #C59A45;">${currentStreak > 0 ? `${currentStreak} நாட்கள் 🔥` : '1 நாள்'}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Call to Action Button -->
        <div style="text-align: center; margin: 30px 0 24px 0;">
          <a href="https://relationswithgod.in/read/${nextDayNum}" style="display: inline-block; background: linear-gradient(135deg, #C59A45 0%, #9B2C2C 100%); color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 15px; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 16px rgba(155, 44, 44, 0.35); letter-spacing: 0.3px;">
            📖 Day ${nextDayNum} வாசிக்கத் தொடங்குங்கள் (Read Now)
          </a>
          <div style="margin-top: 10px;">
            <a href="https://relationswithgod.in/dashboard" style="font-size: 12px; color: #7A1C1C; text-decoration: underline;">
              அல்லது உங்கள் டேஷ்போர்டைப் பார்வையிடவும் (View Dashboard)
            </a>
          </div>
        </div>

        <!-- WhatsApp Community Box -->
        <div style="background: #F4F7F4; border: 1px solid #D6E4D6; border-radius: 12px; padding: 16px; margin: 26px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #1E4620; font-weight: bold;">
            💬 சக விசுவாசிகளுடன் ஐக்கியப்பட WhatsApp குழுவில் இணையுங்கள்:
          </p>
          <a href="https://chat.whatsapp.com/GSm4lH0h7t67z8eNqK3Q3Q" style="display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 12px; padding: 10px 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(37, 211, 102, 0.3);">
            Join Relations With God WhatsApp Group
          </a>
        </div>

        <!-- Prayer / Contact Note -->
        <div style="border-top: 1px solid #EADBCC; padding-top: 20px; margin-top: 24px; font-size: 12.5px; line-height: 1.6; color: #6E5D53; text-align: center;">
          உங்களுக்கு ஏதேனும் ஜெப விண்ணப்பங்கள் இருந்தாலோ அல்லது வேத வாசிப்பில் உதவி தேவைப்பட்டாலோ, இந்த மின்னஞ்சலுக்கு நேரடியாகப் பதிலளிக்கலாம் (Reply). உங்களுக்காக ஜெபிக்க நாங்கள் எப்போதும் ஆயத்தமாய் இருக்கிறோம்!
        </div>

        <!-- Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 11.5px; color: #9A8B80;">
          <p style="margin: 4px 0;"><strong>Relations With God Ministries</strong></p>
          <p style="margin: 4px 0;">
            <a href="https://relationswithgod.in" style="color: #9B2C2C; text-decoration: none;">relationswithgod.in</a> • 
            <a href="https://www.youtube.com/@relationswithgod" style="color: #9B2C2C; text-decoration: none;">YouTube @relationswithgod</a>
          </p>
          <p style="margin: 8px 0 0 0; font-size: 10.5px; color: #B5A89E;">
            அனுதினமும் தேவனோடு நெருங்கி ஜீவிக்க ஒரு எளிய வாசிப்புக் கருவி.
          </p>
        </div>

      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `கிறிஸ்துவுக்குள் அன்பான நண்பரே (${displayName}), அன்பின் வாழ்த்துக்கள்!\n\nஇந்த வார இறுதியில் கர்த்தருடைய வார்த்தையோடு அமைதியாக சில நிமிடங்கள் செலவழித்து உங்கள் ஆத்துமாவை பலப்படுத்த இந்த மடல் அன்போடு எழுதப்படுகிறது.\n\n“உம்முடைய வார்த்தைகள் கிடைத்தவுடனே அவைகளை உட்கொண்டேன்; உம்முடைய வார்த்தை எனக்கு மகிழ்ச்சியும், என் இருதயத்திற்கு ஆனந்தமுமாயிருந்தது...” — எரேமியா 15:16\n\nஉங்கள் அடுத்த வேத வாசிப்புப் பகுதி:\nDay ${nextDayNum}: ${dayDetails.tamilRef} (${dayDetails.englishRef})\nமுடித்த நாட்கள்: ${completedDaysCount} நாட்கள் | வாசித்த அதிகாரங்கள்: ${completedChaptersCount} chs\n\nஇன்றே வாசிக்க: https://relationswithgod.in/read/${nextDayNum}\nடேஷ்போர்டு: https://relationswithgod.in/dashboard\n\nWhatsApp சமூகம்: https://chat.whatsapp.com/GSm4lH0h7t67z8eNqK3Q3Q\n\nRelations With God Ministries • https://relationswithgod.in`;

  return { subject, html, text };
}

async function main() {
  const args = process.argv.slice(2);
  const modeArg = args.find(a => a.startsWith('--mode='))?.split('=')[1] || process.env.BROADCAST_MODE || 'test';
  const isTest = modeArg.toLowerCase() === 'test';

  console.log(`\n======================================================`);
  console.log(`RELATIONS WITH GOD - COMMUNITY BROADCAST EMAIL`);
  console.log(`Mode: ${isTest ? 'TEST (Preview to jerishbtech@gmail.com)' : 'FULL BROADCAST (To All Believers)'}`);
  console.log(`======================================================\n`);

  const token = await getAccessToken();
  const transporter = createTransporter();

  // 1. Fetch all registered users
  const rawUsers = await firestoreRequest('users?pageSize=100', 'GET', null, token);
  const users = (rawUsers?.documents || []).map(parseFirestoreDoc).filter(Boolean);

  console.log(`Total Firestore User Profiles found: ${users.length}`);

  // Fetch progress for users
  const recipients = [];
  for (const u of users) {
    const rawProg = await firestoreRequest(`users/${u.id}/progress/current`, 'GET', null, token);
    const prog = parseFirestoreDoc(rawProg);

    const completedDays = (prog?.completedDays || []).map(d => parseInt(d, 10)).filter(d => !isNaN(d)).sort((a, b) => a - b);
    const completedDaysCount = completedDays.length;
    const completedChaptersCount = (prog?.completedChapters || []).length || u.completedChaptersCount || 0;
    const currentStreak = prog?.currentStreak || u.currentStreak || 0;

    let nextDayNum = 1;
    if (completedDays.length > 0) {
      const maxCompleted = completedDays[completedDays.length - 1];
      nextDayNum = Math.min(365, maxCompleted + 1);
    }

    recipients.push({
      id: u.id,
      email: (u.email || '').toLowerCase().trim(),
      name: u.name || 'Friend in Christ',
      nextDayNum,
      completedDaysCount,
      completedChaptersCount,
      currentStreak
    });
  }

  if (isTest) {
    console.log(`\n--- EXECUTING TEST / PREVIEW SEND ---`);
    // Find founder profile or build a sample recipient
    const founderRecipient = recipients.find(r => r.email === 'jerishbtech@gmail.com') || {
      name: 'Jerish Obed',
      email: 'jerishbtech@gmail.com',
      nextDayNum: 3,
      completedDaysCount: 2,
      completedChaptersCount: 7,
      currentStreak: 1
    };

    console.log(`Sending sample personalized preview to: ${ADMIN_EMAIL}`);
    console.log(`Preview details:`);
    console.log(`- Recipient Name: ${founderRecipient.name}`);
    console.log(`- Next Reading: Day ${founderRecipient.nextDayNum}`);
    console.log(`- Completed: ${founderRecipient.completedDaysCount} days (${founderRecipient.completedChaptersCount} chs)`);

    const emailContent = buildCommunityEncouragementEmail({
      ...founderRecipient,
      isTest: true
    });

    try {
      const res = await dispatchEmail(transporter, {
        to: ADMIN_EMAIL,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
      console.log(`\n✅ TEST EMAIL SENT SUCCESSFULLY to ${ADMIN_EMAIL}!`);
      console.log(`Result:`, res);
    } catch (err) {
      console.error(`\n❌ Failed to send test email:`, err.message);
      process.exit(1);
    }
    return;
  }

  // BROADCAST MODE
  console.log(`\n--- EXECUTING FULL COMMUNITY BROADCAST ---`);
  const activeRecipients = recipients.filter(r => {
    if (!r.email || !r.email.includes('@')) return false;
    if (EXCLUDED_BROADCAST_EMAILS.includes(r.email)) return false;
    return true;
  });

  console.log(`Total community recipients to message: ${activeRecipients.length}`);

  let sentCount = 0;
  let failCount = 0;

  for (let i = 0; i < activeRecipients.length; i++) {
    const r = activeRecipients[i];
    const emailContent = buildCommunityEncouragementEmail({
      ...r,
      isTest: false
    });

    console.log(`[${i + 1}/${activeRecipients.length}] Sending to ${r.name} (${r.email}) -> Next Day ${r.nextDayNum}...`);

    try {
      await dispatchEmail(transporter, {
        to: r.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
      console.log(`  ✓ Successfully delivered to ${r.email}`);
      sentCount++;
    } catch (err) {
      console.error(`  ❌ Failed for ${r.email}:`, err.message);
      failCount++;
    }

    // Delay 600ms between sends to stay comfortably under Resend 2 req/sec rate limit
    if (i < activeRecipients.length - 1) {
      await new Promise(res => setTimeout(res, 600));
    }
  }

  console.log(`\n======================================================`);
  console.log(`COMMUNITY BROADCAST COMPLETE!`);
  console.log(`- Successfully Sent: ${sentCount}`);
  console.log(`- Failed: ${failCount}`);
  console.log(`- Total Targets: ${activeRecipients.length}`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('Fatal error during execution:', err);
  process.exit(1);
});
