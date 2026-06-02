import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Spice Fusion TAKEAWAY customer account.",
};

export default function SignInPage() {
  return (
    <main className="bg-[#121212] px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_520px] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F4B400]">
            Customer account
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] sm:text-6xl">
            Sign in for faster ordering.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-white/62">
            Access saved details, order history, and live tracking from one
            quiet place.
          </p>
        </div>
        <AuthForm mode="sign-in" />
      </section>
    </main>
  );
}




