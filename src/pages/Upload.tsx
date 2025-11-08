import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { simpleGoogleAuth } from "../lib/services/simpleGoogleAuth";
import { googleCalendarService } from "../lib/services/googleCalendar";
import { calendarDownloadService } from "../lib/services/calendarDownload";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { 
  Upload as UploadIcon, 
  FileAudio, 
  FileVideo,
  CheckCircle, 
  AlertCircle,
  Brain,
  Loader2,
  ArrowRight,
  Home,
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDescope, useUser, Descope } from '@descope/react-sdk';
import { calendarService } from '@/lib/descope';
import { ActionItemCustomizer } from '@/components/ActionItemCustomizer';

interface ProcessingStage {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
}

interface ProcessingResult {
  meetingId: string;
  transcription: any;
  insights: any;
  actionPlan: any;
  metadata: any;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSchedulingCalendar, setIsSchedulingCalendar] = useState(false);
  const [calendarResults, setCalendarResults] = useState<any[]>([]);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [showEmbeddedAuth, setShowEmbeddedAuth] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isDataRestored, setIsDataRestored] = useState(false);

  const { sdk } = useDescope();
  const { user } = useUser();
  const googleAuth = useGoogleAuth();

  // Load session token and saved progress from storage on mount
  useEffect(() => {
    console.log('📂 Loading stored session and data...');

    // First, try to get session token from Descope SDK
    const restoreDescopeSession = async () => {
      if (sdk) {
        try {
          if (sdk.getSessionToken) {
            const token = await sdk.getSessionToken();
            if (token) {
              console.log('✅ Session token retrieved from Descope SDK');
              setSessionToken(token);
              localStorage.setItem('descope_session_token', token);
              sessionStorage.setItem('descope_session_token', token);
              return; // Exit early if SDK has the token
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not retrieve session token from SDK:', error.message);
        }
      }

      // Fallback: Try to restore from localStorage first, then sessionStorage
      console.log('🔍 SDK did not provide token, checking storage...');
      let storedToken = localStorage.getItem('descope_session_token');

      if (!storedToken) {
        console.log('ℹ️ No token in localStorage, checking sessionStorage...');
        storedToken = sessionStorage.getItem('descope_session_token');
        if (storedToken) {
          console.log('✅ Found token in sessionStorage:', storedToken.substring(0, 20) + '...');
        }
      } else {
        console.log('✅ Found token in localStorage:', storedToken.substring(0, 20) + '...');
      }

      if (storedToken) {
        console.log('✅ Session token restored from storage');
        setSessionToken(storedToken);
        // Ensure it's in both storages
        localStorage.setItem('descope_session_token', storedToken);
        sessionStorage.setItem('descope_session_token', storedToken);
      } else {
        console.log('❌ No stored Descope session found in any storage');
        console.log('📊 Storage check:', {
          localStorage_keys: Object.keys(localStorage),
          sessionStorage_keys: Object.keys(sessionStorage)
        });
      }
    };

    restoreDescopeSession();

    // Restore action items after OAuth redirect
    const pendingItems = sessionStorage.getItem('pending_action_items');
    if (pendingItems && !result) {
      try {
        const restored = JSON.parse(pendingItems);
        setResult(restored);
        console.log('✅ Restored action items after OAuth');
        // Clear it so we don't restore again
        sessionStorage.removeItem('pending_action_items');
      } catch (e) {
        console.error('Failed to restore pending action items:', e);
      }
    }

    // Load saved analysis result
    const savedResult = localStorage.getItem('mentoriq_analysis_result');
    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);
        // Analysis result restored
        setResult(parsedResult);
        setIsDataRestored(true);
      } catch (error) {
        // Failed to parse saved result
        localStorage.removeItem('mentoriq_analysis_result');
      }
    }

    // Load saved calendar results
    const savedCalendarResults = localStorage.getItem('mentoriq_calendar_results');
    if (savedCalendarResults) {
      try {
        const parsedCalendarResults = JSON.parse(savedCalendarResults);
        // Calendar results restored
        setCalendarResults(parsedCalendarResults);
        setIsDataRestored(true);
      } catch (error) {
        // Failed to parse saved calendar results
        localStorage.removeItem('mentoriq_calendar_results');
      }
    }
  }, []);

  // Sync session token when user state changes
  useEffect(() => {
    if (user && !sessionToken && sdk) {
      // User exists but no sessionToken - try to get it from SDK
      console.log('ℹ️ User exists but no sessionToken, fetching from SDK');
      sdk.getSessionToken?.().then((token) => {
        if (token) {
          console.log('✅ Retrieved session token for existing user');
          setSessionToken(token);
          localStorage.setItem('descope_session_token', token);
          sessionStorage.setItem('descope_session_token', token);
        }
      }).catch((err) => {
        console.warn('⚠️ Failed to get session token:', err);
      });
    }
  }, [user, sessionToken, sdk]);

  // Auto-save analysis result when it changes
  useEffect(() => {
    if (result) {
      localStorage.setItem('mentoriq_analysis_result', JSON.stringify(result));
      // Analysis result saved
    }
  }, [result]);

  // Auto-save calendar results when they change
  useEffect(() => {
    if (calendarResults.length > 0) {
      localStorage.setItem('mentoriq_calendar_results', JSON.stringify(calendarResults));
      // Calendar results saved
    }
  }, [calendarResults]);

  // Debug action items when result changes
  useEffect(() => {
    if (result) {
      // Action items validated
    }
  }, [result]);

  // Sync with Google Auth hook
  useEffect(() => {
    setIsCalendarConnected(googleAuth.isConnected);
  }, [googleAuth.isConnected]);

  // Debug authentication state
  useEffect(() => {
    console.log('🔍 Auth State:', {
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.userId,
      hasSessionToken: !!sessionToken,
      isCalendarConnected: googleAuth.isConnected,
      showEmbeddedAuth,
      hasSdk: !!sdk
    });

    // If we have a session token but no user, try to refresh the user from SDK
    if (sessionToken && !user && sdk) {
      console.log('⚠️ Have sessionToken but no user - attempting to refresh from SDK');
      // The Descope SDK should automatically restore the user if the session is valid
      // Force a re-check
      sdk.refresh?.().catch((e) => {
        console.error('Failed to refresh Descope session:', e);
      });
    }
  }, [user, sessionToken, googleAuth.isConnected, showEmbeddedAuth, sdk]);

  // Auto-trigger calendar creation after returning from Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const calendarConnected = urlParams.get('calendar-connected');
    const justConnected = sessionStorage.getItem('calendar_just_connected');

    // Only require sessionToken, not user (user object may not be loaded yet after redirect)
    if ((calendarConnected === 'true' || justConnected === 'true') && result && result.actionPlan && googleAuth.isConnected && sessionToken) {
      // Clear markers
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      sessionStorage.removeItem('calendar_just_connected');

      // Auto-trigger calendar creation
      console.log('✅ Returned from Google OAuth - auto-creating calendar events...');
      console.log('📊 Auth state after OAuth return:', {
        hasResult: !!result,
        hasActionPlan: !!result?.actionPlan,
        isConnected: googleAuth.isConnected,
        hasUser: !!user,
        userId: user?.userId,
        hasSessionToken: !!sessionToken
      });

      // Auto-create calendar events (even if user object not loaded yet)
      setTimeout(() => {
        handleScheduleActions();
      }, 1000);
    }
  }, [result, googleAuth.isConnected, sessionToken]);

  // Check if user is authenticated and has calendar connection
  useEffect(() => {
    const checkCalendarConnection = async () => {
      if (user && user.userId) {
        try {
          // Check if user has connected Google Calendar via Descope
          const hasConnection = localStorage.getItem(`descope_calendar_${user.userId}`);
          // Checking calendar connection
          
          if (hasConnection) {
            setIsCalendarConnected(true);
            // Google Calendar connected
          } else {
            setIsCalendarConnected(false);
            // No Google Calendar connection found
          }
        } catch (error) {
          // Failed to check calendar connection
          setIsCalendarConnected(false);
        }
      } else {
        // Cannot check calendar connection - user not available
        setIsCalendarConnected(false);
      }
    };
    checkCalendarConnection();
  }, [user]);

  const processingStages = [
    { stage: 'uploading', message: 'Uploading your meeting recording...', progress: 20 },
    { stage: 'transcribing', message: 'Transcribing conversation with AI...', progress: 40 },
    { stage: 'analyzing', message: 'Extracting insights and patterns...', progress: 70 },
    { stage: 'planning', message: 'Generating action plan...', progress: 90 },
    { stage: 'completed', message: 'Processing completed successfully!', progress: 100 }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select an audio or video file (MP3, MP4, WAV, M4A, etc.)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select an audio or video file (MP3, MP4, WAV, M4A, etc.)');
      }
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a',
      'audio/aiff', 'audio/x-aiff', 'audio/flac', 'audio/ogg', 'audio/webm',
      'video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime',
      'application/octet-stream' // For some audio files that might be detected as this
    ];
    
    const validExtensions = /\.(mp3|wav|m4a|mp4|mov|avi|webm|ogg|aiff|flac|aac|wma)$/i;
    
    return validTypes.includes(file.type) || validExtensions.test(file.name);
  };

  const simulateProcessing = async () => {
    for (let i = 0; i < processingStages.length; i++) {
      const stage = processingStages[i];
      setCurrentStage({ ...stage, completed: false });
      
      // Simulate processing time for each stage
      const delay = stage.stage === 'completed' ? 500 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      setCurrentStage({ ...stage, completed: true });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Upload file
      setCurrentStage({ stage: 'uploading', message: 'Uploading your meeting recording...', progress: 20, completed: false });
      
      const formData = new FormData();
      formData.append('meeting', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadResult = await uploadResponse.json();
      setCurrentStage({ stage: 'uploading', message: 'Upload completed!', progress: 20, completed: true });

      // Step 2: Process the meeting
      setCurrentStage({ stage: 'transcribing', message: 'Processing with AI pipeline...', progress: 40, completed: false });

      const processResponse = await fetch('/api/meetings/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: uploadResult.file.filename,
          metadata: {
            title: file.name,
            userId: 'demo-user'
          }
        })
      });

      if (!processResponse.ok) {
        throw new Error('Failed to process meeting');
      }

      // Simulate the processing stages
      await simulateProcessing();

      const processResult = await processResponse.json();
      // Processing completed successfully
      console.log('🎯 Received action items from API:', processResult.actionPlan?.immediateActions?.length || 0);
      console.log('📋 First action item:', processResult.actionPlan?.immediateActions?.[0]);
      
      setResult(processResult);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process meeting');
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConnectCalendar = () => {
    // Connecting Google Calendar via redirect (Descope session will persist in cookies)

    if (!user || !sessionToken) {
      // User not authenticated with Descope first - show auth UI
      setShowEmbeddedAuth(true);
      setError('Please sign in to connect your Google Calendar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    console.log('🔐 Starting Google Calendar connection via redirect');
    console.log('💾 Current auth state:', {
      hasUser: !!user,
      userId: user?.userId,
      hasSessionToken: !!sessionToken
    });

    // Save current results to sessionStorage so we can restore after OAuth redirect
    if (result) {
      sessionStorage.setItem('pending_action_items', JSON.stringify(result));
      console.log('✅ Saved action items to sessionStorage');
    }

    // CRITICAL: Ensure Descope session token is saved to BOTH storages before redirect
    if (sessionToken) {
      localStorage.setItem('descope_session_token', sessionToken);
      sessionStorage.setItem('descope_session_token', sessionToken);
      console.log('✅ Descope session token saved to both localStorage and sessionStorage:', sessionToken.substring(0, 20) + '...');
    } else {
      console.error('❌ No sessionToken to save before OAuth redirect!');
      setError('Session token missing - please try signing in again');
      return;
    }

    // Verify it was saved
    const savedToken = localStorage.getItem('descope_session_token');
    if (savedToken) {
      console.log('✅ Verified: Token is in localStorage');
    } else {
      console.error('❌ Failed to save token to localStorage!');
      return;
    }

    // Use the redirect flow from the hook
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    googleAuth.connect(clientId);
  };

  const handleScheduleActions = async (customizedItems?: any[]) => {
    console.log('🚀 handleScheduleActions called', {
      hasUser: !!user,
      hasSessionToken: !!sessionToken,
      isCalendarConnected: googleAuth.isConnected,
      hasCustomizedItems: !!customizedItems,
      hasActionPlan: !!result?.actionPlan
    });

    // Check for session token (user object might be temporarily unavailable after OAuth redirect)
    if (!sessionToken) {
      console.warn('❌ No Descope session token');
      setShowEmbeddedAuth(true);
      setError('Please sign in to schedule calendar events');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If no user but we have session token, it's likely the Descope SDK is still loading
    // This can happen right after OAuth redirect - we'll proceed with the token
    if (!user) {
      console.warn('⚠️ Descope user object not loaded yet, but session token exists - proceeding');
    }

    const actionItems = customizedItems || result?.actionPlan?.immediateActions;
    if (!actionItems) {
      console.warn('❌ No action items found');
      setError('No action items available to schedule');
      return;
    }

    // Check if Google Calendar is connected
    if (!googleAuth.isConnected) {
      console.warn('❌ Google Calendar not connected');
      setError('Please connect your Google Calendar first');
      return;
    }

    console.log('✅ All checks passed, proceeding with calendar creation...');
    console.log('📊 Action items to convert:', actionItems);

    try {
      setIsSchedulingCalendar(true);
      setError(null);

      console.log('🔄 Converting action items to calendar events format...');

      // Convert action items to Google Calendar events format
      const events = actionItems.map((action, index) => {
        console.log(`📝 Processing action ${index + 1}:`, action.title || action.action);
        console.log('📅 Action data:', { dueDate: action.dueDate, estimatedTime: action.estimatedTime });

        // Use custom schedule date if provided, otherwise use default logic
        let scheduledDate: Date;
        let duration: number;

        if (action.customScheduleDate && action.customDuration) {
          // Use custom date and duration from ActionItemCustomizer
          scheduledDate = new Date(action.customScheduleDate);
          // Parse duration - it might be a string like "60 minutes" or a number
          duration = typeof action.customDuration === 'number'
            ? action.customDuration
            : parseInt(String(action.customDuration).replace(/\D/g, '')) || 60;
          console.log('✅ Using custom schedule:', { date: scheduledDate, duration });
        } else {
          // Use default logic: 2 days before due date at 10 AM
          // First, try to parse the due date
          let dueDate: Date;

          if (action.dueDate) {
            dueDate = new Date(action.dueDate);

            // Check if date is valid
            if (isNaN(dueDate.getTime())) {
              console.warn(`⚠️ Invalid dueDate for action ${index + 1}: ${action.dueDate}, using default (tomorrow)`);
              dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + 1); // Default to tomorrow
            }
          } else {
            console.warn(`⚠️ No dueDate for action ${index + 1}, using default (tomorrow)`);
            dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 1); // Default to tomorrow
          }

          // Schedule 2 days before due date at 10 AM
          scheduledDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000);

          // If that's in the past, schedule for tomorrow instead
          const now = new Date();
          if (scheduledDate < now) {
            console.warn(`⚠️ Scheduled date is in the past, using tomorrow at 10 AM`);
            scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 1);
          }

          scheduledDate.setHours(10, 0, 0, 0);

          // Parse estimatedTime - it might be "60 minutes" or a number
          if (action.estimatedTime) {
            duration = typeof action.estimatedTime === 'number'
              ? action.estimatedTime
              : parseInt(String(action.estimatedTime).replace(/\D/g, '')) || 60;
          } else {
            duration = 60; // Default 60 minutes
          }

          console.log('✅ Using default schedule:', { date: scheduledDate, duration });
        }

        const endDate = new Date(scheduledDate.getTime() + duration * 60 * 1000);

        // Validate dates before converting to ISO
        if (isNaN(scheduledDate.getTime()) || isNaN(endDate.getTime())) {
          console.error(`❌ Invalid date for action ${index + 1}, skipping`);
          throw new Error(`Invalid date for action: ${action.title || action.action}`);
        }

        // Get title from different possible fields
        const title = action.title || action.action || action.summary || `Action Item ${index + 1}`;
        const description = action.description || action.details || 'No description available';

        console.log('✅ Event configured:', { title, start: scheduledDate.toISOString(), duration });

        return {
          summary: `🎯 ${title}`,
          description: `MentorIQ Action Item\n\n${description}\n\nPriority: ${action.priority || 'medium'}\nEstimated Time: ${duration} minutes\nSuccess Rate: ${Math.round((action.successProbability || 0.8) * 100)}%\n\nGenerated from your mentor conversation analysis.`,
          start: {
            dateTime: scheduledDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          reminders: { useDefault: true },
          colorId: action.priority === 'high' ? '11' : action.priority === 'medium' ? '5' : '2'
        };
      });

      // Creating calendar events via backend
      console.log(`📅 Converted ${events.length} action items to calendar events format`);

      // Get the Google token from localStorage
      const googleToken = localStorage.getItem('google_access_token');
      const tokenExpiry = localStorage.getItem('google_token_expiry');

      console.log('🔍 Token check:', {
        hasToken: !!googleToken,
        hasExpiry: !!tokenExpiry,
        tokenLength: googleToken ? googleToken.length : 0
      });

      // Check if token is valid
      if (!googleToken) {
        console.error('❌ No Google Calendar token found');
        setError('Google Calendar token not found. Please reconnect your calendar.');
        setIsCalendarConnected(false);
        setIsSchedulingCalendar(false);
        return;
      }

      // Check if token is expired
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        console.log('🕐 Token expiry check:', {
          expiryTime: new Date(expiryTime).toLocaleString(),
          now: new Date(now).toLocaleString(),
          isExpired: now >= expiryTime
        });

        if (now >= expiryTime) {
          console.error('❌ Google Calendar token has expired');
          setError('Google Calendar token has expired. Please reconnect your calendar.');
          setIsCalendarConnected(false);
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_token_expiry');
          localStorage.removeItem('google_refresh_token');
          setIsSchedulingCalendar(false);
          return;
        }
      }

      console.log('✅ Google token is valid, proceeding with API call');

      // Use the new backend endpoint with Google token
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ events, googleToken })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Calendar API error:', {
          status: response.status,
          error: errorData
        });

        if ((response.status === 401 || response.status === 403) && errorData.needsConnection) {
          // Token expired or invalid - need to reconnect
          setError('Google Calendar token has expired. Please reconnect your calendar.');
          setIsCalendarConnected(false);
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_token_expiry');
          localStorage.removeItem('google_refresh_token');
          setIsSchedulingCalendar(false);
          return;
        }

        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Calendar API response:', {
        successful: data.successfulEvents,
        total: data.totalEvents,
        hasResults: !!data.results
      });

      // Transform results for UI display
      const transformedResults = data.results.map((r: any, index: number) => ({
        action: r.title || result.actionPlan.immediateActions[index]?.title || result.actionPlan.immediateActions[index]?.action || `Action Item ${index + 1}`,
        event: r.success && r.event ? { htmlLink: r.event.htmlLink, id: r.event.id } : undefined,
        error: r.success ? undefined : r.error
      }));

      setCalendarResults(transformedResults);

      const successful = data.successfulEvents;
      const total = data.totalEvents;

      if (successful === total && successful > 0) {
        alert(`🎉 Success! All ${successful} action items have been added to your Google Calendar!\n\nYou can view them in your calendar now.`);
      } else if (successful > 0) {
        alert(`⚠️ Partial success: ${successful} out of ${total} action items were added to your calendar.\n\nCheck the results below for details about which events failed.`);
      } else {
        setError(`Failed to create any calendar events. Please check the error details below.`);
      }
      
    } catch (error) {
      console.error('❌ Calendar creation error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule action items';
      setError(errorMessage);

      // Show detailed error in console
      if (error instanceof Error && error.message) {
        console.error('📛 Error message:', error.message);
      }

      // If authentication error, clear stored session token
      if (errorMessage.includes('Authentication') || errorMessage.includes('401')) {
        setSessionToken(null);
        localStorage.removeItem('descope_session_token');
      }
    } finally {
      console.log('🏁 Calendar creation process completed (success or error)');
      setIsSchedulingCalendar(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) {
      return <FileVideo className="w-8 h-8 text-blue-500" />;
    }
    return <FileAudio className="w-8 h-8 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80">
              <Home className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MentorIQ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto overflow-hidden break-words space-y-6">
          {/* Data Restoration Indicator */}
          {isDataRestored && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Previous analysis restored from local storage</span>
                <span className="text-green-600 text-sm ml-2">(Data persists through page refreshes)</span>
              </div>
              <Button
                onClick={() => {
                  // Clear all saved data
                  localStorage.removeItem('mentoriq_analysis_result');
                  localStorage.removeItem('mentoriq_calendar_results');
                  setResult(null);
                  setCalendarResults([]);
                  setIsDataRestored(false);
                  // All saved data cleared
                }}
                variant="outline"
                size="sm"
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Clear Saved Data
              </Button>
            </div>
          )}


          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {!result ? (
                <>Upload Your <span className="gradient-text">Meeting Recording</span></>
              ) : (
                <>Your <span className="gradient-text">Action Plan</span></>
              )}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {!result ? (
                'Upload any audio or video file from your meetings, calls, or conversations to get AI-powered insights'
              ) : (
                'Review your personalized action items and add them to your calendar'
              )}
            </p>
          </div>

          {/* Step 1: File Upload (show when no result) */}
          {!result && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Recording</CardTitle>
                <CardDescription>
                  Upload any audio or video file from your meetings, calls, or conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : file
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.mov,.avi,.webm,.ogg,.aiff,.flac,.aac,.wma"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!file ? (
                    <>
                      <UploadIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">
                        {isDragging ? 'Drop your file here' : 'Drag & drop your meeting file'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Or click to browse and select a file
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['MP3', 'MP4', 'WAV', 'M4A', 'MOV', 'AVI', 'WEBM'].map((format) => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <div className="flex items-center justify-center mb-2">
                        {getFileIcon(file)}
                        <span className="ml-2 font-semibold">{file.name}</span>
                      </div>
                      <p className="text-muted-foreground">
                        Size: {formatFileSize(file.size)} • Ready to process
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Choose Different File
                      </Button>
                    </>
                  )}
                </div>

                {error && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {file && !isProcessing && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={handleUpload}
                      size="lg"
                      className="px-8 py-4 text-lg"
                    >
                      <Brain className="mr-2 h-5 w-5" />
                      Process with AI
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show user info if authenticated */}
          {user && sessionToken && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-green-900">✅ Signed in as: {user.email || user.userId}</h3>
                  {isCalendarConnected && (
                    <p className="text-sm text-green-700 mt-1">📅 Google Calendar connected</p>
                  )}
                </div>
                <Button
                  onClick={() => {
                    setSessionToken(null);
                    localStorage.removeItem('descope_session_token');
                    setIsCalendarConnected(false);
                    localStorage.removeItem('google_access_token');
                    localStorage.removeItem('google_token_expiry');
                    localStorage.removeItem('google_refresh_token');
                    if (user?.userId) {
                      localStorage.removeItem(`descope_calendar_${user.userId}`);
                    }
                    sdk?.logout();
                  }}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}


          {/* Processing Status */}
          {isProcessing && currentStage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Your Meeting
                </CardTitle>
                <CardDescription>
                  Our AI is analyzing your conversation and generating insights...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{currentStage.message}</span>
                      <span className="text-sm text-muted-foreground">{currentStage.progress}%</span>
                    </div>
                    <Progress value={currentStage.progress} className="h-3" />
                  </div>
                  
                  {currentStage.completed && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Stage completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                        Processing Complete!
                      </CardTitle>
                      <CardDescription>
                        Your meeting has been processed and insights generated
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {Math.round((result.metadata?.confidence || 0.89) * 100)}% Confidence
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Action Plan Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Generated Action Plan</CardTitle>
                  <CardDescription>
                    Specific, actionable steps based on the advice in your conversation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.actionPlan?.immediateActions?.slice(0, 3).map((action: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <h4 className="font-semibold text-base leading-tight min-w-0 flex-1">{action.title}</h4>
                          <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'} className="shrink-0 self-start">
                            {action.priority} priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 text-sm">{action.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="flex items-center">⏱️ {action.estimatedTime} min</span>
                          <span className="flex items-center">📅 Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                          <span className="flex items-center">📊 {Math.round((action.successProbability || 0.8) * 100)}% success rate</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Authentication Section (show if user not authenticated) */}
              {(!user || !sessionToken) && showEmbeddedAuth && (
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-center">Sign In to Connect Calendar</CardTitle>
                    <CardDescription className="text-center">
                      Create an account or sign in to schedule your action items in Google Calendar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg border descope-auth-section">
                      <h3 className="text-lg font-semibold mb-4 text-center">Sign In with Descope</h3>
                      <div className="max-w-md mx-auto">
                        <Descope
                          projectId={import.meta.env.VITE_DESCOPE_PROJECT_ID || 'P3223qYZVJLHP1BYlfXDuKaDtjSk'}
                          flowId="sign-up-or-in"
                          onSuccess={(e) => {
                            console.log('🎉 Descope authentication successful!', e.detail);

                            const possibleTokens = [
                              e.detail?.sessionJwt,
                              e.detail?.refreshJwt,
                              e.detail?.session?.token,
                              e.detail?.sessionToken,
                              e.detail?.token,
                              e.detail?.session?.sessionToken,
                              e.detail?.session?.refreshJwt,
                              e.detail?.session?.jwt
                            ].filter(Boolean);

                            const token = possibleTokens[0];

                            if (token) {
                              console.log('💾 Saving Descope session token to storage');
                              setSessionToken(token);

                              // Save to BOTH localStorage and sessionStorage for redundancy
                              localStorage.setItem('descope_session_token', token);
                              sessionStorage.setItem('descope_session_token', token);

                              // Also save user info if available
                              if (e.detail?.user) {
                                localStorage.setItem('descope_user', JSON.stringify(e.detail.user));
                                console.log('✅ Saved user info:', e.detail.user.email || e.detail.user.userId);
                              }

                              console.log('✅ Session token saved successfully');
                            } else {
                              console.warn('⚠️ No session token found in Descope response');
                            }

                            setShowEmbeddedAuth(false);
                            setError(null);
                          }}
                          onError={(e) => {
                            console.error('❌ Descope authentication error:', e);
                            setError('Authentication failed. Please try again.');
                          }}
                          theme="light"
                        />
                      </div>
                      <div className="text-center mt-4">
                        <Button
                          onClick={() => setShowEmbeddedAuth(false)}
                          variant="ghost"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Calendar Integration Section */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold mb-2">📅 Schedule in Google Calendar</h3>
                      <p className="text-sm text-muted-foreground">
                        {isCalendarConnected
                          ? "Calendar connected! Customize and schedule your action items below."
                          : "Connect your calendar to automatically schedule these action items"}
                      </p>
                    </div>

                    {!isCalendarConnected ? (
                      <div className="max-w-md mx-auto space-y-4">
                        <Button
                          onClick={handleConnectCalendar}
                          className="btn-hero w-full"
                          disabled={googleAuth.isChecking}
                          size="lg"
                        >
                          {googleAuth.isChecking ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Checking connection...
                            </>
                          ) : (
                            <>
                              <Calendar className="mr-2 h-5 w-5" />
                              Connect Google Calendar
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          🔒 You'll be securely redirected to Google to authorize calendar access
                        </p>
                      </div>
                    ) : (
                        <div className="w-full space-y-4">
                          <ActionItemCustomizer
                            actionItems={result.actionPlan?.immediateActions || []}
                            onSchedule={handleScheduleActions}
                            isScheduling={isSchedulingCalendar}
                          />

                          <div className="mt-4">
                            <Button
                              onClick={() => {
                                if (result?.actionPlan?.immediateActions) {
                                  calendarDownloadService.downloadMultipleEvents(result.actionPlan.immediateActions);
                                }
                              }}
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Download as .ics file (alternative)
                            </Button>
                          </div>
                        </div>
                      )}
                </CardContent>
              </Card>
                  
                  {calendarResults.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">
                            {calendarResults.filter(r => !r.error).length} actions scheduled successfully!
                          </span>
                        </div>
                        <Button
                          onClick={handleScheduleActions}
                          disabled={isSchedulingCalendar}
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          {isSchedulingCalendar ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <Calendar className="mr-2 h-4 w-4" />
                              Retry Calendar
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {calendarResults.map((result, index) => (
                          <div key={index} className="flex items-center text-sm">
                            {result.error ? (
                              <>
                                <AlertCircle className="h-3 w-3 text-red-500 mr-2" />
                                <span className="text-red-700">{result.action}: {typeof result.error === 'object' ? JSON.stringify(result.error) : result.error}</span>
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3 w-3 text-green-500 mr-2" />
                                <span className="text-green-700">{result.action}</span>
                                {result.event?.htmlLink && (
                                  <a 
                                    href={result.event.htmlLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {result.actionPlan?.immediateActions?.length || 3}
                      </div>
                      <p className="text-sm text-muted-foreground">Action Items Generated</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-secondary mb-2">
                        {result.transcription?.duration || 5} min
                      </div>
                      <p className="text-sm text-muted-foreground">Meeting Duration</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {result.insights?.adviceGiven?.length || 3}
                      </div>
                      <p className="text-sm text-muted-foreground">Key Insights Extracted</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Try Another */}
              <div className="text-center">
                <Button 
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setError(null);
                  }}
                  variant="outline"
                  size="lg"
                >
                  Process Another Meeting
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;