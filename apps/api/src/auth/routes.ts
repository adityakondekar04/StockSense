// apps/api/src/auth/routes.ts
// Express router for authentication and RBAC endpoints (backed by PostgreSQL User & UserSession tables)

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  registerUserAsync,
  loginUserAsync,
  getDemoAccounts,
} from "./service.js";
import { requireAuth } from "./middleware.js";
import { ROLE_PERMISSIONS } from "./types.js";

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email("A valid email address is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(["ADMIN", "STOREKEEPER", "ANALYST", "VIEWER"]).optional(),
  facilityName: z.string().optional(),
  facilityType: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email("A valid email address is required."),
  password: z.string().min(1, "Password is required."),
});

// POST /api/auth/register or /api/auth/signup
authRouter.post(["/register", "/signup"], async (req, res) => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parseResult.error.errors[0]?.message || "Invalid registration inputs.",
        details: parseResult.error.errors,
      });
      return;
    }

    const { user, token } = await registerUserAsync(parseResult.data);
    res.status(201).json({
      ok: true,
      user,
      token,
      permissions: ROLE_PERMISSIONS[user.role],
    });
  } catch (error: any) {
    res.status(400).json({
      error: "REGISTRATION_FAILED",
      message: error.message || "Failed to create account.",
    });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parseResult.error.errors[0]?.message || "Invalid login credentials.",
      });
      return;
    }

    const { email, password } = parseResult.data;
    const { user, token } = await loginUserAsync(email, password);

    res.json({
      ok: true,
      user,
      token,
      permissions: ROLE_PERMISSIONS[user.role],
    });
  } catch (error: any) {
    res.status(401).json({
      error: "INVALID_CREDENTIALS",
      message: error.message || "Invalid email or password.",
    });
  }
});

// GET /api/auth/me (requires valid Bearer token)
authRouter.get("/me", requireAuth, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Not signed in." });
    return;
  }

  res.json({
    ok: true,
    user: req.user,
    permissions: ROLE_PERMISSIONS[req.user.role],
  });
});

// GET /api/auth/users (returns users stored in PostgreSQL)
authRouter.get("/users", async (_req, res) => {
  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        facilityName: true,
        facilityType: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    res.json({
      ok: true,
      users: dbUsers,
    });
  } catch {
    res.json({
      ok: true,
      users: getDemoAccounts(),
    });
  }
});

// GET /api/auth/roles (public directory of available roles, matrix & demo users)
authRouter.get("/roles", (_req, res) => {
  res.json({
    ok: true,
    roles: ["ADMIN", "STOREKEEPER", "ANALYST", "VIEWER"],
    permissionsMatrix: ROLE_PERMISSIONS,
    demoAccounts: getDemoAccounts(),
  });
});
