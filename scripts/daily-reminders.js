/**
 * Relations With God - Automated Daily Reminders & Welcome Emails
 * 
 * Rules:
 * 1. Strictly exclude founders: jerishbtech@gmail.com, jerishobed@gmail.com
 * 2. Welcome Email: Sent once to newly registered members who haven't received it yet.
 * 3. Inactivity Reminders: Sent for AT MOST 2 inactive days (Day 1 & Day 2 of inactivity).
 *    If inactive for > 2 days, DO NOT SEND to prevent spamming their inbox!
 * 4. At most 1 email per user per day.
 */

const https = require('https');
const nodemailer = require('nodemailer');
const { execSync } = require('child_process');

const PROJECT_ID = 'jerish-51bd7';
const EXCLUDED_EMAILS = [
  'jerishbtech@gmail.com',
  'jerishobed@gmail.com',
  'relationswithgod@gmail.com'
];

// Helper to get OAuth2 access token
async function getAccessToken() {
  if (process.env.GCP_ACCESS_TOKEN) {
    return process.env.GCP_ACCESS_TOKEN.trim();
  }

  // If running in GitHub Actions with google-github-actions/auth or local service account
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      // Generate OAuth2 token via Google OAuth token endpoint
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
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(err);
            }
          });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      if (resData.access_token) {
        return resData.access_token;
      }
    } catch (e) {
      console.warn('Could not derive token from FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }

  // Local fallback: try gcloud
  try {
    const token = execSync('gcloud auth print-access-token 2>/dev/null', { encoding: 'utf8' }).trim().split('\n')[0];
    if (token) return token;
  } catch {}

  throw new Error('No valid GCP access token or credentials found.');
}

// REST API Firestore Helper
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
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const res = { id: doc.name.split('/').pop(), _rawDocName: doc.name };
  for (const [key, val] of Object.entries(doc.fields)) {
    if (val.stringValue !== undefined) res[key] = val.stringValue;
    else if (val.integerValue !== undefined) res[key] = parseInt(val.integerValue, 10);
    else if (val.booleanValue !== undefined) res[key] = val.booleanValue;
    else if (val.timestampValue !== undefined) res[key] = val.timestampValue;
    else if (val.arrayValue !== undefined) {
      res[key] = (val.arrayValue.values || []).map(v => v.stringValue || v.integerValue || v);
    }
  }
  return res;
}

// Update user fields via Firestore REST API (PATCH with updateMask)
async function updateUserFields(userId, fields, token) {
  const queryParams = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const path = `users/${userId}?${queryParams}`;
  const firestoreFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') firestoreFields[k] = { stringValue: v };
    else if (typeof v === 'number') firestoreFields[k] = { integerValue: v.toString() };
    else if (typeof v === 'boolean') firestoreFields[k] = { booleanValue: v };
  }
  return firestoreRequest(path, 'PATCH', { fields: firestoreFields }, token);
}

