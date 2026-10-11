// Backend/firebase/firebaseAdmin.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const requiredFirebaseEnv = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];
const missingFirebaseEnv = requiredFirebaseEnv.filter((name) => !process.env[name]);

if (missingFirebaseEnv.length) {
  for (const name of missingFirebaseEnv) {
    console.error(`Firebase Admin configuration missing required environment variable: ${name}`);
  }
  throw new Error(`Firebase Admin cannot initialize; missing: ${missingFirebaseEnv.join(", ")}`);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export default admin;
