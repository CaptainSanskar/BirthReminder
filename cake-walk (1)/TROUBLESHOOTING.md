# 🔧 TROUBLESHOOTING GUIDE

Complete guide to fix common push notification issues.

---

## 🚨 PROBLEM 1: "OneSignal is not defined"

### Error in Console:
```
❌ ReferenceError: OneSignal is not defined
```

### Causes:
- OneSignal SDK not loaded
- Script tag missing or incorrect
- Loading timing issue

### Solutions:

#### Solution 1: Check Script Tag
Open `index.html` and verify this line exists in `<head>`:
```html
<script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" defer></script>
```

#### Solution 2: Check Internet Connection
- Make sure you can access: https://cdn.onesignal.com/sdks/OneSignalSDK.js
- Test in browser directly

#### Solution 3: Increase Delay
In `App.tsx`, line 43, increase delay:
```typescript
setTimeout(initPushNotifications, 2000); // Changed from 1000 to 2000
```

---

## 🚨 PROBLEM 2: No Notification Permission Prompt

### Symptoms:
- Clicking Bell icon does nothing
- No browser popup asking for permission

### Solutions:

#### Solution 1: Reset Browser Permissions
1. Click lock icon in address bar
2. Click "Site settings"
3. Find "Notifications"
4. Reset to "Ask (default)"
5. Refresh page and try again

#### Solution 2: Check Browser Support
```javascript
// Add this to console to check:
console.log('Notifications supported:', 'Notification' in window);
console.log('Permission:', Notification.permission);
```

#### Solution 3: Use Different Browser
- Try Chrome (best support)
- Try Firefox
- Safari has limited support
- Avoid mobile Safari

#### Solution 4: Check for Blocking Extensions
- Disable ad blockers
- Disable privacy extensions
- Test in Incognito mode

---

## 🚨 PROBLEM 3: "Notification permission denied"

### Symptoms:
```
❌ Notification permission DENIED
```

### Solutions:

#### Solution 1: Manual Permission Reset
**Chrome:**
1. Go to `chrome://settings/content/notifications`
2. Find your site
3. Change to "Allow"
4. Refresh page

**Firefox:**
1. Click lock icon
2. Click "Clear cookies and site data"
3. Refresh and try again

#### Solution 2: Use Different Domain
If localhost is blocked:
- Deploy to production domain
- Test on HTTPS site

---

## 🚨 PROBLEM 4: Realtime Not Working

### Symptoms:
```
❌ Realtime subscription error
```
- No notifications when review is added

### Solutions:

#### Solution 1: Enable Realtime in Supabase
1. Go to Supabase Dashboard
2. Database → Replication
3. Find `reviews` table
4. Toggle Realtime to ON
5. Save changes

#### Solution 2: Check Table Name
In `supabase-notifications.js`, verify:
```javascript
table: 'reviews' // Must match your actual table name
```

#### Solution 3: Check Supabase Connection
Add to console:
```javascript
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey ? 'Present' : 'Missing');
```

#### Solution 4: Test Realtime Connection
```javascript
// Add this in browser console:
const channel = supabase.channel('test');
channel.subscribe((status) => {
  console.log('Realtime status:', status);
});
```

Should show: `Realtime status: SUBSCRIBED`

---

## 🚨 PROBLEM 5: "Failed to send notification"

### Symptoms:
```
❌ Failed to send notification: 400 Bad Request
```

### Solutions:

#### Solution 1: Verify App ID
- Check `onesignal-config.js` line 7
- App ID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Must be exactly 36 characters
- Get from OneSignal dashboard

#### Solution 2: Verify REST API Key
- Check `supabase-notifications.js` line 38
- Get from OneSignal → Settings → Keys & IDs
- Click "Show" to reveal key
- Copy entire key (long string)

#### Solution 3: Check OneSignal Dashboard
1. Go to OneSignal dashboard
2. Settings → Keys & IDs
3. Verify App ID matches
4. Verify REST API Key is correct (not User Auth Key)

---

## 🚨 PROBLEM 6: Notifications Not Received When App Closed

### Symptoms:
- Notifications work when app is open
- Don't work when app is closed

### Solutions:

#### Solution 1: Browser Limitations (Expected)
- **Normal behavior:** Most browsers don't support notifications when completely closed
- **Solution:** Use Android APK via WebIntoApp for true background notifications

#### Solution 2: Android APK Configuration
In WebIntoApp settings:
- ✅ Enable "Push Notifications"
- ✅ Enable "Background Services"
- ✅ Enable "Run in Background"

#### Solution 3: Android Battery Optimization
On Android device:
1. Settings → Apps → CakeWait
2. Battery → Unrestricted
3. Disable battery optimization

#### Solution 4: Check OneSignalSDKWorker.js
- Must be in root directory
- Must be accessible at: `https://yourdomain.com/OneSignalSDKWorker.js`
- Test by opening in browser

---

## 🚨 PROBLEM 7: Import Errors in TypeScript

### Symptoms:
```
❌ Cannot find module './onesignal-config'
```

### Solutions:

#### Solution 1: Add .js Extension
In `App.tsx`:
```typescript
import { initializeOneSignal } from './onesignal-config.js';
import { initializeReviewNotifications } from './supabase-notifications.js';
```

#### Solution 2: Configure tsconfig.json
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false
  }
}
```

#### Solution 3: Convert to TypeScript
Rename files:
- `onesignal-config.js` → `onesignal-config.ts`
- `supabase-notifications.js` → `supabase-notifications.ts`

---

## 🚨 PROBLEM 8: CORS Errors

### Symptoms:
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

### Solutions:

#### Solution 1: Update OneSignal Site URL
1. OneSignal Dashboard → Settings
2. Web Configuration → Site URL
3. Add your exact domain (including http:// or https://)
4. For local testing, add: `http://localhost:3000`

