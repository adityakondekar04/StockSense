// apps/api/src/auth/middleware.ts
// Express middleware for authentication and Role-Based Access Control (RBAC)

import { Request, Response, NextFunction } from "express";
import { verifyAuthToken, getUserByIdAsync } from "./service.js";
import { AuthUser, UserRole } from "./types.js";

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Authentication token required. Please sign in.",
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({
      error: "INVALID_TOKEN",
      message: "Session expired or invalid token. Please sign in again.",
    });
    return;
  }

  const fullUser = await getUserByIdAsync(payload.id);
  if (!fullUser) {
    res.status(401).json({
      error: "USER_NOT_FOUND",
      message: "Authenticated account no longer exists.",
    });
    return;
  }

  const { passwordHash, ...safeUser } = fullUser;
  req.user = safeUser;
  next();
}

// RBAC middleware to gate endpoints based on required roles
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Authentication required before role verification.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "FORBIDDEN",
        message: `Access denied. Action requires one of: [${allowedRoles.join(
          ", "
        )}]. Current role: ${req.user.role}.`,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      });
      return;
    }

    next();
  };
}
