import Link from "next/link";
import { archiveProjectAction } from "@/app/actions/archive";
import { ProjectStatusForm } from "@/components/project-status-form";
import { listAdminProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

type ProjectsPageProps = {
  searchParams: Promise<{ created?: string; updated?: string; error?: string }>;
};

export default async function AdminProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  let projects = null;
  let failed = false;
  try {
    projects = await listAdminProjects();
  } catch {
    failed = true;
  }

  return (
    <>
      <p className="eyebrow">Content control</p>
      <h1>Projects</h1>
      <p className="admin-lead">Create a project as a draft, then publish it when it is ready for visitors.</p>
      {params.created && <p className="admin-notice" role="status">Draft created.</p>}
      {params.updated && <p className="admin-notice" role="status">Project updated.</p>}
      {params.error && <p className="form-message" role="alert">The requested action could not be completed.</p>}
      <div className="admin-toolbar">
        <h2>Project entries</h2>
        <Link className="button-link" href="/admin/projects/new">New project</Link>
      </div>
      {failed ? (
        <p className="notice" role="status">Projects could not be loaded. Check the Supabase connection and migration setup.</p>
      ) : projects?.length ? (
        <div className="admin-project-list">
          {projects.map((project) => (
            <article className="admin-project" key={project.id}>
              <div>
                <h3>{project.title}</h3>
                <p><span className={`status status-${project.status}`}>{project.status}</span> <span aria-hidden="true"> · </span> /projects/{project.slug}</p>
              </div>
              <div className="admin-project-actions">
                <Link href={`/admin/projects/${project.id}/edit`}>Edit</Link>
                <ProjectStatusForm id={project.id} status={project.status} />
                {project.status !== "archived" && (
                  <form action={archiveProjectAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <button type="submit">Archive</button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">No projects yet. Create your first project draft to begin.</div>
      )}
    </>
  );
}
