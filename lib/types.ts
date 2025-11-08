export interface MeetingInsights {
  adviceGiven: AdviceItem[]
  behavioralPatterns: BehavioralPattern[]
  implementationBarriers: Barrier[]
  successMetrics: Metric[]
  emotionalContext: EmotionalContext
  priorityRanking: PriorityItem[]
  confidence: number
}

export interface AdviceItem {
  id: string
  title: string
  description: string
  category: 'career' | 'skills' | 'leadership' | 'personal' | 'networking'
  impact: 'high' | 'medium' | 'low'
  complexity: 'low' | 'medium' | 'high'
  quote: string
  speaker: string
  timestamp: number
  confidence: number
}

export interface BehavioralPattern {
  pattern: string
  description: string
  frequency: number
  confidence: number
}

export interface Barrier {
  type: 'time' | 'resources' | 'skills' | 'motivation' | 'external'
  description: string
  severity: 'low' | 'medium' | 'high'
  suggestions: string[]
}

export interface Metric {
  name: string
  description: string
  measurement: string
  timeline: string
}

export interface EmotionalContext {
  motivation: number // 0-1
  confidence: number // 0-1
  concerns: string[]
  excitement: number // 0-1
}

export interface PriorityItem {
  actionId: string
  priority: number // 1-10
  reasoning: string
  successProbability: number // 0-1
}

export interface ActionPlan {
  immediateActions: ActionItem[]
  habitFormation: HabitItem[]
  schedulingStrategy: ScheduleItem[]
  riskMitigation: RiskItem[]
}

export interface ActionItem {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  complexity: 'low' | 'medium' | 'high'
  estimatedTime: number // minutes
  dueDate: Date
  successProbability: number
  barriers: string[]
  motivationLevel: number
}

export interface HabitItem {
  habit: string
  trigger: string
  reward: string
  frequency: string
  startDate: Date
}

export interface ScheduleItem {
  action: string
  optimalTime: string
  duration: number
  context: string
}

export interface RiskItem {
  risk: string
  probability: number
  impact: string
  mitigation: string
}

export interface ProcessingStatus {
  stage: 'uploading' | 'transcribing' | 'analyzing' | 'planning' | 'completed' | 'failed'
  progress: number // 0-100
  message: string
  error?: string
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  learningStyle?: string
  personalityType?: string
  timezone: string
  implementationRate: number
  optimalActionComplexity: string
  procrastinationTendency: number
}