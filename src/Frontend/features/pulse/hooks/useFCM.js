// src/Frontend/features/pulse/hooks/useFCM.js
import { useEffect, useState } from 'react';
import { requestNotificationPermission, saveFCMToken, onForegroundMessage } from '../../../../Backend/services/messagingService';

export function useFCM(userId) {
  const [fcmEnabled, setFcmEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    async function initFCM() {
      try {
        const token = await requestNotificationPermission();
        if (token && isMounted) {
          await saveFCMToken(userId, token);
          setFcmEnabled(true);
        }
      } catch (err) {
        console.warn("FCM init gracefully handled as failure:", err);
      }
    }

    initFCM();

    const unsub = onForegroundMessage((payload) => {
      if (!isMounted) return;
      if (payload?.notification) {
        setToastMessage(payload.notification);
        setTimeout(() => setToastMessage(null), 5000);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [userId]);

  return { fcmEnabled, toastMessage };
}
