"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  auth,
  db,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
  isBootstrappedAdminEmail,
  DEFAULT_PORTFOLIO_SETTINGS,
  clampString,
  normaliseProviderId,
  createSafeDocId,
  type PortfolioSettings,
  type AccessRequest,
  type ExportApproval,
  type UserProfile,
  type AuditAction,
} from "@/lib/firebase";
import { useToast } from "@/components/ui/toast-provider";

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  isApprovedForExport: boolean;
  canExport: boolean;
  canCopySnippets: boolean;
  portfolioSettings: PortfolioSettings;
  myAccessRequest: AccessRequest | null;
  authModalOpen: boolean;
  authModalReason: string | null;
  adminConsoleOpen: boolean;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  openAdminConsole: () => void;
  closeAdminConsole: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (displayName: string, email: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserStatus: () => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  submitAccessRequest: (organisation: string, reason: string) => Promise<void>;
  logAuditEvent: (action: AuditAction, target: string) => Promise<void>;
  updatePortfolioSettings: (next: Omit<PortfolioSettings, "updatedAt" | "updatedBy">) => Promise<void>;
  approveAccessRequest: (req: AccessRequest, note?: string) => Promise<void>;
  rejectAccessRequest: (req: AccessRequest) => Promise<void>;
  deleteAccessRequest: (uid: string) => Promise<void>;
  grantDirectExportApproval: (profile: UserProfile, note?: string) => Promise<void>;
  revokeExportApproval: (uid: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hasAdminDoc, setHasAdminDoc] = useState(false);
  const [exportApproval, setExportApproval] = useState<ExportApproval | null>(null);
  const [myAccessRequest, setMyAccessRequest] = useState<AccessRequest | null>(null);
  const [portfolioSettings, setPortfolioSettings] = useState<PortfolioSettings>(
    DEFAULT_PORTFOLIO_SETTINGS
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [adminConsoleOpen, setAdminConsoleOpen] = useState(false);

  // Boot connection validation
  useEffect(() => {
    void testFirestoreConnection();
  }, []);

  // Listen to public non-PII portfolio lock settings
  useEffect(() => {
    const settingsRef = doc(db, "settings", "portfolio");
    const unsubscribe = onSnapshot(
      settingsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<PortfolioSettings>;
          setPortfolioSettings({
            exportLockEnabled:
              typeof data.exportLockEnabled === "boolean"
                ? data.exportLockEnabled
                : DEFAULT_PORTFOLIO_SETTINGS.exportLockEnabled,
            copyLockEnabled:
              typeof data.copyLockEnabled === "boolean"
                ? data.copyLockEnabled
                : DEFAULT_PORTFOLIO_SETTINGS.copyLockEnabled,
            allowAccessRequests:
              typeof data.allowAccessRequests === "boolean"
                ? data.allowAccessRequests
                : DEFAULT_PORTFOLIO_SETTINGS.allowAccessRequests,
            ownerDisplayName:
              typeof data.ownerDisplayName === "string" && data.ownerDisplayName.trim()
                ? data.ownerDisplayName
                : DEFAULT_PORTFOLIO_SETTINGS.ownerDisplayName,
            lockMessage:
              typeof data.lockMessage === "string" && data.lockMessage.trim()
                ? data.lockMessage
                : DEFAULT_PORTFOLIO_SETTINGS.lockMessage,
            defaultPresetName:
              typeof data.defaultPresetName === "string" && data.defaultPresetName.trim()
                ? data.defaultPresetName
                : DEFAULT_PORTFOLIO_SETTINGS.defaultPresetName,
            updatedAt: data.updatedAt ?? null,
            updatedBy: data.updatedBy,
          });
        } else {
          setPortfolioSettings(DEFAULT_PORTFOLIO_SETTINGS);
        }
      },
      (error) => {
        console.warn("Portfolio settings listener fallback:", error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  const syncInFlightRef = useRef<Map<string, Promise<void>>>(new Map());

  // Sync user profile record in Firestore when a verified user signs in (deduplicated per UID)
  const syncUserProfile = useCallback(async (firebaseUser: User) => {
    if (!firebaseUser.emailVerified || !firebaseUser.email) return;

    const existingPromise = syncInFlightRef.current.get(firebaseUser.uid);
    if (existingPromise) {
      return existingPromise;
    }

    const runSync = (async () => {
      const userPath = `users/${firebaseUser.uid}`;
      const userRef = doc(db, "users", firebaseUser.uid);
      const primaryProvider = normaliseProviderId(firebaseUser.providerData[0]?.providerId);
      const displayName = clampString(
        firebaseUser.displayName || firebaseUser.email!.split("@")[0] || "Portfolio Visitor",
        100,
        "Portfolio Visitor"
      );
      const email = clampString(firebaseUser.email!, 160);

      try {
        const existingSnap = await getDoc(userRef);
        if (existingSnap.exists()) {
          await updateDoc(userRef, {
            displayName,
            email,
            provider: primaryProvider,
            emailVerified: firebaseUser.emailVerified,
            lastLoginAt: serverTimestamp(),
          });
        } else {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email,
            displayName,
            provider: primaryProvider,
            emailVerified: firebaseUser.emailVerified,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Firestore profile sync warning:", userPath, error);
      } finally {
        syncInFlightRef.current.delete(firebaseUser.uid);
      }
    })();

    syncInFlightRef.current.set(firebaseUser.uid, runSync);
    return runSync;
  }, []);

  // Firebase Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser && nextUser.emailVerified) {
        void syncUserProfile(nextUser).catch((err) => {
          console.error("Failed syncing user profile:", err);
        });
      }
      if (!nextUser) {
        setHasAdminDoc(false);
        setExportApproval(null);
        setMyAccessRequest(null);
        setAdminConsoleOpen(false);
      }
    });
    return () => unsubscribe();
  }, [syncUserProfile]);

  // Listen to signed-in user's admin record, export approval, and access request
  const currentUid = user?.uid ?? null;
  const currentEmailVerified = user?.emailVerified ?? false;

  useEffect(() => {
    if (!authReady || !currentUid) {
      return;
    }

    const adminRef = doc(db, "admins", currentUid);
    const unsubAdmin = onSnapshot(
      adminRef,
      (snap) => setHasAdminDoc(snap.exists()),
      (error) => {
        handleFirestoreError(error, OperationType.GET, `admins/${currentUid}`);
      }
    );

    const approvalRef = doc(db, "exportApprovals", currentUid);
    const unsubApproval = onSnapshot(
      approvalRef,
      (snap) => {
        setExportApproval(snap.exists() ? (snap.data() as ExportApproval) : null);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `exportApprovals/${currentUid}`);
      }
    );

    const reqRef = doc(db, "accessRequests", currentUid);
    const unsubReq = onSnapshot(
      reqRef,
      (snap) => {
        setMyAccessRequest(snap.exists() ? (snap.data() as AccessRequest) : null);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `accessRequests/${currentUid}`);
      }
    );

    return () => {
      unsubAdmin();
      unsubApproval();
      unsubReq();
    };
  }, [authReady, currentUid]);

  const isPrimaryAdmin = useMemo(() => {
    if (!user || !currentEmailVerified) return false;
    return isBootstrappedAdminEmail(user.email);
  }, [user, currentEmailVerified]);

  const isAdmin = useMemo(() => {
    if (!user || !currentEmailVerified) return false;
    return isPrimaryAdmin || hasAdminDoc;
  }, [user, currentEmailVerified, isPrimaryAdmin, hasAdminDoc]);

  const isApprovedForExport = useMemo(() => {
    if (!user || !currentEmailVerified) return false;
    return Boolean(exportApproval);
  }, [user, currentEmailVerified, exportApproval]);

  // Temporary hard lock: downloads & exports are restricted exclusively to rolan.bacalla@gmail.com
  const canExport = isPrimaryAdmin;
  const canCopySnippets = isPrimaryAdmin;

  const openAuthModal = useCallback((reason?: string) => {
    setAuthModalReason(reason ?? null);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalReason(null);
  }, []);

  const openAdminConsole = useCallback(() => {
    if (!isAdmin) return;
    setAdminConsoleOpen(true);
  }, [isAdmin]);

  const closeAdminConsole = useCallback(() => {
    setAdminConsoleOpen(false);
  }, []);

  // Audit logger (safe for verified signed-in users)
  const logAuditEvent = useCallback(
    async (action: AuditAction, target: string) => {
      const current = auth.currentUser;
      if (!current || !current.emailVerified || !current.email) return;
      const logId = createSafeDocId("log");
      try {
        await setDoc(doc(db, "auditLogs", logId), {
          actorUid: current.uid,
          actorEmail: clampString(current.email, 160),
          action,
          target: clampString(target, 160, "workbench"),
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.warn("Audit log skipped:", error);
      }
    },
    []
  );

  // ============================================================================
  // Authentication Actions (Google, Apple, Email & Password)
  // ============================================================================
  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    if (cred.user.emailVerified) {
      void syncUserProfile(cred.user);
    }
    const adminSignIn = isBootstrappedAdminEmail(cred.user.email) && cred.user.emailVerified;
    showToast(
      adminSignIn
        ? "Signed in as Portfolio Admin (full export & console privileges active)"
        : `Signed in with Google as ${cred.user.email}`
    );
    closeAuthModal();
  }, [closeAuthModal, showToast, syncUserProfile]);

  const signInWithApple = useCallback(async () => {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    const cred = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    if (cred.user.emailVerified) {
      void syncUserProfile(cred.user);
    }
    const adminSignIn = isBootstrappedAdminEmail(cred.user.email) && cred.user.emailVerified;
    showToast(
      adminSignIn
        ? "Signed in as Portfolio Admin via Apple"
        : `Signed in with Apple as ${cred.user.email || "Apple Member"}`
    );
    closeAuthModal();
  }, [closeAuthModal, showToast, syncUserProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (cred.user.emailVerified) {
        void syncUserProfile(cred.user);
        const adminSignIn = isBootstrappedAdminEmail(cred.user.email);
        showToast(
          adminSignIn
            ? "Welcome back, Admin — full export & console access unlocked"
            : `Signed in as ${cred.user.email}`
        );
        closeAuthModal();
      } else {
        showToast("Please verify your email address before requesting export access.");
      }
    },
    [closeAuthModal, showToast, syncUserProfile]
  );

  const registerWithEmail = useCallback(
    async (displayName: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const cleanName = clampString(displayName, 100, "Portfolio Visitor");
      await updateProfile(cred.user, { displayName: cleanName });
      await sendEmailVerification(cred.user);
      showToast("Account created — please check your inbox to verify your email.");
    },
    [showToast]
  );

  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
    showToast("Verification email sent. Please check your inbox.");
  }, [showToast]);

  const refreshUserStatus = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    const refreshed = auth.currentUser;
    setUser(refreshed ? ({ ...refreshed } as User) : null);
    if (refreshed?.emailVerified) {
      await syncUserProfile(refreshed);
      showToast("Email verified successfully.");
      closeAuthModal();
    } else {
      showToast("Email not verified yet — please click the link in your inbox.");
    }
  }, [closeAuthModal, showToast, syncUserProfile]);

  const sendResetPassword = useCallback(
    async (email: string) => {
      await sendPasswordResetEmail(auth, email.trim());
      showToast("Password reset instructions sent to your email address.");
    },
    [showToast]
  );

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      setAdminConsoleOpen(false);
      setAuthModalOpen(false);
      showToast("Signed out cleanly.");
    } catch (error) {
      console.error("Sign out failed:", error);
      showToast("Could not sign out. Please try again.");
    }
  }, [showToast]);

  // ============================================================================
  // Visitor Action: Submit Export Access Request
  // ============================================================================
  const submitAccessRequest = useCallback(
    async (organisation: string, reason: string) => {
      const current = auth.currentUser;
      if (!current || !current.emailVerified || !current.email) {
        throw new Error("Please sign in with a verified email address to submit a request.");
      }
      const cleanOrg = clampString(organisation, 100);
      const cleanReason = clampString(reason, 400);
      if (cleanOrg.length < 1 || cleanReason.length < 5) {
        throw new Error("Please enter your organisation and a brief reason (at least 5 characters).");
      }

      const path = `accessRequests/${current.uid}`;
      const reqRef = doc(db, "accessRequests", current.uid);
      const displayName = clampString(
        current.displayName || current.email.split("@")[0] || "Portfolio Visitor",
        100,
        "Portfolio Visitor"
      );
      const provider = normaliseProviderId(current.providerData[0]?.providerId);

      try {
        const snap = await getDoc(reqRef);
        if (snap.exists()) {
          await updateDoc(reqRef, {
            displayName,
            organisation: cleanOrg,
            reason: cleanReason,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(reqRef, {
            uid: current.uid,
            email: clampString(current.email, 160),
            displayName,
            organisation: cleanOrg,
            reason: cleanReason,
            provider,
            status: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await logAuditEvent("access_requested", `${cleanOrg} (${current.email})`);
        showToast("Export access request submitted to Rolan for review.");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [logAuditEvent, showToast]
  );

  // ============================================================================
  // Admin-Only Mutations (Strictly Enforced by Firestore Rules)
  // ============================================================================
  const updatePortfolioSettings = useCallback(
    async (next: Omit<PortfolioSettings, "updatedAt" | "updatedBy">) => {
      const current = auth.currentUser;
      if (!current || !isAdmin) throw new Error("Admin privileges required.");
      const path = "settings/portfolio";
      try {
        await setDoc(doc(db, "settings", "portfolio"), {
          exportLockEnabled: Boolean(next.exportLockEnabled),
          copyLockEnabled: Boolean(next.copyLockEnabled),
          allowAccessRequests: Boolean(next.allowAccessRequests),
          ownerDisplayName: clampString(next.ownerDisplayName, 80, "Rolan Bacalla"),
          lockMessage: clampString(
            next.lockMessage,
            300,
            DEFAULT_PORTFOLIO_SETTINGS.lockMessage
          ),
          defaultPresetName: clampString(next.defaultPresetName, 60, "Cobalt Obsidian"),
          updatedAt: serverTimestamp(),
          updatedBy: current.uid,
        });
        await logAuditEvent(
          "settings_updated",
          `ExportLock:${next.exportLockEnabled ? "ON" : "OFF"}, CopyLock:${
            next.copyLockEnabled ? "ON" : "OFF"
          }`
        );
        showToast("Portfolio protection settings saved.");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [isAdmin, logAuditEvent, showToast]
  );

  const approveAccessRequest = useCallback(
    async (req: AccessRequest, note = "Approved by portfolio admin") => {
      const current = auth.currentUser;
      if (!current || !isAdmin) throw new Error("Admin privileges required.");
      const batch = writeBatch(db);
      const reqRef = doc(db, "accessRequests", req.uid);
      const approvalRef = doc(db, "exportApprovals", req.uid);

      batch.update(reqRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      batch.set(approvalRef, {
        uid: req.uid,
        email: clampString(req.email, 160),
        displayName: clampString(req.displayName, 100, "Approved Viewer"),
        approvedBy: current.uid,
        note: clampString(note, 240),
        grantedAt: serverTimestamp(),
      });

      try {
        await batch.commit();
        await logAuditEvent("access_approved", req.email);
        showToast(`Approved export access for ${req.email}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `exportApprovals/${req.uid}`);
      }
    },
    [isAdmin, logAuditEvent, showToast]
  );

  const rejectAccessRequest = useCallback(
    async (req: AccessRequest) => {
      if (!auth.currentUser || !isAdmin) throw new Error("Admin privileges required.");
      const path = `accessRequests/${req.uid}`;
      try {
        await updateDoc(doc(db, "accessRequests", req.uid), {
          status: "rejected",
          updatedAt: serverTimestamp(),
        });
        showToast(`Declined request from ${req.email}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [isAdmin, showToast]
  );

  const deleteAccessRequest = useCallback(
    async (uid: string) => {
      if (!auth.currentUser || !isAdmin) throw new Error("Admin privileges required.");
      const path = `accessRequests/${uid}`;
      try {
        await deleteDoc(doc(db, "accessRequests", uid));
        showToast("Access request removed.");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [isAdmin, showToast]
  );

  const grantDirectExportApproval = useCallback(
    async (profile: UserProfile, note = "Granted directly via Admin Console") => {
      const current = auth.currentUser;
      if (!current || !isAdmin) throw new Error("Admin privileges required.");
      const path = `exportApprovals/${profile.uid}`;
      try {
        await setDoc(doc(db, "exportApprovals", profile.uid), {
          uid: profile.uid,
          email: clampString(profile.email, 160),
          displayName: clampString(profile.displayName, 100, "Approved Viewer"),
          approvedBy: current.uid,
          note: clampString(note, 240),
          grantedAt: serverTimestamp(),
        });
        await logAuditEvent("access_approved", profile.email);
        showToast(`Granted export access to ${profile.email}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [isAdmin, logAuditEvent, showToast]
  );

  const revokeExportApproval = useCallback(
    async (uid: string, email: string) => {
      if (!auth.currentUser || !isAdmin) throw new Error("Admin privileges required.");
      const path = `exportApprovals/${uid}`;
      try {
        await deleteDoc(doc(db, "exportApprovals", uid));
        await logAuditEvent("access_revoked", email);
        showToast(`Revoked export access for ${email}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [isAdmin, logAuditEvent, showToast]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authReady,
      isAdmin,
      isPrimaryAdmin,
      isApprovedForExport,
      canExport,
      canCopySnippets,
      portfolioSettings,
      myAccessRequest,
      authModalOpen,
      authModalReason,
      adminConsoleOpen,
      openAuthModal,
      closeAuthModal,
      openAdminConsole,
      closeAdminConsole,
      signInWithGoogle,
      signInWithApple,
      signInWithEmail,
      registerWithEmail,
      resendVerificationEmail,
      refreshUserStatus,
      sendResetPassword,
      signOutUser,
      submitAccessRequest,
      logAuditEvent,
      updatePortfolioSettings,
      approveAccessRequest,
      rejectAccessRequest,
      deleteAccessRequest,
      grantDirectExportApproval,
      revokeExportApproval,
    }),
    [
      user,
      authReady,
      isAdmin,
      isPrimaryAdmin,
      isApprovedForExport,
      canExport,
      canCopySnippets,
      portfolioSettings,
      myAccessRequest,
      authModalOpen,
      authModalReason,
      adminConsoleOpen,
      openAuthModal,
      closeAuthModal,
      openAdminConsole,
      closeAdminConsole,
      signInWithGoogle,
      signInWithApple,
      signInWithEmail,
      registerWithEmail,
      resendVerificationEmail,
      refreshUserStatus,
      sendResetPassword,
      signOutUser,
      submitAccessRequest,
      logAuditEvent,
      updatePortfolioSettings,
      approveAccessRequest,
      rejectAccessRequest,
      deleteAccessRequest,
      grantDirectExportApproval,
      revokeExportApproval,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