#### Solution 2: Add Multiple Origins
In OneSignal, add all your domains:
- http://localhost:3000
- https://yourdomain.com
- https://www.yourdomain.com

---

## 🚨 PROBLEM 9: Notifications Sent Multiple Times

### Symptoms:
- Same notification received 2-3 times
- Duplicate notifications

### Solutions:

#### Solution 1: Check for Multiple Subscriptions
```javascript
// In browser console:
OneSignal.getUserId().then(id => console.log('Player ID:', id));
```
Should be one unique ID per device.

#### Solution 2: Unsubscribe and Resubscribe
```javascript
// In browser console:
OneSignal.setSubscription(false);
// Wait 2 seconds
OneSignal.setSubscription(true);
```

#### Solution 3: Clear Service Workers
1. Open DevTools (F12)
2. Application tab
3. Service Workers
4. Unregister all
5. Refresh page

---

## 🚨 PROBLEM 10: Build Errors with Vite

### Symptoms:
```
❌ Module not found or import errors during build
```

### Solutions:

#### Solution 1: Add to vite.config.ts
```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['onesignal-config', 'supabase-notifications']
  }
});
```

#### Solution 2: Dynamic Imports
Change imports to dynamic:
```typescript
const initPushNotifications = async () => {
  const { initializeOneSignal } = await import('./onesignal-config.js');
  const { initializeReviewNotifications } = await import('./supabase-notifications.js');
  // ... rest of code
};
```

---

## 🚨 PROBLEM 11: WebIntoApp APK Crashes

### Symptoms:
- APK installs but crashes on open
- White screen on Android

### Solutions:

#### Solution 1: Check Console Logs
Use ADB (Android Debug Bridge):
```bash
adb logcat | grep -i cakewait
```

#### Solution 2: Test on Multiple Devices
- Try on different Android version
- Try on emulator

#### Solution 3: WebIntoApp Settings
- Disable "Hardware Acceleration"
- Enable "Legacy Mode"
- Set Min SDK to 21

---

## 🚨 PROBLEM 12: No Subscribers in OneSignal Dashboard

### Symptoms:
- Notification permission granted
- But OneSignal dashboard shows 0 subscribers

### Solutions:

#### Solution 1: Check Player ID
```javascript
// In browser console:
OneSignal.getUserId().then(id => {
  console.log('Player ID:', id);
  if (!id) console.error('Not subscribed!');
});
```

#### Solution 2: Manual Subscription
```javascript
// Force subscription:
OneSignal.setSubscription(true);
```

#### Solution 3: Wait for Sync
- Sometimes takes 1-2 minutes to appear
- Refresh OneSignal dashboard

---

## 🛠️ DEBUGGING TOOLS

### Tool 1: Browser Console Logging
Add detailed logging:
```javascript
// In onesignal-config.js, add more logs:
console.log('Step 1: Checking OneSignal...');
console.log('Step 2: Initializing...');
console.log('Step 3: Subscribed:', isSubscribed);
```

### Tool 2: OneSignal Debug Mode
In `onesignal-config.js`:
```javascript
OneSignal.init({
  appId: ONESIGNAL_APP_ID,
  allowLocalhostAsSecureOrigin: true,
  // Add this:
  promptOptions: {
    slidedown: {
      prompts: [{
        type: 'push',
        autoPrompt: false,
        text: {
          actionMessage: "Would you like notifications?",
          acceptButton: "Yes",
          cancelButton: "No"
        }
      }]
    }
  }
});
```

### Tool 3: Network Tab
1. Open DevTools (F12)
2. Network tab
3. Filter: `onesignal.com`
4. Look for failed requests

### Tool 4: Application Tab
Check Service Workers:
1. DevTools → Application
2. Service Workers
3. Should see OneSignal service worker

---

## 📊 TESTING COMMANDS

### Test OneSignal Connection:
```javascript
// In browser console:
OneSignal.isPushNotificationsEnabled().then(enabled => {
  console.log('Push enabled:', enabled);
});
```

### Test Supabase Realtime:
```javascript
// In browser console:
const test = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'reviews'
  }, payload => console.log('Change detected:', payload))
  .subscribe();
```

### Test Notification Send:
```javascript
// In browser console (paste your keys first):
fetch('https://onesignal.com/api/v1/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic YOUR_REST_API_KEY'
  },
  body: JSON.stringify({
    app_id: 'YOUR_APP_ID',
    included_segments: ['All'],
    contents: { en: 'Test notification' }
  })
}).then(r => r.json()).then(console.log);
```

---

## 📞 STILL STUCK?

### Before Asking for Help, Provide:

1. **Error Messages:** Full console log output
2. **Browser:** Chrome 120, Firefox 118, etc.
3. **Environment:** Local (localhost) or Production (HTTPS)
4. **Steps Taken:** What you've already tried
5. **OneSignal Dashboard:** Screenshot of settings
6. **Console Output:** Screenshot of browser console

### Helpful Resources:

- OneSignal Docs: https://documentation.onesignal.com/
- Supabase Realtime Docs: https://supabase.com/docs/guides/realtime
- WebIntoApp Support: https://webintoapp.com/support

---

## ✅ FINAL CHECKLIST

Before declaring something "broken":

- [ ] API keys are correct (double-check typos)
- [ ] Realtime enabled in Supabase
- [ ] Using Chrome or Firefox
- [ ] Site is HTTPS or localhost
- [ ] No browser extensions blocking
- [ ] Service Worker registered
- [ ] Console shows no errors
- [ ] Tested in incognito mode
- [ ] Tried on different device

---

**Good luck! 🍀**

Most issues are configuration-related and can be fixed in minutes!
