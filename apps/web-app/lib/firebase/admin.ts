import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/*
 * FIREBASE_SERVICE_ACCOUNT_JSON is the full JSON key downloaded from
 * Firebase Console → Project settings → Service accounts → Generate
 * new private key, pasted as a single-line env var value. Used only
 * server-side to verify the ID token a client gets back from Firebase
 * Phone Auth — never exposed to the browser.
 */
let app: App | null = null;
let initAttempted = false;

function getAdminApp(): App | null {
  if (initAttempted) return app;
  initAttempted = true;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    const serviceAccount = JSON.parse(raw);
    app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
    return app;
  } catch (error) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid:", error);
    return null;
  }
}

export const firebaseAdminEnabled = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

export async function verifyFirebasePhoneToken(idToken: string): Promise<{ phone: string } | null> {
  const adminApp = getAdminApp();
  if (!adminApp) return null;

  const decoded = await getAuth(adminApp).verifyIdToken(idToken);
  if (!decoded.phone_number) return null;

  return { phone: decoded.phone_number };
}
