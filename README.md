# MentorIQ - AI-Powered Behavior Change Intelligence Platform

Transform professional development conversations into trackable, implementable action plans using advanced AI.

## 🌟 Overview

MentorIQ uses cutting-edge AI to process audio/video recordings of mentoring sessions, extract insights, and generate personalized action plans with Google Calendar integration. Built for the MCP Hackathon Theme 1: Descope Outbound Apps Integration.

**Live Demo:** [Your Replit URL]

## ✨ Features

- **🎤 Audio/Video Processing**: Upload meeting recordings in any format (MP3, MP4, WAV, M4A, MOV, etc.)
- **🤖 AI Transcription**: AssemblyAI with speaker diarization for accurate transcription
- **🧠 Insight Extraction**: OpenAI GPT-4o-mini analyzes conversations for actionable advice
- **📋 Smart Action Plans**: AI generates specific action items based on actual conversation content
- **📅 Google Calendar Integration**: One-click scheduling of action items to Google Calendar
- **🔐 Secure Authentication**: Descope SDK for user authentication
- **📊 Progress Tracking**: Track implementation of action items over time
- **🎯 Behavioral Science**: Based on BJ Fogg Behavior Model for maximum success probability

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API Keys:
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [AssemblyAI API Key](https://www.assemblyai.com/dashboard/signup)
  - [Descope Project](https://app.descope.com)
  - [Google OAuth Credentials](https://console.cloud.google.com) (optional, for calendar integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Imbiber/MCP-Hackathon.git
   cd MCP-Hackathon/MentorIQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `MentorIQ` directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host:5432/database

   # AI Services
   OPENAI_API_KEY=sk-...
   ASSEMBLYAI_API_KEY=...

   # Descope Authentication
   VITE_DESCOPE_PROJECT_ID=P3...
   DESCOPE_MANAGEMENT_KEY=...

   # Google OAuth (Optional - for Calendar Integration)
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   VITE_GOOGLE_CLIENT_ID=...

   # Replit-specific (if deploying on Replit)
   REPLIT_DOMAINS=your-repl-domain.replit.dev
   ```

4. **Initialize the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the application**
   
   **Development mode (both servers):**
   ```bash
   npm run dev:full
   ```

   **Or run separately:**
   ```bash
   # Terminal 1 - Backend (port 3001)
   npm run dev:server

   # Terminal 2 - Frontend (port 5000)
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5000`

## 🔧 Configuration

### Google Calendar Setup

To enable Google Calendar integration:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create or select a project**
3. **Enable Google Calendar API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it
4. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:8080/auth/google/callback
     http://localhost:8080/auth/google/popup-callback
     https://your-domain.replit.dev/auth/google/callback
     https://your-domain.replit.dev/auth/google/popup-callback
     ```
5. **Copy credentials to .env:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   VITE_GOOGLE_CLIENT_ID=your-client-id
   ```

### Descope Authentication Setup

1. **Create account at [Descope](https://app.descope.com)**
2. **Create a new project**
3. **Copy Project ID to .env:**
   ```env
   VITE_DESCOPE_PROJECT_ID=P3...
   ```
4. **Generate Management Key** (for outbound apps):
   - Go to Settings > API Keys
   - Create a new management key
   - Copy to .env:
     ```env
     DESCOPE_MANAGEMENT_KEY=...
     ```

## 📁 Project Structure

```
MentorIQ/
├── src/                      # React frontend (Vite)
│   ├── pages/               # React Router pages
│   │   ├── Index.tsx        # Landing page
│   │   └── Upload.tsx       # Main application (upload & results)
│   ├── components/          # UI components (shadcn/ui)
│   ├── lib/                 # Client utilities & types
│   └── index.css           # Tailwind CSS styles
├── server/                  # Express backend
│   ├── src/
│   │   ├── app.cjs         # Main Express server (port 3001)
│   │   ├── ai/             # AI processing pipeline
│   │   │   ├── transcription.cjs
│   │   │   ├── insights.cjs
│   │   │   └── action-plan.cjs
│   │   └── services/
│   │       └── processing.cjs
│   └── uploads/            # Audio file storage
├── prisma/                 # Database
│   └── schema.prisma       # Data models
├── components/             # Additional shadcn/ui components
├── public/                 # Static assets
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies & scripts
```

## 🎯 How It Works

### AI Processing Pipeline

1. **Upload**: User uploads audio/video file
2. **Transcription**: AssemblyAI transcribes with speaker detection
3. **Insight Extraction**: OpenAI GPT-4o-mini analyzes conversation for:
   - Advice given
   - Behavioral patterns
   - Implementation barriers
   - Success metrics
   - Emotional context
4. **Action Plan Generation**: AI creates specific, actionable tasks based on the conversation
5. **Database Storage**: Actions saved to PostgreSQL with full metadata
6. **Calendar Integration**: Actions can be scheduled to Google Calendar

### Database Schema

The application uses Prisma ORM with PostgreSQL:

- **User**: User accounts with Descope integration
- **Meeting**: Recorded conversations with AI processing results
- **Action**: Generated action items from meetings
- **ProgressTracking**: User progress on action items
- **Integration**: External service connections (Google Calendar)
- **BehaviorPattern**: AI-detected behavior patterns

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **UI Components**: Radix UI primitives
- **State Management**: React hooks + Context API
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js with Express (port 3001)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Descope SDK
- **File Upload**: Multer
- **Media Processing**: FFmpeg

### AI/ML Services
- **Speech-to-Text**: AssemblyAI (transcription + speaker diarization)
- **LLM**: OpenAI GPT-4o-mini (insights + action planning)
- **Behavioral Science**: BJ Fogg Behavior Model implementation

### Integrations
- **Google Calendar API**: Event creation and scheduling
- **Descope Outbound Apps**: Secure OAuth token management

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start frontend only (port 5000)
npm run dev:server       # Start backend only (port 3001)
npm run dev:full         # Start both frontend and backend

# Database
npx prisma db push       # Push schema changes to database
npx prisma studio        # Open Prisma Studio (database GUI)
npx prisma generate      # Generate Prisma Client

# Build
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🚢 Deployment

### Deploy to Replit

1. **Configure workflows** (already set up):
   - Frontend: `cd MentorIQ && npm run dev` (port 5000)
   - Backend: `cd MentorIQ && npm run dev:server` (port 3001)

2. **Set environment variables** in Replit Secrets:
   - All variables from `.env` file
   - `REPLIT_DOMAINS` will be auto-populated

3. **Click "Deploy"** in Replit UI

### Deploy to Production

The project is configured for Replit autoscale deployment:

```javascript
// Deployment settings
{
  "deployment_target": "autoscale",
  "build": "npm run build",
  "run": "vite preview --port 5000 --host 0.0.0.0"
}
```

For other platforms, ensure:
- Frontend runs on port 5000
- Backend runs on port 3001
- Database migrations are applied
- All environment variables are set

## 🐛 Troubleshooting

### Video Processing Issues

**Problem**: Videos get stuck in processing or show mock data

**Solution**:
1. Clear browser cache: `localStorage.clear()` in browser console
2. Ensure FFmpeg is installed (required for video processing)
3. Check that `OPENAI_API_KEY` and `ASSEMBLYAI_API_KEY` are set correctly
4. Check backend logs for specific errors

### Calendar Integration Issues

**Problem**: Calendar events not creating

**Solution**:
1. Verify Google OAuth credentials are correct
2. Check redirect URIs match your domain exactly
3. Ensure user has connected Google Calendar (click "Connect Google Calendar" button)
4. Check browser console for OAuth errors

### Database Connection Issues

**Problem**: Database errors or tables not found

**Solution**:
```bash
# Reset and recreate database schema
npx prisma db push --force
npx prisma generate
```

### Port Already in Use

**Problem**: Error: Port 5000 or 3001 already in use

**Solution**:
```bash
# Kill processes on ports
lsof -ti:5000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- API keys are stored securely in environment variables
- Google OAuth uses secure token exchange
- Database credentials use environment variables
- All API endpoints use proper authentication checks

## 📊 Features Roadmap

- [ ] Multi-language transcription support
- [ ] Notion integration for action tracking
- [ ] Slack notifications for action reminders
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Custom behavior models per user

## 🤝 Contributing

This is a hackathon project. For contributions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Submission

**MCP Hackathon - Theme 1: Descope Outbound Apps Integration**

This project demonstrates:
- Secure OAuth integration via Descope
- Multiple third-party API integrations (Google Calendar, AssemblyAI, OpenAI)
- Production-ready authentication and authorization
- Scalable architecture with proper separation of concerns
- Real-world application solving the $300B professional development problem

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact: [Your email or contact info]

---
