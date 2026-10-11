// apps/api/src/auth/types.ts
// Role-Based Access Control (RBAC) types and permission matrix for StockSense

export type UserRole = "ADMIN" | "STOREKEEPER" | "ANALYST" | "VIEWER";

export interface RolePermissions {
  canConfirmOrders: boolean;
  canEditParameters: boolean;
  canImportData: boolean;
  canOverrideAnomalies: boolean;
  canRunScenarios: boolean;
  canManageUsers: boolean;
  canExportReports: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canConfirmOrders: true,
    canEditParameters: true,
    canImportData: true,
    canOverrideAnomalies: true,
    canRunScenarios: true,
    canManageUsers: true,
    canExportReports: true,
  },
  STOREKEEPER: {
    canConfirmOrders: true,
    canEditParameters: true,
    canImportData: true,
    canOverrideAnomalies: true,
    canRunScenarios: true,
    canManageUsers: false,
    canExportReports: true,
  },
  ANALYST: {
    canConfirmOrders: false,
    canEditParameters: false,
    canImportData: true,
    canOverrideAnomalies: false,
    canRunScenarios: true,
    canManageUsers: false,
    canExportReports: true,
  },
  VIEWER: {
    canConfirmOrders: false,
    canEditParameters: false,
    canImportData: false,
    canOverrideAnomalies: false,
    canRunScenarios: false,
    canManageUsers: false,
    canExportReports: true,
  },
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facilityName?: string;
  facilityType?: string;
  createdAt: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}
