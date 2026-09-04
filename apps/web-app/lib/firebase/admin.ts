import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/*
 * ID-token signature verification uses Firebase's public signing keys and
 * only needs the correct project id. A matching service-account JSON is used
 * when present, but a stale credential from another project is never loaded.
 */
let app: App | null = null;
let initAttempted = false;

function getAdminApp(): App | null {
  if (initAttempted) return app;
  initAttempted = true;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccount = raw ? JSON.parse(raw) as { project_id?: string } : null;
    const options = serviceAccount?.project_id === projectId
      ? { projectId, credential: cert(serviceAccount as Parameters<typeof cert>[0]) }
      : { projectId };
    app = getApps()[0] ?? initializeApp(options);
    return app;
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    return null;
  }
}

export const firebaseAdminEnabled = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

export function firebasePhoneVerificationConfigured(): boolean {
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return Boolean(
    clientProjectId &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
}

export async function verifyFirebasePhoneToken(idToken: string): Promise<{ phone: string } | null> {
  const adminApp = getAdminApp();
  if (!adminApp) return null;

  const decoded = await getAuth(adminApp).verifyIdToken(idToken);
  if (!decoded.phone_number) return null;

  return { phone: decoded.phone_number };
}
