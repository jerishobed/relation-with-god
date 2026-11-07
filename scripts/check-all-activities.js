const https = require('https');
const { execSync } = require('child_process');
const readingPlan = require('../src/data/readingPlan.json');

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim().split('\n')[0];
const projectId = 'jerish-51bd7';

function getDayPlanDetails(dayNum) {
  const d = readingPlan.days.find(x => x.day === dayNum);
  if (!d) return { tamilRef: `Day ${dayNum}`, englishRef: `Day ${dayNum}` };
  const tamilRef = d.chapters.map(c => c.tamilRef).join(', ');
  const englishRef = d.chapters.map(c => c.englishRef).join(', ');
  return { tamilRef, englishRef };
}

function fetchDoc(path) {
  return new Promise((resolve) => {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;
    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-goog-user-project': projectId
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
  });
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const res = { id: doc.name.split('/').pop(), createTime: doc.createTime, updateTime: doc.updateTime };
  for (const [key, val] of Object.entries(doc.fields)) {
    if (val.stringValue !== undefined) res[key] = val.stringValue;
    else if (val.integerValue !== undefined) res[key] = parseInt(val.integerValue, 10);
    else if (val.booleanValue !== undefined) res[key] = val.booleanValue;
    else if (val.timestampValue !== undefined) res[key] = val.timestampValue;
    else if (val.arrayValue !== undefined) {
      res[key] = (val.arrayValue.values || []).map(v => {
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
        return v;
      });
    } else if (val.mapValue !== undefined) {
      res[key] = {};
      for (const [mk, mv] of Object.entries(val.mapValue.fields || {})) {
        res[key][mk] = mv.stringValue || mv.integerValue || mv.booleanValue || mv;
      }
    }
  }
  return res;
}

async function fetchAll(collectionName) {
  let docs = [];
  let pageToken = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await new Promise((resolve) => {
      https.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-goog-user-project': projectId
        }
      }, r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => {
          try { resolve(JSON.parse(d)); } catch { resolve({}); }
        });
      });
    });
    if (res.documents) {
      docs = docs.concat(res.documents.map(parseFirestoreDoc).filter(Boolean));
    }
    pageToken = res.nextPageToken || '';
  } while (pageToken);
  return docs;
}

function toISTString(isoDateStr) {
  if (!isoDateStr) return 'N/A';
  const d = new Date(isoDateStr);
  return new Date(d.getTime() + (5.5 * 3600 * 1000)).toISOString().replace('T', ' ').substring(0, 19) + ' IST';
}

function toISTDate(isoDateStr) {
  if (!isoDateStr) return '';
  const d = new Date(isoDateStr);
  return new Date(d.getTime() + (5.5 * 3600 * 1000)).toISOString().split('T')[0];
}

