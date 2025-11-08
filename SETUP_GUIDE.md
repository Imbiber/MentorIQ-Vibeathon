# Complete Setup Guide - MentorIQ

This guide will walk you through setting up and deploying MentorIQ from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [API Keys Configuration](#api-keys-configuration)
4. [Database Setup](#database-setup)
5. [Google Calendar Integration](#google-calendar-integration)
6. [Running Locally](#running-locally)
7. [Deploying to Replit](#deploying-to-replit)
8. [Pushing to GitHub](#pushing-to-github)
9. [Testing the Application](#testing-the-application)

---

## 1. Prerequisites

Before you begin, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] PostgreSQL database (or access to a cloud database like Neon)
- [ ] Git installed on your machine
- [ ] A GitHub account
- [ ] A Replit account (optional, for cloud deployment)

---

## 2. Initial Setup

### Step 1: Clone or Download the Repository

If starting from GitHub:
```bash
git clone https://github.com/Imbiber/MCP-Hackathon.git
cd MCP-Hackathon/MentorIQ
```

If starting from scratch on Replit, the code is already in the workspace.

### Step 2: Install Dependencies

```bash
cd MentorIQ
npm install
```

This will install all required packages including:
- React and Vite
- Express and Node.js server dependencies
- Prisma ORM
- AI service SDKs (OpenAI, AssemblyAI)
- Authentication libraries (Descope)

---

## 3. API Keys Configuration

You'll need to obtain API keys from several services. Follow these steps:

### 3.1 OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Save it for the `.env` file

**Cost**: ~$0.01-0.05 per video processed (using GPT-4o-mini)

### 3.2 AssemblyAI API Key

1. Go to [AssemblyAI](https://www.assemblyai.com/dashboard/signup)
2. Sign up for a free account
3. Go to your dashboard
4. Copy your API key
5. Save it for the `.env` file

**Free Tier**: First 5 hours of transcription free

### 3.3 Descope Project ID

1. Go to [Descope](https://app.descope.com)
2. Sign up and create a new project
3. Name it "MentorIQ" or similar
4. Copy the Project ID (starts with `P3`)
5. Go to Settings > API Keys
6. Generate a Management Key
7. Save both for the `.env` file

**Free Tier**: Up to 7,500 MAUs free

### 3.4 Google OAuth Credentials (Optional)

Only needed if you want Google Calendar integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API:
   - APIs & Services > Library
   - Search "Google Calendar API"
   - Click Enable
4. Create OAuth credentials:
   - APIs & Services > Credentials
   - Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Add authorized redirect URIs:
     ```
     http://localhost:8080/auth/google/callback
     http://localhost:8080/auth/google/popup-callback
     https://YOUR-REPL-DOMAIN.replit.dev/auth/google/callback
     https://YOUR-REPL-DOMAIN.replit.dev/auth/google/popup-callback
     ```
5. Copy Client ID and Client Secret
6. Save for the `.env` file

### 3.5 Create .env File

Create a file named `.env` in the `MentorIQ` directory:

```env
# Database (you'll set this up in next section)
DATABASE_URL=postgresql://user:password@host:5432/database

# OpenAI (required)
OPENAI_API_KEY=sk-...

# AssemblyAI (required)
ASSEMBLYAI_API_KEY=...

# Descope Authentication (required)
VITE_DESCOPE_PROJECT_ID=P3...
DESCOPE_MANAGEMENT_KEY=...

# Google OAuth (optional - for calendar integration)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
VITE_GOOGLE_CLIENT_ID=...

# Replit-specific (auto-populated on Replit)
REPLIT_DOMAINS=...
```

---

## 4. Database Setup

### Option A: Using Replit Database (Easiest)

If you're on Replit:
1. Your PostgreSQL database is already provisioned
2. `DATABASE_URL` is automatically set in environment variables
3. Skip to "Initialize Database Schema" below

### Option B: Using Neon (Recommended for Production)

1. Go to [Neon](https://neon.tech)
2. Sign up and create a new project
3. Name it "mentoriq"
4. Copy the connection string
5. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb
   ```

### Option C: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb mentoriq
   ```
3. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://localhost:5432/mentoriq
   ```

### Initialize Database Schema

Once your database is configured:

```bash
# Push the Prisma schema to your database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

This creates all necessary tables:
- `users` - User accounts
- `meetings` - Uploaded recordings
- `actions` - Generated action items
- `progress_tracking` - Implementation tracking
- `integrations` - External service connections
- `behavior_patterns` - AI-detected patterns

### Verify Database

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can view/edit data.

---

## 5. Google Calendar Integration

### Update OAuth Redirect URIs

After deploying to Replit or your domain:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Click on your OAuth 2.0 Client ID
4. Add your actual domain to Authorized redirect URIs:
   ```
   https://YOUR-ACTUAL-DOMAIN.replit.dev/auth/google/callback
   https://YOUR-ACTUAL-DOMAIN.replit.dev/auth/google/popup-callback
   ```
5. Save changes

**Note**: Google OAuth requires HTTPS in production. Replit provides this automatically.

---

## 6. Running Locally

### Start Both Servers

**Option 1: Run both together**
```bash
npm run dev:full
```

**Option 2: Run separately** (useful for debugging)

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (if running)

### Test the Upload Flow

1. Open http://localhost:5000
2. Click "Get Started"
3. Upload a test video/audio file
4. Watch the processing stages:
   - ✅ Uploading
   - ✅ Transcribing (via AssemblyAI)
   - ✅ Extracting insights (via OpenAI)
   - ✅ Generating action plan (via OpenAI)
5. View the generated action items

**Expected behavior**:
- Actions should be SPECIFIC to your video content
- NOT generic "block focus time" advice
- Database should contain the actions (check with Prisma Studio)

---

## 7. Deploying to Replit

### Configure Replit Secrets

1. Click "Secrets" (🔒 icon) in Replit sidebar
2. Add all environment variables from your `.env` file:
   - `OPENAI_API_KEY`
   - `ASSEMBLYAI_API_KEY`
   - `VITE_DESCOPE_PROJECT_ID`
   - `DESCOPE_MANAGEMENT_KEY`
   - `GOOGLE_CLIENT_ID` (if using calendar)
   - `GOOGLE_CLIENT_SECRET` (if using calendar)
   - `VITE_GOOGLE_CLIENT_ID` (if using calendar)
3. `DATABASE_URL` and `REPLIT_DOMAINS` are auto-populated

### Workflows are Already Configured

The project has two workflows:
- **MentorIQ Frontend** (port 5000, webview enabled)
- **MentorIQ Backend** (port 3001, console output)

Both should start automatically when you run the Repl.

### Deploy to Production

1. Click the "Deploy" button in Replit
2. Configure deployment settings (already set):
   - Type: Autoscale
   - Build: `npm run build`
   - Run: Vite preview on port 5000
3. Click "Deploy"
4. Your app will be live at your Replit domain

---

## 8. Pushing to GitHub

### Step 1: Check Current Status

Open the Shell in Replit and run:

```bash
cd MentorIQ
git status
```

You should see modified files including:
- `server/src/ai/action-plan.cjs`
- `server/src/ai/insights.cjs`
- `server/src/ai/transcription.cjs`
- `server/src/app.cjs`
- `vite.config.ts`
- `README.md`
- `SETUP_GUIDE.md`
- `replit.md`

### Step 2: Stage All Changes

```bash
git add .
```

### Step 3: Commit Changes

```bash
git commit -m "Complete MentorIQ setup with AI fixes and documentation

- Fixed AssemblyAI transcription with correct API key
- Replaced Cohere with OpenAI GPT-4o-mini for insights and actions
- Added FFmpeg for video/audio processing
- Fixed infinite recursion in transcription error handling
- Normalized OpenAI response field names (task/action/title mapping)
- Fixed API to return database-saved actions
- Updated action plan prompt for video-specific actions
- Configured Vite for Replit deployment (port 5000, allowed hosts)
- Added comprehensive README and setup guide
- Documented all API integrations and setup steps"
```

### Step 4: Push to GitHub

```bash
git push origin main
```

**If you encounter authentication issues:**

1. Use SSH instead of HTTPS:
   ```bash
   git remote set-url origin git@github.com:Imbiber/MCP-Hackathon.git
   git push origin main
   ```

2. Or configure GitHub credentials:
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

### Step 5: Verify on GitHub

1. Go to https://github.com/Imbiber/MCP-Hackathon
2. Verify all files are updated
3. Check that README.md displays properly
4. Confirm commit history shows your changes

---

## 9. Testing the Application

### Test Checklist

- [ ] **Landing Page Loads**: http://localhost:5000 or your Replit domain
- [ ] **Upload Works**: Can select and upload video/audio files
- [ ] **Processing Completes**: All 4 stages complete without errors
- [ ] **Actions Are Video-Specific**: Generated actions match video content
- [ ] **Database Saves Actions**: Check Prisma Studio for saved data
- [ ] **Google Calendar Integration**: Can connect and schedule events (if configured)
- [ ] **No Console Errors**: Check browser dev tools (F12)
- [ ] **Backend Logs Clean**: No errors in backend logs

### Common Issues and Fixes

**Problem**: Actions are generic, not video-specific
**Solution**: Clear browser cache (`localStorage.clear()` in console), upload new video

**Problem**: Video processing stuck or infinite loop
**Solution**: Check backend logs, ensure FFmpeg is installed, verify API keys

**Problem**: "Server IP not found" error
**Solution**: Restart workflows, check that frontend is on port 5000

**Problem**: Database errors
**Solution**: Run `npx prisma db push --force` to reset schema

**Problem**: Calendar integration not working
**Solution**: Verify redirect URIs match exactly, check OAuth credentials

---

## 🎉 Success Criteria

Your MentorIQ installation is successful when:

1. ✅ You can upload a video file
2. ✅ AI transcribes the audio correctly
3. ✅ Action items are SPECIFIC to your video content
4. ✅ Actions are saved to database
5. ✅ You can view actions in the UI
6. ✅ (Optional) Calendar integration works
7. ✅ Code is pushed to GitHub
8. ✅ README displays properly on GitHub

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs**: Backend console shows detailed error messages
2. **Check browser console**: F12 to see frontend errors
3. **Verify API keys**: Make sure all keys are correct and have sufficient credits
4. **Check database**: Use Prisma Studio to verify data is saving
5. **Clear cache**: Browser localStorage can cause issues with old data

---

## 🚀 Next Steps

After successful setup:

1. **Customize**: Update branding, colors, copy in the frontend
2. **Add features**: Notion integration, Slack notifications, analytics
3. **Optimize**: Fine-tune AI prompts for better action items
4. **Scale**: Add user management, team features, subscription billing
5. **Monitor**: Set up error tracking (Sentry) and analytics

---

**Happy coding! 🎯**
