// apps/api/src/auth/service.ts
// Authentication and RBAC user service with secure cryptographic hashing and token signing

import crypto from "crypto";
import { AuthUser, AuthTokenPayload, UserRole, ROLE_PERMISSIONS } from "./types.js";

interface StoredUser extends AuthUser {
  passwordHash: string;
}

const JWT_SECRET = process.env.AUTH_SECRET || "stocksense-deterministic-auth-secret-vortexa-s02";

// Secure native crypto password hashing using scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Token generation using signed Base64 payload (HMAC-SHA256)
export function createAuthToken(payload: AuthTokenPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7 days
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
  } catch {
    return null;
  }
}

// Pre-seeded demo accounts for instant evaluation & testing
const DEMO_USERS: StoredUser[] = [
  {
    id: "usr_storekeeper_01",
    email: "storekeeper@stocksense.health",
    passwordHash: hashPassword("inventory2026"),
    name: "Dr. Aditi Sharma",
    role: "STOREKEEPER",
    facilityName: "CityCare Community Pharmacy",
    facilityType: "Community Pharmacy",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_admin_01",
    email: "admin@stocksense.health",
    passwordHash: hashPassword("admin2026"),
    name: "Marcus Vance",
    role: "ADMIN",
    facilityName: "Regional Health Network Store",
    facilityType: "Hospital Supply Store",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_analyst_01",
    email: "analyst@stocksense.health",
    passwordHash: hashPassword("analyst2026"),
    name: "Elena Rostova",
    role: "ANALYST",
    facilityName: "Primary Healthcare Centre #4",
    facilityType: "Primary Health Centre",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_auditor_01",
    email: "auditor@stocksense.health",
    passwordHash: hashPassword("auditor2026"),
    name: "Inspection Officer Patel",
    role: "VIEWER",
    facilityName: "State Health Oversight Board",
    facilityType: "Regulatory Authority",
    createdAt: new Date().toISOString(),
  },
];

// In-memory user database with persistent demo users
const usersStore: Map<string, StoredUser> = new Map();

// Initialize demo users
for (const u of DEMO_USERS) {
  usersStore.set(u.email.toLowerCase(), u);
}

export function getUserByEmail(email: string): StoredUser | null {
  return usersStore.get(email.toLowerCase().trim()) || null;
}

export function getUserById(id: string): StoredUser | null {
  for (const user of usersStore.values()) {
    if (user.id === id) return user;
  }
  return null;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  facilityName?: string;
  facilityType?: string;
}

export function registerUser(input: RegisterInput): { user: AuthUser; token: string } {
  const normalizedEmail = input.email.toLowerCase().trim();
  if (usersStore.has(normalizedEmail)) {
    throw new Error("An account with this email address already exists.");
  }

  const role: UserRole = input.role || "STOREKEEPER";
  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    passwordHash: hashPassword(input.password),
    name: input.name.trim(),
    role,
    facilityName: input.facilityName?.trim() || "StockSense Facility",
    facilityType: input.facilityType?.trim() || "Community Pharmacy",
    createdAt: new Date().toISOString(),
  };

  usersStore.set(normalizedEmail, newUser);

  const token = createAuthToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  const { passwordHash, ...safeUser } = newUser;
  return { user: safeUser, token };
}

export function loginUser(email: string, password: string): { user: AuthUser; token: string } {
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  const token = createAuthToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, token };
}

export function getDemoAccounts() {
  return DEMO_USERS.map(({ passwordHash, ...user }) => ({
    ...user,
    samplePassword:
      user.role === "STOREKEEPER"
        ? "inventory2026"
        : user.role === "ADMIN"
        ? "admin2026"
        : user.role === "ANALYST"
        ? "analyst2026"
        : "auditor2026",
    permissions: ROLE_PERMISSIONS[user.role],
  }));
}
