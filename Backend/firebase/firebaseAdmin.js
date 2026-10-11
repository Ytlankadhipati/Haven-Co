import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

const stripWrappingQuotes = (value) => {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = stripWrappingQuotes(process.env.FIREBASE_PRIVATE_KEY)
  .replace(/\\n/g, "\n");

const missingFirebaseEnv = [
  !projectId && "FIREBASE_PROJECT_ID",
  !clientEmail && "FIREBASE_CLIENT_EMAIL",
  !privateKey && "FIREBASE_PRIVATE_KEY",
].filter(Boolean);

for (const name of missingFirebaseEnv) {
  console.error(`Firebase Admin configuration missing required environment variable: ${name}`);
}

let firebaseApp = getApps()[0] || null;
if (!firebaseApp && getApps().length === 0 && missingFirebaseEnv.length === 0) {
  firebaseApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export default firebaseAuth;
