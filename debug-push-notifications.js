const mongoose = require('mongoose');
require('dotenv').config();

// Database configuration
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'your-mongodb-connection-string');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugPushNotifications = async () => {
  console.log('🔍 Debugging Push Notifications System\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`- MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Not set'}`);
  console.log(`- EXPO_ACCESS_TOKEN: ${process.env.EXPO_ACCESS_TOKEN ? '✅ Set' : '⚠️  Not set (optional)'}`);
  console.log('');
  
  await connectDB();
  
  try {
    const User = require('./src/models/User');
    
    // Check for users with notification tokens
    const usersWithTokens = await User.find({
      notificationToken: { $exists: true, $ne: null }
    }).select('_id firstName lastName notificationToken');
    
    console.log(`👥 Users with notification tokens: ${usersWithTokens.length}`);
    
    if (usersWithTokens.length > 0) {
      console.log('📱 Sample tokens:');
      usersWithTokens.slice(0, 3).forEach((user, index) => {
        const tokenPreview = user.notificationToken.substring(0, 30) + '...';
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName}: ${tokenPreview}`);
      });
    } else {
      console.log('⚠️  No users have notification tokens set up');
      console.log('   To test push notifications, users need to:');
      console.log('   1. Open the mobile app');
      console.log('   2. Allow notifications when prompted');
      console.log('   3. The app should automatically save their push token');
    }
    console.log('');
    
    // Test Expo SDK
    const { Expo } = require('expo-server-sdk');
    
    try {
      const expo = new Expo({
        accessToken: process.env.EXPO_ACCESS_TOKEN,
        useFcmV1: true,
      });
      
      console.log('✅ Expo SDK initialized successfully');
      
      if (usersWithTokens.length > 0) {
        const testUser = usersWithTokens[0];
        const isValidToken = Expo.isExpoPushToken(testUser.notificationToken);
        console.log(`🔍 First user's token validity: ${isValidToken ? '✅ Valid' : '❌ Invalid'}`);
        
        if (isValidToken) {
          console.log('🚀 You can test push notifications by running:');
          console.log(`   POST /api/notifications/test-push`);
          console.log(`   Body: {`);
          console.log(`     "token": "${testUser.notificationToken}",`);
          console.log(`     "title": "Test Notification",`);
          console.log(`     "body": "This is a test from the debug script"`);
          console.log(`   }`);
        }
      }
      
    } catch (expoError) {
      console.error('❌ Expo SDK initialization error:', expoError.message);
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Debug complete');
  }
};

// Run the debug script
debugPushNotifications(); 