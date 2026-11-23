# Security Specification — Antigravity Design System Portfolio Protection

## 1. Data Invariants
1. **Default Deny**: All unmatched paths are strictly denied for both read and write.
2. **Verified Admin Bootstrap**: Admin privileges belong exclusively to verified `rolan.bacalla@gmail.com` (`request.auth.token.email.lower() == 'rolan.bacalla@gmail.com' && request.auth.token.email_verified == true`) or UIDs present in `/admins/{uid}` with verified email.
3. **Zero Self-Escalation**: Standard users can never write to `/admins/{uid}`, `/exportApprovals/{uid}`, or `/settings/{settingId}`, nor inject `role`/`isAdmin` shadow keys into `/users/{uid}`.
4. **Strict PII Isolation**: `/users/{uid}`, `/accessRequests/{uid}`, and `/exportApprovals/{uid}` contain emails and names. Non-admins may only `get` their own document (`request.auth.uid == uid`); collection-wide `list` is restricted to `isAdmin()`.
5. **Terminal State Locking**: Once an `/accessRequests/{uid}` document transitions from `pending` to `approved` or `rejected`, standard users cannot modify it. Only `isAdmin()` may transition status or modify terminal records.
6. **Temporal Integrity & Immutability**: All `createdAt`, `updatedAt`, `grantedAt`, and `lastLoginAt` fields must match `request.time` on write; `createdAt` and `uid` are strictly immutable on update.
7. **Audit Log Integrity**: `/auditLogs/{logId}` is append-only; standard verified users may only log non-admin actions attributed to their own `request.auth.uid`, and can never read, update, or delete audit logs.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Admin Email Spoof (Unverified)**: User sets email `rolan.bacalla@gmail.com` with `email_verified: false` and attempts to write `/settings/portfolio`. Expected: `PERMISSION_DENIED`.
2. **Shadow Field Injection on Profile**: Verified user writes `/users/{uid}` with extra field `isAdmin: true`. Expected: `PERMISSION_DENIED`.
3. **Self-Approved Export Escalation**: Verified non-admin attempts to create `/exportApprovals/{uid}` for themselves. Expected: `PERMISSION_DENIED`.
4. **Self-Approved Access Request**: Verified non-admin creates `/accessRequests/{uid}` with `status: "approved"`. Expected: `PERMISSION_DENIED`.
5. **Terminal State Tampering**: Verified non-admin tries to update their `rejected` `/accessRequests/{uid}` back to `pending`. Expected: `PERMISSION_DENIED`.
6. **PII Cross-User Read**: Verified user `userA` attempts `get` on `/users/userB`. Expected: `PERMISSION_DENIED`.
7. **PII Collection Scraping**: Verified non-admin attempts `list` on `/users` or `/accessRequests`. Expected: `PERMISSION_DENIED`.
8. **Identity Spoofing on Request**: Verified user `userA` attempts to create `/accessRequests/userB` or set `uid: "userB"`. Expected: `PERMISSION_DENIED`.
9. **Resource Exhaustion (1MB String)**: Verified user submits `/accessRequests/{uid}` with a 5,000-character `reason` string. Expected: `PERMISSION_DENIED`.
10. **Path ID Poisoning**: Verified user attempts to write `/auditLogs/../../etc/passwd` or a 200-character document ID. Expected: `PERMISSION_DENIED`.
11. **Audit Log Forgery**: Verified non-admin attempts to create `/auditLogs/log1` with `action: "access_approved"` or `actorUid: "adminUid"`. Expected: `PERMISSION_DENIED`.
12. **Client Timestamp Tampering**: Verified user submits `/accessRequests/{uid}` with a backdated `createdAt` instead of `request.time`. Expected: `PERMISSION_DENIED`.
