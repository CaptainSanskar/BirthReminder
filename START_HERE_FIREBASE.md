# 🚀 START HERE - Firebase Notification Setup

## ⚡ You're 3 Steps Away from Push Notifications!

### Step 1️⃣: Install Firebase (30 seconds)
```bash
npm install
```

### Step 2️⃣: Get Your VAPID Key (2 minutes)
1. Click this link: [Get VAPID Key](https://console.firebase.google.com/project/notification-c7b6a/settings/cloudmessaging)
2. Scroll to **Web Push certificates**
3. Click **Generate key pair** button
4. Copy the key (starts with "BN...")

### Step 3️⃣: Add Key to Config (1 minute)
Open `firebase-config.ts` and find line 38:
```typescript
const vapidKey = 'YOUR_VAPID_PUBLIC_KEY_HERE'; // ← Replace this
```

Replace with your key:
```typescript
const vapidKey = 'BN1a2b3c4d5e...'; // ← Your actual key
```

## 🎯 One More Thing: Enable FCM API
Click here: [Enable FCM API](https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=notification-c7b6a)

Click the **Enable** button.

## ✅ Test It!
```bash
npm run dev
```

1. Open your app
2. Click the bell icon 🔔
3. Allow notifications
4. You should see "Firebase notifications enabled" in console

## 🎉 Done!

Your app can now send and receive push notifications!

### 📚 Learn More:
- **Complete Guide**: `FIREBASE_SETUP_GUIDE.md`
- **Quick Reference**: `QUICK_FIREBASE_SETUP.md`
- **Backend Setup**: `backend-example/README.md`

### 🧪 Test Sending Notifications:
1. Go to [Firebase Console](https://console.firebase.google.com/project/notification-c7b6a/messaging)
2. Click **Send your first message**
3. Enter title and message
4. Click **Send test message**
5. Paste your FCM token (found in browser console)

---

**Need help?** Check `FIREBASE_SETUP_GUIDE.md` for troubleshooting!
