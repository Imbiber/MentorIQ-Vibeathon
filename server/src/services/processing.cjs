const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs').promises;

const prisma = new PrismaClient();

// Import AI services (we'll create simplified versions since they're in TypeScript)
const { transcribeAudio } = require('../ai/transcription.cjs');
const { extractInsights } = require('../ai/insights.cjs');
const { generateActionPlan } = require('../ai/action-plan.cjs');

class ProcessingService {
  async processMeeting(filePath, metadata = {}) {
    let meeting;
    
    try {
      console.log('🎵 Starting audio processing for:', filePath);
      
      // Step 0: Ensure demo user exists
      const userId = metadata.userId || 'demo-user';
      await this.ensureUserExists(userId);
      
      // Step 1: Create meeting record
      meeting = await prisma.meeting.create({
        data: {
          userId,
          title: metadata.title || 'Mentor Conversation',
          description: metadata.description || 'AI-processed meeting insights',
          audioFilePath: filePath,
          originalFileName: metadata.originalName || path.basename(filePath),
          fileSize: metadata.size || 0,
          participants: metadata.participants || ['Mentor', 'Mentee'],
          meetingType: metadata.meetingType || 'mentor_session',
          processingStatus: 'processing'
        }
      });

      console.log('📝 Meeting record created:', meeting.id);

      // Step 2: Transcribe audio
      console.log('🎤 Starting transcription...');
      const transcription = await transcribeAudio(filePath);
      
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          transcription: JSON.stringify(transcription),
          duration: transcription.duration
        }
      });

      console.log('✅ Transcription completed');

      // Step 3: Extract insights
      console.log('🧠 Extracting insights...');
      const insights = await extractInsights(transcription.transcript, {
        meetingType: meeting.meetingType,
        participants: meeting.participants,
        duration: transcription.duration
      });

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          insights: JSON.stringify(insights)
        }
      });

      console.log('💡 Insights extracted');

      // Step 4: Generate action plan
      console.log('📋 Generating action plan...');
      const actionPlan = await generateActionPlan(insights, {
        userId: meeting.userId
      });

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          actionPlan: JSON.stringify(actionPlan),
          processingStatus: 'completed',
          processedAt: new Date(),
          confidence: insights.confidence || 0.9
        }
      });

      console.log('✅ Action plan generated');

      // Step 5: Create action items in database
      if (actionPlan.immediateActions && Array.isArray(actionPlan.immediateActions)) {
        for (const action of actionPlan.immediateActions) {
          await prisma.action.create({
            data: {
              userId: meeting.userId,
              meetingId: meeting.id,
              title: action.title || action.action || 'Action Item',
              description: action.description || action.content || 'Generated action item',
              category: action.category || 'general',
              priority: action.priority === 'high' ? 1 : action.priority === 'medium' ? 2 : 3,
              estimatedTime: `${action.estimatedTime || 60} minutes`,
              difficulty: action.complexity || action.difficulty || 'medium',
              dueDate: action.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              successProbability: action.successProbability || 0.8
            }
          });
        }
      }

      console.log('🎯 Action items created');

      // Return complete result
      const completedMeeting = await prisma.meeting.findUnique({
        where: { id: meeting.id },
        include: {
          actions: true
        }
      });

      return {
        meeting: completedMeeting,
        transcription,
        insights,
        actionPlan
      };

    } catch (error) {
      console.error('❌ Processing error:', error);
      
      // Update meeting status to failed
      if (meeting?.id) {
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            processingStatus: 'failed',
            processedAt: new Date()
          }
        });
      }

      throw error;
    }
  }

  async ensureUserExists(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        console.log('👤 Creating demo user:', userId);
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`,
            name: 'Demo User',
            descopeUserId: `descope-${userId}`
          }
        });
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  }

  async getMeetingResults(meetingId) {
    return await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        actions: true
      }
    });
  }

  async getUserMeetings(userId) {
    return await prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        actions: true
      }
    });
  }
}

module.exports = new ProcessingService();