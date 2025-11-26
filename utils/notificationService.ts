// Notification Service - Unified interface for Firebase and Local notifications
import { requestNotificationPermission, onForegroundMessage, getStoredFCMToken } from '../firebase-config';
import { Birthday } from '../types';

export class NotificationService {
  private static instance: NotificationService;
  private initialized = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Setup foreground message listener
      onForegroundMessage((payload) => {
        console.log('Foreground notification received:', payload);
        
        // Show a custom notification or update UI
        if (payload.notification) {
          this.showCustomNotification(
            payload.notification.title,
            payload.notification.body,
            payload.data
          );
        }
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermission(): Promise<string | null> {
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        console.log('Successfully obtained FCM token');
        // You can send this token to your backend server to send notifications
        await this.sendTokenToServer(token);
      }
      
      return token;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  /**
   * Send FCM token to your backend (implement based on your backend)
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Implement your backend API call here
      // Example:
      // await fetch('https://your-backend.com/api/fcm-tokens', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId: 'current-user-id' })
      // });
      
      console.log('FCM token stored:', token);
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  /**
   * Show custom in-app notification
   */
  private showCustomNotification(title: string, body: string, data?: any): void {
    // Create a custom notification UI element
    const notification = document.createElement('div');
    notification.className = 'firebase-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #D2F801 0%, #a8cc00 100%);
        color: #000;
        padding: 16px 20px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(210, 248, 1, 0.3);
        max-width: 350px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
        <div style="font-size: 14px; opacity: 0.9;">${body}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Schedule birthday notifications (to be called by your app logic)
   */
  async scheduleBirthdayNotification(birthday: Birthday): Promise<void> {
    // This would typically send a request to your backend
    // which schedules the notification using FCM
    const token = getStoredFCMToken();
    
    if (!token) {
      console.warn('No FCM token available for scheduling notification');
      return;
    }

    // TODO: Implement backend API call to schedule notification
    console.log('Schedule notification for:', birthday.name);
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return Notification.permission === 'granted';
  }

  /**
   * Get current FCM token
   */
  getToken(): string | null {
    return getStoredFCMToken();
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
