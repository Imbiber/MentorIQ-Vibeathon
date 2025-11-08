import OpenAI from 'openai'
import { MeetingInsights, ActionPlan, ActionItem, HabitItem, ScheduleItem, RiskItem } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface UserContext {
  userId: string
  implementationHistory?: any[]
  personalityType?: string
  learningStyle?: string
}

export async function generateActionPlan(insights: MeetingInsights, userContext: UserContext): Promise<ActionPlan> {
  try {
    const systemPrompt = `You are a behavior change expert specializing in professional development implementation.

Using the BJ Fogg Behavior Model and Tiny Habits methodology, create an implementation plan that maximizes the likelihood of lasting behavior change.

Consider:
- Motivation levels and emotional context
- Implementation barriers identified  
- User's past patterns and preferences
- Optimal scheduling and habit stacking
- Risk mitigation strategies

Create a plan with:
1. IMMEDIATE ACTIONS: Specific, time-bound tasks (next 1-4 weeks)
2. HABIT FORMATION: Daily/weekly behaviors to develop
3. SCHEDULING STRATEGY: When and how to implement each action
4. RISK MITIGATION: Plans for overcoming likely obstacles

Make actions SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and account for the user's emotional context and barriers.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Insights: ${JSON.stringify(insights, null, 2)}` }
      ],
      functions: [{
        name: "generate_action_plan",
        description: "Generate structured action plan for behavior change",
        parameters: {
          type: "object",
          properties: {
            immediateActions: {
              type: "array",
              items: {
                type: "object", 
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  complexity: { type: "string", enum: ["low", "medium", "high"] },
                  estimatedTime: { type: "number" },
                  dueDate: { type: "string" },
                  successProbability: { type: "number" },
                  barriers: { type: "array", items: { type: "string" } },
                  motivationLevel: { type: "number" }
                }
              }
            },
            habitFormation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  habit: { type: "string" },
                  trigger: { type: "string" },
                  reward: { type: "string" },
                  frequency: { type: "string" },
                  startDate: { type: "string" }
                }
              }
            },
            schedulingStrategy: {
              type: "array", 
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  optimalTime: { type: "string" },
                  duration: { type: "number" },
                  context: { type: "string" }
                }
              }
            },
            riskMitigation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  probability: { type: "number" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            }
          },
          required: ["immediateActions", "habitFormation", "schedulingStrategy", "riskMitigation"]
        }
      }],
      function_call: { name: "generate_action_plan" }
    })

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall?.arguments) {
      throw new Error('No action plan generated')
    }

    const actionPlan = JSON.parse(functionCall.arguments)
    
    // Convert date strings to Date objects
    actionPlan.immediateActions = actionPlan.immediateActions.map((action: any) => ({
      ...action,
      dueDate: new Date(action.dueDate)
    }))

    actionPlan.habitFormation = actionPlan.habitFormation.map((habit: any) => ({
      ...habit,
      startDate: new Date(habit.startDate)
    }))

    return actionPlan as ActionPlan

  } catch (error) {
    // Action plan generation failed
    
    // Return mock action plan for development
    return generateMockActionPlan()
  }
}

function generateMockActionPlan(): ActionPlan {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const twoWeeks = new Date()
  twoWeeks.setDate(twoWeeks.getDate() + 14)

  return {
    immediateActions: [
      {
        id: "action-1",
        title: "Set up weekly focus blocks",
        description: "Block three 2-hour focus sessions every Monday morning, treat as non-negotiable meetings",
        category: "time-management",
        priority: "high",
        complexity: "low",
        estimatedTime: 30,
        dueDate: nextWeek,
        successProbability: 0.85,
        barriers: ["People booking over blocks", "Feeling guilty about boundaries"],
        motivationLevel: 0.8
      },
      {
        id: "action-2",
        title: "Implement coaching questions framework",
        description: "Use 'What approaches have you considered?' before giving direct answers to team questions",
        category: "leadership",
        priority: "high", 
        complexity: "medium",
        estimatedTime: 120,
        dueDate: twoWeeks,
        successProbability: 0.73,
        barriers: ["Feels slower than direct solutions", "Team pushback"],
        motivationLevel: 0.7
      },
      {
        id: "action-3",
        title: "Track daily energy patterns",
        description: "Monitor energy levels hourly for 2 weeks to identify peak performance times",
        category: "personal",
        priority: "medium",
        complexity: "low", 
        estimatedTime: 10,
        dueDate: twoWeeks,
        successProbability: 0.91,
        barriers: ["Remembering to track", "Consistent measurement"],
        motivationLevel: 0.6
      }
    ],
    habitFormation: [
      {
        habit: "Monday morning calendar blocking",
        trigger: "Monday 8am calendar review",
        reward: "Better strategic thinking capability",
        frequency: "Weekly",
        startDate: nextWeek
      },
      {
        habit: "Coaching question before solutions",
        trigger: "Team member asks question",
        reward: "Team growth and time savings",
        frequency: "Daily",
        startDate: new Date()
      }
    ],
    schedulingStrategy: [
      {
        action: "Calendar blocking session",
        optimalTime: "Monday 8:00-8:30 AM",
        duration: 30,
        context: "Start of week, high energy, planning mindset"
      },
      {
        action: "Energy tracking check-ins",
        optimalTime: "Every 2 hours during work day",
        duration: 2,
        context: "Brief reflection on current energy and focus"
      }
    ],
    riskMitigation: [
      {
        risk: "Team members booking over focus blocks",
        probability: 0.7,
        impact: "High - undermines entire strategy",
        mitigation: "Book conference rooms, set blocks as 'busy', prepare standard responses"
      },
      {
        risk: "Reverting to direct problem-solving under pressure",
        probability: 0.8,
        impact: "Medium - slows team development",
        mitigation: "Practice coaching questions, set 5-minute rule before giving answers"
      }
    ]
  }
}