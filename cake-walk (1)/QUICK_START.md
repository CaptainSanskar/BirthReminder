# ⚡ QUICK START - 5 MINUTE SETUP

## 🎯 Goal
Get push notifications working in **5 minutes** for your CakeWait app.

---

## 📝 Step 1: OneSignal Account (2 minutes)

1. Go to: **https://onesignal.com**
2. Click **"Get Started Free"**
3. Sign up with email
4. Verify email
5. Click **"New App/Website"**
6. Name: **CakeWait**
7. Platform: **Web Push**
8. Site URL: **http://localhost:3000** (for testing)
9. Click **Save**

---

## 🔑 Step 2: Copy Your Keys (1 minute)

### App ID:
1. You'll see: `App ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
2. **Copy this ID**

### REST API Key:
1. Go to **Settings** → **Keys & IDs**
2. Find **REST API Key**
3. Click **Show**
4. **Copy this key**

---

## ✏️ Step 3: Update Code (1 minute)

### File 1: `onesignal-config.js`
Replace line 7:
```javascript
const ONESIGNAL_APP_ID = 'paste-your-app-id-here';
```

### File 2: `supabase-notifications.js`
Replace lines 37-38:
```javascript
const ONESIGNAL_APP_ID = 'paste-your-app-id-here';
const ONESIGNAL_REST_API_KEY = 'paste-your-rest-api-key-here';
```

---

## 🔥 Step 4: Enable Realtime (30 seconds)

1. Go to **Supabase Dashboard**
2. Click **Database** → **Replication**
3. Find **reviews** table
4. Toggle **Realtime** to **ON**
5. Click **Save**

---

## 🧪 Step 5: Test (30 seconds)

1. Start app: `npm run dev`
2. Open in browser: **http://localhost:3000**
3. Click **Bell icon** (top right)
4. Click **Allow** when browser asks
5. Go to **Reviews** tab
6. Click **Add Your Review**
7. Submit a review
8. **You should get a notification!** 🎉

---

## ✅ Done!

If you see the notification, **everything is working!**

### Next Steps:
- Deploy to production domain
- Update OneSignal Site URL to production
- Build Android APK with WebIntoApp
- Test on real Android device

---

## ❌ Not Working?

### Check Console (F12):
Should see:
```
✅ OneSignal initialized successfully
✅ Subscribed to reviews realtime updates
```

### Common Issues:
- **No notification:** Make sure you clicked "Allow" for notifications
- **Console errors:** Double-check API keys are pasted correctly
- **Realtime not working:** Verify Realtime is enabled in Supabase

---

## 📖 Need More Help?

See detailed guides:
- **ONESIGNAL_SETUP_GUIDE.md** - Full setup instructions
- **IMPLEMENTATION_SUMMARY.md** - How it all works
