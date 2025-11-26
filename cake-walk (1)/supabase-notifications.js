// ============================================
// SUPABASE REALTIME + ONESIGNAL INTEGRATION
// ============================================
// This file listens for new reviews in Supabase and triggers push notifications
// Works in background even when app is closed

import { supabase } from './utils/supabaseClient.js';

let realtimeChannel = null;

// Initialize Supabase Realtime subscription for new reviews
export const initializeReviewNotifications = () => {
    try {
        console.log('📡 Setting up Supabase Realtime listener for reviews...');

        // Unsubscribe from previous channel if exists
        if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
        }

        // Subscribe to INSERT events on 'reviews' table
        realtimeChannel = supabase
            .channel('reviews-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'reviews'
                },
                (payload) => {
                    console.log('🎉 New review detected:', payload);
                    handleNewReview(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Subscribed to reviews realtime updates');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Realtime subscription error');
                } else {
                    console.log('📡 Realtime status:', status);
                }
            });

    } catch (error) {
        console.error('❌ Error setting up realtime listener:', error);
    }
};

// Handle new review (send notification via OneSignal API)
const handleNewReview = async (review) => {
    try {
        console.log('📬 Sending notification for new review...');

        const notification = {
            headings: { en: "🎉 New Review!" },
            contents: { 
                en: `${review.name} just rated CakeWait ${review.rating} stars!` 
            },
            data: {
                type: 'new_review',
                review_id: review.id,
                rating: review.rating
            },
            // Send to all subscribed users
            included_segments: ['All'],
            // Custom icon and image
            small_icon: 'notification_icon',
            large_icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
            big_picture: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
            // Android specific settings
            android_accent_color: 'FFD2F801', // Lime color
            android_channel_id: 'cakewait-reviews',
            // iOS specific settings
            ios_sound: 'notification.wav',
            // Web specific settings
            web_icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
            url: window.location.origin // Open app on click
        };

        // Send via OneSignal REST API
        await sendNotificationViaAPI(notification);

    } catch (error) {
        console.error('❌ Error handling new review:', error);
    }
};

// Send notification using OneSignal REST API
const sendNotificationViaAPI = async (notification) => {
    // NOTE: This should ideally be done from a backend server for security
    // For now, we'll use the REST API directly (not recommended for production)
    
    const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID_HERE';
    const ONESIGNAL_REST_API_KEY = 'YOUR_ONESIGNAL_REST_API_KEY_HERE';

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                ...notification
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Notification sent successfully:', data);
        } else {
            console.error('❌ Failed to send notification:', data);
        }

        return data;
    } catch (error) {
        console.error('❌ Error sending notification via API:', error);
    }
};

// Stop listening to review updates
export const stopReviewNotifications = () => {
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
        console.log('🔇 Stopped listening to review updates');
    }
};

// Manual notification test (for debugging)
export const sendTestNotification = async () => {
    const testReview = {
        id: 999,
        name: 'Test User',
        rating: 5,
        content: 'This is a test notification!'
    };
    
    await handleNewReview(testReview);
};
