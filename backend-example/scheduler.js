/**
 * Scheduler for Birthday Notifications
 * 
 * This script runs daily to check for birthdays and send notifications.
 * Uses node-cron for scheduling.
 * 
 * SETUP:
 * 1. npm install
 * 2. Setup your database connection (MongoDB, PostgreSQL, etc.)
 * 3. Update the getUserBirthdays function to fetch from your DB
 * 4. Run: npm start
 */

const cron = require('node-cron');
const { checkAndSendBirthdayNotifications } = require('./sendNotification');

/**
 * Fetch user birthdays from your database
 * This is a placeholder - implement based on your database
 */
async function getUserBirthdays() {
  // TODO: Replace with actual database query
  // Example structure:
  /*
  return [
    {
      fcmToken: 'user1-fcm-token',
      birthdays: [
        { name: 'John Doe', birthDate: '1990-05-15' },
        { name: 'Jane Smith', birthDate: '1985-12-25' }
      ]
    },
    {
      fcmToken: 'user2-fcm-token',
      birthdays: [
        { name: 'Bob Johnson', birthDate: '1992-08-10' }
      ]
    }
  ];
  */
  
  // For now, return empty array
  console.log('⚠️  Warning: getUserBirthdays not implemented. Please connect to your database.');
  return [];
}

/**
 * Main notification job
 */
async function notificationJob() {
  console.log('🔍 Checking for birthdays...', new Date().toISOString());
  
  try {
    const userBirthdays = await getUserBirthdays();
    
    if (userBirthdays.length === 0) {
      console.log('ℹ️  No users found or database not configured.');
      return;
    }
    
    await checkAndSendBirthdayNotifications(userBirthdays);
    console.log('✅ Birthday check complete!');
  } catch (error) {
    console.error('❌ Error in notification job:', error);
  }
}

// Schedule the job to run daily at 9:00 AM
// Cron format: second minute hour day month day-of-week
cron.schedule('0 9 * * *', () => {
  console.log('⏰ Daily notification job triggered');
  notificationJob();
});

// Also check on startup
console.log('🚀 Birthday Notification Scheduler started');
console.log('📅 Scheduled to run daily at 9:00 AM');
console.log('⏳ Running initial check...');
notificationJob();

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down scheduler...');
  process.exit(0);
});
