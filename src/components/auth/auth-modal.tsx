"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import {
  X,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Globe,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ADMIN_EMAIL } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "register" | "reset";

function formatFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  switch (code) {
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing authentication.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Please allow popups for this site and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in provider is not yet enabled in Firebase Console. Sign in with Google now, or enable Apple / Email-Password under Firebase Authentication → Sign-in method.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email address or password. Please check your details and try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please wait a moment before trying again.";
    default:
      return message || "Authentication failed. Please try again.";
  }
}

export const AuthModal: React.FC = () => {
  const { authModalOpen } = useAuth();
  if (!authModalOpen) return null;
  return <AuthModalDialog />;
};

const AuthModalDialog: React.FC = () => {
  const {
    user,
    authModalReason,
    closeAuthModal,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    registerWithEmail,
    resendVerificationEmail,
    refreshUserStatus,
    sendResetPassword,
    signOutUser,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const emailId = useId();
  const passwordId = useId();
  const nameId = useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAuthModal]);

  const needsVerification = Boolean(user && !user.emailVerified);

  const handleGoogle = async () => {
    setBusy(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleApple = async () => {
    setBusy(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await signInWithApple();
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else if (mode === "register") {
        if (!displayName.trim()) {
          setErrorMsg("Please enter your full name.");
          setBusy(false);
          return;
        }
        await registerWithEmail(displayName, email, password);
        setInfoMsg(
          "Account created! A verification email has been sent to your inbox. Please click the link, then refresh your status below."
        );
      } else {
        await sendResetPassword(email);
        setInfoMsg("Password reset instructions have been sent if an account exists for that email.");
      }
    } catch (err) {
      setErrorMsg(formatFirebaseAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={closeAuthModal}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: "blur(40px) saturate(190%)",
          WebkitBackdropFilter: "blur(40px) saturate(190%)",
        }}
        className="liquid-glass-regular w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[var(--sys-outline)]"
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--sys-outline-variant)] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--sys-primary)]">
              <Lock className="w-3.5 h-3.5" />
              <span>Portfolio Access &amp; Authentication</span>
            </div>
            <h2
              id={titleId}
              className="text-xl font-bold tracking-tight text-[var(--sys-on-surface)]"
            >
              {needsVerification
                ? "Verify Your Email Address"
                : mode === "signin"
                ? "Sign in to Continue"
                : mode === "register"
                ? "Create Portfolio Account"
                : "Reset Your Password"}
            </h2>
            {authModalReason && (
              <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                {authModalReason}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close authentication dialogue"
            className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center bg-[var(--sys-surface-high)]/70 hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface-secondary)] border border-[var(--sys-outline-variant)] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Email Verification Pending View */}
          {needsVerification ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--sys-primary-container)]/50 border border-[var(--sys-primary)]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--sys-on-surface)]">
                  <Mail className="w-4 h-4 text-[var(--sys-primary)]" />
                  <span>Verification required for {user?.email}</span>
                </div>
                <p className="text-xs text-[var(--sys-on-surface-secondary)] leading-relaxed">
                  To prevent unauthorised access, please click the verification link sent to your
                  email address before submitting an export request or accessing admin tools.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await refreshUserStatus();
                    } catch (err) {
                      setErrorMsg(formatFirebaseAuthError(err));
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-95 disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4", busy && "animate-spin")} />
                  <span>I&apos;ve Verified My Email — Refresh</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await resendVerificationEmail();
                    } catch (err) {
                      setErrorMsg(formatFirebaseAuthError(err));
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="w-full min-h-[42px] px-4 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-high)] hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-xs font-semibold cursor-pointer"
                >
                  Resend Verification Email
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                    closeAuthModal();
                  }}
                  className="text-xs text-[var(--sys-on-surface-tertiary)] hover:text-[var(--sys-on-surface)] py-1 cursor-pointer"
                >
                  Sign out and use another account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Primary OAuth Providers: Google & Apple */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleGoogle}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-xs font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Globe className="w-4 h-4 text-[var(--sys-primary)]" />
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={handleApple}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-on-surface)] hover:opacity-92 text-[var(--sys-surface-canvas)] text-xs font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* Subtle Divider */}
              <div className="flex items-center gap-3 text-[11px] text-[var(--sys-on-surface-tertiary)]">
                <div className="flex-1 h-px bg-[var(--sys-outline-variant)]" />
                <span>or with email &amp; password</span>
                <div className="flex-1 h-px bg-[var(--sys-outline-variant)]" />
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={cn(
                    "py-2 rounded-lg font-medium transition-colors cursor-pointer",
                    mode === "signin"
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold"
                      : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={cn(
                    "py-2 rounded-lg font-medium transition-colors cursor-pointer",
                    mode === "register"
                      ? "bg-[var(--sys-primary)] text-[var(--sys-on-primary)] font-semibold"
                      : "text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)]"
                  )}
                >
                  Create Account
                </button>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-[var(--bg-feedback-error-subtle)] border border-[var(--border-feedback-error)] text-xs text-[var(--text-feedback-error)] flex items-start gap-2 leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div
                  role="status"
                  className="p-3 rounded-xl bg-[var(--bg-feedback-success-subtle)] border border-emerald-500/30 text-xs text-[var(--text-feedback-success)] flex items-start gap-2 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {mode === "register" && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor={nameId}
                      className="block text-xs font-medium text-[var(--sys-on-surface-secondary)]"
                    >
                      Full Name
                    </label>
                    <input
                      id={nameId}
                      type="text"
                      required
                      maxLength={100}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] focus:border-[var(--sys-primary)] text-sm text-[var(--sys-on-surface)] outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor={emailId}
                    className="block text-xs font-medium text-[var(--sys-on-surface-secondary)]"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sys-on-surface-tertiary)]" />
                    <input
                      id={emailId}
                      type="email"
                      required
                      maxLength={160}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] focus:border-[var(--sys-primary)] text-sm text-[var(--sys-on-surface)] outline-none"
                    />
                  </div>
                </div>

                {mode !== "reset" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={passwordId}
                        className="block text-xs font-medium text-[var(--sys-on-surface-secondary)]"
                      >
                        Password
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("reset");
                            setErrorMsg(null);
                            setInfoMsg(null);
                          }}
                          className="text-[11px] font-medium text-[var(--sys-primary)] hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sys-on-surface-tertiary)]" />
                      <input
                        id={passwordId}
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] focus:border-[var(--sys-primary)] text-sm text-[var(--sys-on-surface)] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--sys-on-surface-tertiary)] hover:text-[var(--sys-on-surface)] cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {busy
                      ? "Authenticating..."
                      : mode === "signin"
                      ? "Sign In with Email"
                      : mode === "register"
                      ? "Create Account & Verify Email"
                      : "Send Password Reset Email"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {mode === "reset" && (
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="w-full text-center text-xs text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] py-1 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                )}
              </form>

              {/* Admin Recognition Notice */}
              <div className="p-3.5 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-start gap-2.5 text-[11px] text-[var(--sys-on-surface-secondary)] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[var(--sys-primary)] shrink-0 mt-0.5" />
                <span>
                  Viewing the portfolio is open to everyone. Signing in as{" "}
                  <strong className="font-mono text-[var(--sys-on-surface)]">{ADMIN_EMAIL}</strong>{" "}
                  automatically unlocks full Admin Console controls and unrestricted exports.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
