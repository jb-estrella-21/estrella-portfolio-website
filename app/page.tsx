import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { SiteHeader } from "@/components/site-header";
import { listPublishedProjects } from "@/lib/projects";
import { EMPTY_PROFILE, getPublicProfile, listPublicMedia, listPublicSections } from "@/lib/content";
import { DEFAULT_PUBLIC_SECTIONS } from "@/lib/content-config";
import { SpaceMap } from "@/components/space-map";
import { SpaceIntro } from "@/components/space-intro";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let projects = null;
  let media = [] as Awaited<ReturnType<typeof listPublicMedia>>;
  let profile = EMPTY_PROFILE;
  let failed = false;
  const [projectsResult, profileResult] = await Promise.allSettled([listPublishedProjects(), getPublicProfile()]);
  if (projectsResult.status === "fulfilled") projects = projectsResult.value;
  else failed = true;
  if (profileResult.status === "fulfilled") profile = profileResult.value;
  if (projects?.length) {
    try { media = await listPublicMedia(projects.map((project) => project.id)); } catch { /* Images are supplementary; retain the project list. */ }
  }
  let sections = DEFAULT_PUBLIC_SECTIONS;
  try { sections = await listPublicSections(); } catch { /* Keep map navigation useful while the backend is offline. */ }
  const covers = new Map<string, (typeof media)[number]>();
  for (const asset of media) if (!covers.has(asset.project_id)) covers.set(asset.project_id, asset);

  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <SiteHeader current="home" />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-orbit" aria-hidden="true" />
        <p className="eyebrow">{profile.professional_title || "A portfolio in progress"}</p>
        <h1 id="hero-title">{profile.display_name ? `Hi, I’m ${profile.display_name}.` : "A place for work worth exploring."}</h1>
        <p className="hero-copy">{profile.intro_line || "Selected projects, ideas, and details will be charted here as the portfolio takes shape."}</p>
      </section>
      <SpaceIntro />
      <SpaceMap sections={sections} />
      <section aria-labelledby="projects-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Field notes</p>
            <h2 id="projects-heading">Selected projects</h2>
          </div>
          <Link className="text-link" href="/projects">View all projects <span aria-hidden="true">↗</span></Link>
        </div>
        {failed ? (
          <p className="notice" role="status">Projects are temporarily unavailable. Please try again later.</p>
        ) : projects?.length ? (
          <div className="project-grid">
            {projects.slice(0, 4).map((project, index) => <ProjectCard key={project.id} project={project} index={index} cover={covers.get(project.id)} />)}
          </div>
        ) : (
          <p className="empty-state">No projects have been published yet.</p>
        )}
      </section>
      <footer className="site-footer">
        <span>Portfolio</span>
        <Link className="text-link" href="/admin/login">Administrator sign in</Link>
      </footer>
    </main>
  );
}
