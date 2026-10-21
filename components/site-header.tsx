import Link from "next/link";
import { DEFAULT_PUBLIC_SECTIONS } from "@/lib/content-config";
import { listPublicSections } from "@/lib/content";
import type { SectionKey } from "@/lib/supabase/database.types";

const sectionPaths: Record<SectionKey, string> = {
  about: "/about",
  projects: "/projects",
  skills: "/skills",
  experience: "/experience",
  contact: "/contact",
};

export async function SiteHeader({ current }: { current?: "home" | SectionKey }) {
  let sections = DEFAULT_PUBLIC_SECTIONS;
  try {
    sections = await listPublicSections();
  } catch {
    // Keep the primary navigation available when the content backend is offline.
  }

  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="Portfolio home">
        <span className="wordmark-mark" aria-hidden="true" />
        <span>Portfolio</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/" aria-current={current === "home" ? "page" : undefined}>Overview</Link>
        {sections.map((section) => (
          <Link key={section.section_key} href={sectionPaths[section.section_key]} aria-current={current === section.section_key ? "page" : undefined}>
            {section.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
