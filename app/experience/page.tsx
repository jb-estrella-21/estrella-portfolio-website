import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { MarkdownContent } from "@/components/markdown-content";
import { EMPTY_PROFILE, getPublicProfile, isPublicSectionVisible } from "@/lib/content";
import { publicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicPageMetadata({ title: "Experience and education", description: "Experience and education information.", path: "/experience" });

export default async function ExperiencePage() {
  if (!await isPublicSectionVisible("experience")) notFound();
  let profile = EMPTY_PROFILE;
  try { profile = await getPublicProfile(); } catch { /* Keep the page usable with an honest placeholder. */ }
  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <SiteHeader current="experience" />
      <section className="page-intro">
        <p className="eyebrow">Timeline</p>
        <h1>Experience / education</h1>
        {profile.experience_markdown
          ? <MarkdownContent source={profile.experience_markdown} />
          : <p className="empty-state">Experience and education details will be added when they are provided.</p>}
      </section>
      <footer className="site-footer"><span>Portfolio</span><span>Experience</span></footer>
    </main>
  );
}
