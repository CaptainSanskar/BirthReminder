// ============================================
// ONESIGNAL PUSH NOTIFICATION CONFIGURATION
// ============================================
// This file handles all OneSignal initialization and push notification setup
// Works even when app is CLOSED (important for Android APK)

const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID_HERE'; // Replace with your OneSignal App ID from dashboard

// Initialize OneSignal
export const initializeOneSignal = () => {
    try {
        console.log('🔔 Initializing OneSignal Push Notifications...');
        
        // Check if OneSignal is loaded
        if (typeof OneSignal === 'undefined') {
            console.error('❌ OneSignal SDK not loaded. Check your index.html script tags.');
            return;
        }

        // Initialize OneSignal with your App ID
        OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true, // For local testing
            notifyButton: {
                enable: false, // We'll use our custom UI
            },
            welcomeNotification: {
                disable: true // Disable default welcome notification
            }
        });

        console.log('✅ OneSignal initialized successfully');

        // Set up event listeners
        setupOneSignalListeners();

    } catch (error) {
        console.error('❌ Error initializing OneSignal:', error);
    }
};

// Set up OneSignal event listeners
const setupOneSignalListeners = () => {
    // Listen for subscription changes
    OneSignal.on('subscriptionChange', (isSubscribed) => {
        console.log('🔔 Subscription changed:', isSubscribed);
        if (isSubscribed) {
            console.log('✅ User is subscribed to push notifications');
            getUserId();
        } else {
            console.log('❌ User is NOT subscribed to push notifications');
        }
    });

    // Listen for notification permission changes
    OneSignal.on('notificationPermissionChange', (permissionChange) => {
        console.log('🔔 Permission changed:', permissionChange);
    });

    // Listen for notification display
    OneSignal.on('notificationDisplay', (event) => {
        console.log('🔔 Notification displayed:', event);
    });
};

// Request notification permission from user
export const requestNotificationPermission = async () => {
    try {
        console.log('📱 Requesting notification permission...');
        
        const permission = await OneSignal.showNativePrompt();
        
        if (permission) {
            console.log('✅ Notification permission GRANTED');
            await getUserId();
            return true;
        } else {
            console.log('❌ Notification permission DENIED');
            return false;
        }
    } catch (error) {
        console.error('❌ Error requesting permission:', error);
        return false;
    }
};

// Get OneSignal Player ID (unique user identifier)
export const getUserId = async () => {
    try {
        const userId = await OneSignal.getUserId();
        console.log('👤 OneSignal Player ID:', userId);
        
        // Store in localStorage for future use
        if (userId) {
            localStorage.setItem('onesignal_player_id', userId);
        }
        
        return userId;
    } catch (error) {
        console.error('❌ Error getting user ID:', error);
        return null;
    }
};

// Check if user is subscribed
export const isUserSubscribed = async () => {
    try {
        const isPushEnabled = await OneSignal.isPushNotificationsEnabled();
        console.log('🔔 Push notifications enabled:', isPushEnabled);
        return isPushEnabled;
    } catch (error) {
        console.error('❌ Error checking subscription:', error);
        return false;
    }
};

// Send a tag to OneSignal (for user segmentation)
export const setUserTag = async (key, value) => {
    try {
        await OneSignal.sendTag(key, value);
        console.log(`✅ Tag set: ${key} = ${value}`);
    } catch (error) {
        console.error('❌ Error setting tag:', error);
    }
};

// Send tags for user preferences
export const setUserPreferences = async (username, userRole = 'user') => {
    try {
        await OneSignal.sendTags({
            username: username,
            role: userRole,
            app: 'cakewait',
            timestamp: new Date().toISOString()
        });
        console.log('✅ User preferences saved to OneSignal');
    } catch (error) {
        console.error('❌ Error setting preferences:', error);
    }
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = async () => {
    try {
        await OneSignal.setSubscription(false);
        console.log('✅ Unsubscribed from notifications');
    } catch (error) {
        console.error('❌ Error unsubscribing:', error);
    }
};

// Re-subscribe to notifications
export const subscribeToNotifications = async () => {
    try {
        await OneSignal.setSubscription(true);
        console.log('✅ Subscribed to notifications');
    } catch (error) {
        console.error('❌ Error subscribing:', error);
    }
};
