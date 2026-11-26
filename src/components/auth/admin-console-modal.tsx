"use client";

import React, { useState, useEffect, useId } from "react";
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Inbox,
  Activity,
  Check,
  Ban,
  Trash2,
  Download,
  Save,
  UserCheck,
  UserX,
  Sliders,
  ExternalLink,
  LogOut,
} from "lucide-react";
import firebaseConfig from "../../../firebase-applet-config.json";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import {
  db,
  handleFirestoreError,
  OperationType,
  type AccessRequest,
  type ExportApproval,
  type UserProfile,
  type AuditLogEntry,
} from "@/lib/firebase";
import { useAuth } from "@/components/auth/auth-provider";
import {
  SEED_PRESETS,
  generateTailwindV4Export,
  generateW3CTokensJSON,
  generateDesignMdExport,
} from "@/lib/tokens";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";
import { SlidingTabList } from "@/components/ui/sliding-tab-list";

type AdminTab = "protection" | "requests" | "users" | "audit";

export const AdminConsoleModal: React.FC = () => {
  const {
    user,
    isAdmin,
    adminConsoleOpen,
    closeAdminConsole,
    signOutUser,
    portfolioSettings,
    updatePortfolioSettings,
    approveAccessRequest,
    rejectAccessRequest,
    deleteAccessRequest,
    grantDirectExportApproval,
    revokeExportApproval,
    logAuditEvent,
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("protection");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [approvals, setApprovals] = useState<ExportApproval[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Local draft overrides on top of live Firestore portfolioSettings
  const [draft, setDraft] = useState<{
    exportLockEnabled?: boolean;
    copyLockEnabled?: boolean;
    allowAccessRequests?: boolean;
    ownerDisplayName?: string;
    lockMessage?: string;
    defaultPresetName?: string;
  }>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const exportLockEnabled = draft.exportLockEnabled ?? portfolioSettings.exportLockEnabled;
  const copyLockEnabled = draft.copyLockEnabled ?? portfolioSettings.copyLockEnabled;
  const allowAccessRequests = draft.allowAccessRequests ?? portfolioSettings.allowAccessRequests;
  const ownerDisplayName = draft.ownerDisplayName ?? portfolioSettings.ownerDisplayName;
  const lockMessage = draft.lockMessage ?? portfolioSettings.lockMessage;
  const defaultPresetName = draft.defaultPresetName ?? portfolioSettings.defaultPresetName;

  const titleId = useId();

  // Real-time Admin Firestore Subscriptions (strictly guarded by isAdmin & open state)
  useEffect(() => {
    if (!isAdmin || !adminConsoleOpen) return;

    const reqQuery = query(collection(db, "accessRequests"), orderBy("createdAt", "desc"));
    const unsubReqs = onSnapshot(
      reqQuery,
      (snap) => {
        setRequests(snap.docs.map((d) => d.data() as AccessRequest));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "accessRequests")
    );

    const appQuery = query(collection(db, "exportApprovals"), orderBy("grantedAt", "desc"));
    const unsubApps = onSnapshot(
      appQuery,
      (snap) => {
        setApprovals(snap.docs.map((d) => d.data() as ExportApproval));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "exportApprovals")
    );

    const userQuery = query(collection(db, "users"), orderBy("lastLoginAt", "desc"));
    const unsubUsers = onSnapshot(
      userQuery,
      (snap) => {
        setUsersList(snap.docs.map((d) => d.data() as UserProfile));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "users")
    );

    const logQuery = query(
      collection(db, "auditLogs"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsubLogs = onSnapshot(
      logQuery,
      (snap) => {
        setAuditLogs(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<AuditLogEntry, "id">),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "auditLogs")
    );

    return () => {
      unsubReqs();
      unsubApps();
      unsubUsers();
      unsubLogs();
    };
  }, [isAdmin, adminConsoleOpen]);

  useEffect(() => {
    if (!adminConsoleOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAdminConsole();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adminConsoleOpen, closeAdminConsole]);

  if (!isAdmin || !adminConsoleOpen) return null;

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedUidSet = new Set(approvals.map((a) => a.uid));

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updatePortfolioSettings({
        exportLockEnabled,
        copyLockEnabled,
        allowAccessRequests,
        ownerDisplayName,
        lockMessage,
        defaultPresetName,
      });
      setDraft({});
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDownloadMasterBundle = async () => {
    const preset =
      SEED_PRESETS.find((p) => p.name === defaultPresetName) ?? SEED_PRESETS[0];
    const bundle = {
      exportedAt: new Date().toISOString(),
      exportedBy: user?.email,
      preset,
      files: {
        "src/styles/tokens.generated.css": generateTailwindV4Export(preset),
        "figma-variables.tokens.json": JSON.parse(generateW3CTokensJSON(preset)),
        "DESIGN.md": generateDesignMdExport(preset),
      },
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "antigravity-master-portfolio-bundle.json";
    a.click();
    URL.revokeObjectURL(url);
    await logAuditEvent("export_download", "Admin Master Portfolio Bundle (.json)");
    showToast("Downloaded complete Admin Master Bundle (.json)");
  };

  const formatTimestamp = (ts?: { toDate?: () => Date } | null) => {
    if (!ts || typeof ts.toDate !== "function") return "Just now";
    return ts.toDate().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      onClick={closeAdminConsole}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: "blur(40px) saturate(190%)",
          WebkitBackdropFilter: "blur(40px) saturate(190%)",
        }}
        className="liquid-glass-regular w-full max-w-4xl max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl border border-[var(--sys-outline)] flex flex-col"
      >
        {/* Top Bar */}
        <div className="px-6 py-5 border-b border-[var(--sys-outline-variant)] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--sys-primary)] text-[var(--sys-on-primary)] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--sys-primary)] font-semibold">
                <span>Portfolio Administrator Console</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{user?.email}</span>
              </div>
              <h2
                id={titleId}
                className="text-lg font-bold tracking-tight text-[var(--sys-on-surface)]"
              >
                Export Protection, Approvals &amp; Governance
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                void signOutUser();
              }}
              className="min-h-[36px] px-3 rounded-xl inline-flex items-center gap-1.5 bg-[var(--sys-surface-high)]/70 hover:bg-[var(--sys-surface-highest)] text-xs font-medium text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] border border-[var(--sys-outline-variant)] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
            <button
              type="button"
              onClick={closeAdminConsole}
              aria-label="Close admin console"
              className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center bg-[var(--sys-surface-high)]/70 hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-3 bg-[var(--sys-surface-container)]/70 border-b border-[var(--sys-outline-variant)] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <SlidingTabList
            activeKey={activeTab}
            ariaLabel="Admin Console Sections"
            className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--sys-surface-lowest)]/80 border border-[var(--sys-outline-variant)]"
            indicatorClassName="rounded-lg bg-[var(--sys-primary)] shadow-xs"
          >
            {(
              [
                { id: "protection", label: "Protection Rules", icon: Sliders },
                {
                  id: "requests",
                  label: pendingCount > 0 ? `Access Requests (${pendingCount})` : "Access Requests",
                  icon: Inbox,
                },
                { id: "users", label: `Users & Allowlist (${approvals.length})`, icon: Users },
                { id: "audit", label: "Activity Log", icon: Activity },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative z-10 min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition-colors duration-200 whitespace-nowrap",
                    active
                      ? "text-[var(--sys-on-primary)] font-semibold"
                      : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </SlidingTabList>

          <button
            type="button"
            onClick={handleDownloadMasterBundle}
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[var(--sys-primary)]" />
            <span>Master Bundle (.json)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROTECTION SETTINGS */}
          {activeTab === "protection" && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sys-on-surface)]">
                      {exportLockEnabled ? (
                        <Lock className="w-3.5 h-3.5 text-[var(--sys-primary)]" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>Export &amp; Download Lock</span>
                    </div>
                    <p className="text-[11px] text-[var(--sys-on-surface-secondary)] leading-relaxed">
                      Blocks token file downloads and compiled code exports for everyone except you
                      and approved visitors.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={exportLockEnabled}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, exportLockEnabled: !exportLockEnabled }))
                    }
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer",
                      exportLockEnabled ? "bg-[var(--sys-primary)]" : "bg-[var(--sys-surface-highest)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white shadow transition-transform",
                        exportLockEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sys-on-surface)]">
                      {copyLockEnabled ? (
                        <Lock className="w-3.5 h-3.5 text-[var(--sys-primary)]" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>Snippet &amp; Source Copy Lock</span>
                    </div>
                    <p className="text-[11px] text-[var(--sys-on-surface-secondary)] leading-relaxed">
                      Locks React TSX source tabs, icon code copying, and token value copying for
                      unapproved viewers.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={copyLockEnabled}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, copyLockEnabled: !copyLockEnabled }))
                    }
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer",
                      copyLockEnabled ? "bg-[var(--sys-primary)]" : "bg-[var(--sys-surface-highest)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white shadow transition-transform",
                        copyLockEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sys-on-surface)]">
                      <Inbox className="w-3.5 h-3.5 text-[var(--sys-primary)]" />
                      <span>Allow Access Requests</span>
                    </div>
                    <p className="text-[11px] text-[var(--sys-on-surface-secondary)] leading-relaxed">
                      Lets signed-in recruiters or clients submit a request for export permission
                      directly to your queue.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={allowAccessRequests}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, allowAccessRequests: !allowAccessRequests }))
                    }
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer",
                      allowAccessRequests ? "bg-[var(--sys-primary)]" : "bg-[var(--sys-surface-highest)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white shadow transition-transform",
                        allowAccessRequests ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--sys-on-surface-secondary)]">
                    Portfolio Owner Attribution
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={ownerDisplayName}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, ownerDisplayName: e.target.value }))
                    }
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] text-sm text-[var(--sys-on-surface)] outline-none focus:border-[var(--sys-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--sys-on-surface-secondary)]">
                    Published Default Theme Preset
                  </label>
                  <select
                    value={defaultPresetName}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, defaultPresetName: e.target.value }))
                    }
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] text-sm text-[var(--sys-on-surface)] outline-none focus:border-[var(--sys-primary)]"
                  >
                    {SEED_PRESETS.map((preset) => (
                      <option key={preset.name} value={preset.name}>
                        {preset.name} ({preset.hue}°)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--sys-on-surface-secondary)]">
                  Portfolio Lock Gate Message (Displayed on Locked Export Panels)
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={300}
                  value={lockMessage}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, lockMessage: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] text-sm text-[var(--sys-on-surface)] outline-none focus:border-[var(--sys-primary)] resize-none"
                />
                <div className="text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] text-right tabular-nums">
                  {lockMessage.length}/300
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--sys-outline-variant)]">
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-primary)] inline-flex items-center gap-1.5"
                >
                  <span>Manage Google, Apple &amp; Email Sign-In Providers in Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? "Saving..." : "Save Protection Settings"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ACCESS REQUESTS QUEUE */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="p-10 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-center space-y-1.5">
                  <div className="text-sm font-semibold text-[var(--sys-on-surface)]">
                    No export access requests yet
                  </div>
                  <p className="text-xs text-[var(--sys-on-surface-secondary)]">
                    When verified visitors request download permission from the Export section,
                    their submissions will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.uid}
                      className="p-4 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[var(--sys-on-surface)]">
                            {req.displayName}
                          </span>
                          <span className="font-mono text-[var(--sys-on-surface-secondary)]">
                            {req.email}
                          </span>
                          <span aria-hidden="true" className="text-[var(--sys-on-surface-quaternary)]">
                            ·
                          </span>
                          <span className="text-[var(--sys-primary)] font-medium">
                            {req.organisation}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                          {req.reason}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--sys-on-surface-tertiary)] tabular-nums">
                          <span>Provider: {req.provider}</span>
                          <span>·</span>
                          <span>Submitted: {formatTimestamp(req.createdAt)}</span>
                          <span>·</span>
                          <span
                            className={cn(
                              "font-semibold capitalize",
                              req.status === "approved"
                                ? "text-emerald-500"
                                : req.status === "rejected"
                                ? "text-[var(--text-feedback-error)]"
                                : "text-amber-500"
                            )}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => void approveAccessRequest(req)}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {req.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => void rejectAccessRequest(req)}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[var(--sys-surface-high)] hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void deleteAccessRequest(req.uid)}
                          aria-label={`Remove request from ${req.email}`}
                          className="min-w-[36px] min-h-[36px] rounded-lg bg-[var(--bg-feedback-error-subtle)] text-[var(--text-feedback-error)] border border-[var(--border-feedback-error)]/40 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGISTERED USERS & EXPORT ALLOWLIST */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sys-on-surface-secondary)]">
                  Signed-In Portfolio Visitors ({usersList.length})
                </h3>
                {usersList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-xs text-[var(--sys-on-surface-secondary)]">
                    No registered visitors recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-lowest)]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] text-[11px] font-semibold text-[var(--sys-on-surface-tertiary)]">
                          <th className="py-3 px-4">Visitor</th>
                          <th className="py-3 px-4">Provider</th>
                          <th className="py-3 px-4">Last Sign-In</th>
                          <th className="py-3 px-4 text-right">Export Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--sys-outline-variant)]">
                        {usersList.map((u) => {
                          const isSelf = u.uid === user?.uid;
                          const isApproved = approvedUidSet.has(u.uid);
                          return (
                            <tr key={u.uid}>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[var(--sys-on-surface)]">
                                  {u.displayName} {isSelf && "(You — Admin)"}
                                </div>
                                <div className="font-mono text-[11px] text-[var(--sys-on-surface-tertiary)]">
                                  {u.email}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-[var(--sys-on-surface-secondary)]">
                                {u.provider}
                              </td>
                              <td className="py-3 px-4 font-mono tabular-nums text-[var(--sys-on-surface-tertiary)]">
                                {formatTimestamp(u.lastLoginAt)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isSelf ? (
                                  <span className="font-mono text-[11px] font-semibold text-[var(--sys-primary)]">
                                    Full Admin Access
                                  </span>
                                ) : isApproved ? (
                                  <button
                                    type="button"
                                    onClick={() => void revokeExportApproval(u.uid, u.email)}
                                    className="min-h-[32px] px-3 py-1 rounded-lg bg-[var(--bg-feedback-error-subtle)] text-[var(--text-feedback-error)] border border-[var(--border-feedback-error)]/40 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Revoke Export</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void grantDirectExportApproval(u)}
                                    className="min-h-[32px] px-3 py-1 rounded-lg bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Grant Export</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY AUDIT LOG */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--sys-on-surface-secondary)]">
                <span>Recent export, copy, and access governance events (latest 50).</span>
                <span className="font-mono tabular-nums">{auditLogs.length} entries</span>
              </div>

              {auditLogs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-center text-xs text-[var(--sys-on-surface-secondary)]">
                  No activity recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-lowest)]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] text-[11px] font-semibold text-[var(--sys-on-surface-tertiary)]">
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Event</th>
                        <th className="py-3 px-4">Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--sys-outline-variant)] font-mono text-[11px] tabular-nums">
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="py-2.5 px-4 text-[var(--sys-on-surface-tertiary)] whitespace-nowrap">
                            {formatTimestamp(log.createdAt)}
                          </td>
                          <td className="py-2.5 px-4 text-[var(--sys-on-surface)]">
                            {log.actorEmail}
                          </td>
                          <td className="py-2.5 px-4 text-[var(--sys-primary)] font-semibold">
                            {log.action}
                          </td>
                          <td className="py-2.5 px-4 text-[var(--sys-on-surface-secondary)]">
                            {log.target}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
