"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LockKeyhole, LogIn } from "lucide-react";

export function MerchantLoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (!url.searchParams.has("token")) {
      return;
    }

    url.searchParams.delete("token");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/merchant/session", {
        body: JSON.stringify({ token }),
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Merchant access failed.");
      }

      setToken("");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Merchant access failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4 text-left">
      <label className="text-sm font-black text-[#121212]">
        Dashboard token
        <span className="relative mt-2 block">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#121212]/60"
            size={18}
            aria-hidden="true"
          />
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="h-12 w-full rounded-lg border border-black/10 bg-white px-4 pl-12 text-sm font-black text-[#121212] outline-none transition placeholder:text-[#5F5A53]/40 focus:border-[#121212] focus:ring-4 focus:ring-[#121212]/10"
            type="password"
            autoComplete="current-password"
            placeholder="Enter dashboard token"
            required
          />
        </span>
      </label>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-black leading-6 text-red-900">
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#121212] px-5 text-sm font-black text-white transition hover:bg-[#1F0F06] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn size={17} aria-hidden="true" />
        {submitting ? "Checking..." : "Open merchant dashboard"}
      </button>
    </form>
  );
}




