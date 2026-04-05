import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to your wallet"
      subtitle="Fast access to deposits, approvals, and your live transaction stream."
    >
      <LoginForm />
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        New here?{" "}
        <Link className="font-semibold text-amber-300" href="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
