'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'

interface ProcessingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed'
}

export function ProcessingPipeline() {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps: ProcessingStep[] = [
    {
      id: 'upload',
      title: 'Audio Enhancement',
      description: 'Optimizing audio quality and extracting audio from video',
      status: 'completed'
    },
    {
      id: 'transcription',
      title: 'Transcription & Speaker ID',
      description: 'Converting speech to text with speaker identification',
      status: 'processing'
    },
    {
      id: 'insights',
      title: 'Insight Extraction',
      description: 'Analyzing conversation for advice and behavioral patterns',
      status: 'pending'
    },
    {
      id: 'planning',
      title: 'Action Plan Generation',
      description: 'Creating implementation strategy with success predictions',
      status: 'pending'
    },
    {
      id: 'integration',
      title: 'Calendar Integration',
      description: 'Setting up implementation schedule and reminders',
      status: 'pending'
    }
  ]

  // Simulate processing progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        clearInterval(timer)
        return prev
      })
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  // Update step statuses based on current step
  const updatedSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'completed' : 
           index === currentStep ? 'processing' : 'pending'
  }))

  return (
    <div className="space-y-4">
      {updatedSteps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="flex-shrink-0">
            {step.status === 'completed' && (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
            {step.status === 'processing' && (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            {step.status === 'pending' && (
              <Clock className="h-6 w-6 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h4 className={`font-medium ${
              step.status === 'completed' ? 'text-green-700' :
              step.status === 'processing' ? 'text-blue-700' : 'text-gray-500'
            }`}>
              {step.title}
            </h4>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
          
          <div className="text-sm font-medium">
            {step.status === 'completed' && (
              <span className="text-green-600">✓ Complete</span>
            )}
            {step.status === 'processing' && (
              <span className="text-blue-600">Processing...</span>
            )}
            {step.status === 'pending' && (
              <span className="text-gray-400">Pending</span>
            )}
          </div>
        </div>
      ))}
      
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Processing Progress</span>
          <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}