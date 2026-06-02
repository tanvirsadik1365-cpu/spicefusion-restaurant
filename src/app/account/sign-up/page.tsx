import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a Spice Fusion TAKEAWAY customer account for faster orders.",
};

export default function SignUpPage() {
  return (
    <main className="bg-[#F5F5F5] px-4 py-12 text-[#121212] sm:px-6 lg:px-8 lg:py-16">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_520px] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-[#cbd5e1] bg-[#ffffff] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#E52B2B]">
            Customer account
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] sm:text-6xl">
            Create an account for repeat orders.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[#5F5A53]">
            Save your details once, then order, book, and track without starting
            again every time.
          </p>
        </div>
        <AuthForm mode="sign-up" />
      </section>
    </main>
  );
}