async function main() {
  const nowIST = new Date(Date.now() + 5.5 * 3600 * 1000);
  const todayStr = nowIST.toISOString().split('T')[0];
  console.log(`Checking all activities up to now: ${nowIST.toISOString().replace('T', ' ').substring(0, 19)} IST (Today: ${todayStr})...`);

  // 1. Fetch visits
  const visits = await fetchAll('visits');
  console.log(`Total visits recorded all-time: ${visits.length}`);

  // Group visits by date (IST)
  const visitsByDate = {};
  for (const v of visits) {
    const ts = v.timestamp || v.createTime || '';
    const dateIST = toISTDate(ts);
    if (!visitsByDate[dateIST]) visitsByDate[dateIST] = 0;
    visitsByDate[dateIST]++;
  }

  const todayVisits = visits.filter(v => toISTDate(v.timestamp || v.createTime || '') === todayStr);

  // 2. Fetch booklet requests
  const booklets = await fetchAll('booklet_requests');

  // 3. Fetch Auth Users
  const authUsersRaw = await new Promise((resolve) => {
    https.get(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchGet?maxResults=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-goog-user-project': projectId
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d).users || []); } catch { resolve([]); }
      });
    });
  });

  // 4. Fetch Users & their current progress
  const users = await fetchAll('users');
  const enrichedUsers = [];

  for (const u of users) {
    const progDoc = await fetchDoc(`users/${u.id}/progress/current`);
    const prog = parseFirestoreDoc(progDoc);
    enrichedUsers.push({
      ...u,
      progress: prog
    });
  }

  // Identify activity today and recently
  const activeToday = [];
  const newUsersToday = [];

  for (const u of enrichedUsers) {
    const email = (u.email || '').toLowerCase();
    const isFounder = email === 'jerishbtech@gmail.com' || email === 'jerishobed@gmail.com' || email === 'relationswithgod@gmail.com';
    const joined = u.joinedDate || '';
    if (joined === todayStr) {
      newUsersToday.push(u);
    }

    const prog = u.progress;
    const isTodayActive = (u.lastActiveDate === todayStr) || (prog?.lastActiveDate === todayStr);

    let progUpdatedToday = false;
    if (prog?.updateTime && toISTDate(prog.updateTime) === todayStr) {
      progUpdatedToday = true;
    }

    if (isTodayActive || progUpdatedToday) {
      activeToday.push({
        name: u.name || 'Anonymous',
        email: u.email,
        isFounder,
        lastActiveDate: u.lastActiveDate || prog?.lastActiveDate,
        progUpdatedTime: prog?.updateTime,
        userUpdatedTime: u.updateTime,
        currentStreak: prog?.currentStreak || u.currentStreak || 0,
        completedDaysCount: (prog?.completedDays || []).length,
        completedDays: prog?.completedDays || [],
        completedChaptersCount: (prog?.completedChapters || []).length || u.completedChaptersCount || 0,
        notes: prog?.notes || {}
      });
    }
  }

  console.log('\n=============================================');
  console.log(`SUMMARY REPORT FOR TODAY (${todayStr})`);
  console.log('=============================================');
  console.log(`Total Registered Users (Auth): ${authUsersRaw.length}`);
  console.log(`Total Firestore User Profiles: ${users.length}`);
  console.log(`Total Booklet Requests: ${booklets.length}`);
  console.log(`Total Visits Today (IST): ${todayVisits.length}`);
  console.log(`Active Members Today: ${activeToday.length}`);
  console.log(`New Registrations Today: ${newUsersToday.length}`);

  console.log('\n--- DAILY VISITS TREND (LAST 7 DAYS) ---');
  const sortedDates = Object.keys(visitsByDate).sort().slice(-7);
  for (const d of sortedDates) {
    console.log(`  ${d}: ${visitsByDate[d]} visits`);
  }

  console.log('\n--- ACTIVE MEMBERS TODAY & DETAILS ---');
  if (activeToday.length === 0) {
    console.log('No members active yet today.');
  } else {
    for (const a of activeToday) {
      const days = a.completedDays.map(Number).sort((x, y) => x - y);
      const latestDay = days.length > 0 ? days[days.length - 1] : 'None';
      const dayDetails = latestDay !== 'None' ? getDayPlanDetails(latestDay) : null;
      const notesCount = Object.keys(a.notes).length;

      console.log(`\n• ${a.name} (${a.email}) ${a.isFounder ? '[FOUNDER]' : ''}`);
      console.log(`  - Latest Day: Day ${latestDay} ${dayDetails ? `(${dayDetails.tamilRef} / ${dayDetails.englishRef})` : ''}`);
      console.log(`  - Total Days Completed: ${a.completedDaysCount} days`);
      console.log(`  - Total Chapters Read: ${a.completedChaptersCount} chapters`);
      console.log(`  - Streak: ${a.currentStreak} days`);
      console.log(`  - Last Progress Updated: ${toISTString(a.progUpdatedTime)}`);
      console.log(`  - Total Notes: ${notesCount}`);
      if (notesCount > 0) {
        console.log(`  - Notes content:`, JSON.stringify(a.notes));
      }
    }
  }

  console.log('\n--- ALL USERS OVERVIEW (SORTED BY LATEST ACTIVITY) ---');
  enrichedUsers.sort((a, b) => {
    const tA = a.progress?.updateTime || a.updateTime || '';
    const tB = b.progress?.updateTime || b.updateTime || '';
    return tB.localeCompare(tA);
  });

  for (const u of enrichedUsers) {
    const days = (u.progress?.completedDays || []).map(Number).sort((x, y) => x - y);
    const latestDay = days.length > 0 ? days[days.length - 1] : 0;
    const chapters = u.progress?.completedChapters?.length || u.completedChaptersCount || 0;
    const t = toISTString(u.progress?.updateTime || u.updateTime || '');
    console.log(`- ${u.name || 'Anonymous'} (${u.email}): Day ${latestDay} (${chapters} chs), streak: ${u.progress?.currentStreak || u.currentStreak || 0}, last: ${t}`);
  }

  console.log('\n--- RECENT VISITS TODAY (CHRONOLOGICAL) ---');
  todayVisits.sort((a, b) => {
    const tA = a.timestamp || a.createTime || '';
    const tB = b.timestamp || b.createTime || '';
    return tA.localeCompare(tB);
  });

  for (const v of todayVisits) {
    const rawTs = v.timestamp || v.createTime || '';
    const ist = toISTString(rawTs);
    console.log(`[${ist}] ${v.userId || 'anon'} | page: ${v.page || v.path || '/'} | referrer: ${v.referrer || 'direct'} | ua: ${(v.userAgent || '').substring(0, 40)}`);
  }

  console.log('\n--- NEW USERS SIGNED UP RECENTLY (AUTH) ---');
  authUsersRaw.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  for (const u of authUsersRaw.slice(0, 10)) {
    const createdIst = new Date(Number(u.createdAt)).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const lastLoginIst = new Date(Number(u.lastLoginAt)).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    console.log(`• ${u.displayName || 'No Name'} (${u.email}) | Joined: ${createdIst} | LastLogin: ${lastLoginIst}`);
  }
}

main().catch(console.error);
