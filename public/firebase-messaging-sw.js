importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Must configure manually if using compat scripts in SW
// The keys should ideally match the project config
firebase.initializeApp({
  apiKey: "AIzaSyDJ7vlo_Bw4QTtd2UTrhdmNDkblgHaPvTY",
  projectId: "prepflow-ai-harsh",
  messagingSenderId: "969008089984",
  appId: "1:969008089984:web:bc4ef788d900a6e07b0f65"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
