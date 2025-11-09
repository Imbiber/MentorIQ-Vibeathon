const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Determine base URL based on environment
const getBaseUrl = () => {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.VITE_APP_URL || 'http://localhost:8080';
};

const BASE_URL = getBaseUrl();
console.log('🌐 Base URL:', BASE_URL);

// Middleware
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
];

if (process.env.REPLIT_DOMAINS) {
  const replitDomains = process.env.REPLIT_DOMAINS.split(',');
  replitDomains.forEach(domain => {
    allowedOrigins.push(`https://${domain.trim()}`);
  });
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    
    const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS: Rejected origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    // Accept audio and video files
    const allowedTypes = /\.(mp3|wav|m4a|mp4|mov|avi|webm|ogg|aiff|flac|aac|wma)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'));
    }
  }
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MentorIQ API is running' });
});

// Google OAuth callback endpoint (for direct OAuth flow)
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // We passed userId as state

    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

    // Processing OAuth callback

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${BASE_URL}/auth/google/callback`
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();

    // Store token in memory (in production, use database)
    global.userTokens = global.userTokens || {};
    global.userTokens[userId] = tokens.access_token;

    // OAuth token stored successfully

    // Redirect back to frontend with success message
    res.redirect(`${BASE_URL}/auth/callback?success=true&userId=${encodeURIComponent(userId)}`);

  } catch (error) {
    res.status(500).send('OAuth callback failed');
  }
});

// Google OAuth token exchange endpoint
app.post('/auth/google/exchange', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    // Processing token exchange request

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri || `${BASE_URL}/auth/google/callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      // Token exchange failed
      return res.status(400).json({ error: 'Failed to exchange authorization code', details: errorData });
    }

    const tokens = await tokenResponse.json();
    // Token exchange successful

    // Also store in global tokens for backend calendar integration
    try {
      // Getting user info to store tokens
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        const googleUserId = userInfo.id;

        // Store token for backend use (map Google user to our system)
        global.userTokens = global.userTokens || {};
        global.userTokens[googleUserId] = tokens.access_token;
        global.userTokens[`google_${userInfo.email}`] = tokens.access_token; // Store by email as well

        // CRITICAL: Also store a general "oauth_token" that we can find later
        global.userTokens['latest_oauth'] = tokens.access_token;
        global.userTokens['oauth_email'] = userInfo.email;

        // Token stored successfully
      }
    } catch (userInfoError) {
      // Fallback: Store the token anyway for general use
      global.userTokens = global.userTokens || {};
      global.userTokens['latest_oauth'] = tokens.access_token;
    }

    // Return tokens to frontend
    res.json(tokens);

  } catch (error) {
    // OAuth token exchange failed
    res.status(500).json({ error: 'Internal server error during token exchange' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('meeting'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    // File upload failed
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Import processing service
const processingService = require('./services/processing.cjs');

// Meeting processing endpoint - REAL AI PROCESSING
app.post('/api/meetings/process', async (req, res) => {
  try {
    const { filename, metadata } = req.body;

    // Starting meeting processing

    // Build full file path
    const filePath = `server/uploads/${filename}`;

    // Process with full AI pipeline
    const result = await processingService.processMeeting(filePath, {
      originalName: filename,
      size: metadata?.size || 0,
      userId: metadata?.userId || 'demo-user',
      title: metadata?.title || 'Mentor Conversation',
      participants: metadata?.participants || ['Mentor', 'Mentee']
    });

    // Processing completed successfully

    // Return formatted response for frontend with REAL database actions
    const response = {
      meetingId: result.meeting.id,
      transcription: {
        text: result.transcription.transcript,
        confidence: result.transcription.confidence,
        duration: result.transcription.duration,
        speakers: result.transcription.speakers
      },
      insights: result.insights,
      actionPlan: {
        immediateActions: result.meeting.actions || result.actionPlan.immediateActions,
        habitFormation: result.actionPlan.habitFormation || [],
        schedulingStrategy: result.actionPlan.schedulingStrategy || [],
        riskMitigation: result.actionPlan.riskMitigation || []
      },
      metadata: {
        processed_at: result.meeting.processedAt,
        processing_time: "30 seconds",
        status: result.meeting.processingStatus,
        confidence: result.meeting.confidence
      }
    };

    console.log('📤 Returning action items to frontend:', result.meeting.actions?.length || 0, 'items');

    res.json(response);
  } catch (error) {
    // Meeting processing failed
    res.status(500).json({
      error: 'Failed to process meeting',
      details: error.message
    });
  }
});

// Get meeting results
app.get('/api/meetings/:id', async (req, res) => {
  try {
    const meetingId = req.params.id;
    const meeting = await processingService.getMeetingResults(meetingId);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    // Failed to fetch meeting
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// Get user meetings
app.get('/api/meetings', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo-user';
    const meetings = await processingService.getUserMeetings(userId);
    res.json(meetings);
  } catch (error) {
    // Failed to fetch meetings
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Descope Outbound Apps - Calendar Integration
// Based on friend's successful implementation
async function getUserOutboundTokens(sessionToken) {
  const managementToken = process.env.DESCOPE_MANAGEMENT_TOKEN;
  const projectId = process.env.DESCOPE_PROJECT_ID;

  // Starting token verification and outbound app token retrieval

  let userId = 'fallback-user'; // Default fallback user ID

  try {
    // Only attempt JWT decoding if the token looks valid
    if (sessionToken && sessionToken.includes('.') && sessionToken.split('.').length === 3) {
      // Decoding session token to extract user ID

      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const tokenParts = sessionToken.split('.');

      // Decode the payload (base64url decode)
      const payload = Buffer.from(tokenParts[1], 'base64url').toString('utf8');
      const tokenData = JSON.parse(payload);

      // Verify token is not expired
      const now = Math.floor(Date.now() / 1000);
      if (tokenData.exp && tokenData.exp < now) {
        userId = 'expired-user';
      } else {
        userId = tokenData.sub;
      }
    } else {
      // Invalid session token format, using fallback OAuth token
    }
  } catch (error) {
    userId = 'fallback-user';
  }

  // Get Google Calendar token from Descope Outbound Apps
  const appId = process.env.DESCOPE_OUTBOUND_APP_ID || 'google-calendar';
  const tokens = {};

  // Attempting to get outbound app token

  // Try correct Descope Outbound Apps API endpoints
  const possibleEndpoints = [
    `https://api.descope.com/v1/mgmt/outbound-apps/${appId}/tokens/${userId}`,
    `https://api.descope.com/v1/mgmt/user/${userId}/outbound-apps/${appId}`,
    `https://api.descope.com/v2/mgmt/outbound-apps/${appId}/tokens/${userId}`
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      // Trying endpoint

      const tokenResponse = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${projectId}:${managementToken}`,
          'Content-Type': 'application/json'
        }
      });

      tokens[appId] = tokenResponse.data.accessToken || tokenResponse.data.token;
      break;

    } catch (error) {
      continue;
    }
  }

  if (!tokens[appId]) {
    // No tokens available from Descope API - checking stored tokens

    // Check if we have stored Google tokens for this user
    if (global.userTokens && global.userTokens[userId]) {
      tokens[appId] = global.userTokens[userId];
      // Found stored Google token
    } else if (global.userTokens) {
      // Check for latest OAuth token first (most reliable)
      if (global.userTokens['latest_oauth']) {
        tokens[appId] = global.userTokens['latest_oauth'];
        const email = global.userTokens['oauth_email'] || 'unknown';
        // Found latest OAuth token
      } else {
        // Also check for Google OAuth tokens by looking for any stored tokens
        const googleTokenKeys = Object.keys(global.userTokens).filter(key => key.startsWith('google_'));
        if (googleTokenKeys.length > 0) {
          tokens[appId] = global.userTokens[googleTokenKeys[0]];
          // Found stored Google token
        } else {
          tokens[appId] = null;
          // No stored tokens - user needs to connect
        }
      }
    } else {
      tokens[appId] = null;
      // No stored tokens - user needs to connect
    }
  }

  return { userId, tokens };
}

// Create calendar event via Descope Outbound Apps
app.post('/api/calendar/create-event', async (req, res) => {
  const { events, googleToken } = req.body; // Array of calendar events + optional google token
  const authHeader = req.headers.authorization;

  // Creating calendar events

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const sessionToken = authHeader.replace('Bearer ', '');

  try {
    // Get outbound tokens using friend's pattern
    let userId, tokens;
    try {
      const result = await getUserOutboundTokens(sessionToken);
      userId = result.userId;
      tokens = result.tokens;
    } catch (tokenError) {
      // Failed to get tokens from Descope, using fallback
      userId = 'fallback-user';
      tokens = {};
    }

    const appId = process.env.DESCOPE_OUTBOUND_APP_ID || 'google-calendar';
    const googleCalendarToken = tokens[appId];

    if (!googleCalendarToken) {
      // Check for stored OAuth token first
      if (global.userTokens && global.userTokens['latest_oauth']) {
        // Using stored OAuth token for calendar integration
        tokens[appId] = global.userTokens['latest_oauth'];
      } else {
        // Since Descope Outbound Apps Management API is not publicly available,
        // we'll use direct Google OAuth as a fallback while keeping Descope auth
        const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(`${BASE_URL}/auth/google/callback`)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}&` +
          `access_type=offline&` +
          `prompt=consent&` +
          `state=${userId}`;

        return res.status(403).json({
          error: 'Google Calendar connection required. Click OK to authorize calendar access.',
          userId: userId,
          needsConnection: true,
          redirectUrl: googleOAuthUrl
        });
      }
    }

    // Get the final Google Calendar token (priority: provided token > Descope > stored OAuth)
    const finalGoogleToken = googleToken || tokens[appId];

    console.log('📅 Calendar token source:', {
      fromFrontend: !!googleToken,
      fromDescope: !!tokens[appId],
      tokenPresent: !!finalGoogleToken,
      tokenLength: finalGoogleToken ? finalGoogleToken.length : 0
    });

    if (!finalGoogleToken) {
      console.error('❌ No valid Google token available');
      return res.status(401).json({
        error: 'No Google Calendar token available. Please reconnect your calendar.',
        needsConnection: true
      });
    }

    const results = [];

    // Create each event
    for (const event of events || []) {
      try {
        console.log(`📅 Creating event: ${event.summary}`);

        const calendarResponse = await axios.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          event,
          {
            headers: {
              Authorization: `Bearer ${finalGoogleToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        results.push({
          success: true,
          event: calendarResponse.data,
          title: event.summary
        });

        console.log(`✅ Event created: ${event.summary}`);

      } catch (eventError) {
        console.error(`❌ Failed to create event: ${event.summary}`, {
          status: eventError.response?.status,
          error: eventError.response?.data?.error?.message || eventError.message
        });

        results.push({
          success: false,
          error: eventError.response?.data?.error?.message || eventError.message,
          title: event.summary
        });
      }
    }

    // Calendar events creation completed
    return res.json({
      success: true,
      results,
      totalEvents: events?.length || 0,
      successfulEvents: results.filter(r => r.success).length
    });

  } catch (error) {
    // Calendar integration error

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed. Please sign in again.',
        details: error.response?.data
      });
    }

    return res.status(500).json({
      error: 'Failed to create calendar events',
      details: error.response?.data || error.message
    });
  }
});

// Debug endpoint to check stored tokens
app.get('/api/debug/tokens', (req, res) => {
  res.json({
    hasGlobalTokens: !!global.userTokens,
    tokenKeys: global.userTokens ? Object.keys(global.userTokens) : [],
    tokenCount: global.userTokens ? Object.keys(global.userTokens).length : 0
  });
});

// Health check with database connection
app.get('/api/health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    res.json({
      status: 'OK',
      message: 'MentorIQ API is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Health check failed
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Setup production static file serving BEFORE error handlers
let cachedIndexHtml = null;
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const distPath = path.join(__dirname, '../../dist');
  const indexPath = path.join(distPath, 'index.html');
  
  // Cache index.html during boot for fast health checks
  if (fs.existsSync(indexPath)) {
    try {
      cachedIndexHtml = fs.readFileSync(indexPath, 'utf8');
      console.log('✅ Cached index.html for fast health checks');
    } catch (error) {
      console.warn('⚠️  Failed to cache index.html:', error.message);
    }
  } else {
    console.warn('⚠️  index.html not found at:', indexPath);
  }
  
  // Serve static assets
  if (fs.existsSync(distPath)) {
    console.log('📁 Serving static files from:', distPath);
    app.use(express.static(distPath));
  } else {
    console.warn('⚠️  Dist directory not found at:', distPath);
  }
}

// Fast root handler for Replit health checks (MUST come before error handlers)
app.get('/', (req, res) => {
  const startTime = Date.now();
  if (process.env.NODE_ENV === 'production' && cachedIndexHtml) {
    res.type('text/html').send(cachedIndexHtml);
  } else if (process.env.NODE_ENV === 'production') {
    // Fallback if cache failed - always return 200 OK
    res.status(200).send('MentorIQ is running');
  } else {
    // In development, let Vite handle it
    res.status(200).json({ 
      status: 'OK', 
      message: 'MentorIQ API - Development Mode',
      responseTime: Date.now() - startTime + 'ms'
    });
  }
  console.log(`✅ Health check responded in ${Date.now() - startTime}ms`);
});

// SPA fallback for other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/auth') || 
        req.path.startsWith('/health')) {
      return next();
    }
    
    // Serve cached index.html for all other routes
    if (cachedIndexHtml) {
      res.type('text/html').send(cachedIndexHtml);
    } else {
      res.status(404).send('Frontend not built');
    }
  });
}

// Error handling (MUST be last!)
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startPort = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3001);
app.listen(startPort, '0.0.0.0', () => {
  console.log(`MentorIQ API server running on port ${startPort}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`File uploads directory: server/uploads/`);

  // Initialize with empty tokens for fresh OAuth flow
  global.userTokens = global.userTokens || {};
  console.log('Server ready');
});

module.exports = app;