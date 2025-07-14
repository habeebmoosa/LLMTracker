import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

async function main() {
  console.log('Starting database seed...');

  await prisma.usageLog.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: await hashPassword('password123'),
        name: 'John Doe',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        settings: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        },
        lastLogin: new Date('2024-01-15T10:30:00Z'),
        lastActive: new Date('2024-01-15T14:45:00Z')
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: await hashPassword('password123'),
        name: 'Jane Smith',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        settings: {
          theme: 'light',
          notifications: false,
          language: 'en'
        },
        lastLogin: new Date('2024-01-14T09:15:00Z'),
        lastActive: new Date('2024-01-14T16:20:00Z')
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.johnson@example.com',
        password: await hashPassword('password123'),
        name: 'Mike Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        settings: {
          theme: 'auto',
          notifications: true,
          language: 'en'
        },
        lastLogin: new Date('2024-01-16T08:00:00Z'),
        lastActive: new Date('2024-01-16T17:30:00Z')
      }
    }),
    prisma.user.create({
      data: {
        email: 'sarah.wilson@example.com',
        password: await hashPassword('password123'),
        name: 'Sarah Wilson',
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
        settings: {
          theme: 'dark',
          notifications: true,
          language: 'es'
        },
        lastLogin: new Date('2024-01-13T11:45:00Z'),
        lastActive: new Date('2024-01-13T15:10:00Z')
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await hashPassword('admin123'),
        name: 'Admin User',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        settings: {
          theme: 'light',
          notifications: true,
          language: 'en',
          role: 'admin'
        },
        lastLogin: new Date('2024-01-16T07:30:00Z'),
        lastActive: new Date('2024-01-16T18:00:00Z')
      }
    })
  ]);

  console.log(`Created ${users.length} users`);

  // Create Organizations
  const organizations = await Promise.all([
    prisma.organization.create({
      data: {
        name: 'TechCorp Solutions',
        description: 'A leading technology solutions provider specializing in AI and machine learning applications.',
        ownerId: users[0].id,
        settings: {
          defaultModel: 'gpt-4',
          maxTokens: 4000,
          temperature: 0.7,
          billingEnabled: true
        }
      }
    }),
    prisma.organization.create({
      data: {
        name: 'DataInsights Inc',
        description: 'Data analytics and business intelligence company helping organizations make data-driven decisions.',
        ownerId: users[1].id,
        settings: {
          defaultModel: 'gpt-3.5-turbo',
          maxTokens: 2000,
          temperature: 0.5,
          billingEnabled: true
        }
      }
    }),
    prisma.organization.create({
      data: {
        name: 'AI Research Lab',
        description: 'Academic research organization focused on advancing artificial intelligence and natural language processing.',
        ownerId: users[2].id,
        settings: {
          defaultModel: 'claude-3-sonnet',
          maxTokens: 8000,
          temperature: 0.3,
          billingEnabled: false
        }
      }
    }),
    prisma.organization.create({
      data: {
        name: 'StartupHub',
        description: 'Innovation hub supporting early-stage startups with AI-powered tools and consulting.',
        ownerId: users[3].id,
        settings: {
          defaultModel: 'gpt-4',
          maxTokens: 3000,
          temperature: 0.8,
          billingEnabled: true
        }
      }
    })
  ]);

  console.log(`Created ${organizations.length} organizations`);

  // Create Projects
  const projects = await Promise.all([
    // TechCorp Solutions projects
    prisma.project.create({
      data: {
        name: 'Customer Support Chatbot',
        description: 'AI-powered chatbot for handling customer inquiries and support tickets.',
        organizationId: organizations[0].id,
        createdBy: users[0].id,
        settings: {
          model: 'gpt-4',
          maxTokens: 2000,
          temperature: 0.6,
          systemPrompt: 'You are a helpful customer support assistant.'
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'Content Generator',
        description: 'Automated content generation system for marketing materials and blog posts.',
        organizationId: organizations[0].id,
        createdBy: users[0].id,
        settings: {
          model: 'gpt-4',
          maxTokens: 4000,
          temperature: 0.8,
          systemPrompt: 'You are a creative content writer.'
        }
      }
    }),
    // DataInsights Inc projects
    prisma.project.create({
      data: {
        name: 'Report Summarizer',
        description: 'Automated system for summarizing lengthy business reports and extracting key insights.',
        organizationId: organizations[1].id,
        createdBy: users[1].id,
        settings: {
          model: 'gpt-3.5-turbo',
          maxTokens: 1500,
          temperature: 0.3,
          systemPrompt: 'You are an expert business analyst.'
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'Data Query Assistant',
        description: 'Natural language interface for querying databases and generating insights.',
        organizationId: organizations[1].id,
        createdBy: users[1].id,
        settings: {
          model: 'gpt-4',
          maxTokens: 2500,
          temperature: 0.2,
          systemPrompt: 'You are a data analyst expert.'
        }
      }
    }),
    // AI Research Lab projects
    prisma.project.create({
      data: {
        name: 'Research Paper Analyzer',
        description: 'Tool for analyzing and extracting key information from academic research papers.',
        organizationId: organizations[2].id,
        createdBy: users[2].id,
        settings: {
          model: 'claude-3-sonnet',
          maxTokens: 8000,
          temperature: 0.1,
          systemPrompt: 'You are an academic researcher.'
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'Literature Review Assistant',
        description: 'AI assistant for conducting comprehensive literature reviews and citation analysis.',
        organizationId: organizations[2].id,
        createdBy: users[2].id,
        settings: {
          model: 'claude-3-sonnet',
          maxTokens: 6000,
          temperature: 0.2,
          systemPrompt: 'You are a research assistant.'
        }
      }
    }),
    // StartupHub projects
    prisma.project.create({
      data: {
        name: 'Pitch Deck Generator',
        description: 'AI-powered tool for creating compelling investor pitch decks for startups.',
        organizationId: organizations[3].id,
        createdBy: users[3].id,
        settings: {
          model: 'gpt-4',
          maxTokens: 3000,
          temperature: 0.7,
          systemPrompt: 'You are a startup mentor and investor.'
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'Market Research Bot',
        description: 'Automated market research and competitive analysis tool for early-stage companies.',
        organizationId: organizations[3].id,
        createdBy: users[3].id,
        settings: {
          model: 'gpt-3.5-turbo',
          maxTokens: 2000,
          temperature: 0.5,
          systemPrompt: 'You are a market research expert.'
        }
      }
    })
  ]);

  console.log(`Created ${projects.length} projects`);

  // Create Usage Logs
  const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku'];
  const providers = ['openai', 'anthropic'];
  const statusCodes = [200, 200, 200, 200, 200, 429, 500]; // Mostly successful requests

  const usageLogs = [];
  
  for (let i = 0; i < 500; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const provider = model.includes('gpt') ? 'openai' : 'anthropic';
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    
    // Generate realistic token counts based on model
    const promptTokens = Math.floor(Math.random() * 2000) + 100;
    const completionTokens = statusCode === 200 ? Math.floor(Math.random() * 1500) + 50 : 0;
    const totalTokens = promptTokens + completionTokens;
    
    // Calculate costs (simplified pricing)
    const inputCostPerToken = model === 'gpt-4' ? 0.00003 : 0.000001;
    const outputCostPerToken = model === 'gpt-4' ? 0.00006 : 0.000002;
    const inputCost = promptTokens * inputCostPerToken;
    const outputCost = completionTokens * outputCostPerToken;
    const totalCost = inputCost + outputCost;
    
    // Generate timestamp within last 30 days
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
    
    usageLogs.push({
      projectId: project.id,
      projectKey: project.projectKey,
      timestamp,
      model,
      provider,
      promptTokens,
      completionTokens,
      totalTokens,
      totalCost,
      currency: 'USD',
      requestDurationMs: Math.floor(Math.random() * 5000) + 500,
      statusCode,
      errorMessage: statusCode !== 200 ? `HTTP ${statusCode} Error` : null,
      inputCost,
      outputCost
    });
  }

  // Batch insert usage logs
  await prisma.usageLog.createMany({
    data: usageLogs
  });

  console.log(`Created ${usageLogs.length} usage logs`);

  // Create some inactive users and organizations for testing
  await prisma.user.create({
    data: {
      email: 'inactive@example.com',
      password: await hashPassword('password123'),
      name: 'Inactive User',
      isActive: false,
      settings: {}
    }
  });

  await prisma.organization.create({
    data: {
      name: 'Inactive Organization',
      description: 'This organization is no longer active.',
      ownerId: users[4].id,
      isActive: false,
      settings: {}
    }
  });

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });