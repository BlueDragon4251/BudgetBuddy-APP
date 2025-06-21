// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for BudgetBuddy
const firebaseConfig = {
  apiKey: "AIzaSyAp_C8r7k4JbnWJGlJY_IrXgaM9jusShII",
  authDomain: "budgetbuddy4251.firebaseapp.com",
  projectId: "budgetbuddy4251",
  storageBucket: "budgetbuddy4251.firebasestorage.app",
  messagingSenderId: "287628065599",
  appId: "1:287628065599:web:b7065b7482346174d4f18a",
  measurementId: "G-63N9SCDE25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);