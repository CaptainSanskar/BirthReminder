# 🚀 Quick Firebase Setup - 5 Minutes

## Step 1: Install Dependencies (1 min)

```bash
npm install firebase
```

## Step 2: Get Your VAPID Key (2 min)

1. Go to: https://console.firebase.google.com/project/notification-c7b6a/settings/cloudmessaging
2. Scroll to **Web Push certificates**
3. Click **Generate key pair**
4. Copy the key (starts with "BN...")

## Step 3: Update firebase-config.ts (1 min)

Open `firebase-config.ts` and replace line 38:

```typescript
// BEFORE:
const vapidKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';

// AFTER:
const vapidKey = 'BN...YOUR_ACTUAL_KEY...';
```

## Step 4: Enable FCM API (1 min)

1. Go to: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=notification-c7b6a
2. Click **Enable**

## Step 5: Test! 

```bash
npm run dev
```

Click the bell icon in your app and allow notifications!

---

## 📝 Quick Test from Firebase Console

1. Go to: https://console.firebase.google.com/project/notification-c7b6a/messaging
2. Click **Send your first message**
3. Title: "Test Notification"
4. Text: "Hello from Firebase!"
5. Click **Send test message**
6. Paste your FCM token (found in browser console)
7. Click **Test**

---

## ✅ Done!

Your app now has Firebase Cloud Messaging integrated! 🎉

For detailed setup and troubleshooting, see `FIREBASE_SETUP_GUIDE.md`.
