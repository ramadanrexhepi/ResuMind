// require('dotenv').config();
// const mongoose = require('mongoose');

//async function testConnection() {
//  try {
//    console.log('🔄 Testing MongoDB connection...\n');
//    
//    const uri = process.env.MONGODB_URI;
//    console.log('📍 Connecting to:', uri.replace(/:([^:@]+)@/, ':<password>@'));
//    
//    await mongoose.connect(uri);
    
//    console.log('\n✅ SUCCESS! MongoDB connected!');
//    console.log('📊 Database name:', mongoose.connection.name);
//    console.log('🌐 Host:', mongoose.connection.host);
//    console.log('✨ Connection is working perfectly!\n');
    
//    await mongoose.connection.close();
//    console.log('👋 Connection closed gracefully');
//    process.exit(0);
    
//  } catch (error) {
//    console.error('\n❌ CONNECTION FAILED!');
//    console.error('Error:', error.message);
//    console.error('\nTroubleshooting:');
 //   console.error('1. Check if password is correct');
  //  console.error('2. Make sure IP is whitelisted (0.0.0.0/0)');
    // console.error('3. Wait 2-3 minutes after changing IP whitelist');
    // process.exit(1);
//  }
//}

//testConnection();