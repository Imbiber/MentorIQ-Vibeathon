'use client'

import { MeetingInsights, ActionItem } from '@/lib/types'
import { formatConfidence, getPriorityColor, getComplexityIcon } from '@/lib/utils'
import { TrendingUp, AlertTriangle, Target, Calendar, Brain } from 'lucide-react'

interface InsightResultsProps {
  insights: MeetingInsights
  actions: ActionItem[]
  actionPlan: any
}

export function InsightResults({ insights, actions, actionPlan }: InsightResultsProps) {
  if (!insights) return null

  return (
    <div className="space-y-6">
      
      {/* Key Insights Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Key Insights</h3>
          <span className="text-sm text-gray-500">
            {formatConfidence(insights.confidence)} confidence
          </span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🎯 Advice Given</h4>
            <div className="space-y-2">
              {insights.adviceGiven?.slice(0, 3).map((advice, index) => (
                <div key={advice.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(advice.impact as any)}`}>
                      {advice.impact} impact
                    </span>
                    <span className="text-xs text-gray-500">
                      {getComplexityIcon(advice.complexity)}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{advice.title}</p>
                  <p className="text-xs text-gray-600 mt-1">"{advice.quote}"</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🔍 Behavioral Patterns</h4>
            <div className="space-y-2">
              {insights.behavioralPatterns?.map((pattern, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">{pattern.pattern}</p>
                  <p className="text-xs text-gray-600 mt-1">{pattern.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Confidence: {formatConfidence(pattern.confidence)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Action Plan</h3>
        </div>
        
        <div className="space-y-4">
          {actions?.map((action, index) => (
            <div key={action.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(action.priority)}`}>
                    {action.priority}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {action.complexity}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>⏱️ ~{action.estimatedTime}min</span>
                <span>📅 Due: {action.dueDate.toLocaleDateString()}</span>
                <span>🎯 {Math.round(action.successProbability * 100)}% success rate</span>
              </div>
              
              {action.barriers && action.barriers.length > 0 && (
                <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-400">
                  <div className="flex items-center gap-1 text-sm font-medium text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    Potential Barriers
                  </div>
                  <ul className="text-xs text-amber-700 mt-1 ml-5">
                    {action.barriers.map((barrier, i) => (
                      <li key={i}>• {barrier}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Strategy */}
      {actionPlan && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Implementation Strategy</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">🔄 Habit Formation</h4>
              <div className="space-y-3">
                {actionPlan.habitFormation?.map((habit: any, index: number) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-sm">{habit.habit}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Trigger:</strong> {habit.trigger}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Frequency:</strong> {habit.frequency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">⚠️ Risk Mitigation</h4>
              <div className="space-y-3">
                {actionPlan.riskMitigation?.map((risk: any, index: number) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                    <p className="font-medium text-sm">{risk.risk}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Probability:</strong> {Math.round(risk.probability * 100)}%
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Ready to Start Implementing?</h3>
        <p className="text-gray-600 mb-4">
          Your action plan is ready. Connect your calendar to automatically schedule implementation time.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Connect Calendar
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}