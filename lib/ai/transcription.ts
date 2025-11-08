import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'

interface TranscriptionResult {
  transcript: string
  speakers: SpeakerSegment[]
  duration: number
  confidence: number
  language: string
}

interface SpeakerSegment {
  speaker: string
  text: string
  start: number
  end: number
  confidence: number
}

export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
  try {
    // For MVP, we'll use a mock transcription
    // In production, this would integrate with AssemblyAI
    
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`)
    }

    // Get audio duration using ffmpeg
    const duration = await getAudioDuration(audioPath)

    // Mock transcription result for development
    const mockTranscript = generateMockTranscript()

    return {
      transcript: mockTranscript.text,
      speakers: mockTranscript.speakers,
      duration: duration,
      confidence: 0.95,
      language: 'en'
    }

  } catch (error) {
    // Transcription failed
    throw new Error(`Failed to transcribe audio: ${error}`)
  }
}

async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .ffprobe((err, metadata) => {
        if (err) {
          reject(err)
        } else {
          const duration = metadata.format.duration || 0
          resolve(Math.round(duration / 60)) // Convert to minutes
        }
      })
  })
}

function generateMockTranscript() {
  return {
    text: `Sarah (Mentor): So how has your time management been going since our last conversation?

John (Mentee): Honestly, still struggling. I keep saying yes to too many meetings and then I don't have focused time for the strategic work you mentioned.

Sarah: I remember we talked about blocking calendar time. Have you tried that?

John: I set up a few blocks but then people just book over them anyway. I guess I'm not being firm enough about protecting that time.

Sarah: That's exactly the issue. You need to start treating your focus blocks like you would treat a client meeting. Would you cancel a client meeting for someone else's random request?

John: No, definitely not.

Sarah: Right. So here's what I want you to try this week. Every Monday morning, block out three 2-hour focus sessions for the week. Make them recurring meetings with yourself, and put them in conference rooms if you have to. Then when someone asks to meet during those times, you say 'I'm not available then, but I have these other slots open.'

John: That makes sense. I think I'm just worried about seeming unresponsive or difficult to work with.

Sarah: I get that. But think about it this way - when you're constantly reactive and don't have time for strategic thinking, how helpful are you really being to your team? They need you to be thinking ahead, not just responding to whatever's urgent today.

John: You're right. And I've definitely noticed that the weeks when I do get focus time, I come up with much better solutions.

Sarah: Exactly. And here's another thing to try - start delegating more. You mentioned your team members asking you questions they could probably figure out themselves. Next time someone asks something that isn't truly urgent, try saying 'What approaches have you already considered?' or 'What would you do if I wasn't available?' This helps them develop problem-solving skills and gives you back time.

John: That's a good framework. I tend to just jump in and solve things because it feels faster in the moment.

Sarah: Which creates a cycle where they depend on you more and more. Break that cycle by coaching them through the thinking process instead of just giving answers.

John: Okay, so to summarize - protect my calendar time like client meetings, and coach my team instead of just solving their problems directly.

Sarah: Perfect. And let's add one more thing - I want you to track your energy levels throughout the day for the next two weeks. Notice when you feel most focused and creative, and try to align your most important work with those natural energy peaks.

John: Good idea. I suspect I'm more creative in the mornings but I've been using that time for emails.

Sarah: Classic mistake. Email is reactive work. Save your peak energy for proactive, strategic thinking. Your future self will thank you.`,
    
    speakers: [
      {
        speaker: "Sarah (Mentor)",
        text: "So how has your time management been going since our last conversation?",
        start: 0,
        end: 4,
        confidence: 0.98
      },
      {
        speaker: "John (Mentee)", 
        text: "Honestly, still struggling. I keep saying yes to too many meetings and then I don't have focused time for the strategic work you mentioned.",
        start: 5,
        end: 12,
        confidence: 0.96
      }
      // Additional speaker segments would continue...
    ]
  }
}

// Real AssemblyAI integration
export async function transcribeWithAssemblyAI(audioPath: string): Promise<TranscriptionResult> {
  const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY
  
  if (!ASSEMBLY_AI_API_KEY) {
    throw new Error('AssemblyAI API key not configured')
  }

  try {
    // Step 1: Upload audio file
    const uploadUrl = await uploadToAssemblyAI(audioPath, ASSEMBLY_AI_API_KEY)
    
    // Step 2: Start transcription with speaker diarization
    const transcriptId = await startTranscription(uploadUrl, ASSEMBLY_AI_API_KEY)
    
    // Step 3: Poll for completion
    const transcriptData = await pollForCompletion(transcriptId, ASSEMBLY_AI_API_KEY)
    
    // Step 4: Parse and return structured result
    return parseAssemblyAIResult(transcriptData)
    
  } catch (error) {
    // AssemblyAI transcription failed
    throw new Error(`Failed to transcribe with AssemblyAI: ${error}`)
  }
}

async function uploadToAssemblyAI(audioPath: string, apiKey: string): Promise<string> {
  const audioData = fs.readFileSync(audioPath)
  
  const response = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'content-type': 'application/octet-stream'
    },
    body: audioData
  })
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.upload_url
}

async function startTranscription(audioUrl: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true,
      language_detection: true,
      punctuate: true,
      format_text: true
    })
  })
  
  if (!response.ok) {
    throw new Error(`Transcription start failed: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.id
}

async function pollForCompletion(transcriptId: string, apiKey: string): Promise<any> {
  const maxAttempts = 60 // 10 minutes max
  let attempts = 0
  
  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { 'authorization': apiKey }
    })
    
    if (!response.ok) {
      throw new Error(`Polling failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'completed') {
      return data
    } else if (data.status === 'error') {
      throw new Error(`Transcription failed: ${data.error}`)
    }
    
    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000))
    attempts++
  }
  
  throw new Error('Transcription timed out')
}

function parseAssemblyAIResult(data: any): TranscriptionResult {
  const speakers: SpeakerSegment[] = []
  
  if (data.utterances) {
    data.utterances.forEach((utterance: any) => {
      speakers.push({
        speaker: `Speaker ${utterance.speaker}`,
        text: utterance.text,
        start: Math.round(utterance.start / 1000), // Convert to seconds
        end: Math.round(utterance.end / 1000),
        confidence: utterance.confidence || 0.9
      })
    })
  }
  
  return {
    transcript: data.text || '',
    speakers: speakers,
    duration: Math.round((data.audio_duration || 0) / 60), // Convert to minutes
    confidence: data.confidence || 0.9,
    language: data.language_code || 'en'
  }
}