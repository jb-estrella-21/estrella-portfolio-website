import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { EMPTY_PROFILE, getPublicProfile } from "@/lib/content";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({ title: "Contact", description: "Contact information for this portfolio.", path: "/contact" });

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  let profile = EMPTY_PROFILE;
  try { profile = await getPublicProfile(); } catch { /* Render useful placeholder content offline. */ }

  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <SiteHeader current="contact" />
      <section className="project-detail">
        <p className="eyebrow">Get in touch</p>
        <h1>Contact</h1>
        <p className="hero-copy">{profile.contact_email ? "For inquiries, reach me by email." : "Contact details will be added when they are provided."}</p>
        <div className="contact-links">
          {profile.contact_email && <a className="button-link" href={`mailto:${profile.contact_email}`}>Email {profile.contact_email}</a>}
          {profile.linkedin_url && <a className="text-link" href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
          {profile.github_url && <a className="text-link" href={profile.github_url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
          {profile.other_url && <a className="text-link" href={profile.other_url} target="_blank" rel="noopener noreferrer">Other profile ↗</a>}
        </div>
        <p style={{ marginTop: 34 }}><Link className="back-link" href="/">← Back to overview</Link></p>
      </section>
      <footer className="site-footer"><span>Portfolio</span><Link className="text-link" href="/projects">Projects</Link></footer>
    </main>
  );
}
