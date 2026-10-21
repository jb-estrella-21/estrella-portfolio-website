import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="login-wrap" id="main-content" tabIndex={-1}>
        <section className="login-card" aria-labelledby="login-title">
          <Link className="back-link" href="/">← Back to portfolio</Link>
          <p className="eyebrow" style={{ marginTop: 30 }}>Setup required</p>
          <h1 id="login-title">Administrator sign in</h1>
          <p>Connect a Supabase project and follow the setup steps in the project README before signing in.</p>
        </section>
      </main>
    );
  }

  if (await getCurrentAdmin()) redirect("/admin/projects");

  return (
    <main className="login-wrap" id="main-content" tabIndex={-1}>
      <section className="login-card" aria-labelledby="login-title">
        <Link className="back-link" href="/">← Back to portfolio</Link>
        <p className="eyebrow" style={{ marginTop: 30 }}>Private access</p>
        <h1 id="login-title">Administrator sign in</h1>
        <p>Use the administrator account provisioned for this portfolio.</p>
        <LoginForm />
      </section>
    </main>
  );
}
