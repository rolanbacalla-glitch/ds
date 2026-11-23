import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  type Timestamp,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Connect specifically to the provisioned named Firestore database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_EMAIL = "rolan.bacalla@gmail.com";

export function isBootstrappedAdminEmail(email?: string | null): boolean {
  return typeof email === "string" && email.trim().toLowerCase() === ADMIN_EMAIL;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;

export async function testFirestoreConnection(): Promise<void> {
  if (typeof window === "undefined" || connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// ============================================================================
// Strongly-Typed Entities (Synchronised with firebase-blueprint.json)
// ============================================================================
export type AuthProviderId = "google.com" | "apple.com" | "password";

export type AuditAction =
  | "export_download"
  | "export_copy"
  | "blocked_export_attempt"
  | "access_requested"
  | "access_approved"
  | "access_revoked"
  | "settings_updated";

export interface PortfolioSettings {
  exportLockEnabled: boolean;
  copyLockEnabled: boolean;
  allowAccessRequests: boolean;
  ownerDisplayName: string;
  lockMessage: string;
  defaultPresetName: string;
  updatedAt?: Timestamp | null;
  updatedBy?: string;
}

export const DEFAULT_PORTFOLIO_SETTINGS: PortfolioSettings = {
  exportLockEnabled: true,
  copyLockEnabled: true,
  allowAccessRequests: true,
  ownerDisplayName: "Rolan Bacalla",
  lockMessage:
    "This design system workbench is published as a live interactive portfolio showcase. You are welcome to explore every component, token scale, and theme live, whilst file exports and source code downloads remain restricted.",
  defaultPresetName: "Monochrome Swiss",
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  provider: AuthProviderId;
  emailVerified: boolean;
  createdAt?: Timestamp | null;
  lastLoginAt?: Timestamp | null;
}

export interface ExportApproval {
  uid: string;
  email: string;
  displayName: string;
  approvedBy: string;
  note: string;
  grantedAt?: Timestamp | null;
}

export interface AccessRequest {
  uid: string;
  email: string;
  displayName: string;
  organisation: string;
  reason: string;
  provider: AuthProviderId;
  status: "pending" | "approved" | "rejected";
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: AuditAction;
  target: string;
  createdAt?: Timestamp | null;
}

// Defensive sanitisation helpers aligned with firebase-blueprint.json boundaries
export function clampString(value: string, maxLength: number, fallback = ""): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback.slice(0, maxLength);
  return trimmed.slice(0, maxLength);
}

export function normaliseProviderId(providerId?: string | null): AuthProviderId {
  if (providerId === "google.com") return "google.com";
  if (providerId === "apple.com") return "apple.com";
  return "password";
}

export function createSafeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 120);
}
