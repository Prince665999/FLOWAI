"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell, { FormField } from "@/components/auth/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import { resetPasswordSchema } from "@/lib/validators/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const queryToken = new URLSearchParams(window.location.search).get("token");
    if (queryToken) {
      setToken(queryToken);
    }
  }, []);

  async function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({
      new_password: password,
      confirm_password: confirmPassword,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errors[String(issue.path[0] ?? "form")] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    if (!token) {
      setFormError("Missing reset token. Use the link from your email.");
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(token, parsed.data.new_password);
    setSubmitting(false);

    if (result.ok) {
      router.push("/login");
      return;
    }
    setFormError(result.detail ?? "Unable to reset your password");
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter a new password for your account."
      footer={
        <>
          Back to{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {formError ? (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        ) : null}
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.new_password}
        />
        <FormField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirm_password}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}
