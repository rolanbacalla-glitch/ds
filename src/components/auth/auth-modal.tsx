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
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ADMIN_EMAIL } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import firebaseConfig from "../../../firebase-applet-config.json";

type AuthMode = "signin" | "register" | "reset";

const FIREBASE_PROVIDERS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
const FIREBASE_SETTINGS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

interface ParsedAuthError {
  message: string;
  isProviderDisabled?: boolean;
  isUnauthorizedDomain?: boolean;
}

function parseFirebaseAuthError(error: unknown): ParsedAuthError {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return {
        message: "Sign-in popup was closed before completing authentication. Click Continue with Google to try again.",
      };
    case "auth/popup-blocked":
      return {
        message:
          "Your browser blocked the sign-in popup. Please allow popups for this site and click Continue with Google again.",
      };
    case "auth/unauthorized-domain":
      return {
        message:
          "This domain is not yet on your Firebase Authorised Domains allowlist. Copy the domain below and add it under Authentication → Settings → Authorised domains.",
        isUnauthorizedDomain: true,
      };
    case "auth/operation-not-allowed":
      return {
        message:
          "This sign-in method is not yet enabled in your Firebase Console. Google Sign-In works immediately — click Continue with Google below, or toggle Apple / Email-Password on in Firebase Authentication.",
        isProviderDisabled: true,
      };
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return {
        message: "Incorrect email address or password. Please check your details and try again.",
      };
    case "auth/email-already-in-use":
      return {
        message: "An account with this email address already exists. Please sign in instead.",
      };
    case "auth/weak-password":
      return {
        message: "Please choose a stronger password (at least 6 characters).",
      };
    case "auth/invalid-email":
      return {
        message: "Please enter a valid email address.",
      };
    case "auth/too-many-requests":
      return {
        message: "Too many sign-in attempts. Please wait a moment before trying again.",
      };
    default:
      return {
        message: message || "Authentication failed. Please try again.",
      };
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
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busyProvider, setBusyProvider] = useState<"google" | "apple" | "email" | "verify" | null>(
    null
  );
  const [authError, setAuthError] = useState<ParsedAuthError | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";

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

  const busy = busyProvider !== null;
  const needsVerification = Boolean(user && !user.emailVerified);

  const handleGoogle = async () => {
    setBusyProvider("google");
    setAuthError(null);
    setInfoMsg(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(parseFirebaseAuthError(err));
    } finally {
      setBusyProvider(null);
    }
  };

  const handleApple = async () => {
    setBusyProvider("apple");
    setAuthError(null);
    setInfoMsg(null);
    try {
      await signInWithApple();
    } catch (err) {
      setAuthError(parseFirebaseAuthError(err));
    } finally {
      setBusyProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyProvider("email");
    setAuthError(null);
    setInfoMsg(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else if (mode === "register") {
        if (!displayName.trim()) {
          setAuthError({ message: "Please enter your full name." });
          setBusyProvider(null);
          return;
        }
        await registerWithEmail(displayName, email, password);
        setInfoMsg(
          "Account created! A verification email has been sent to your inbox. Please click the link, then refresh your status below."
        );
      } else {
        await sendResetPassword(email);
        setInfoMsg(
          "Password reset instructions have been sent if an account exists for that email."
        );
      }
    } catch (err) {
      setAuthError(parseFirebaseAuthError(err));
    } finally {
      setBusyProvider(null);
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
              {needsVerification ? "Verify Your Email Address" : "Sign in to Continue"}
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

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                    setBusyProvider("verify");
                    try {
                      await refreshUserStatus();
                    } catch (err) {
                      setAuthError(parseFirebaseAuthError(err));
                    } finally {
                      setBusyProvider(null);
                    }
                  }}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-95 disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4", busyProvider === "verify" && "animate-spin")} />
                  <span>I&apos;ve Verified My Email — Refresh</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusyProvider("verify");
                    try {
                      await resendVerificationEmail();
                    } catch (err) {
                      setAuthError(parseFirebaseAuthError(err));
                    } finally {
                      setBusyProvider(null);
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
              {/* Primary Active Provider: Google Sign-In */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleGoogle}
                  className="w-full min-h-[48px] px-4 py-3 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] hover:opacity-95 text-[var(--sys-on-primary)] text-sm font-semibold flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Globe className="w-4 h-4" />
                  <span>
                    {busyProvider === "google"
                      ? "Opening Google Sign-In..."
                      : "Continue with Google"}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <p className="text-[11px] text-center text-[var(--sys-on-surface-secondary)]">
                  Instant sign-in active now · Use{" "}
                  <span className="font-mono font-semibold text-[var(--sys-on-surface)]">
                    {ADMIN_EMAIL}
                  </span>{" "}
                  for Admin access
                </p>

                <button
                  type="button"
                  disabled={busy}
                  onClick={handleApple}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-lowest)] hover:bg-[var(--sys-surface-high)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>
                    {busyProvider === "apple"
                      ? "Opening Apple Sign-In..."
                      : "Continue with Apple"}
                  </span>
                </button>
              </div>

              {/* Alerts */}
              {authError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-[var(--bg-feedback-error-subtle)] border border-[var(--border-feedback-error)] text-xs text-[var(--text-feedback-error)] space-y-2.5 leading-relaxed"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError.message}</span>
                  </div>
                  {authError.isUnauthorizedDomain && (
                    <div className="space-y-2 pt-1 pl-6">
                      {currentHostname && (
                        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline)] text-[var(--sys-on-surface)]">
                          <code className="font-mono text-[11px] truncate">{currentHostname}</code>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(currentHostname);
                                setCopiedDomain(true);
                                setTimeout(() => setCopiedDomain(false), 1800);
                              } catch {
                                // ignore clipboard restrictions
                              }
                            }}
                            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--sys-surface-high)] hover:bg-[var(--sys-surface-highest)] text-[11px] font-semibold cursor-pointer"
                          >
                            {copiedDomain ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      <a
                        href={FIREBASE_SETTINGS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[34px] px-3 py-1.5 rounded-lg bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-[11px] font-semibold inline-flex items-center gap-1.5 hover:opacity-95"
                      >
                        <span>Open Firebase Authorised Domains</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {authError.isProviderDisabled && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                      <button
                        type="button"
                        onClick={handleGoogle}
                        className="min-h-[32px] px-3 py-1 rounded-lg bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-[11px] font-semibold cursor-pointer"
                      >
                        Sign in with Google Now
                      </button>
                      <a
                        href={FIREBASE_PROVIDERS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[32px] px-3 py-1 rounded-lg bg-[var(--sys-surface-lowest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-[11px] font-medium inline-flex items-center gap-1 hover:bg-[var(--sys-surface-high)]"
                      >
                        <span>Enable in Firebase Console</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
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

              {/* Collapsible Email & Password Section */}
              <div className="pt-1 border-t border-[var(--sys-outline-variant)]">
                <button
                  type="button"
                  onClick={() => setShowEmailForm((prev) => !prev)}
                  aria-expanded={showEmailForm}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl hover:bg-[var(--sys-surface-high)]/60 text-xs font-medium text-[var(--sys-on-surface-secondary)] hover:text-[var(--sys-on-surface)] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Sign in or register with Email &amp; Password</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      showEmailForm && "rotate-180"
                    )}
                  />
                </button>

                {showEmailForm && (
                  <div className="mt-3 space-y-3.5">
                    {/* Mode Switcher */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signin");
                          setAuthError(null);
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
                          setAuthError(null);
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

                    <form onSubmit={handleEmailSubmit} className="space-y-3">
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
                                  setAuthError(null);
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
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--sys-radius-md)] bg-[var(--sys-surface-high)] hover:bg-[var(--sys-surface-highest)] text-[var(--sys-on-surface)] border border-[var(--sys-outline)] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <span>
                          {busyProvider === "email"
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
                  </div>
                )}
              </div>

              {/* Admin Recognition Notice */}
              <div className="p-3.5 rounded-2xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] flex items-start gap-2.5 text-[11px] text-[var(--sys-on-surface-secondary)] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[var(--sys-primary)] shrink-0 mt-0.5" />
                <span>
                  Viewing the portfolio is open to everyone. Signing in via Google as{" "}
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
