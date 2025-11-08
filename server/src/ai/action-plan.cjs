const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateActionPlan(insights, userContext) {
  try {
    console.log('📋 Starting action plan generation...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not configured, using mock action plan');
      return generateMockActionPlan();
    }

    const systemPrompt = `You are a behavior change expert creating actionable implementation plans from professional development conversations.

CRITICAL: Create action items that are DIRECTLY BASED ON the specific advice, recommendations, and topics discussed in the insights provided. DO NOT create generic professional development advice.

For example:
- If the insights mention "use Google Drive search filters", create actions about practicing those specific filters
- If the insights mention "delegate more tasks", create actions about identifying delegation opportunities
- If the insights mention "improve public speaking", create actions about joining Toastmasters or practicing presentations

Using the BJ Fogg Behavior Model, create a plan with:
1. IMMEDIATE ACTIONS: 3-5 specific tasks derived DIRECTLY from the advice given in the insights
2. HABIT FORMATION: Daily/weekly behaviors based on the conversation topics
3. SCHEDULING STRATEGY: When and how to implement each action
4. RISK MITIGATION: Plans for overcoming likely obstacles

Make each action:
- SPECIFIC to the advice/topics in the insights (not generic professional development)
- Measurable and time-bound
- Achievable within the next 1-4 weeks
- Clearly tied to what was actually discussed`;

    const prompt = `Based on these insights from a mentoring conversation, create SPECIFIC action items that directly implement the advice given.

Insights:\n${JSON.stringify(insights, null, 2)}

IMPORTANT: The action items MUST be about the specific topics, advice, and recommendations mentioned in these insights. Do not create generic "block focus time" or "implement coaching" actions unless those were explicitly discussed.

Respond with a JSON object containing the action plan.`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const responseText = response.choices[0].message.content.trim();
    console.log('📝 OpenAI action plan response:', responseText.substring(0, 200) + '...');
    
    let actionPlan;
    try {
      const jsonData = JSON.parse(responseText);
      
      // Adapt different possible structures
      if (jsonData.action_plan || jsonData.actionPlan) {
        actionPlan = adaptActionPlanStructure(jsonData.action_plan || jsonData.actionPlan);
      } else if (jsonData.immediateActions || jsonData.immediate_actions) {
        actionPlan = normalizeActionPlanFields(jsonData);
      } else {
        actionPlan = adaptGenericActionPlan(jsonData);
      }
    } catch (parseError) {
      console.log('⚠️  Failed to parse OpenAI action plan response:', parseError.message);
      console.log('📝 Raw response snippet:', responseText.substring(0, 300));
      actionPlan = extractActionPlanFromText(responseText);
    }
    
    // Convert date strings to Date objects safely
    if (actionPlan.immediateActions && Array.isArray(actionPlan.immediateActions)) {
      actionPlan.immediateActions = actionPlan.immediateActions.map((action) => ({
        ...action,
        dueDate: action.dueDate ? new Date(action.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }));
    }

    if (actionPlan.habitFormation && Array.isArray(actionPlan.habitFormation)) {
      actionPlan.habitFormation = actionPlan.habitFormation.map((habit) => ({
        ...habit,
        startDate: habit.startDate ? new Date(habit.startDate) : new Date()
      }));
    }

    console.log('✅ Action plan generated successfully');
    return actionPlan;

  } catch (error) {
    console.error('❌ OpenAI action plan error:', error);
    console.log('🔄 Falling back to mock action plan...');
    return generateMockActionPlan();
  }
}

function generateMockActionPlan() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);

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
  };
}

// Extract action plan from raw text when JSON parsing fails
function extractActionPlanFromText(text) {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const actions = [];
  
  // Look for action-like content in the text
  const actionMatches = text.match(/"action_\d+":\s*"([^"]+)"/g) || 
                       text.match(/"content":\s*"([^"]+)"/g) || [];
  
  actionMatches.forEach((match, index) => {
    const content = match.replace(/"action_\d+":\s*"/, '').replace(/"content":\s*"/, '').replace(/"$/, '');
    if (content.length > 10) {
      actions.push({
        id: `text-action-${index + 1}`,
        title: content.length > 50 ? content.substring(0, 47) + '...' : content,
        description: content,
        category: 'productivity',
        priority: 'medium',
        complexity: 'medium',
        estimatedTime: 60,
        dueDate: nextWeek,
        successProbability: 0.8,
        barriers: [],
        motivationLevel: 0.7
      });
    }
  });
  
  // If no actions found, create default ones based on common meeting improvement themes
  if (actions.length === 0) {
    actions.push({
      id: 'default-1',
      title: 'Implement meeting efficiency tools',
      description: 'Set up and use digital tools to improve meeting productivity and note-taking',
      category: 'productivity',
      priority: 'high',
      complexity: 'medium',
      estimatedTime: 60,
      dueDate: nextWeek,
      successProbability: 0.8,
      barriers: ['Learning curve', 'Team adoption'],
      motivationLevel: 0.8
    });
  }
  
  return {
    immediateActions: actions,
    habitFormation: generateMockActionPlan().habitFormation,
    schedulingStrategy: generateMockActionPlan().schedulingStrategy,
    riskMitigation: generateMockActionPlan().riskMitigation
  };
}

