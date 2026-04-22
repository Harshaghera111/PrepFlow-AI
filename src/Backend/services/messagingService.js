// src/Backend/services/messagingService.js
/* SETUP: before this works in production —
  1. Go to Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
  2. Generate a key pair, copy the public key
  3. Add to Vercel: Settings → Environment Variables
        Key:   VITE_FCM_VAPID_KEY
        Value: <your key pair>
  4. FCM only works on HTTPS — Vercel handles this automatically
*/

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import app from './firebase'; // Existing initialized app

let messaging = null;

// Initialize conditionally due to browser support (e.g. Safari incognito might fail)
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch(() => {
  console.log("FCM is not supported in this browser environment.");
});

/**
 * Requests notification permission and returns FCM token
 * @returns {Promise<string|null>} Token if granted, null if denied or unsupported
 */
export async function requestNotificationPermission() {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FCM_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.warn("Notification permission request failed (soft catch):", error);
    return null;
  }
}

/**
 * Saves FCM token to user document
 * @param {string} userId - Firebase Auth UID
 * @param {string} token - FCM Token
 */
export async function saveFCMToken(userId, token) {
  if (!userId || !token) return;
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      fcmTokens: arrayUnion(token)
    });
  } catch (err) {
    console.error("Failed to save FCM token to user doc:", err);
  }
}

/**
 * Registers a foreground message handler
 * @param {Function} callback - Callback function for messages
 */
export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  try {
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (err) {
    console.warn("Failed to set onMessage listener:", err);
    return () => {};
  }
}
