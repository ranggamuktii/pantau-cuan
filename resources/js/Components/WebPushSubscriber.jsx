import { useEffect } from 'react';
import axios from 'axios';

export default function WebPushSubscriber() {
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        const registerServiceWorkerAndSubscribe = async () => {
            try {
                // Check current permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Push notification permission denied.');
                    return;
                }

                // Register Service Worker
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                // Check for existing subscription
                let subscription = await registration.pushManager.getSubscription();
                
                // If no subscription, create one using the VAPID key
                if (!subscription) {
                    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                    
                    if (!vapidPublicKey) {
                        console.error('VITE_VAPID_PUBLIC_KEY is missing in environment variables.');
                        return;
                    }

                    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey
                    });
                }

                // Send subscription to backend
                await sendSubscriptionToBackEnd(subscription);
                
            } catch (error) {
                console.error('Error during service worker registration or push subscription:', error);
            }
        };

        registerServiceWorkerAndSubscribe();
    }, []);

    const sendSubscriptionToBackEnd = async (subscription) => {
        try {
            await axios.post('/push-subscriptions', subscription.toJSON(), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Failed to send push subscription to backend:', error);
        }
    };

    // Utility function to convert VAPID public key
    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    return null; // This is a headless component
}
