import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { SiteHeader } from "@/components/site-header";
import { listPublishedProjects } from "@/lib/projects";
import { listPublicMedia } from "@/lib/content";
import { publicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicPageMetadata({ title: "Projects", description: "A collection of selected projects.", path: "/projects" });

export default async function ProjectsPage() {
  let projects = null;
  let media = [] as Awaited<ReturnType<typeof listPublicMedia>>;
  let failed = false;
  try {
    projects = await listPublishedProjects();
  } catch {
    failed = true;
  }
  if (projects?.length) {
    try { media = await listPublicMedia(projects.map((project) => project.id)); } catch { /* Keep project summaries available if images fail. */ }
  }
  const covers = new Map<string, (typeof media)[number]>();
  for (const asset of media) if (!covers.has(asset.project_id)) covers.set(asset.project_id, asset);

  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <SiteHeader current="projects" />
      <section className="page-intro">
        <p className="eyebrow">The project archive</p>
        <h1>Projects</h1>
        <p className="hero-copy">Selected work and the thinking behind it.</p>
      </section>
      {failed ? (
        <p className="notice" role="status">Projects are temporarily unavailable. Please try again later.</p>
      ) : projects?.length ? (
        <div className="project-grid">
          {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} cover={covers.get(project.id)} />)}
        </div>
      ) : (
        <p className="empty-state">No projects have been published yet.</p>
      )}
      <footer className="site-footer"><span>Portfolio</span><span>Projects</span></footer>
    </main>
  );
}