// Normalize OpenAI response to expected format
function normalizeActionPlanFields(data) {
  const normalized = {
    immediateActions: [],
    habitFormation: data.habitFormation || data.habit_formation || generateMockActionPlan().habitFormation,
    schedulingStrategy: data.schedulingStrategy || data.scheduling_strategy || generateMockActionPlan().schedulingStrategy,
    riskMitigation: data.riskMitigation || data.risk_mitigation || generateMockActionPlan().riskMitigation
  };

  // Normalize immediateActions array
  const actions = data.immediateActions || data.immediate_actions || [];
  normalized.immediateActions = actions.map((action, index) => {
    return {
      id: action.id || `action-${index + 1}`,
      title: action.title || action.task || action.action || `Action ${index + 1}`,
      description: action.description || action.content || extractDescription(action.specifics) || action.task || '',
      category: action.category || 'general',
      priority: action.priority || 'medium',
      complexity: action.complexity || action.difficulty || 'medium',
      estimatedTime: action.estimatedTime || action.estimated_time || extractEstimatedTime(action.specifics) || 60,
      dueDate: action.dueDate || action.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      successProbability: action.successProbability || action.success_probability || 0.8,
      barriers: action.barriers || [],
      motivationLevel: action.motivationLevel || action.motivation_level || 0.7
    };
  });

  return normalized;
}

// Helper to extract description from specifics object
function extractDescription(specifics) {
  if (!specifics || typeof specifics !== 'object') return '';
  
  const parts = [];
  if (specifics.duration) parts.push(`Duration: ${specifics.duration}`);
  if (specifics.frequency) parts.push(`Frequency: ${specifics.frequency}`);
  if (specifics.details) parts.push(specifics.details);
  if (specifics.description) return specifics.description;
  
  return parts.join(', ');
}

// Helper to extract estimated time from specifics
function extractEstimatedTime(specifics) {
  if (!specifics || typeof specifics !== 'object') return 60;
  
  if (specifics.estimatedTime) return specifics.estimatedTime;
  if (specifics.duration) {
    const match = String(specifics.duration).match(/(\d+)\s*(hour|minute|min|hr)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      return unit.startsWith('hour') || unit === 'hr' ? value * 60 : value;
    }
  }
  
  return 60;
}

// Helper functions to adapt different action plan structures
function adaptActionPlanStructure(actionPlanData) {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const rawData = {
    immediateActions: actionPlanData.immediate_actions || actionPlanData.immediateActions || actionPlanData.actions || [],
    habitFormation: actionPlanData.habit_formation || actionPlanData.habitFormation || actionPlanData.habits || [],
    schedulingStrategy: actionPlanData.scheduling_strategy || actionPlanData.schedulingStrategy || actionPlanData.schedule || [],
    riskMitigation: actionPlanData.risk_mitigation || actionPlanData.riskMitigation || actionPlanData.risks || []
  };
  
  return normalizeActionPlanFields(rawData);
}

function adaptGenericActionPlan(data) {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Try to extract actions from various possible formats
  const actions = [];
  
  // Look for action-like data in the response
  Object.keys(data).forEach((key) => {
    if (key.toLowerCase().includes('action') && typeof data[key] === 'string') {
      actions.push({
        id: `action-${actions.length + 1}`,
        title: `Action ${actions.length + 1}`,
        description: data[key],
        category: 'general',
        priority: 'medium',
        complexity: 'medium',
        estimatedTime: 60,
        dueDate: nextWeek,
        successProbability: 0.8,
        barriers: [],
        motivationLevel: 0.7
      });
    }
  });
  
  return {
    immediateActions: actions.length > 0 ? actions : generateMockActionPlan().immediateActions,
    habitFormation: generateMockActionPlan().habitFormation,
    schedulingStrategy: generateMockActionPlan().schedulingStrategy,
    riskMitigation: generateMockActionPlan().riskMitigation
  };
}

module.exports = {
  generateActionPlan
};
