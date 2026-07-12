import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// HavenCO Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCGyLSEarrWuukMTIo9fcIkbGfMxKLcE5E",
  authDomain: "havenco-10ef1.firebaseapp.com",
  projectId: "havenco-10ef1",
  storageBucket: "havenco-10ef1.firebasestorage.app",
  messagingSenderId: "274109584175",
  appId: "1:274109584175:web:3803f38ead8ac8b24fc7da",
  measurementId: "G-1HXEJM6XMQ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
