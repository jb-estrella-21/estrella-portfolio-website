import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isPublicSectionVisible, listPublicSkills } from "@/lib/content";
import { publicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicPageMetadata({ title: "Skills", description: "Skills and technologies used across selected work.", path: "/skills" });

export default async function SkillsPage() {
  if (!await isPublicSectionVisible("skills")) notFound();
  let skills = [] as Awaited<ReturnType<typeof listPublicSkills>>;
  let failed = false;
  try { skills = await listPublicSkills(); } catch { failed = true; }
  const groups = new Map<string, typeof skills>();
  for (const skill of skills) groups.set(skill.category || "Other", [...(groups.get(skill.category || "Other") ?? []), skill]);

  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <SiteHeader current="skills" />
      <section className="page-intro">
        <p className="eyebrow">Toolkit</p>
        <h1>Skills</h1>
        <p className="hero-copy">A growing list of skills and tools.</p>
      </section>
      {failed ? (
        <p className="notice" role="status">Skills are temporarily unavailable. Please try again later.</p>
      ) : groups.size ? (
        <div className="skill-groups">
          {[...groups].map(([category, entries]) => (
            <section className="skill-group" key={category}>
              <h2>{category}</h2>
              <ul className="tag-list" aria-label={category}>{entries.map((skill) => <li className="tag" key={skill.id}>{skill.label}</li>)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="empty-state">Skills will be added here when they are provided.</p>
      )}
      <footer className="site-footer"><span>Portfolio</span><span>Skills</span></footer>
    </main>
  );
}
