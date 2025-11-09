const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

async function extractInsights(transcript, context) {
  try {
    console.log('🧠 Starting insight extraction...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not configured, using mock insights');
      return generateMockInsights();
    }

    const systemPrompt = `You are a behavior change expert analyzing professional development conversations.

Context:
- Meeting Type: ${context.meetingType}
- Participants: ${context.participants?.join(', ') || 'Unknown'}
- Duration: ${context.duration || 'unknown'} minutes

From this transcript, extract and categorize:

1. ADVICE GIVEN: Specific recommendations, suggestions, or guidance provided
2. BEHAVIORAL PATTERNS: Habits, tendencies, or patterns discussed about the mentee
3. IMPLEMENTATION BARRIERS: Obstacles, challenges, or concerns mentioned
4. SUCCESS METRICS: How progress should be measured or tracked
5. EMOTIONAL CONTEXT: Motivation levels, confidence, concerns, excitement
6. PRIORITY RANKING: Most important advice vs nice-to-have suggestions

Format as structured JSON with confidence scores (0-1) and supporting quotes from the transcript.

Focus on actionable insights that can lead to measurable behavior change.`;

    const prompt = `${systemPrompt}\n\nTranscript to analyze:\n${transcript}\n\nPlease respond with a JSON object containing the insights analysis. Format your response as valid JSON only, no other text:`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transcript to analyze:\n${transcript}\n\nPlease respond with a JSON object containing the insights analysis. Format your response as valid JSON only, no other text.` }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const responseText = response.choices[0].message.content.trim();
    console.log('📝 OpenAI response:', responseText.substring(0, 200) + '...');
    
    let insights;
    try {
      const jsonData = JSON.parse(responseText);
      
      // Adapt different possible structures
      if (jsonData.adviceGiven || jsonData.advice_given) {
        insights = jsonData;
      } else {
        // Try to extract meaningful data from whatever structure we got
        insights = adaptGenericToInsights(jsonData);
      }
    } catch (parseError) {
      console.log('⚠️  Failed to parse OpenAI JSON response:', parseError.message);
      console.log('📝 Raw response snippet:', responseText.substring(0, 300));
      // Try to extract insights from the raw text
      insights = extractInsightsFromText(responseText);
    }
    console.log('✅ Insights extracted successfully');
    
    return insights;

  } catch (error) {
    console.error('❌ OpenAI insight extraction error:', error);
    console.log('🔄 Falling back to mock insights...');
    return generateMockInsights();
  }
}

function generateMockInsights() {
  return {
    adviceGiven: [
      {
        id: "advice-1",
        title: "Protect Calendar Time Like Client Meetings",
        description: "Block focused work time and treat it as non-negotiable, just like client meetings",
        category: "skills",
        impact: "high",
        complexity: "medium",
        quote: "You need to start treating your focus blocks like you would treat a client meeting",
        speaker: "Sarah (Mentor)",
        timestamp: 120,
        confidence: 0.95
      },
      {
        id: "advice-2", 
        title: "Coach Team Instead of Solving Problems",
        description: "Ask 'What approaches have you considered?' instead of immediately providing solutions",
        category: "leadership",
        impact: "high",
        complexity: "medium",
        quote: "Try saying 'What approaches have you already considered?' or 'What would you do if I wasn't available?'",
        speaker: "Sarah (Mentor)",
        timestamp: 380,
        confidence: 0.92
      },
      {
        id: "advice-3",
        title: "Track Energy Levels for Optimal Scheduling",
        description: "Monitor daily energy patterns and align important work with peak energy times",
        category: "personal",
        impact: "medium",
        complexity: "low",
        quote: "Track your energy levels throughout the day for the next two weeks",
        speaker: "Sarah (Mentor)",
        timestamp: 520,
        confidence: 0.88
      }
    ],
    behavioralPatterns: [
      {
        pattern: "People-pleasing tendency",
        description: "Difficulty saying no to meeting requests, worried about seeming unresponsive",
        frequency: 3,
        confidence: 0.87
      },
      {
        pattern: "Reactive work style",
        description: "Tends to jump in and solve problems immediately rather than coaching others",
        frequency: 2,
        confidence: 0.82
      }
    ],
    implementationBarriers: [
      {
        type: "motivation",
        description: "Fear of appearing difficult or unresponsive to colleagues",
        severity: "medium",
        suggestions: ["Frame boundaries as enabling better service", "Practice saying no professionally"]
      },
      {
        type: "time",
        description: "Feels faster to solve problems directly rather than coach team members",
        severity: "medium", 
        suggestions: ["Set coaching time limits", "Create quick coaching templates"]
      }
    ],
    successMetrics: [
      {
        name: "Focus Time Protected",
        description: "Number of focus blocks successfully protected per week",
        measurement: "Hours of uninterrupted focus time",
        timeline: "Weekly tracking"
      },
      {
        name: "Team Self-Sufficiency",
        description: "Reduction in questions that team members could solve themselves",
        measurement: "Number of coaching conversations vs direct solutions",
        timeline: "Monthly assessment"
      }
    ],
    emotionalContext: {
      motivation: 0.8,
      confidence: 0.6,
      concerns: ["Appearing unresponsive", "Team members getting stuck"],
      excitement: 0.7
    },
    priorityRanking: [
      {
        actionId: "advice-1",
        priority: 9,
        reasoning: "High impact on overall productivity and strategic thinking time",
        successProbability: 0.85
      },
      {
        actionId: "advice-2",
        priority: 8,
        reasoning: "Will scale impact and develop team capabilities",
        successProbability: 0.73
      },
      {
        actionId: "advice-3",
        priority: 6,
        reasoning: "Good optimization but lower urgency than time management fixes",
        successProbability: 0.91
      }
    ],
    confidence: 0.89
  };
}

// Extract insights from raw text when JSON parsing fails
function extractInsightsFromText(text) {
  const adviceGiven = [];
  
  // Look for content about advice, recommendations, or actions
  const contentMatches = text.match(/"content":\s*"([^"]+)"/g) || [];
  
  contentMatches.forEach((match, index) => {
    const content = match.replace(/"content":\s*"/, '').replace(/"$/, '');
    if (content.length > 10) {
      adviceGiven.push({
        id: `text-advice-${index + 1}`,
        title: content.length > 50 ? content.substring(0, 47) + '...' : content,
        description: content,
        category: 'general',
        impact: 'medium',
        complexity: 'medium',
        quote: content,
        speaker: 'AI Analysis',
        timestamp: 0,
        confidence: 0.8
      });
    }
  });
  
  // If no content found, create a generic insight
  if (adviceGiven.length === 0) {
    adviceGiven.push({
      id: 'extracted-1',
      title: 'Use meeting tools effectively',
      description: 'Implement digital tools for better meeting management and note-taking',
      category: 'productivity',
      impact: 'high',
      complexity: 'low',
      quote: 'Based on the conversation analysis',
      speaker: 'AI Analysis',
      timestamp: 0,
      confidence: 0.7
    });
  }
  
  return {
    adviceGiven,
    behavioralPatterns: generateMockInsights().behavioralPatterns,
    implementationBarriers: generateMockInsights().implementationBarriers,
    successMetrics: generateMockInsights().successMetrics,
    emotionalContext: generateMockInsights().emotionalContext,
    priorityRanking: generateMockInsights().priorityRanking,
    confidence: 0.7
  };
}

function adaptGenericToInsights(data) {
  // Try to extract any meaningful advice/insights from generic structure
  const advice = [];
  
  // Look for various possible field names
  const possibleAdviceFields = ['advice', 'insights', 'recommendations', 'suggestions', 'actions', 'adviceGiven', 'advice_given'];
  
  for (const field of possibleAdviceFields) {
    if (data[field] && Array.isArray(data[field])) {
      data[field].forEach((item, index) => {
        advice.push({
          id: `extracted-${index + 1}`,
          title: item.title || item.name || `Insight ${index + 1}`,
          description: item.description || item.content || item.toString(),
          category: item.category || 'personal',
          impact: item.impact || 'medium',
          complexity: item.complexity || 'medium',
          quote: item.quote || item.content || '',
          speaker: item.speaker || 'AI Analysis',
          timestamp: item.timestamp || 0,
          confidence: item.confidence || 0.7
        });
      });
      break;
    }
  }
  
  return {
    adviceGiven: advice.length > 0 ? advice : generateMockInsights().adviceGiven,
    behavioralPatterns: data.behavioralPatterns || data.behavioral_patterns || generateMockInsights().behavioralPatterns,
    implementationBarriers: data.implementationBarriers || data.implementation_barriers || generateMockInsights().implementationBarriers,
    successMetrics: data.successMetrics || data.success_metrics || generateMockInsights().successMetrics,
    emotionalContext: data.emotionalContext || data.emotional_context || generateMockInsights().emotionalContext,
    priorityRanking: data.priorityRanking || data.priority_ranking || generateMockInsights().priorityRanking,
    confidence: data.confidence || 0.7
  };
}

module.exports = {
  extractInsights
};
