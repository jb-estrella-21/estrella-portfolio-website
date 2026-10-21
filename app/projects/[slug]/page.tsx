import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteHeader } from "@/components/site-header";
import { getPublishedProject } from "@/lib/projects";
import { listPublicMedia } from "@/lib/content";
import Image from "next/image";
import { publicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getPublishedProject(slug);
    if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
    return publicPageMetadata({
      title: project.title,
      description: project.summary,
      path: `/projects/${slug}`,
      type: "article",
    });
  } catch {
    return { title: "Project temporarily unavailable", robots: { index: false, follow: false } };
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  let project;
  try {
    project = await getPublishedProject(slug);
  } catch {
    return (
      <main className="shell" id="main-content" tabIndex={-1}>
        <SiteHeader current="projects" />
        <section className="project-detail">
          <p className="notice" role="status">This project is temporarily unavailable. Please try again later.</p>
          <Link className="back-link" href="/projects">← Back to projects</Link>
        </section>
      </main>
    );
  }

  if (!project) notFound();

  let media = [] as Awaited<ReturnType<typeof listPublicMedia>>;
  try { media = await listPublicMedia([project.id]); } catch { /* Keep the project readable if its images are temporarily unavailable. */ }

  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <SiteHeader current="projects" />
      <article className="project-detail">
        <Link className="back-link" href="/projects">← All projects</Link>
        <p className="eyebrow" style={{ marginTop: 38 }}>Project file</p>
        <h1>{project.title}</h1>
        <p className="lead">{project.summary}</p>
        {project.technology_tags.length > 0 && (
          <ul className="tag-list" aria-label="Technologies">
            {project.technology_tags.map((tag) => <li className="tag" key={tag}>{tag}</li>)}
          </ul>
        )}
        {(project.live_url || project.source_url) && (
          <div className="project-actions">
            {project.live_url && <a className="button-link" href={project.live_url} target="_blank" rel="noopener noreferrer">View live project <span aria-hidden="true">↗</span></a>}
            {project.source_url && <a className="button-secondary" href={project.source_url} target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a>}
          </div>
        )}
        {media.length > 0 && (
          <div className="media-gallery" aria-label="Project images">
            {media.map((asset) => (
              <figure key={asset.id}>
                <Image src={`/media/${asset.id}`} alt={asset.alt_text} width={asset.width} height={asset.height} sizes="(max-width: 790px) 100vw, 790px" unoptimized />
              </figure>
            ))}
          </div>
        )}
        {project.description_markdown ? <MarkdownContent source={project.description_markdown} /> : <p className="empty-state">Project details will be added soon.</p>}
      </article>
      <footer className="site-footer"><span>Portfolio</span><Link className="text-link" href="/projects">More projects</Link></footer>
    </main>
  );
}
