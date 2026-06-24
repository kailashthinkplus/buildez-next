import { prisma } from "@buildez/db";

/**
 * Fetch user by email
 */
export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

/**
 * Fetch user by phone
 */
export async function findUserByPhone(phone: string) {
  return db.user.findUnique({
    where: { phone },
  });
}

/**
 * Create new user (signup / OTP / Google)
 */
export async function createUser(data: {
  email?: string;
  phone?: string;
  passwordHash?: string;
  googleId?: string;
}) {
  return db.user.create({
    data,
  });
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}
