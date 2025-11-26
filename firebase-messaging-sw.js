// Firebase Messaging Service Worker
// This file handles background notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyDD4ctAhIdQCIJE0a3vlU6STNtETWTO91c",
  authDomain: "notification-c7b6a.firebaseapp.com",
  projectId: "notification-c7b6a",
  storageBucket: "notification-c7b6a.firebasestorage.app",
  messagingSenderId: "918045500456",
  appId: "1:918045500456:web:28382ed9d61e91398cc11d",
  measurementId: "G-8XB8X1JGCM"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'CakeWait Birthday Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a birthday reminder!',
    icon: payload.notification?.icon || 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.data?.birthdayId || 'birthday-notification',
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || event.action === '') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window/tab open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Birthday checking functionality (keeping your existing logic)
const DB_NAME = 'BirthdayDB';
const DB_VERSION = 1;

async function checkBirthdaysAndNotify() {
  try {
    const birthdays = await getAllBirthdaysFromDB();
    
    if (!birthdays || birthdays.length === 0) {
      return;
    }
    
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    for (const birthday of birthdays) {
      if (!birthday.notificationEnabled) continue;
      
      const parts = birthday.birthDate.split('-').map(Number);
      const birthMonth = parts[1] - 1;
      const birthDay = parts[2];
      
      const daysUntil = calculateDaysUntil(birthday.birthDate);
      
      // Birthday is TODAY
      if (birthMonth === todayMonth && birthDay === todayDate) {
        await sendLocalNotification(
          '🎂 Birthday Today!',
          `It's ${birthday.name}'s birthday! Don't forget to wish them! 🎉`,
          { birthdayId: birthday.id, type: 'today' }
        );
      }
      // Birthday is TOMORROW
      else if (daysUntil === 1) {
        await sendLocalNotification(
          '⏰ Birthday Tomorrow',
          `${birthday.name}'s birthday is tomorrow! Get ready! 🎈`,
          { birthdayId: birthday.id, type: 'tomorrow' }
        );
      }
      // Birthday is in 7 DAYS
      else if (daysUntil === 7) {
        await sendLocalNotification(
          '📅 Birthday Next Week',
          `${birthday.name}'s birthday is in 7 days`,
          { birthdayId: birthday.id, type: 'week' }
        );
      }
    }
  } catch (error) {
    console.error('Error checking birthdays:', error);
  }
}

function sendLocalNotification(title, body, data) {
  return self.registration.showNotification(title, {
    body: body,
    icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    tag: `birthday-${data.birthdayId}`,
    data: data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
}

function getAllBirthdaysFromDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('birthdays')) {
        resolve([]);
        return;
      }
      const transaction = db.transaction(['birthdays'], 'readonly');
      const store = transaction.objectStore('birthdays');
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

function calculateDaysUntil(birthDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = birthDateString.split('-').map(Number);
  const birth = new Date(parts[0], parts[1] - 1, parts[2]);
  
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Periodic check
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-birthdays') {
    event.waitUntil(checkBirthdaysAndNotify());
  }
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'checkBirthdays') {
    event.waitUntil(checkBirthdaysAndNotify());
  }
});
