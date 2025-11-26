# Firebase Cloud Messaging Setup Guide for CakeWait

This guide will help you complete the Firebase Cloud Messaging (FCM) integration for birthday notifications in your CakeWait app.

## 📋 Prerequisites

- Firebase project created (✅ You already have this)
- Firebase configuration added (✅ Done)

## 🔧 Step-by-Step Setup

### 1. Generate VAPID Key (Web Push Certificate)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `notification-c7b6a`
3. Click on **Settings** (gear icon) → **Project settings**
4. Go to **Cloud Messaging** tab
5. Scroll down to **Web Push certificates**
6. Click **Generate key pair**
7. Copy the generated key (it looks like: `BN...`)

### 2. Update Your Code with VAPID Key

Open `firebase-config.ts` and replace the placeholder:

```typescript
const vapidKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';
```

With your actual VAPID key:

```typescript
const vapidKey = 'BN1234567890abcdef...'; // Your actual key
```

### 3. Install Firebase SDK

Run the following command in your project directory:

```bash
npm install firebase
```

### 4. Update Service Worker Registration

The service worker is already registered in your app. Make sure the `firebase-messaging-sw.js` file is accessible at the root of your public directory.

**For Vite projects**, copy `firebase-messaging-sw.js` to your `public` folder:

```bash
# Create public folder if it doesn't exist
mkdir -p public
cp firebase-messaging-sw.js public/
```

### 5. Update `index.html`

Add the Firebase Messaging service worker registration in your `index.html`:

```html
<head>
  <!-- ... existing head content ... -->
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Firebase SW registered:', registration);
        })
        .catch((err) => {
          console.error('Firebase SW registration failed:', err);
        });
    }
  </script>
</head>
```

### 6. Enable Firebase Cloud Messaging API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `notification-c7b6a`
3. Go to **APIs & Services** → **Library**
4. Search for **"Firebase Cloud Messaging API"**
5. Click on it and press **Enable**

## 🚀 Integration with Your App

### Update `App.tsx`

Replace the notification request handler with the Firebase version:

```typescript
import { notificationService } from './utils/notificationService';

// In your useEffect (initialization)
useEffect(() => {
  // Initialize notification service
  notificationService.initialize();
  
  // ... rest of your initialization code
}, []);

// Update the notification request handler
const handleRequestNotification = async () => {
  if (!('Notification' in window)) {
    alert('Notifications not supported on this device');
    return;
  }
  
  const token = await notificationService.requestPermission();
  
  if (token) {
    setNotificationsEnabled(true);
    console.log('FCM Token:', token);
    // Token is automatically stored in localStorage
  }
};
```

## 📱 Testing Notifications

### Test Foreground Notifications

When the app is open, you can test notifications using Firebase Console:

1. Go to Firebase Console → **Cloud Messaging**
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Enter your FCM token (found in browser console or localStorage)
6. Click **Test**

### Test Background Notifications

1. Close or minimize your app
2. Send a test message from Firebase Console (same steps as above)
3. You should receive a system notification

## 🔔 Notification Types

Your app supports three types of birthday notifications:

1. **Today** - Sent on the birthday
2. **Tomorrow** - Sent 1 day before
3. **Week** - Sent 7 days before

These are handled automatically by the service worker checking birthdays periodically.

## 🎯 Sending Custom Notifications

### Using Firebase Console (Manual)

Use the Firebase Console to send notifications manually for testing.

### Using Firebase Admin SDK (Backend)

To send automated birthday notifications, you'll need a backend service:

```javascript
// Example Node.js backend using Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Send notification
async function sendBirthdayNotification(token, birthdayName) {
  const message = {
    notification: {
      title: '🎂 Birthday Today!',
      body: `It's ${birthdayName}'s birthday! Don't forget to wish them! 🎉`,
    },
    data: {
      type: 'birthday',
      name: birthdayName,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

## 🐛 Troubleshooting

### "Messaging: Missing VAPID key"

- Make sure you've generated a VAPID key in Firebase Console
- Ensure the key is correctly added to `firebase-config.ts`

### "Permission denied"

- User has blocked notifications
- Ask them to enable notifications in browser settings

### Service Worker not registering

- Check browser console for errors
- Ensure `firebase-messaging-sw.js` is in the correct location
- Make sure HTTPS is enabled (or localhost for development)

### Token not generated

- Check Firebase project configuration
- Verify Firebase Cloud Messaging API is enabled
- Check browser console for detailed errors

## 📊 Monitoring

Monitor your notifications in Firebase Console:

1. Go to **Cloud Messaging** tab
2. View delivery statistics
3. Check success/failure rates

## 🔐 Security

- **Never expose your Firebase Admin SDK credentials** in client-side code
- Store FCM tokens securely
- Implement proper authentication for your backend API
- Consider rate limiting notification requests

## 📚 Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## ✅ Quick Checklist

- [ ] Generated VAPID key from Firebase Console
- [ ] Updated `firebase-config.ts` with VAPID key
- [ ] Installed Firebase SDK (`npm install firebase`)
- [ ] Copied `firebase-messaging-sw.js` to public folder
- [ ] Enabled Firebase Cloud Messaging API
- [ ] Updated `App.tsx` with notification service
- [ ] Tested foreground notifications
- [ ] Tested background notifications

---

**Need Help?** Check the Firebase documentation or feel free to ask questions!
