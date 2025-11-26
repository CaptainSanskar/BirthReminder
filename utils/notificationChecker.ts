// Aggressive Notification Checker for APK
// This runs multiple checks to ensure notifications work

export class NotificationChecker {
  private checkInterval: number | null = null;
  private isRunning = false;

  /**
   * Start aggressive notification checking
   * Checks every minute for birthdays
   */
  start() {
    if (this.isRunning) {
      console.log('Notification checker already running');
      return;
    }

    this.isRunning = true;
    console.log('🔔 Starting aggressive notification checker');

    // Initial check
    this.checkNow();

    // Check every minute (60000ms)
    this.checkInterval = window.setInterval(() => {
      this.checkNow();
    }, 60000);

    // Also check when app becomes visible
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          console.log('App visible - checking birthdays');
          this.checkNow();
        }
      });
    }
  }

  /**
   * Stop the checker
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Notification checker stopped');
  }

  /**
   * Force check right now
   */
  async checkNow() {
    try {
      console.log('🔍 Checking for birthdays now...');

      // Method 1: Service Worker message
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ 
          action: 'checkBirthdays' 
        });
        console.log('✅ Sent check request to service worker');
      }

      // Method 2: Direct check and notification
      const birthdays = await this.getBirthdaysFromStorage();
      if (birthdays && birthdays.length > 0) {
        console.log(`Found ${birthdays.length} birthdays`);
        await this.checkAndNotify(birthdays);
      }

      // Method 3: Wake up service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // Trigger a sync to wake up SW
          if ('sync' in registration) {
            await (registration as any).sync.register('check-birthdays');
          }
        } catch (e) {
          console.log('Sync not supported:', e);
        }
      }
    } catch (error) {
      console.error('Error in checkNow:', error);
    }
  }

  /**
   * Get birthdays from IndexedDB
   */
  private async getBirthdaysFromStorage(): Promise<any[]> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('BirthdayDB', 1);
        
        request.onerror = () => {
          console.error('Failed to open IndexedDB');
          resolve([]);
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('birthdays')) {
            resolve([]);
            return;
          }
          
          const transaction = db.transaction(['birthdays'], 'readonly');
          const store = transaction.objectStore('birthdays');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result || []);
          };
          
          getAllRequest.onerror = () => {
            console.error('Failed to get birthdays');
            resolve([]);
          };
        };
      } catch (error) {
        console.error('Error accessing IndexedDB:', error);
        resolve([]);
      }
    });
  }

  /**
   * Check birthdays and show notifications directly
   */
  private async checkAndNotify(birthdays: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    for (const birthday of birthdays) {
      if (!birthday.notificationEnabled) continue;

      const parts = birthday.birthDate.split('-').map(Number);
      const birthMonth = parts[1] - 1;
      const birthDay = parts[2];
      const daysUntil = this.calculateDaysUntil(birthday.birthDate);

      let title = '';
      let body = '';
      let shouldNotify = false;

      // Birthday is TODAY
      if (birthMonth === todayMonth && birthDay === todayDate) {
        title = '🎂 Birthday Today!';
        body = `It's ${birthday.name}'s birthday! Don't forget to wish them! 🎉`;
        shouldNotify = true;
      }
      // Birthday is TOMORROW
      else if (daysUntil === 1) {
        title = '⏰ Birthday Tomorrow';
        body = `${birthday.name}'s birthday is tomorrow! Get ready! 🎈`;
        shouldNotify = true;
      }
      // Birthday is in 7 DAYS
      else if (daysUntil === 7) {
        title = '📅 Birthday Next Week';
        body = `${birthday.name}'s birthday is in 7 days`;
        shouldNotify = true;
      }

      if (shouldNotify) {
        await this.showNotification(title, body, birthday.id);
      }
    }
  }

  /**
   * Show notification using multiple methods
   */
  private async showNotification(title: string, body: string, birthdayId: string) {
    console.log(`📢 Attempting to show notification: ${title}`);

    // Method 1: Service Worker notification (best for APK)
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: body,
          icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
          badge: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
          vibrate: [200, 100, 200, 100, 200],
          tag: `birthday-${birthdayId}`,
          requireInteraction: true,
          silent: false,
          renotify: true,
          data: { birthdayId, type: 'birthday' }
        });
        console.log('✅ Notification shown via Service Worker');
        return;
      }
    } catch (swError) {
      console.warn('SW notification failed:', swError);
    }

    // Method 2: Browser Notification API (fallback)
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
          vibrate: [200, 100, 200, 100, 200],
          tag: `birthday-${birthdayId}`
        });
        console.log('✅ Notification shown via Notification API');
        return;
      }
    } catch (notifError) {
      console.warn('Notification API failed:', notifError);
    }

    // Method 3: Console log as last resort (for debugging)
    console.log(`🔔 NOTIFICATION: ${title} - ${body}`);
  }

  /**
   * Calculate days until birthday
   */
  private calculateDaysUntil(birthDateString: string): number {
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

  /**
   * Test if notifications work
   */
  async testNotification() {
    console.log('🧪 Testing notification...');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('🎂 Test Notification', {
          body: 'CakeWait notifications are working!',
          icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
          vibrate: [200, 100, 200],
          tag: 'test'
        });
        console.log('✅ Test notification sent');
        return true;
      }
    } catch (error) {
      console.error('Test notification failed:', error);
      return false;
    }
    
    return false;
  }
}

// Export singleton instance
export const notificationChecker = new NotificationChecker();
