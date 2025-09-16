// // Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-PrJ5DRggt5Mi_WRPbL0d7YTYFHqrwGg",
  authDomain: "aimockinterviewer-d0a3a.firebaseapp.com",
  projectId: "aimockinterviewer-d0a3a",
  storageBucket: "aimockinterviewer-d0a3a.firebasestorage.app",
  messagingSenderId: "1082028923518",
  appId: "1:1082028923518:web:a1936424beef34a357562f",
  measurementId: "G-84G0QNL2VD"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);