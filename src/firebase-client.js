// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBu-h_bO3zmgIQecwAfgg8NUbPVLjqaYmY",
  authDomain: "finance-app-3b4ba.firebaseapp.com",
  projectId: "finance-app-3b4ba",
  storageBucket: "finance-app-3b4ba.firebasestorage.app",
  messagingSenderId: "180634898170",
  appId: "1:180634898170:web:11f0dde6b6fc9147554343",
  measurementId: "G-MST3779VV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const firestoreDb = getFirestore(app);