/**
 * Security Rules Specification Verification Suite (Dirty Dozen Payloads)
 * Maps each adversarial payload from security_spec.md to its expected PERMISSION_DENIED assertion.
 * Run against Firebase Rules Unit Testing emulator when executing full CI security checks.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  actor: {
    uid: string;
    email: string;
    emailVerified: boolean;
  };
  operation: "get" | "list" | "create" | "update" | "delete";
  path: string;
  payload?: Record<string, unknown>;
  expected: "PERMISSION_DENIED";
}

export const DIRTY_DOZEN_CASES: readonly AdversarialTestCase[] = [
  {
    id: 1,
    name: "Admin email spoof with unverified email",
    actor: { uid: "spoof-uid", email: "rolan.bacalla@gmail.com", emailVerified: false },
    operation: "update",
    path: "/settings/portfolio",
    payload: { exportLockEnabled: false },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 2,
    name: "Shadow field injection on user profile",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/users/user-1",
    payload: {
      uid: "user-1",
      email: "visitor@example.com",
      displayName: "Visitor",
      provider: "google.com",
      emailVerified: true,
      isAdmin: true,
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 3,
    name: "Self-approved export escalation",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/exportApprovals/user-1",
    payload: {
      uid: "user-1",
      email: "visitor@example.com",
      displayName: "Visitor",
      approvedBy: "user-1",
      note: "Self granted",
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 4,
    name: "Self-approved access request on create",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/accessRequests/user-1",
    payload: {
      uid: "user-1",
      email: "visitor@example.com",
      displayName: "Visitor",
      organisation: "Acme",
      reason: "Reviewing design system",
      provider: "google.com",
      status: "approved",
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 5,
    name: "Terminal state tampering on rejected request",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "update",
    path: "/accessRequests/user-1",
    payload: { status: "pending" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 6,
    name: "Cross-user PII profile read",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "get",
    path: "/users/user-2",
    expected: "PERMISSION_DENIED",
  },
  {
    id: 7,
    name: "Non-admin PII collection listing",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "list",
    path: "/users",
    expected: "PERMISSION_DENIED",
  },
  {
    id: 8,
    name: "Identity spoofing on access request",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/accessRequests/user-2",
    payload: {
      uid: "user-2",
      email: "other@example.com",
      displayName: "Other",
      organisation: "Other Co",
      reason: "Spoofed request",
      provider: "google.com",
      status: "pending",
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 9,
    name: "Oversized reason string resource exhaustion",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/accessRequests/user-1",
    payload: {
      uid: "user-1",
      email: "visitor@example.com",
      displayName: "Visitor",
      organisation: "Acme",
      reason: "A".repeat(5000),
      provider: "google.com",
      status: "pending",
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 10,
    name: "Invalid document ID path poisoning",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/auditLogs/" + "x".repeat(200),
    payload: {
      actorUid: "user-1",
      actorEmail: "visitor@example.com",
      action: "blocked_export_attempt",
      target: "tailwind",
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 11,
    name: "Audit log privileged action forgery",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/auditLogs/log-forged-1",
    payload: {
      actorUid: "user-1",
      actorEmail: "visitor@example.com",
      action: "access_approved",
      target: "user-1",
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 12,
    name: "Backdated client timestamp on create",
    actor: { uid: "user-1", email: "visitor@example.com", emailVerified: true },
    operation: "create",
    path: "/accessRequests/user-1",
    payload: {
      uid: "user-1",
      email: "visitor@example.com",
      displayName: "Visitor",
      organisation: "Acme",
      reason: "Valid length reason",
      provider: "google.com",
      status: "pending",
      createdAt: "2020-01-01T00:00:00Z",
    },
    expected: "PERMISSION_DENIED",
  },
];
