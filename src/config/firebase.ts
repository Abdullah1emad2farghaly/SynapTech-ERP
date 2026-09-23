// Intended project path: src/config/firebase.ts
//
// Firebase is used ONLY for temporary WebRTC signaling (exchanging SDP
// offer/answer + ICE candidates between laptop and mobile). It is NOT the
// ERP backend, is never used for barcode data, and holds nothing
// permanent — see services/scanner/signaling.service.ts for the
// create/delete lifecycle of a pairing session.
//
// Requires these Vite env vars (see .env.example):
//   VITE_FIREBASE_API_KEY
//   VITE_FIREBASE_AUTH_DOMAIN
//   VITE_FIREBASE_DATABASE_URL      (Realtime Database URL, NOT Firestore)
//   VITE_FIREBASE_PROJECT_ID
//   VITE_FIREBASE_APP_ID
//
// All free-tier (Spark plan) compatible: Realtime Database + Anonymous
// Authentication. No Cloud Functions are used (RTDB-triggered Cloud
// Functions require the Blaze plan even at zero usage, which would violate
// the "no paid service" constraint) — session cleanup is handled entirely
// client-side instead (see signaling.service.ts).
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.FIREBASE_DATABASE_URL,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;

const getFirebaseApp = (): FirebaseApp => {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
};

export const getScannerDatabase = (): Database => {
  if (!db) db = getDatabase(getFirebaseApp());
  return db;
};

export const getScannerAuth = (): Auth => {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
};

// Ensures an anonymous Firebase session exists before any signaling
// read/write — required by the security rules in
// firebase-database.rules.json (`auth != null`), so an anonymous stranger
// can't enumerate or read pairing sessions without at least this minimal
// gate. Idempotent: resolves immediately if already signed in.
export const ensureScannerAuth = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const authInstance = getScannerAuth();
    const unsubscribe = onAuthStateChanged(
      authInstance,
      (user) => {
        if (user) {
          console.log("[Firebase Auth] Anonymous user:", user.uid);
          unsubscribe();
          resolve(user.uid);
        }
      },
      reject
    );
    if (!authInstance.currentUser) {
      signInAnonymously(authInstance)
        .then((result) => {
          console.log("[Firebase Auth] signInAnonymously success:", result.user.uid);
        })
        .catch((error) => {
          console.log("[Firebase Anonymous Auth Error]", error);
          reject(error);
        });
    }
  });
