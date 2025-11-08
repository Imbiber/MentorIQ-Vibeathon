'use client'

import { useState, useCallback } from 'react'
import { 
  Brain, 
  Upload, 
  FileAudio, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Play,
  Wand2,
  Mic,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function FileUpload({ onUpload, onUploadComplete, className }: {
  onUpload: (file: File) => void
  onUploadComplete?: (result: any) => void
  className?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      onUpload(file)
      setSuccess(`Successfully uploaded ${file.name}`)
      
      // Simulate successful upload for demo
      setTimeout(() => {
        onUploadComplete?.({ meetingId: 'demo-123' })
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-500 group",
          dragActive 
            ? "border-primary bg-primary/10 scale-105 neon-glow" 
            : "border-white/20 hover:border-primary/50 glass-card",
          uploading && "pointer-events-none"
        )}
      >
        <input
          type="file"
          onChange={handleChange}
          accept="audio/*,video/*,.mp3,.wav,.m4a,.webm,.mp4,.mov,.avi"
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-8">
            {uploading ? (
              <>
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center neon-glow animate-pulse-neon">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                  <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-2">Processing Upload...</p>
                  <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse w-3/4"></div>
                  </div>
                  <p className="text-white/60 mt-2">AI is analyzing your file</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  {dragActive ? (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center neon-glow animate-pulse-neon group-hover:scale-110 transition-transform">
                      <Upload className="w-12 h-12 text-white animate-bounce" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-blue-500/20 transition-all duration-300 group-hover:scale-110">
                      <FileAudio className="w-12 h-12 text-white/60 group-hover:text-primary transition-colors" />
                    </div>
                  )}
                  <Wand2 className="w-5 h-5 text-primary absolute -top-2 -right-2 animate-pulse" />
                </div>
                
                <div className="text-center max-w-md">
                  <h3 className="text-3xl font-black mb-4 gradient-text">
                    {dragActive ? 'Drop it like it\'s hot! 🔥' : 'Upload Your Meeting'}
                  </h3>
                  <p className="text-white/70 text-lg mb-4">
                    Drag & drop your recording or click to browse
                  </p>
                  <p className="text-white/50 text-sm mb-6">
                    Supports: MP3, WAV, MP4, WebM, MOV • Max 500MB<br/>
                    Works with: Zoom, Teams, Meet, Discord, Loom
                  </p>
                  
                  <div className="inline-flex items-center gap-2 glass-morphism rounded-full px-4 py-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium text-white/80">
                      AI processes in ~30 seconds
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-6 p-4 glass-card border border-red-500/30 rounded-2xl flex items-center gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 glass-card border border-green-500/30 rounded-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-300">{success}</p>
        </div>
      )}
    </div>
  )
}

function ProcessingPipeline() {
  const [currentStep, setCurrentStep] = useState(1)
  
  const steps = [
    { 
      title: 'Audio Enhancement', 
      description: 'Optimizing quality and extracting audio from video files',
      icon: Mic,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'AI Transcription', 
      description: 'Converting speech to text with speaker identification',
      icon: FileAudio,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'Insight Extraction', 
      description: 'Analyzing conversation patterns and extracting key advice',
      icon: Brain,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Action Planning', 
      description: 'Generating SMART goals with success probability',
      icon: Target,
      color: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Calendar Sync', 
      description: 'Scheduling implementation time and setting reminders',
      icon: Calendar,
      color: 'from-pink-500 to-pink-600'
    }
  ]

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={cn(
            "glass-card p-6 rounded-2xl transition-all duration-500 animate-scale-in",
            index <= currentStep ? "border-primary/30 neon-glow" : "border-white/10"
          )}
          style={{animationDelay: `${index * 0.2}s`}}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
              index < currentStep 
                ? "bg-gradient-to-br from-green-500 to-green-600 neon-glow" :
              index === currentStep 
                ? `bg-gradient-to-br ${step.color} animate-pulse-neon` :
                "bg-white/10"
            )}>
              {index < currentStep ? (
                <CheckCircle className="w-7 h-7 text-white" />
              ) : index === currentStep ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <step.icon className="w-7 h-7 text-white/40" />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-xl mb-1 text-white">{step.title}</h4>
              <p className="text-white/70">{step.description}</p>
            </div>
            
            <div className="text-right">
              {index < currentStep && (
                <div className="text-green-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </div>
              )}
              {index === currentStep && (
                <div className="text-primary font-semibold flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              )}
              {index > currentStep && (
                <div className="text-white/40 font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Pending
                </div>
              )}
            </div>
          </div>
          
          {index === currentStep && (
            <div className="mt-4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [meetingId, setMeetingId] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleUploadComplete = async (uploadResult: any) => {
    setMeetingId(uploadResult.meetingId)
    setProcessing(true)

    // Simulate processing for demo
    setTimeout(() => {
      const mockResults = {
        insights: {
          adviceGiven: [
            { id: '1', title: 'Time Management Mastery', impact: 'high', confidence: 0.95 },
            { id: '2', title: 'Leadership Communication', impact: 'high', confidence: 0.92 }
          ],
          confidence: 0.89
        },
        actions: [
          { 
            id: '1', 
            title: 'Implement weekly focus blocks',
            description: 'Block three 2-hour focus sessions every Monday, Wednesday, Friday',
            priority: 'high',
            estimatedTime: 30,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            successProbability: 0.85
          },
          {
            id: '2',
            title: 'Practice delegation framework',
            description: 'Use the RACI matrix for all team assignments this week',
            priority: 'medium',
            estimatedTime: 45,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            successProbability: 0.72
          }
        ]
      }
      setResults(mockResults)
      setProcessing(false)
    }, 8000)
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-morphism rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white/80">AI Processing Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 gradient-text text-glow">
            Process Meeting
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Transform any conversation into actionable behavior change plans with our revolutionary AI
          </p>
        </div>

        {/* Upload Section */}
        {!results && (
          <Card className="glass-card border-white/10 mb-12 animate-scale-in">
            <CardContent className="p-8">
              <FileUpload 
                onUpload={handleUpload}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* Processing Pipeline */}
        {processing && (
          <Card className="glass-card border-primary/30 mb-12 neon-glow animate-fade-in">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 gradient-text">
                  <Brain className="w-8 h-8 inline mr-3 animate-pulse" />
                  AI Processing Pipeline
                </h2>
                <p className="text-white/70">
                  Our advanced AI is analyzing your meeting and extracting actionable insights
                </p>
              </div>
              <ProcessingPipeline />
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-12 animate-fade-in">
            <Card className="glass-card border-green-500/30 neon-glow">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-white">
                    Processing Complete! 🎉
                  </h2>
                  <p className="text-white/70">
                    Your meeting has been transformed into actionable insights
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {[
                    { 
                      icon: Brain, 
                      title: 'Insights Found', 
                      value: results.insights?.adviceGiven?.length || 0,
                      color: 'from-blue-500 to-blue-600'
                    },
                    { 
                      icon: Target, 
                      title: 'Action Items', 
                      value: results.actions?.length || 0,
                      color: 'from-green-500 to-green-600'
                    },
                    { 
                      icon: BarChart3, 
                      title: 'Confidence', 
                      value: Math.round((results.insights?.confidence || 0) * 100) + '%',
                      color: 'from-purple-500 to-purple-600'
                    }
                  ].map((metric, index) => (
                    <div key={index} className="glass-card p-6 text-center border-white/10 animate-float" style={{animationDelay: `${index * 0.2}s`}}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-black gradient-text mb-2">{metric.value}</div>
                      <div className="text-white/60">{metric.title}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  {results.actions?.map((action: any, index: number) => (
                    <div key={action.id} className="glass-card p-6 border-white/10 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold mb-2 text-white">{action.title}</h4>
                          <p className="text-white/70">{action.description}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          action.priority === 'high' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        )}>
                          {action.priority}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          ~{action.estimatedTime} minutes
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          Due: {action.dueDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          {Math.round(action.successProbability * 100)}% success rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 glass-card p-8 text-center border-primary/30 neon-glow">
                  <h3 className="text-2xl font-bold mb-4 gradient-text">
                    🚀 Ready to Transform Your Habits?
                  </h3>
                  <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                    Your personalized action plan is ready! Connect your calendar to automatically 
                    schedule implementation time and start your behavior change journey.
                  </p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 neon-glow">
                      <Calendar className="mr-2 h-5 w-5" />
                      Connect Calendar
                    </Button>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 glass-morphism">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      View Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}