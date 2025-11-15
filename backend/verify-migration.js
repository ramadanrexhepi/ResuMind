require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function verifyMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    const users = await User.find({});
    
    console.log('📊 Verification Report:\n');
    console.log('='.repeat(80));

    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      console.log('─'.repeat(80));
      
      if (user.plan && user.plan.type) {
        console.log(`✅ Plan Type: ${user.plan.type.toUpperCase()}`);
        console.log(`✅ Plan Status: ${user.plan.status}`);
        console.log(`✅ Max Uploads: ${user.plan.features.maxUploads}`);
        console.log(`✅ Max Generations: ${user.plan.features.maxGenerations}`);
        console.log(`✅ Has Templates: ${user.plan.features.hasTemplates}`);
        console.log(`✅ Has Advanced AI: ${user.plan.features.hasAdvancedAI}`);
        
        if (user.usage) {
          console.log(`\n📈 Usage Stats:`);
          console.log(`   Uploads: ${user.usage.uploadsCount}/${user.plan.features.maxUploads}`);
          console.log(`   Generations: ${user.usage.generationsCount}/${user.plan.features.maxGenerations}`);
          console.log(`   Remaining Uploads: ${user.plan.features.maxUploads - user.usage.uploadsCount}`);
        }
      } else {
        console.log('❌ MISSING PLAN DATA - Run migration again!');
      }
      
      console.log('─'.repeat(80));
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n✨ Total Users: ${users.length}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification error:', error);
    process.exit(1);
  }
}

verifyMigration();