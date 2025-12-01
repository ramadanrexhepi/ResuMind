require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const planFeatures = {
  free: {
    maxUploads: 2,
    maxGenerations: 2,
    hasTemplates: false,
    hasAdvancedAI: false,
    hasPrioritySupport: false
  },
  pro: {
    maxUploads: 999999,
    maxGenerations: 999999,
    hasTemplates: true,
    hasAdvancedAI: true,
    hasPrioritySupport: true
  },
  team: {
    maxUploads: 999999,
    maxGenerations: 999999,
    hasTemplates: true,
    hasAdvancedAI: true,
    hasPrioritySupport: true
  }
};

async function changeUserPlan(userEmail, newPlanType) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Validate plan type
    if (!['free', 'pro', 'team'].includes(newPlanType)) {
      console.error('❌ Invalid plan type. Must be: free, pro, or team');
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`📦 Current plan: ${user.plan.type.toUpperCase()}`);
    console.log(`🔄 Changing to: ${newPlanType.toUpperCase()}\n`);

    // Update plan
    const oldPlan = user.plan.type;
    user.plan.type = newPlanType;
    user.plan.status = 'active';
    user.plan.startDate = new Date();
    user.plan.features = planFeatures[newPlanType];

    await user.save();

    console.log('✅ Plan changed successfully!\n');
    console.log('📊 New Plan Details:');
    console.log(`   Plan Type: ${user.plan.type.toUpperCase()}`);
    console.log(`   Status: ${user.plan.status}`);
    console.log(`   Max Uploads: ${user.plan.features.maxUploads}`);
    console.log(`   Max Generations: ${user.plan.features.maxGenerations}`);
    console.log(`   Has Templates: ${user.plan.features.hasTemplates}`);
    console.log(`   Has Advanced AI: ${user.plan.features.hasAdvancedAI}`);
    console.log(`   Priority Support: ${user.plan.features.hasPrioritySupport}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error changing plan:', error);
    process.exit(1);
  }
}

// Get command line arguments
const userEmail = process.argv[2];
const newPlanType = process.argv[3];

if (!userEmail || !newPlanType) {
  console.log('❌ Usage: node change-user-plan.js <user-email> <plan-type>\n');
  console.log('Example: node change-user-plan.js ramadan@example.com pro\n');
  console.log('Plan types: free, pro, team\n');
  process.exit(1);
}

changeUserPlan(userEmail, newPlanType);
