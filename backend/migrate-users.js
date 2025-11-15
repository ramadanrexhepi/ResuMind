/**
 * Migration Script to Add Plan and Usage Fields to Existing Users
 * 
 * This script updates all existing users in the database to include
 * the new plan and usage fields that were added to the User schema.
 * 
 * Run this script with: node backend/migrate-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function migrateUsers() {
  try {
    await connectDB();
    
    console.log('🔄 Starting user migration...');
    
    const users = await User.find({});
    console.log(`📋 Found ${users.length} users to check`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errors = [];

    for (const user of users) {
      try {
        let needsUpdate = false;

        // Check if plan field is missing or incomplete
        if (!user.plan || !user.plan.type) {
          user.plan = {
            type: 'free',
            status: 'active',
            startDate: user.createdAt || new Date(),
            endDate: null,
            paymentId: null,
            features: {
              maxUploads: 3,
              maxGenerations: 1,
              hasTemplates: false,
              hasAdvancedAI: false,
              hasPrioritySupport: false
            }
          };
          needsUpdate = true;
        }

        // Check if usage field is missing or incomplete
        if (!user.usage) {
          user.usage = {
            uploadsCount: 0,
            generationsCount: 0,
            lastUpload: null
          };
          needsUpdate = true;
        }

        if (needsUpdate) {
          await user.save();
          migratedCount++;
          console.log(`✅ Migrated user: ${user.email}`);
        } else {
          skippedCount++;
          console.log(`⏭️  User already has plan/usage fields: ${user.email}`);
        }
      } catch (error) {
        errors.push({ email: user.email, error: error.message });
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Skipped (already migrated): ${skippedCount}`);
    console.log(`   Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => {
        console.log(`   - ${err.email}: ${err.error}`);
      });
    }

    if (migratedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n✅ No users needed migration. All users are up to date!');
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateUsers();

