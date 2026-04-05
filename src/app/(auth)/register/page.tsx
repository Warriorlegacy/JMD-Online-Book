import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your JMD account"
      subtitle="Create your profile with email and password, then start using your wallet instantly."
    >
      <RegisterForm />
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Already registered?{" "}
        <Link className="font-semibold text-amber-300" href="/login">
          Go to login
        </Link>
      </p>
    </AuthShell>
  );
}
