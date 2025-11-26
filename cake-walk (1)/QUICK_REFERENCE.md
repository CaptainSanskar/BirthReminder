# 🚀 QUICK REFERENCE CARD

## 📋 3 Files to Update with API Keys

### 1. `onesignal-config.js` (line 7)
```javascript
const ONESIGNAL_APP_ID = 'your-app-id-here';
```

### 2. `supabase-notifications.js` (lines 37-38)
```javascript
const ONESIGNAL_APP_ID = 'your-app-id-here';
const ONESIGNAL_REST_API_KEY = 'your-rest-api-key-here';
```

### 3. `birthday-notifications.js` (lines 86-87)
```javascript
const ONESIGNAL_APP_ID = 'your-app-id-here';
const ONESIGNAL_REST_API_KEY = 'your-rest-api-key-here';
```

---

## 🔑 Where to Get Keys

1. Go to: **https://onesignal.com**
2. Create account → New App → Web Push
3. Copy **App ID** from dashboard
4. Go to Settings → Keys & IDs
5. Copy **REST API Key**

---

## ✅ Enable Supabase Realtime

1. Supabase Dashboard
2. Database → Replication
3. Find `reviews` table
4. Toggle **Realtime** ON
5. Save

---

## 🧪 Quick Test

```bash
# Start app
npm run dev

# Open browser
http://localhost:3000

# Click Bell icon → Allow
# Add a review → Get notification!
# Add birthday for today → Get notification!
```

---

## 📱 Notifications You'll Get

| Type | When | Message |
|------|------|---------|
| **Review** | Someone adds review | 🎉 New Review! |
| **Birthday Today** | Daily at 9 AM | 🎂 Birthday Today! |
| **Birthday Tomorrow** | Daily at 9 AM | ⏰ Birthday Tomorrow |
| **Birthday Week** | Daily at 9 AM | 📅 Birthday Next Week |

---

## 📖 Documentation Quick Links

- **Start:** `START_HERE.md`
- **Setup:** `QUICK_START.md`
- **Birthdays:** `BIRTHDAY_NOTIFICATIONS_GUIDE.md`
- **Help:** `TROUBLESHOOTING.md`
- **Verify:** `CHECKLIST.md`

---

## ✨ Success Indicators

### Console should show:
```
✅ OneSignal initialized successfully
✅ Subscribed to reviews realtime updates
🎂 Birthday notifications scheduled
```

### OneSignal Dashboard should show:
- Subscribers: 1+
- Delivery rate: >95%

---

## 🎯 Key Features

✅ Works when app is **closed** (Android APK)  
✅ **2 notification types**: Reviews + Birthdays  
✅ **Automatic daily checks** at 9:00 AM  
✅ **Realtime** review notifications  
✅ **Production ready** code  

---

## 📞 Need Help?

**Check:** `TROUBLESHOOTING.md` first!

**Common Issues:**
- Wrong API keys → Double-check all 3 files
- No notifications → Check Realtime is enabled
- Browser issues → Use Chrome/Firefox

---

**That's it! You're ready to go! 🎉**
