const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('Creating demo user...');
    
    const user = await prisma.user.upsert({
      where: { email: 'demo@mentoriq.com' },
      update: {},
      create: {
        id: 'demo-user',
        email: 'demo@mentoriq.com',
        name: 'Demo User',
        descopeUserId: 'demo-descope-id',
        profileData: {
          implementationRate: 0.73,
          optimalActionComplexity: 'medium',
          procrastinationTendency: 0.3
        }
      }
    });

    console.log('✅ Demo user created:', user.email);
    console.log('   User ID:', user.id);
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
