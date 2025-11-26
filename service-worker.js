// service-worker.js
const CACHE_NAME = 'cakewait-v1';
const DB_NAME = 'BirthdayDB';
const DB_VERSION = 1;

// Install Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  self.skipWaiting(); // Activate immediately
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Use relative paths to support sub-directory deployment
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
  // Start checking birthdays immediately
  checkBirthdaysAndNotify();
});

// Periodic Background Sync
self.addEventListener('periodicsync', function(event) {
  console.log('Periodic sync triggered:', event.tag);
  if (event.tag === 'check-birthdays') {
    event.waitUntil(checkBirthdaysAndNotify());
  }
});

// Background Sync (fallback)
self.addEventListener('sync', function(event) {
  console.log('Background sync triggered:', event.tag);
  if (event.tag === 'check-birthdays') {
    event.waitUntil(checkBirthdaysAndNotify());
  }
});

async function checkBirthdaysAndNotify() {
  try {
    const birthdays = await getAllBirthdaysFromDB();
    
    if (!birthdays || birthdays.length === 0) {
      console.log('No birthdays found in database');
      return;
    }
    
    console.log(`Checking ${birthdays.length} birthdays...`);
    
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    for (const birthday of birthdays) {
      // Skip if notifications are disabled for this birthday
      if (!birthday.notificationEnabled) {
        continue;
      }
      
      // We need to parse the YYYY-MM-DD manually to match the logic in the app
      // which uses local time (split by '-')
      const parts = birthday.birthDate.split('-').map(Number);
      const birthMonth = parts[1] - 1; // Month is 0-indexed
      const birthDay = parts[2];
      
      const daysUntil = calculateDaysUntil(birthday.birthDate);
      
      // Birthday is TODAY
      if (birthMonth === todayMonth && birthDay === todayDate) {
        console.log(`🎂 Sending birthday notification for ${birthday.name}`);
        await sendNotification(
          '🎂 Birthday Today!',
          `It's ${birthday.name}'s birthday! Don't forget to wish them! 🎉`,
          { birthdayId: birthday.id, type: 'today' }
        );
      }
      // Birthday is TOMORROW
      else if (daysUntil === 1) {
        console.log(`⏰ Sending tomorrow reminder for ${birthday.name}`);
        await sendNotification(
          '⏰ Birthday Tomorrow',
          `${birthday.name}'s birthday is tomorrow! Get ready! 🎈`,
          { birthdayId: birthday.id, type: 'tomorrow' }
        );
      }
      // Birthday is in 7 DAYS
      else if (daysUntil === 7) {
        console.log(`📅 Sending week reminder for ${birthday.name}`);
        await sendNotification(
          '📅 Birthday Next Week',
          `${birthday.name}'s birthday is in 7 days`,
          { birthdayId: birthday.id, type: 'week' }
        );
      }
    }
    
    console.log('Birthday check complete');
  } catch (error) {
    console.error('Error checking birthdays:', error);
  }
}

function sendNotification(title, body, data) {
  // Service worker notifications work in Android WebView
  console.log('Showing notification:', title);
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
    ],
    // Additional options for better mobile support
    silent: false,
    renotify: true
  }).then(() => {
    console.log('✅ Notification shown successfully');
  }).catch((error) => {
    console.error('❌ Failed to show notification:', error);
  });
}

function getAllBirthdaysFromDB() {
  return new Promise(function(resolve, reject) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = function() { reject(request.error); };
    request.onsuccess = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('birthdays')) {
        resolve([]);
        return;
      }
      const transaction = db.transaction(['birthdays'], 'readonly');
      const store = transaction.objectStore('birthdays');
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = function() { resolve(getAllRequest.result); };
      getAllRequest.onerror = function() { reject(getAllRequest.error); };
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

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'open' || event.action === '') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            // Use relative path './' to open the app in the current directory scope
            return clients.openWindow('./');
          }
        })
    );
  }
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'checkBirthdays') {
    event.waitUntil(checkBirthdaysAndNotify());
  }
});