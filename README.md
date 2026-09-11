# Relation With God — 365-Day Chronological Bible Journey 📖✨

> *“Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105*  
> *“உமது வேதத்திலுள்ள அதிசயங்களை நான் பார்க்கும்படிக்கு என் கண்களைத் திறந்தருளும்” — சங்கீதம் 119:18*

A full-stack devotional web application for **Relation With God Ministries**, guiding believers through the entire Holy Bible in chronological order over 365 days.

- **Author & Founder**: J Jerish Obed (+91 9442418286)
- **YouTube Channel**: [@relationswithgod](https://www.youtube.com/@relationswithgod)
- **Instagram Page**: [@relations_with_god](https://www.instagram.com/relations_with_god/)

---

## ✨ Features

1. **Complete 365-Day Chronological Plan**:
   - Extracted directly from the official ministry booklet `Bible Chronological Order-2_PrintReady.docx`.
   - All 365 days with **1,163 chapter readings** harmonized across 9 biblical eras (Patriarchs, Exodus, Promised Land, United Kingdom, Divided Kingdom, Exile, Gospels, Early Church, Revelation).
   - Dual-language support: Tamil (தமிழ்) & English.

2. **YouVersion-Style Tracker & Progress**:
   - Reading Streak tracker with flame indicator (`🔥`).
   - Dynamic progress rings for percentage of days (out of 365) and chapters (out of 1,163).
   - "Continue Today's Reading" smart card automatically jumps to the next pending day.
   - Unlockable spiritual milestone badges (7-Day Devotion, Month of Grace, Patriarchs, Gospels, Bible Finisher).

3. **In-App Scripture Reader & YouVersion Deep Links**:
   - Interactive chapter checklist with celebration confetti upon completing days.
   - In-app reading view with adjustable font sizing and scripture typography.
   - 1-tap **"Open in YouVersion"** buttons for both Tamil (BSI) and English (KJV) for audio and community study.
   - Daily prayer & reflection journal saved per user.

4. **Ministry Admin Console (`/admin`)**:
   - Audience metrics: Total registered seekers, enrolled participants, active readers today and this week.
   - Cohort distribution chart showing reader progression along the timeline.
   - Searchable, filterable participant directory with **1-click CSV Export**.
   - Community Encouragement Broadcast tool to post inspirational scriptures to all user dashboards.

5. **Spiritual Devotional Aesthetic**:
   - Three ambient reading themes:
     - 📜 **Sanctuary Parchment** (Warm, calming daylight paper)
     - 🕯️ **Midnight Sanctuary** (Deep OLED dark mode with amber candlelight glow)
     - 🏺 **Sepia Devotional** (Vintage antique paper)
   - Embedded booklet cover artwork (`booklet-cover.png`) and "Amazing Facts About the Bible" study poster (`bible-facts.png`).

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit [http://localhost:3005](http://localhost:3005) in your browser.

---

## 🛡️ Safe GCP Deployment (Strict Isolation)

> **Important**: This project has built-in safety guardrails to ensure **NO EXISTING GCP PROJECTS ARE EVER TOUCHED OR OVERWRITTEN**.

The script `scripts/gcp-deploy.sh` automatically verifies the target project against all your pre-existing projects (`personal-gemini-journal-fcc28`, `coffee-shop-agent-506604`, `gopika-5bb19`, `jerish-51bd7`, etc.) and immediately aborts if any of them is targeted.

### Deploying to a NEW Dedicated GCP Project:

```bash
# Deploys safely to a new project: relation-with-god-365
./scripts/gcp-deploy.sh relation-with-god-365
```

The script will:
1. Verify the project is not in the blacklist.
2. Create the new GCP project `relation-with-god-365`.
3. Link your open billing account.
4. Enable Cloud Run, Artifact Registry, and Cloud Build.
5. Deploy the containerized Next.js app to Cloud Run.
6. Provide you with the live HTTPS URL.

---

## 📁 Project Structure

```
Relation With God/
├── public/
│   ├── assets/
│   │   ├── booklet-cover.png      # Original booklet cover art
│   │   └── bible-facts.png        # Bible facts infographic poster
│   └── favicon.svg
├── scripts/
│   ├── extract_plan.py            # Python extractor for docx booklet data
│   └── gcp-deploy.sh              # Safe GCP Cloud Run deployment script
├── src/
│   ├── app/
│   │   ├── admin/page.tsx         # Audience analytics & admin dashboard
│   │   ├── api/                   # Admin & progress endpoints
│   │   ├── dashboard/page.tsx     # User progress, streak, & 365 grid
│   │   ├── read/[day]/page.tsx    # Scripture reader & journal notes
│   │   ├── globals.css            # Sacred themes & parchment styling
│   │   ├── layout.tsx             # Root layout & providers
│   │   └── page.tsx               # Spiritual landing & hero page
│   ├── components/
│   │   ├── AuthModal.tsx          # Login, Sign Up, & Quick Demo
│   │   ├── BibleFactsSection.tsx  # Interactive facts showcase
│   │   ├── Footer.tsx             # Founder credits & spiritual links
│   │   ├── HeroSection.tsx        # Devotional hero banner
│   │   ├── Navbar.tsx             # Navigation, theme, & language toggle
│   │   ├── ProgressOverview.tsx   # YouVersion-style progress engine
│   │   ├── ReadingPlanGrid.tsx    # 365-day schedule grid & search
│   │   ├── SocialHubSection.tsx   # YouTube & Instagram community
│   │   └── SocialIcons.tsx        # SVG icons for YouTube & Instagram
│   ├── data/
│   │   └── readingPlan.json       # 365-day chronological dataset (1,163 chapters)
│   ├── lib/
│   │   ├── authContext.tsx        # Auth state & streak manager
│   │   ├── storage.ts             # LocalStorage & mock data engine
│   │   └── themeContext.tsx       # Theme & language state
│   └── types/
│       └── index.ts               # TypeScript definitions
├── Dockerfile                     # Multi-stage production container
├── firebase.json                  # Firebase hosting configuration
└── tailwind.config.js             # Sanctuary color palette
```

---

## 🕊️ Glory to God Alone
*Relation With God Ministries*  
*Prepared by J Jerish Obed*
