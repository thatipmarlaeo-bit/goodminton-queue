importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

// ใช้คอนฟิกเดียวกับใน firebase.js ของโปรเจกต์
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
})

const messaging = firebase.messaging()

// จัดการการแจ้งเตือนเมื่อแอปทำงานอยู่เบื้องหลัง (ปิดจอ/พับหน้าต่าง)
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'ถึงคิวลงสนามแล้ว!'
  const notificationOptions = {
    body: payload.notification.body || 'กรุณาไปที่คอร์ดเพื่อเตรียมพร้อมแข่งขัน',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200, 100, 400],
    tag: 'court-call-alert',
    renotify: true,
    data: payload.data
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})