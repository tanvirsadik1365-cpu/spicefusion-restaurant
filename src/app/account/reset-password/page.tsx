import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your Spice Fusion TAKEAWAY customer account.",
};

export default function ResetPasswordPage() {
  return (
    <main className="bg-[#121212] px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_520px] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F4B400]">
            Customer account
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] sm:text-6xl">
            Choose a new password.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-white/62">
            Create a fresh password, then return to ordering and account
            history.
          </p>
        </div>
        <AuthForm mode="reset-password" />
      </section>
    </main>
  );
}




