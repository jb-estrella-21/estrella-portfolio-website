import Link from "next/link";
import Image from "next/image";
import type { MediaAssetRow, ProjectRow } from "@/lib/supabase/database.types";

export function ProjectCard({ project, index, cover }: { project: ProjectRow; index: number; cover?: MediaAssetRow }) {
  return (
    <article className="project-card">
      {cover && (
        <Link className="project-card-image" href={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>
          <Image src={`/media/${cover.id}`} alt={cover.alt_text} width={cover.width} height={cover.height} sizes="(max-width: 700px) 100vw, 50vw" unoptimized />
        </Link>
      )}
      <div>
        <div className="project-card-top">
          <span className="card-index">PROJECT {String(index + 1).padStart(2, "0")}</span>
          <span className="arrow" aria-hidden="true">↗</span>
        </div>
        <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
        <p>{project.summary}</p>
      </div>
      {project.technology_tags.length > 0 && (
        <ul className="tag-list" aria-label="Technologies">
          {project.technology_tags.map((tag) => <li className="tag" key={tag}>{tag}</li>)}
        </ul>
      )}
    </article>
  );
}