// Email Transporter
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (gmailUser && gmailPass) {
    console.log(`Using Gmail SMTP via ${gmailUser}`);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    console.log(`Using Custom SMTP ${smtpHost}:${process.env.SMTP_PORT || 587}`);
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

  if (process.env.RESEND_API_KEY) {
    console.log('Using Resend API for email delivery.');
    return { isResend: true, apiKey: process.env.RESEND_API_KEY.trim() };
  }

  console.log('⚠️ No email credentials found (GMAIL_USER & GMAIL_APP_PASSWORD, or RESEND_API_KEY). Running in DRY-RUN mode.');
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

  // Nodemailer (Gmail / SMTP)
  return transporter.sendMail({
    from: `"Relations With God" <${process.env.GMAIL_USER || 'connect@relationswithgod.in'}>`,
    to,
    subject,
    html,
    text
  });
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function calculateInactiveDays(dateStr) {
  if (!dateStr) return 999;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 999;
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - target.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

// Templates
function buildWelcomeEmail(name) {
  const displayName = name || 'Friend in Christ';
  return {
    subject: `உங்கள் 365 நாள் தேவனுடைய வார்த்தைப் பயணம் ஆரம்பமாகிறது! 📖✨ | Welcome to Relations With God`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; padding: 24px; color: #2D241E;">
      <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <div style="background: linear-gradient(135deg, #7A1C1C, #9B2C2C, #C59A45); padding: 32px 24px; text-align: center; color: #FFFFFF;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">Relations With God</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">365-Day Chronological Bible Journey</p>
        </div>

        <div style="padding: 28px 24px;">
          <h2 style="margin-top: 0; color: #7A1C1C; font-size: 18px;">
            கிறிஸ்துவுக்குள் அன்பான நண்பரே (${displayName}), வாழ்த்துக்கள்! 🙏
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A3E36;">
            கர்த்தராகிய இயேசு கிறிஸ்துவின் இனிய நாமத்தில் உங்களுக்கு அன்பின் வாழ்த்துக்கள். தேவனோடு அனுதினமும் நெருங்கி ஜீவிக்கும் இந்த 365 நாள் பயணத்தில் நீங்கள் இணைந்திருப்பதில் நாங்கள் மகிழ்ச்சியடைகிறோம்!
          </p>

          <div style="background: #FDF9F3; border-left: 4px solid #C59A45; padding: 14px 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic; font-size: 13px; color: #664D03;">
              “உம்முடைய வசனம் என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.” — சங்கீதம் 119:105
            </p>
          </div>

          <h3 style="color: #2D241E; font-size: 15px; margin-bottom: 8px;">🚀 உங்கள் முதல் நாள் வாசிப்பைத் தொடங்க (Start Day 1):</h3>
          <p style="font-size: 13px; line-height: 1.6; color: #5C4E43;">
            இன்றே <strong>Day 1: ஆதியாகமம் 1, 2, 3</strong> அதிகாரங்களை வாசித்து, தேவனுடைய சிருஷ்டிப்பின் ஆசீர்வாதத்தைப் பெற்றுக்கொள்ளுங்கள்.
          </p>

          <div style="text-align: center; margin: 26px 0;">
            <a href="https://relationswithgod.in/read/1" style="display: inline-block; background: linear-gradient(135deg, #C59A45, #9B2C2C); color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(197, 154, 69, 0.3);">
              📖 முதல் நாள் வாசிக்க (Read Day 1 Now)
            </a>
          </div>

          <div style="background: #F4F7F4; border: 1px solid #D6E4D6; border-radius: 12px; padding: 14px 16px; margin-top: 24px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #1E4620; font-weight: bold;">
              💬 நமது WhatsApp சமூகத்தில் இணைந்து கொள்ளுங்கள்:
            </p>
            <a href="https://chat.whatsapp.com/GSm4lH0h7t67z8eNqK3Q3Q" style="display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 12px; padding: 8px 16px; border-radius: 8px;">
              Join Official WhatsApp Group
            </a>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #8A7B70; text-align: center;">
            Relations With God Ministries • <a href="https://relationswithgod.in" style="color: #9B2C2C; text-decoration: none;">relationswithgod.in</a>
          </p>
        </div>
      </div>
    </div>
    `,
    text: `கிறிஸ்துவுக்குள் அன்பான நண்பரே (${displayName}),\n\nRelations With God 365-நாள் வேத வாசிப்புப் பயணத்திற்கு அன்புடன் வரவேற்கிறோம்!\n\nஇன்றே முதல் நாள் வாசிப்பைத் தொடங்குங்கள்:\nDay 1: ஆதியாகமம் 1, 2, 3\n\nவாசிக்க: https://relationswithgod.in/read/1\n\nWhatsApp சமூகம்: https://chat.whatsapp.com/GSm4lH0h7t67z8eNqK3Q3Q\n\nRelations With God Ministries • https://relationswithgod.in`
  };
}

const readingPlan = require('../src/data/readingPlan.json');

function getDayPlanDetails(dayNum) {
  const d = readingPlan.days.find(x => x.day === dayNum);
  if (!d) return { tamilRef: `Day ${dayNum}`, englishRef: `Day ${dayNum}` };
  const tamilRef = d.chapters.map(c => c.tamilRef).join(', ');
  const englishRef = d.chapters.map(c => c.englishRef).join(', ');
  return { tamilRef, englishRef };
}

function buildInactiveReminderEmail(name, inactiveDays, nextDayNum, progressStats = {}) {
  const displayName = name || 'Friend in Christ';
  const isSecondDay = inactiveDays === 2;
  const dayDetails = getDayPlanDetails(nextDayNum);
  const completedCount = progressStats.completedDaysCount || 0;
  const chaptersCount = progressStats.completedChaptersCount || 0;
  const streak = progressStats.currentStreak || 0;
  const percent = Math.round((completedCount / 365) * 100);

  const subject = `கிறிஸ்துவுக்குள் அன்பான நண்பரே, உங்கள் Day ${nextDayNum} வாசிப்பு காத்திருக்கிறது 📖 | Relations With God`;

  return {
    subject,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; padding: 24px; color: #2D241E;">
      <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #EADBCC; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7A1C1C, #9B2C2C, #C59A45); padding: 28px 24px; text-align: center; color: #FFFFFF;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">Relations With God</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.95;">365-Day Chronological Bible Journey</p>
        </div>

        <!-- Body -->
        <div style="padding: 26px 22px;">
          <h2 style="font-size: 17px; font-weight: bold; color: #7A1C1C; margin-top: 0;">
            கிறிஸ்துவுக்குள் அன்பான நண்பரே (${displayName}), 🙏
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A3E36; margin-bottom: 16px;">
            இன்றைய நாளுக்கான உங்கள் வேத வாசிப்பைத் தொடர ஒரு அன்பான நினைவூட்டல்! உங்கள் ஆவிக்குரிய பயணத்தில் நீங்கள் எந்த நாளில் இருந்தாலும், அடுத்த பகுதியின் வார்த்தை உங்களுக்காக காத்திருக்கிறது.
          </p>

          <!-- Personalized Progress & Next Day Card -->
          <div style="background: #FDFBF7; border: 1px solid #E8DEC8; border-radius: 14px; padding: 18px 20px; margin: 18px 0;">
            
            <!-- Progress stats row -->
            <div style="border-bottom: 1px solid #EADBCC; padding-bottom: 12px; margin-bottom: 14px;">
              <span style="font-size: 11px; text-transform: uppercase; color: #8A7B70; font-weight: bold; letter-spacing: 0.5px;">உங்கள் தற்போதைய முன்னேற்றம் (Your Progress)</span>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
                <p style="margin: 0; font-size: 15px; font-weight: bold; color: #7A1C1C;">
                  ${completedCount} / 365 நாட்கள் முடிந்தது (${percent}%)
                </p>
                ${streak > 0 ? `<span style="background: #FFF3CD; border: 1px solid #FFE69C; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; color: #856404;">🔥 ${streak} நாள் Streak</span>` : ''}
              </div>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: #7A6F66;">
                மொத்தம் வாசித்த அதிகாரங்கள்: <strong>${chaptersCount} Chapters</strong>
              </p>
            </div>

            <!-- Target: What to complete next -->
            <div style="background: #FFFFFF; border: 1.5px solid #C59A45; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(197, 154, 69, 0.1);">
              <span style="font-size: 11px; font-weight: bold; color: #C59A45; text-transform: uppercase; letter-spacing: 0.5px;">
                👉 நீங்கள் அடுத்து வாசிக்க வேண்டியது (Next To Complete)
              </span>
              <h2 style="margin: 6px 0 2px 0; font-size: 24px; color: #7A1C1C; font-weight: 800;">
                Day ${nextDayNum}
              </h2>
              <p style="margin: 2px 0 0 0; font-size: 15px; font-weight: bold; color: #2D241E;">
                ${dayDetails.tamilRef}
              </p>
              <p style="margin: 1px 0 0 0; font-size: 12px; color: #6E5D53; font-style: italic;">
                (${dayDetails.englishRef})
              </p>

              <div style="margin-top: 14px;">
                <a href="https://relationswithgod.in/read/${nextDayNum}" style="display: inline-block; background: linear-gradient(135deg, #C59A45, #9B2C2C); color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(197, 154, 69, 0.35);">
                  📖 Day ${nextDayNum} வாசிக்கத் தொடங்குங்கள் (Read Now)
                </a>
              </div>
            </div>

          </div>

          <!-- Scripture Box -->
          <div style="background: #FDF9F3; border-left: 4px solid #C59A45; padding: 12px 14px; border-radius: 8px; margin: 18px 0;">
            <p style="margin: 0; font-style: italic; font-size: 12.5px; color: #664D03;">
              “உம்முடைய வசனம் என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.” — சங்கீதம் 119:105
            </p>
          </div>

          <p style="font-size: 12px; line-height: 1.5; color: #7A6F66; text-align: center; font-style: italic;">
            💡 குறிப்பு: எந்தவித அவசரமும் இல்லை! நீங்கள் உங்கள் சொந்த நேரத்தில், அமைதியாக வாசிக்கலாம்.
          </p>

          <hr style="border: none; border-top: 1px solid #EADBCC; margin: 20px 0;" />

          <!-- English section -->
          <div style="font-size: 12.5px; color: #5C4E43; line-height: 1.6;">
            <p style="margin: 0 0 4px 0; font-weight: bold; color: #7A1C1C;">Dear Friend in Christ,</p>
            <p style="margin: 0;">
              Before this day ends, spend 5 peaceful minutes in God's Holy Word. Your assigned reading for <strong>Day ${nextDayNum} (${dayDetails.englishRef})</strong> is waiting for you in your dashboard. Walk at your own pace and be blessed!
            </p>
          </div>

          <!-- WhatsApp Community card -->
          <div style="background: #F4F7F4; border: 1px solid #D6E4D6; border-radius: 12px; padding: 12px 16px; margin-top: 18px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #1E4620; font-weight: bold;">
              💬 நமது WhatsApp சமூகத்தில் இணையுங்கள்:
            </p>
            <a href="https://chat.whatsapp.com/GSm4lH0h7t67z8eNqK3Q3Q" style="display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 12px; padding: 7px 16px; border-radius: 8px;">
              Join WhatsApp Community
            </a>
          </div>

          <p style="margin-top: 22px; font-size: 11px; color: #8A7B70; text-align: center;">
            Relations With God Ministries • <a href="https://relationswithgod.in/dashboard" style="color: #9B2C2C; text-decoration: none;">Dashboard</a>
          </p>
        </div>
      </div>
    </div>
    `,
    text: `கிறிஸ்துவுக்குள் அன்பான நண்பரே (${displayName}),\n\nஉங்கள் Day ${nextDayNum} வாசிப்பு காத்திருக்கிறது 📖\n\nபகுதி: ${dayDetails.tamilRef} (${dayDetails.englishRef})\n\nஉங்கள் முன்னேற்றம்:\n- ${completedCount} / 365 நாட்கள் முடிந்தது (${percent}%)\n- மொத்தம் வாசித்த அதிகாரங்கள்: ${chaptersCount} Chapters\n\nஉடனே வாசிக்க: https://relationswithgod.in/read/${nextDayNum}\n\nDear Friend in Christ, before this day ends, spend 5 peaceful minutes in God's Holy Word. Walk at your own pace and be blessed!\n\nWhatsApp சமூகம்: https://chat.whatsapp.com/GSm4lH0h7t67z8eNqK3Q3Q\n\nRelations With God Ministries • https://relationswithgod.in/dashboard`
  };
}

async function run() {
  console.log('--- Relations With God Automated Email Service ---');
  console.log(`Current Date: ${getTodayString()}`);

  const token = await getAccessToken();
  const transporter = createTransporter();

  // Fetch all users
  const rawUsers = await firestoreRequest('users?pageSize=100', 'GET', null, token);
  const users = (rawUsers?.documents || []).map(parseFirestoreDoc).filter(Boolean);
  console.log(`Found ${users.length} total registered accounts in Firestore.`);

  const todayStr = getTodayString();
  let welcomeSent = 0;
  let reminderSent = 0;
  let skippedCount = 0;

  for (const u of users) {
    const email = (u.email || '').trim().toLowerCase();

    // Rule 1: Strictly exclude founders
    if (!email || EXCLUDED_EMAILS.includes(email)) {
      continue;
    }

    // Fetch user progress to find actual completed days
    const rawProg = await firestoreRequest(`users/${u.id}/progress/current`, 'GET', null, token);
    const prog = parseFirestoreDoc(rawProg);
    const completedDays = Array.isArray(prog?.completedDays) ? prog.completedDays : [];
    const nextDayNum = completedDays.length > 0 ? Math.max(...completedDays) + 1 : 1;

    // Rule 2: Welcome Email for newly registered members
    if (!u.welcomeEmailSent) {
      // If user already completed days, they are an existing reader and don't need a Day 1 welcome
      if (completedDays.length > 0) {
        console.log(`[Existing Reader] ${u.name || 'User'} (${email}) already completed ${completedDays.length} days. Marking welcomeEmailSent without email.`);
        if (transporter) {
          await updateUserFields(u.id, {
            welcomeEmailSent: true,
            welcomeEmailSentAt: new Date().toISOString()
          }, token);
        }
        // Proceed to check inactivity below
      } else {
        console.log(`[Welcome Email Target] ${u.name || 'User'} (${email}) - Ready for Day 1`);
        const tpl = buildWelcomeEmail(u.name);

        if (transporter) {
          try {
            await dispatchEmail(transporter, {
              to: email,
              subject: tpl.subject,
              html: tpl.html,
              text: tpl.text
            });
            console.log(`  ✓ Sent welcome email to ${email}`);
            await updateUserFields(u.id, {
              welcomeEmailSent: true,
              welcomeEmailSentAt: new Date().toISOString(),
              lastReminderSentDate: todayStr
            }, token);
            welcomeSent++;
          } catch (err) {
            console.error(`  ✗ Error sending welcome email to ${email}:`, err.message);
          }
        } else {
          console.log(`  [DRY RUN] Would send welcome email to ${email}`);
          welcomeSent++;
        }
        continue; // Don't send reminder on the same day as welcome email
      }
    }

    // Rule 3: Inactivity Reminders (MAX 2 INACTIVE DAYS ONLY, NO SPAM)
    const lastActive = u.lastActiveDate || u.joinedDate || '';
    const inactiveDays = calculateInactiveDays(lastActive);

    // Active today -> skip
    if (inactiveDays === 0) {
      if (u.consecutiveReminderCount && u.consecutiveReminderCount > 0) {
        await updateUserFields(u.id, { consecutiveReminderCount: 0 }, token);
      }
      continue;
    }

    // Anti-spam rule: If inactive for > 2 days, DO NOT SEND!
    if (inactiveDays > 2) {
      skippedCount++;
      continue;
    }

    // Already sent a reminder today?
    if (u.lastReminderSentDate === todayStr) {
      skippedCount++;
      continue;
    }

    // Eligible for Reminder (Inactive Day 1 or Inactive Day 2)
    console.log(`[Reminder Target - Inactive ${inactiveDays}d] ${u.name || 'User'} (${email}) -> Next Day: ${nextDayNum}`);
    const reminderTpl = buildInactiveReminderEmail(u.name, inactiveDays, nextDayNum, {
      completedDaysCount: completedDays.length,
      completedChaptersCount: Array.isArray(prog?.completedChapters) ? prog.completedChapters.length : (u.completedChaptersCount || 0),
      currentStreak: prog?.currentStreak || u.currentStreak || 0
    });

    if (transporter) {
      try {
        await dispatchEmail(transporter, {
          to: email,
          subject: reminderTpl.subject,
          html: reminderTpl.html,
          text: reminderTpl.text
        });
        console.log(`  ✓ Sent inactive day ${inactiveDays} reminder to ${email}`);
        await updateUserFields(u.id, {
          lastReminderSentDate: todayStr,
          consecutiveReminderCount: inactiveDays,
          lastReminderSentAt: new Date().toISOString()
        }, token);
        reminderSent++;
      } catch (err) {
        console.error(`  ✗ Error sending reminder to ${email}:`, err.message);
      }
    } else {
      console.log(`  [DRY RUN] Would send inactive day ${inactiveDays} reminder to ${email}`);
      reminderSent++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Welcome Emails Processed: ${welcomeSent}`);
  console.log(`Inactivity Reminders Processed: ${reminderSent}`);
  console.log(`Users Skipped (active today or inactive > 2 days): ${skippedCount}`);
  console.log('Done.');
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
