"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebasePhoneAuthEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

export const firebaseAnalyticsEnabled = Boolean(firebasePhoneAuthEnabled && firebaseConfig.measurementId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!firebasePhoneAuthEnabled) return null;
  if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) auth = getAuth(firebaseApp);
  return auth;
}

let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Lazy, consent-gated GA4 (via Firebase Analytics) init. `firebase/analytics`
 * touches the `indexedDB`/measurement APIs at import time, so it's dynamically
 * imported only once a caller actually wants it — never at module load.
 */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!firebaseAnalyticsEnabled) return Promise.resolve(null);
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return Promise.resolve(null);

  if (!analyticsPromise) {
    analyticsPromise = import("firebase/analytics").then(async ({ getAnalytics, isSupported }) => {
      const supported = await isSupported().catch(() => false);
      if (!supported) return null;
      return getAnalytics(firebaseApp);
    });
  }
  return analyticsPromise;
}
