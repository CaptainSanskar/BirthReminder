// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDD4ctAhIdQCIJE0a3vlU6STNtETWTO91c",
  authDomain: "notification-c7b6a.firebaseapp.com",
  projectId: "notification-c7b6a",
  storageBucket: "notification-c7b6a.firebasestorage.app",
  messagingSenderId: "918045500456",
  appId: "1:918045500456:web:28382ed9d61e91398cc11d",
  measurementId: "G-8XB8X1JGCM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize messaging only if supported
let messaging;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase Messaging not supported:', error);
}

export { app, messaging };

/**
 * Request notification permission and get FCM token
 * @returns FCM token or null if permission denied
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if messaging is initialized
    if (!messaging) {
      console.warn('Firebase Messaging not available, skipping FCM setup');
      return null;
    }
    
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get FCM token
      // VAPID key from Firebase Console: Project Settings > Cloud Messaging > Web Push certificates
      const vapidKey = 'BIelk3XThhbXGVpx6qhg79XEWL4IL6b8eGOsrskIiWogH1Kxg65GfN7x6r58tSjI808HkxTNeAzXqNIC39pF9Ps';
      
      try {
        const token = await getToken(messaging, { vapidKey });
        
        if (token) {
          console.log('FCM Token:', token);
          // Store token in localStorage for later use
          localStorage.setItem('fcm_token', token);
          return token;
        } else {
          console.log('No registration token available.');
          return null;
        }
      } catch (tokenError) {
        console.warn('Failed to get FCM token:', tokenError);
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return;
  }
  
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
}

/**
 * Get stored FCM token
 */
export function getStoredFCMToken(): string | null {
  return localStorage.getItem('fcm_token');
}
