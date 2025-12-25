import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE_NAME = "divyde_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Simple password hashing (in production, use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}

// Generate a secure session token
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Create a session for a user
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

// Set the session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });
}

// Get the current session from cookies
export async function getSession(): Promise<{
  userId: string;
  user: { id: string; email: string; name: string };
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or not found
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return {
    userId: session.userId,
    user: session.user,
  };
}

// Delete session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Require authentication - returns user or throws
export async function requireAuth(): Promise<{
  userId: string;
  user: { id: string; email: string; name: string };
}> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

