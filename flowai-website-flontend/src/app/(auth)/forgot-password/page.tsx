"use client";

import { useState } from "react";
import Link from "next/link";

import AuthShell, { FormField } from "@/components/auth/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFieldError(null);
    setMessage(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(parsed.data.email);
    setSubmitting(false);

    if (result.ok) {
      setMessage(
        "If that email exists, a password reset link has been prepared. Check your inbox in development, or use the reset token returned by the API.",
      );
      return;
    }
    setFieldError(result.detail ?? "Request failed");
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We will email you a link to reset your password."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {fieldError ? (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {fieldError}
          </div>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError ?? undefined}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
