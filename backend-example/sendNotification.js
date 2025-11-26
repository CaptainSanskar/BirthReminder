/**
 * Example Backend Script for Sending Firebase Notifications
 * 
 * This is a Node.js example showing how to send birthday notifications
 * from your backend using Firebase Admin SDK.
 * 
 * SETUP:
 * 1. npm install firebase-admin
 * 2. Download service account key from Firebase Console:
 *    Project Settings > Service Accounts > Generate new private key
 * 3. Save as serviceAccountKey.json in this directory
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Send a birthday notification to a specific device
 * @param {string} fcmToken - The FCM token of the device
 * @param {Object} birthdayData - Birthday information
 */
async function sendBirthdayNotification(fcmToken, birthdayData) {
  const { name, type, daysUntil } = birthdayData;
  
  let title, body, emoji;
  
  switch (type) {
    case 'today':
      title = '🎂 Birthday Today!';
      body = `It's ${name}'s birthday! Don't forget to wish them! 🎉`;
      emoji = '🎂';
      break;
    case 'tomorrow':
      title = '⏰ Birthday Tomorrow';
      body = `${name}'s birthday is tomorrow! Get ready! 🎈`;
      emoji = '⏰';
      break;
    case 'week':
      title = '📅 Birthday Next Week';
      body = `${name}'s birthday is in 7 days`;
      emoji = '📅';
      break;
    default:
      title = '🎉 Birthday Reminder';
      body = `${name}'s birthday is in ${daysUntil} days`;
      emoji = '🎉';
  }

  const message = {
    notification: {
      title: title,
      body: body,
      icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
    },
    data: {
      type: type,
      name: name,
      daysUntil: String(daysUntil),
      emoji: emoji,
      clickAction: '/'
    },
    token: fcmToken,
    webpush: {
      notification: {
        badge: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'open', title: 'Open App' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      },
      fcmOptions: {
        link: '/'
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Successfully sent notification:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notifications to multiple devices
 * @param {Array} fcmTokens - Array of FCM tokens
 * @param {Object} birthdayData - Birthday information
 */
async function sendBirthdayNotificationToMultiple(fcmTokens, birthdayData) {
  const { name, type, daysUntil } = birthdayData;
  
  let title, body;
  
  switch (type) {
    case 'today':
      title = '🎂 Birthday Today!';
      body = `It's ${name}'s birthday! Don't forget to wish them! 🎉`;
      break;
    case 'tomorrow':
      title = '⏰ Birthday Tomorrow';
      body = `${name}'s birthday is tomorrow! Get ready! 🎈`;
      break;
    case 'week':
      title = '📅 Birthday Next Week';
      body = `${name}'s birthday is in 7 days`;
      break;
    default:
      title = '🎉 Birthday Reminder';
      body = `${name}'s birthday is in ${daysUntil} days`;
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: fcmTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Successfully sent ${response.successCount} notifications`);
    console.log(`❌ Failed to send ${response.failureCount} notifications`);
    return response;
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Schedule notifications using a cron job or scheduler
 * This function checks birthdays and sends appropriate notifications
 */
async function checkAndSendBirthdayNotifications(userBirthdays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const user of userBirthdays) {
    const { fcmToken, birthdays } = user;

    for (const birthday of birthdays) {
      const daysUntil = calculateDaysUntil(birthday.birthDate);

      if (daysUntil === 0) {
        // Birthday is today
        await sendBirthdayNotification(fcmToken, {
          name: birthday.name,
          type: 'today',
          daysUntil: 0
        });
      } else if (daysUntil === 1) {
        // Birthday is tomorrow
        await sendBirthdayNotification(fcmToken, {
          name: birthday.name,
          type: 'tomorrow',
          daysUntil: 1
        });
      } else if (daysUntil === 7) {
        // Birthday is in a week
        await sendBirthdayNotification(fcmToken, {
          name: birthday.name,
          type: 'week',
          daysUntil: 7
        });
      }
    }
  }
}

/**
 * Calculate days until next birthday
 */
function calculateDaysUntil(birthDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const parts = birthDateString.split('-').map(Number);
  const birth = new Date(parts[0], parts[1] - 1, parts[2]);
  
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Example usage
if (require.main === module) {
  // Example: Send a test notification
  const testToken = 'PASTE_YOUR_FCM_TOKEN_HERE';
  
  sendBirthdayNotification(testToken, {
    name: 'John Doe',
    type: 'today',
    daysUntil: 0
  }).then(() => {
    console.log('Test notification sent!');
    process.exit(0);
  }).catch(err => {
    console.error('Failed to send test notification:', err);
    process.exit(1);
  });
}

module.exports = {
  sendBirthdayNotification,
  sendBirthdayNotificationToMultiple,
  checkAndSendBirthdayNotifications
};
