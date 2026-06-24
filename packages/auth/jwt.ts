import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "insecure-dev-secret";

export interface SessionJWT {
  userId: string;
  role: string;
  tenantId?: string | null;
  onboardingCompleted: boolean;
  exp?: number;
}

// Create a signed session JWT
export function signSession(payload: SessionJWT) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "24h", // must match your Prisma session duration
  });
}

// Verify and decode JWT
export function verifySession(token: string): SessionJWT | null {
  try {
    return jwt.verify(token, SECRET) as SessionJWT;
  } catch (err) {
    return null;
  }
}
