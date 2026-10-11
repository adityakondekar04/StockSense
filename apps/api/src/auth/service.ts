// apps/api/src/auth/service.ts
// Authentication and RBAC user service backed by PostgreSQL (Prisma) with in-memory fallback

import crypto from "crypto";
import { prisma } from "../db.js";
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

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
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
export const DEMO_USERS: StoredUser[] = [
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

// In-memory cache & fallback store
const usersStore: Map<string, StoredUser> = new Map();

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

export async function getUserByIdAsync(id: string): Promise<StoredUser | null> {
  try {
    const dbUser = await prisma.user.findUnique({ where: { id } });
    if (dbUser) {
      const mapped: StoredUser = {
        id: dbUser.id,
        email: dbUser.email,
        passwordHash: dbUser.passwordHash,
        name: dbUser.name,
        role: dbUser.role as UserRole,
        facilityName: dbUser.facilityName,
        facilityType: dbUser.facilityType,
        createdAt: dbUser.createdAt.toISOString(),
      };
      usersStore.set(mapped.email.toLowerCase(), mapped);
      return mapped;
    }
  } catch {
    // Fallback to in-memory cache if DB unreachable
  }
  return getUserById(id);
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

export async function registerUserAsync(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
  const normalizedEmail = input.email.toLowerCase().trim();

  // Check in-memory demo store first for immediate conflict detection
  try {
    const existingDb = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingDb || usersStore.has(normalizedEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    const role: UserRole = input.role || "STOREKEEPER";
    const passwordHash = hashPassword(input.password);
    const facilityName = input.facilityName?.trim() || "StockSense Facility";
    const facilityType = input.facilityType?.trim() || "Community Pharmacy";

    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: input.name.trim(),
        role,
        facilityName,
        facilityType,
        lastLoginAt: new Date(),
      },
    });

    const stored: StoredUser = {
      id: created.id,
      email: created.email,
      passwordHash: created.passwordHash,
      name: created.name,
      role: created.role as UserRole,
      facilityName: created.facilityName,
      facilityType: created.facilityType,
      createdAt: created.createdAt.toISOString(),
    };
    usersStore.set(normalizedEmail, stored);

    const token = createAuthToken({
      id: stored.id,
      email: stored.email,
      role: stored.role,
      name: stored.name,
    });

    // Persist session & audit log in PostgreSQL
    await prisma.userSession
      .create({
        data: {
          userId: created.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
      })
      .catch(() => {});

    await prisma.auditLog
      .create({
        data: {
          kind: "auth",
          userId: created.id,
          decisionPath: "RULES",
          detailJson: {
            action: "user_registered",
            email: created.email,
            role: created.role,
            facilityName: created.facilityName,
          },
        },
      })
      .catch(() => {});

    const { passwordHash: _pw, ...safeUser } = stored;
    return { user: safeUser, token };
  } catch (err: any) {
    if (err?.message === "An account with this email address already exists.") {
      throw err;
    }
    // Fallback to in-memory if DB is unavailable
    return registerUser(input);
  }
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

export async function loginUserAsync(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    let dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // If logging in with one of the demo accounts and DB hasn't seeded it yet, upsert it automatically
    if (!dbUser) {
      const demoMatch = DEMO_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (demoMatch) {
        dbUser = await prisma.user.upsert({
          where: { email: normalizedEmail },
          update: {},
          create: {
            id: demoMatch.id,
            email: demoMatch.email,
            passwordHash: demoMatch.passwordHash,
            name: demoMatch.name,
            role: demoMatch.role,
            facilityName: demoMatch.facilityName || "CityCare Community Pharmacy",
            facilityType: demoMatch.facilityType || "Community Pharmacy",
          },
        });
      }
    }

    if (dbUser) {
      const isValid = verifyPassword(password, dbUser.passwordHash);
      if (!isValid) {
        throw new Error("Invalid email or password.");
      }

      await prisma.user
        .update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        })
        .catch(() => {});

      const stored: StoredUser = {
        id: dbUser.id,
        email: dbUser.email,
        passwordHash: dbUser.passwordHash,
        name: dbUser.name,
        role: dbUser.role as UserRole,
        facilityName: dbUser.facilityName,
        facilityType: dbUser.facilityType,
        createdAt: dbUser.createdAt.toISOString(),
      };
      usersStore.set(normalizedEmail, stored);

      const token = createAuthToken({
        id: stored.id,
        email: stored.email,
        role: stored.role,
        name: stored.name,
      });

      await prisma.userSession
        .create({
          data: {
            userId: dbUser.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          },
        })
        .catch(() => {});

      await prisma.auditLog
        .create({
          data: {
            kind: "auth",
            userId: dbUser.id,
            decisionPath: "RULES",
            detailJson: {
              action: "user_login",
              email: dbUser.email,
              role: dbUser.role,
            },
          },
        })
        .catch(() => {});

      const { passwordHash: _pw, ...safeUser } = stored;
      return { user: safeUser, token };
    }
  } catch (err: any) {
    if (err?.message === "Invalid email or password.") {
      throw err;
    }
    // Fallback to in-memory if DB is offline
  }

  return loginUser(email, password);
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
