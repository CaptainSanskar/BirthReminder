// ============================================
// BIRTHDAY NOTIFICATIONS WITH ONESIGNAL
// ============================================
// This file handles automatic birthday notifications using OneSignal
// Checks daily and sends notifications for upcoming birthdays

import { supabase } from './utils/supabaseClient.js';

// Check for birthdays and send notifications
export const checkAndSendBirthdayNotifications = async () => {
    try {
        console.log('🎂 Checking for upcoming birthdays...');
        
        // Get all birthdays from localStorage
        const savedBirthdays = localStorage.getItem('cakewait_birthdays');
        if (!savedBirthdays) {
            console.log('No birthdays found');
            return;
        }

        const birthdays = JSON.parse(savedBirthdays);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check each birthday
        for (const birthday of birthdays) {
            const daysUntil = calculateDaysUntil(birthday.birthDate);
            
            // Send notification based on days until birthday
            if (daysUntil === 0) {
                // TODAY is the birthday!
                await sendBirthdayNotification(birthday, 'today');
            } else if (daysUntil === 1) {
                // Tomorrow
                await sendBirthdayNotification(birthday, 'tomorrow');
            } else if (daysUntil === 7) {
                // One week away
                await sendBirthdayNotification(birthday, 'week');
            }
        }

    } catch (error) {
        console.error('❌ Error checking birthdays:', error);
    }
};

// Calculate days until birthday
const calculateDaysUntil = (birthDateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const parts = birthDateString.split('-').map(Number);
    const birth = new Date(parts[0], parts[1] - 1, parts[2]);
    
    // Create date for this year's birthday
    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    
    // If birthday passed this year, check next year
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
};

// Calculate age
const calculateNextAge = (birthDateString) => {
    const today = new Date();
    const parts = birthDateString.split('-').map(Number);
    const birth = new Date(parts[0], parts[1] - 1, parts[2]);
    
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age + 1;
};

// Send birthday notification via OneSignal API
const sendBirthdayNotification = async (birthday, type) => {
    // Get keys from config (you'll update these in onesignal-config.js)
    const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID_HERE'; // TODO: Replace with your App ID
    const ONESIGNAL_REST_API_KEY = 'YOUR_ONESIGNAL_REST_API_KEY_HERE'; // TODO: Replace with your REST API Key

    let notification = {};
    const age = calculateNextAge(birthday.birthDate);
    
    switch(type) {
        case 'today':
            notification = {
                headings: { en: `🎂 Birthday Today!` },
                contents: { 
                    en: `It's ${birthday.name}'s ${age}th birthday! Don't forget to wish them! 🎉` 
                },
                data: {
                    type: 'birthday_today',
                    birthday_id: birthday.id,
                    name: birthday.name
                },
                big_picture: `https://cdn-icons-png.flaticon.com/512/4213/4213652.png`,
                // High priority for today's birthdays
                priority: 10,
                android_channel_id: 'birthday-alerts'
            };
            break;
            
        case 'tomorrow':
            notification = {
                headings: { en: `⏰ Birthday Tomorrow` },
                contents: { 
                    en: `${birthday.name}'s ${age}th birthday is tomorrow! Get ready! 🎈` 
                },
                data: {
                    type: 'birthday_tomorrow',
                    birthday_id: birthday.id,
                    name: birthday.name
                },
                big_picture: `https://cdn-icons-png.flaticon.com/512/4213/4213652.png`,
                priority: 8,
                android_channel_id: 'birthday-reminders'
            };
            break;
            
        case 'week':
            notification = {
                headings: { en: `📅 Birthday Next Week` },
                contents: { 
                    en: `${birthday.name}'s birthday is in 7 days. Plan something special! 🎁` 
                },
                data: {
                    type: 'birthday_week',
                    birthday_id: birthday.id,
                    name: birthday.name
                },
                big_picture: `https://cdn-icons-png.flaticon.com/512/4213/4213652.png`,
                priority: 5,
                android_channel_id: 'birthday-reminders'
            };
            break;
    }

    // Add common settings
    notification = {
        ...notification,
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['All'], // Send to all subscribed users
        small_icon: 'notification_icon',
        large_icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
        android_accent_color: 'FFD2F801', // Lime color
        ios_sound: 'notification.wav',
        web_icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
        url: window.location.origin
    };

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(notification)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Birthday notification sent for ${birthday.name} (${type})`, data);
        } else {
            console.error(`❌ Failed to send birthday notification:`, data);
        }

        return data;
    } catch (error) {
        console.error('❌ Error sending birthday notification:', error);
    }
};

// Schedule daily check at 9:00 AM
export const scheduleDailyBirthdayCheck = () => {
    console.log('📅 Scheduling daily birthday checks...');
    
    // Check immediately on app load
    checkAndSendBirthdayNotifications();
    
    // Then check every 24 hours
    setInterval(() => {
        checkAndSendBirthdayNotifications();
    }, 24 * 60 * 60 * 1000); // 24 hours
};

// Manual trigger for testing
export const testBirthdayNotification = async () => {
    const testBirthday = {
        id: '999',
        name: 'Test User',
        birthDate: new Date().toISOString().split('T')[0], // Today's date
        emoji: '🎂'
    };
    
    await sendBirthdayNotification(testBirthday, 'today');
    console.log('🧪 Test birthday notification sent');
};

// Check on specific time (e.g., 9:00 AM daily)
export const scheduleAtSpecificTime = (hour = 9, minute = 0) => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilCheck = scheduledTime.getTime() - now.getTime();
    
    console.log(`⏰ Next birthday check scheduled for: ${scheduledTime.toLocaleString()}`);
    
    // Schedule first check
    setTimeout(() => {
        checkAndSendBirthdayNotifications();
        
        // Then repeat daily
        setInterval(() => {
            checkAndSendBirthdayNotifications();
        }, 24 * 60 * 60 * 1000);
    }, timeUntilCheck);
};
