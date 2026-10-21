import Link from "next/link";
import { createProjectAction } from "@/app/actions/projects";
import { ProjectForm } from "@/components/project-form";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <>
      <Link className="back-link" href="/admin/projects">← All projects</Link>
      <p className="eyebrow" style={{ marginTop: 34 }}>New entry</p>
      <h1>Create a project</h1>
      <p className="admin-lead">This will be saved as a private draft.</p>
      <section className="admin-panel">
        <ProjectForm action={createProjectAction} />
      </section>
    </>
  );
}
