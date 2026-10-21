import Link from "next/link";
import type { Metadata } from "next";
import { logoutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Portfolio admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell">
      <header className="admin-header shell">
        <Link className="wordmark" href="/admin/projects">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>Portfolio admin</span>
        </Link>
        <nav aria-label="Administrator navigation">
          <Link className="text-link" href="/admin/projects">Projects</Link>
          <Link className="text-link" href="/admin/content">Profile &amp; sections</Link>
          <Link className="text-link" href="/">View site</Link>
          <span className="sr-only">Signed in as {admin.email}</span>
          <form action={logoutAction}><button type="submit">Sign out</button></form>
        </nav>
      </header>
      <main className="admin-main shell" id="main-content" tabIndex={-1}>{children}</main>
    </div>
  );
}
