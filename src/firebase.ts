// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAWUrQwvSkg4k6YGoP4TWO9_pEGSQniPN4",
  authDomain: "tenadam-d5d83.firebaseapp.com",
  projectId: "tenadam-d5d83",
  storageBucket: "tenadam-d5d83.firebasestorage.app",
  messagingSenderId: "854970187210",
  appId: "1:854970187210:web:74f2df3e4cd9e1d6492333",
  measurementId: "G-L7V8L6ECTG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);