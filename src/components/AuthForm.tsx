"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LogIn,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import {
  getSupabaseBrowser,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase-browser";
import { GoogleMark } from "@/components/GoogleMark";

type AuthMode = "forgot-password" | "reset-password" | "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
};

const fieldClass =
  "mt-2 h-12 w-full rounded-lg border border-[#cbd5e1] bg-[#F5F5F5] px-4 text-sm font-semibold text-[#121212] outline-none transition placeholder:text-[#8B7B66] focus:border-[#E52B2B]/70 focus:ring-4 focus:ring-[#E52B2B]/12";

function getOrigin() {
  return window.location.origin;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState(false);

  const title =
    mode === "sign-up"
      ? "Create your Spice Fusion TAKEAWAY account"
      : mode === "forgot-password"
        ? "Reset your password"
        : mode === "reset-password"
          ? "Choose a new password"
          : "Sign in to your account";
  const description =
    mode === "sign-up"
      ? "Save your details for faster orders, orders and account history."
      : mode === "forgot-password"
        ? "Enter your email and we will send a secure reset link."
        : mode === "reset-password"
          ? "Enter a new password for your account."
          : "Use your saved details for faster ordering and orders.";

  useEffect(() => {
    if (mode !== "reset-password" || !isSupabaseBrowserConfigured()) {
      return;
    }

    const supabase = getSupabaseBrowser();
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setStatus({
            message: error.message,
            tone: "error",
          });
        }
      });
    } else {
      supabase.auth.getSession();
    }
  }, [mode]);

  async function saveProfile(accessToken: string) {
    const response = await fetch("/api/account/profile", {
      body: JSON.stringify({ name, phone }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(result.error ?? "Customer profile could not be saved.");
    }
  }

  async function handleGoogleSignIn() {
    setStatus(null);

    if (!isSupabaseBrowserConfigured()) {
      setStatus({
        message:
          "Customer accounts are not configured yet. Add the public Supabase URL and publishable key.",
        tone: "error",
      });
      return;
    }

    setOauthSubmitting(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        options: {
          redirectTo: `${getOrigin()}/account`,
        },
        provider: "google",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setOauthSubmitting(false);
      setStatus({
        message:
          error instanceof Error ? error.message : "Google sign in failed.",
        tone: "error",
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!isSupabaseBrowserConfigured()) {
      setStatus({
        message:
          "Customer accounts are not configured yet. Add the public Supabase URL and publishable key.",
        tone: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      const supabase = getSupabaseBrowser();

      if (mode === "sign-in") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session?.access_token) {
          router.push("/account");
          router.refresh();
          return;
        }
      }

      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          options: {
            data: {
              full_name: name,
              phone,
            },
            emailRedirectTo: `${getOrigin()}/account`,
          },
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session?.access_token) {
          await saveProfile(data.session.access_token);
          router.push("/account");
          router.refresh();
          return;
        }

        setStatus({
          message:
            "Account created. Check your email to confirm the account, then sign in.",
          tone: "success",
        });
      }

      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${getOrigin()}/account/reset-password`,
        });

        if (error) {
          throw error;
        }

        setStatus({
          message: "Password reset link sent. Check your email.",
          tone: "success",
        });
      }

      if (mode === "reset-password") {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          throw error;
        }

        setStatus({
          message: "Password updated. You can now sign in with the new password.",
          tone: "success",
        });
      }
    } catch (error) {
      setStatus({
        message:
          error instanceof Error ? error.message : "Account request failed.",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#cbd5e1] bg-[#ffffff] p-6 text-[#121212] shadow-[0_24px_70px_rgba(18,18,18,0.12)] sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E52B2B] text-[#121212] shadow-[0_14px_30px_rgba(229,43,43,0.18)]">
          {mode === "sign-up" ? (
            <UserPlus size={22} aria-hidden="true" />
          ) : mode === "forgot-password" || mode === "reset-password" ? (
            <KeyRound size={22} aria-hidden="true" />
          ) : (
            <LogIn size={22} aria-hidden="true" />
          )}
        </span>
        <div>
          <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#5F5A53]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        {mode === "sign-in" || mode === "sign-up" ? (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={oauthSubmitting || submitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/14 bg-white px-4 py-3 text-sm font-black text-[#121212] shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition hover:bg-[#F4B400] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark />
              {oauthSubmitting ? "Opening Google..." : "Continue with Google"}
            </button>
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-white/38">
              <span className="h-px flex-1 bg-[#cbd5e1]" />
              <span>Email</span>
              <span className="h-px flex-1 bg-[#cbd5e1]" />
            </div>
          </>
        ) : null}

        {mode === "sign-up" ? (
          <>
            <label className="text-sm font-black">
              Full name
              <span className="relative block">
                <User
                  className="pointer-events-none absolute left-4 top-[2.05rem] text-[#8B7B66]"
                  size={17}
                  aria-hidden="true"
                />
                <input
                  className={`${fieldClass} pl-11`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  autoComplete="name"
                  required
                />
              </span>
            </label>
            <label className="text-sm font-black">
              Phone
              <span className="relative block">
                <Phone
                  className="pointer-events-none absolute left-4 top-[2.05rem] text-[#8B7B66]"
                  size={17}
                  aria-hidden="true"
                />
                <input
                  className={`${fieldClass} pl-11`}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  autoComplete="tel"
                  required
                />
              </span>
            </label>
          </>
        ) : null}

        {mode !== "reset-password" ? (
          <label className="text-sm font-black">
            Email
            <span className="relative block">
              <Mail
                className="pointer-events-none absolute left-4 top-[2.05rem] text-[#8B7B66]"
                size={17}
                aria-hidden="true"
              />
              <input
                className={`${fieldClass} pl-11`}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </span>
          </label>
        ) : null}

        {mode !== "forgot-password" ? (
          <label className="text-sm font-black">
            Password
            <span className="relative block">
              <KeyRound
                className="pointer-events-none absolute left-4 top-[2.05rem] text-[#8B7B66]"
                size={17}
                aria-hidden="true"
              />
              <input
                className={`${fieldClass} pl-11`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                minLength={6}
                required
              />
            </span>
          </label>
        ) : null}
      </div>

      {status ? (
        <div
          className={`mt-5 rounded-lg border p-4 text-sm leading-6 ${
            status.tone === "success"
              ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
              : "border-red-400/25 bg-red-500/10 text-red-100"
          }`}
        >
          <div className="flex gap-2">
            {status.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            )}
            <p className="font-black">{status.message}</p>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E52B2B] px-4 py-3 text-sm font-black text-[#121212] shadow-[0_16px_36px_rgba(229,43,43,0.2)] transition hover:bg-white disabled:opacity-60"
      >
        {submitting
          ? "Please wait..."
          : mode === "sign-up"
            ? "Create account"
            : mode === "forgot-password"
              ? "Send reset link"
              : mode === "reset-password"
                ? "Update password"
                : "Sign in"}
        {!submitting ? <ArrowRight size={16} aria-hidden="true" /> : null}
      </button>

      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-black text-[#E52B2B]">
        {mode !== "sign-in" ? <Link href="/account/sign-in">Sign in</Link> : null}
        {mode !== "sign-up" ? <Link href="/account/sign-up">Create account</Link> : null}
        {mode !== "forgot-password" ? (
          <Link href="/account/forgot-password">Forgot password?</Link>
        ) : null}
      </div>
    </form>
  );
}





