require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany()]);
  console.log('Cleared existing data');

  const [alice, bob, carol, dan, eve, frank] = await User.create([
    { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
    { name: 'Bob Smith',     email: 'bob@example.com',   password: 'password123' },
    { name: 'Carol White',   email: 'carol@example.com', password: 'password123' },
    { name: 'Dan Brown',     email: 'dan@example.com',   password: 'password123' },
    { name: 'Eve Davis',     email: 'eve@example.com',   password: 'password123' },
    { name: 'Frank Miller',  email: 'frank@example.com', password: 'password123' },
  ]);
  console.log('Users created (6)');

  const [alpha, beta, gamma, delta] = await Project.create([
    { name: 'Project Alpha', description: 'Main product development',      owner: alice._id, members: [alice._id, bob._id, carol._id, dan._id] },
    { name: 'Project Beta',  description: 'Internal tooling & automation', owner: bob._id,   members: [bob._id, carol._id, eve._id] },
    { name: 'Project Gamma', description: 'Mobile app redesign',           owner: carol._id, members: [carol._id, dan._id, eve._id, frank._id] },
    { name: 'Project Delta', description: 'Data analytics platform',       owner: dan._id,   members: [dan._id, alice._id, frank._id] },
  ]);
  console.log('Projects created (4)');

  await Task.create([
    // Alpha
    { title: 'Setup CI/CD pipeline',        description: 'Configure GitHub Actions for auto deploy',      status: 'done',        priority: 'high',   project: alpha._id, assignedTo: alice._id, createdBy: alice._id, dueDate: new Date('2025-06-01') },
    { title: 'Design database schema',       description: 'ERD for all core entities',                    status: 'done',        priority: 'high',   project: alpha._id, assignedTo: bob._id,   createdBy: alice._id, dueDate: new Date('2025-06-05') },
    { title: 'Build authentication module',  description: 'JWT login, signup, refresh token',             status: 'in-progress', priority: 'high',   project: alpha._id, assignedTo: carol._id, createdBy: alice._id, dueDate: new Date('2025-06-12') },
    { title: 'Write API documentation',      description: 'Document all REST endpoints with examples',    status: 'todo',        priority: 'medium', project: alpha._id, assignedTo: dan._id,   createdBy: alice._id, dueDate: new Date('2025-06-20') },
    { title: 'Setup error monitoring',       description: 'Integrate Sentry for error tracking',          status: 'todo',        priority: 'low',    project: alpha._id, assignedTo: bob._id,   createdBy: alice._id, dueDate: new Date('2025-06-25') },
    // Beta
    { title: 'Fix login bug',                description: 'Token not refreshing on session expiry',       status: 'done',        priority: 'high',   project: beta._id,  assignedTo: bob._id,   createdBy: bob._id,   dueDate: new Date('2025-06-03') },
    { title: 'Build admin dashboard',        description: 'Internal dashboard for monitoring metrics',    status: 'in-progress', priority: 'medium', project: beta._id,  assignedTo: carol._id, createdBy: bob._id,   dueDate: new Date('2025-06-18') },
    { title: 'Automate weekly reports',      description: 'Cron job to email weekly summary reports',     status: 'todo',        priority: 'low',    project: beta._id,  assignedTo: eve._id,   createdBy: bob._id,   dueDate: new Date('2025-06-28') },
    { title: 'Migrate legacy scripts',       description: 'Port old bash scripts to Node.js',             status: 'in-progress', priority: 'medium', project: beta._id,  assignedTo: bob._id,   createdBy: bob._id,   dueDate: new Date('2025-06-22') },
    // Gamma
    { title: 'Redesign onboarding flow',     description: 'New user onboarding UX with progress steps',  status: 'in-progress', priority: 'high',   project: gamma._id, assignedTo: carol._id, createdBy: carol._id, dueDate: new Date('2025-06-14') },
    { title: 'Implement push notifications', description: 'FCM integration for iOS and Android',         status: 'todo',        priority: 'high',   project: gamma._id, assignedTo: dan._id,   createdBy: carol._id, dueDate: new Date('2025-06-30') },
    { title: 'Performance audit',            description: 'Profile and fix slow screens',                 status: 'todo',        priority: 'medium', project: gamma._id, assignedTo: eve._id,   createdBy: carol._id, dueDate: new Date('2025-07-05') },
    { title: 'Dark mode support',            description: 'Add theme toggle with persistent preference',  status: 'done',        priority: 'low',    project: gamma._id, assignedTo: frank._id, createdBy: carol._id, dueDate: new Date('2025-06-08') },
    // Delta
    { title: 'Setup data pipeline',          description: 'ETL pipeline from Postgres to data warehouse', status: 'in-progress', priority: 'high',   project: delta._id, assignedTo: dan._id,   createdBy: dan._id,   dueDate: new Date('2025-06-16') },
    { title: 'Build reporting API',          description: 'Endpoints to query aggregated analytics data', status: 'todo',        priority: 'medium', project: delta._id, assignedTo: alice._id, createdBy: dan._id,   dueDate: new Date('2025-06-24') },
    { title: 'Create data visualizations',   description: 'Charts and graphs for the analytics dashboard',status: 'todo',        priority: 'medium', project: delta._id, assignedTo: frank._id, createdBy: dan._id,   dueDate: new Date('2025-07-01') },
  ]);
  console.log('Tasks created (16)');

  console.log('\n--- Seed Credentials ---');
  console.log('alice@example.com  / password123');
  console.log('bob@example.com    / password123');
  console.log('carol@example.com  / password123');
  console.log('dan@example.com    / password123');
  console.log('eve@example.com    / password123');
  console.log('frank@example.com  / password123');
  console.log('------------------------\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
