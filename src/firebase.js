import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth'

// นำ firebaseConfig ที่ก๊อปปี้มาจากเว็บ Firebase มาวางทับตรงนี้ได้เลย 👇
const firebaseConfig = {
  apiKey: "AIzaSyBRV1xSOQf4HMkZO_jPFUKFb2A3BUgYUrg",
  authDomain: "goodminton-queue.firebaseapp.com",
  projectId: "goodminton-queue",
  storageBucket: "goodminton-queue.firebasestorage.app",
  messagingSenderId: "96869892921",
  appId: "1:96869892921:web:1ea28bb7ee9e9d9aa79ee8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);