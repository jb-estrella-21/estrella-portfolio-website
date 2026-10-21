import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteHeader } from "@/components/site-header";
import { EMPTY_PROFILE, getPublicProfile, isPublicSectionVisible } from "@/lib/content";
import { publicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicPageMetadata({ title: "About", description: "About the person behind this portfolio.", path: "/about" });

export default async function AboutPage() {
  if (!await isPublicSectionVisible("about")) notFound();
  let profile = EMPTY_PROFILE;
  try { profile = await getPublicProfile(); } catch { /* Use a clear placeholder while content storage is unavailable. */ }

  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <SiteHeader current="about" />
      <article className="project-detail">
        <p className="eyebrow">Profile</p>
        <h1>{profile.display_name || "About"}</h1>
        {profile.professional_title && <p className="lead">{profile.professional_title}</p>}
        {profile.biography_markdown
          ? <MarkdownContent source={profile.biography_markdown} />
          : <p className="empty-state">Profile details will be added when they are provided.</p>}
      </article>
      <footer className="site-footer"><span>Portfolio</span><span>About</span></footer>
    </main>
  );
}
