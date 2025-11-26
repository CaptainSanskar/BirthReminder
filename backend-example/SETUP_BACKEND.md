# 🚀 Backend Setup - READY TO USE!

Your Firebase Service Account Key is now configured! You can send notifications from your backend.

## ✅ What's Already Done

- ✅ Service Account Key added (`serviceAccountKey.json`)
- ✅ File secured in `.gitignore`
- ✅ Backend code ready to use

## 🔧 Quick Start

### 1. Install Dependencies
```bash
cd backend-example
npm install
```

### 2. Test Sending a Notification

Edit `sendNotification.js` (at the bottom) and add a test FCM token:

```javascript
// Get FCM token from your browser console when you enable notifications
const testToken = 'PASTE_YOUR_FCM_TOKEN_HERE';

sendBirthdayNotification(testToken, {
  name: 'John Doe',
  type: 'today',
  daysUntil: 0
}).then(() => {
  console.log('Test notification sent!');
  process.exit(0);
});
```

### 3. Run Test
```bash
node sendNotification.js
```

You should receive a notification! 🎉

## 📱 How to Get Your FCM Token

1. Run your app: `npm run dev`
2. Click the bell icon 🔔
3. Allow notifications
4. Open browser console (F12)
5. Look for: `FCM Token: ...`
6. Copy that token

## 🤖 Automated Notifications

To send notifications automatically every day:

### Option 1: Using Scheduler (Recommended)

1. Update `scheduler.js` to connect to your database
2. Implement the `getUserBirthdays()` function
3. Run the scheduler:
```bash
npm start
```

The scheduler will check birthdays daily at 9:00 AM.

### Option 2: Using Cron Job

Add to your server's crontab:
```bash
0 9 * * * cd /path/to/backend-example && node sendNotification.js
```

## 📊 Backend Architecture

```
Your Backend
    │
    ├── serviceAccountKey.json (✅ Added)
    │   └── Firebase Admin credentials
    │
    ├── sendNotification.js
    │   └── Send notification to specific user
    │
    ├── scheduler.js
    │   └── Automated daily checks
    │
    └── Your Database
        └── Store user FCM tokens
```

## 🔐 Security Best Practices

### ✅ Already Implemented
- Service account key in `.gitignore`
- File located in secure backend folder

### ⚠️ Additional Steps (Recommended)

1. **Never commit** `serviceAccountKey.json` to version control
2. **Use environment variables** in production:
   ```javascript
   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   ```
3. **Restrict API permissions** in Firebase Console
4. **Use HTTPS** for all backend endpoints
5. **Validate FCM tokens** before storing

## 🌐 Deployment Options

### Deploy to Cloud Services

**Google Cloud Functions** (Recommended):
```bash
firebase deploy --only functions
```

**Heroku**:
```bash
heroku create your-app-name
git push heroku main
```

**DigitalOcean / AWS / Azure**:
- Upload backend folder
- Install dependencies
- Set up environment variables
- Run scheduler

### Using Serverless (No Server Required!)

**Vercel Functions**:
```javascript
// api/send-notification.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
  });
}

export default async function handler(req, res) {
  // Your notification logic
}
```

## 📝 Example: Store FCM Tokens

### Frontend (App.tsx)
```typescript
const handleRequestNotification = async () => {
  const token = await notificationService.requestPermission();
  
  if (token) {
    // Send token to your backend
    await fetch('https://your-backend.com/api/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: 'user123', 
        fcmToken: token 
      })
    });
  }
};
```

### Backend API Endpoint
```javascript
// Express.js example
app.post('/api/register-token', async (req, res) => {
  const { userId, fcmToken } = req.body;
  
  // Save to database
  await db.collection('users').doc(userId).update({
    fcmToken: fcmToken,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  res.json({ success: true });
});
```

## 🧪 Testing Scenarios

### Test 1: Single Notification
```javascript
const { sendBirthdayNotification } = require('./sendNotification');

sendBirthdayNotification('user-fcm-token', {
  name: 'Alice',
  type: 'today',
  daysUntil: 0
});
```

### Test 2: Multiple Users
```javascript
const { sendBirthdayNotificationToMultiple } = require('./sendNotification');

const tokens = ['token1', 'token2', 'token3'];
sendBirthdayNotificationToMultiple(tokens, {
  name: 'Bob',
  type: 'tomorrow',
  daysUntil: 1
});
```

### Test 3: Scheduled Check
```javascript
const { checkAndSendBirthdayNotifications } = require('./sendNotification');

const userBirthdays = [
  {
    fcmToken: 'user1-token',
    birthdays: [
      { name: 'John', birthDate: '1990-12-25' }
    ]
  }
];

checkAndSendBirthdayNotifications(userBirthdays);
```

## 📊 Monitoring

Monitor your notifications in Firebase Console:
- Go to: https://console.firebase.google.com/project/notification-c7b6a/messaging
- View delivery statistics
- Check error logs

## 🐛 Troubleshooting

### Error: "Invalid service account"
- Check that `serviceAccountKey.json` is in the correct location
- Verify the file is valid JSON

### Error: "Registration token is not valid"
- Token has expired
- User uninstalled the app
- Remove invalid tokens from database

### Notifications not received
- Verify FCM API is enabled
- Check Firebase Console for errors
- Test with Firebase Console first

## 📚 Next Steps

1. ✅ Test sending a single notification
2. ⬜ Connect to your database
3. ⬜ Implement user token storage
4. ⬜ Set up automated scheduler
5. ⬜ Deploy to production
6. ⬜ Monitor notification delivery

---

**Your backend is ready to send notifications!** 🎉

Need help? Check the main `README.md` or Firebase documentation.
