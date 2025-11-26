# CakeWait Backend - Firebase Notification Service

This directory contains example backend code for sending automated birthday notifications using Firebase Cloud Messaging.

## 📁 Files

- `sendNotification.js` - Core notification sending logic
- `scheduler.js` - Cron job scheduler for daily notification checks
- `package.json` - Dependencies

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend-example
npm install
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `notification-c7b6a`
3. Go to **Project Settings** (⚙️) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in this directory

### 3. Test Sending a Notification

Edit `sendNotification.js` and update the test token:

```javascript
const testToken = 'PASTE_YOUR_FCM_TOKEN_HERE'; // Get from browser console
```

Run the test:

```bash
node sendNotification.js
```

### 4. Setup Scheduler (Optional)

For automated daily notifications:

1. Update `scheduler.js` to connect to your database
2. Implement the `getUserBirthdays()` function
3. Run the scheduler:

```bash
npm start
```

## 🔧 Integration with Your App

### Store FCM Tokens

When users enable notifications in your app, send their FCM token to your backend:

```typescript
// In your React app
const token = await notificationService.requestPermission();

// Send to your backend
await fetch('https://your-api.com/users/fcm-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: currentUser.id, 
    fcmToken: token 
  })
});
```

### Backend API Endpoint Example

```javascript
// Express.js example
app.post('/users/fcm-token', async (req, res) => {
  const { userId, fcmToken } = req.body;
  
  // Save to database
  await db.users.update(
    { id: userId },
    { fcmToken: fcmToken }
  );
  
  res.json({ success: true });
});
```

### Database Schema Example

```sql
-- PostgreSQL example
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  fcm_token TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE birthdays (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100),
  birth_date DATE,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📋 Notification Schedule

The scheduler sends notifications at these intervals:

- **7 days before** - "Birthday Next Week"
- **1 day before** - "Birthday Tomorrow"
- **On the day** - "Birthday Today!"

## 🔐 Security

**Important:**

- ✅ Keep `serviceAccountKey.json` secret (add to `.gitignore`)
- ✅ Never commit Firebase credentials to version control
- ✅ Use environment variables for sensitive data
- ✅ Implement rate limiting on notification endpoints
- ✅ Validate FCM tokens before storing

## 🌐 Deployment Options

### Option 1: Node.js Server

Deploy to:
- Heroku
- DigitalOcean
- AWS EC2
- Google Cloud Run

### Option 2: Serverless Functions

Use:
- **Vercel Functions**
- **Netlify Functions**
- **AWS Lambda**
- **Google Cloud Functions**

Example with Google Cloud Functions:

```javascript
// index.js
const functions = require('firebase-functions');
const { checkAndSendBirthdayNotifications } = require('./sendNotification');

exports.checkBirthdays = functions.pubsub
  .schedule('0 9 * * *') // Daily at 9 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    await checkAndSendBirthdayNotifications(userBirthdays);
  });
```

### Option 3: Cron Job Service

Use external services:
- **EasyCron**
- **Cron-job.org**
- **GitHub Actions** (free!)

Example GitHub Actions workflow:

```yaml
# .github/workflows/daily-notifications.yml
name: Daily Birthday Notifications

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: node sendNotification.js
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

## 🧪 Testing

### Test Individual Notification

```bash
node -e "
const { sendBirthdayNotification } = require('./sendNotification');
sendBirthdayNotification('YOUR_FCM_TOKEN', {
  name: 'Test User',
  type: 'today',
  daysUntil: 0
});
"
```

### Test with Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/notification-c7b6a/messaging)
2. Click **Send your first message**
3. Enter notification details
4. Click **Send test message**
5. Paste your FCM token

## 📊 Monitoring

Monitor notification delivery in Firebase Console:

- Go to **Cloud Messaging** tab
- View delivery statistics
- Check error logs

## 🆘 Troubleshooting

### "Invalid registration token"

- Token has expired or is invalid
- User has uninstalled the app
- Solution: Remove invalid tokens from database

### "Requested entity was not found"

- Firebase project misconfigured
- Check service account key is correct

### Notifications not received

- Check if FCM API is enabled
- Verify service worker is registered
- Test with Firebase Console first

## 📚 Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [FCM Server Documentation](https://firebase.google.com/docs/cloud-messaging/server)
- [Node Cron Documentation](https://github.com/node-cron/node-cron)

---

**Need help?** Check the main `FIREBASE_SETUP_GUIDE.md` or Firebase documentation.
