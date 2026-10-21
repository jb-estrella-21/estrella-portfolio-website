import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProjectAction } from "@/app/actions/projects";
import { ProjectForm } from "@/components/project-form";
import { getAdminProject } from "@/lib/projects";
import { listAdminProjectMedia } from "@/lib/content";
import { deleteProjectMediaAction, updateProjectMediaAction } from "@/app/actions/media";
import { MediaUploadForm } from "@/components/media-upload-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ media?: string; mediaError?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const project = await getAdminProject(id);
  if (!project) notFound();
  let media: Awaited<ReturnType<typeof listAdminProjectMedia>> = [];
  let mediaFailed = false;
  try { media = await listAdminProjectMedia(project.id); } catch { mediaFailed = true; }

  return (
    <>
      <Link className="back-link" href="/admin/projects">← All projects</Link>
      <p className="eyebrow" style={{ marginTop: 34 }}>Project entry</p>
      <h1>Edit project</h1>
      <p className="admin-lead">Status: <span className={`status status-${project.status}`}>{project.status}</span></p>
      <section className="admin-panel">
        <ProjectForm
          action={updateProjectAction.bind(null, project.id)}
          project={project}
        />
      </section>
      <section className="admin-content-section">
        <div className="admin-toolbar"><h2>Project images</h2></div>
        <div className="admin-panel">
          <p className="admin-section-copy">Uploads are resized and converted to WebP. Images remain private while this project is a draft or archived.</p>
          {query.media === "updated" && <p className="form-success" role="status">Image details saved.</p>}
          {query.media === "deleted" && <p className="form-success" role="status">Image removed.</p>}
          {query.mediaError && <p className="form-message" role="alert">The image change could not be completed. {query.mediaError === "cleanup" ? "Its private storage file may need cleanup." : "Check the image and try again."}</p>}
          <MediaUploadForm projectId={project.id} />
          {mediaFailed ? (
            <p className="notice" role="status">Project images could not be loaded. Check the Phase 2 migration and Storage setup.</p>
          ) : media.length ? (
            <div className="media-admin-list">
              {media.map((asset) => (
                <article className="media-admin-item" key={asset.id}>
                  {asset.previewUrl ? <img src={asset.previewUrl} alt={asset.alt_text} width={asset.width} height={asset.height} /> : <div className="media-preview-missing">Preview unavailable</div>}
                  <div className="media-admin-details">
                    <form action={updateProjectMediaAction} className="form media-edit-form">
                      <input type="hidden" name="id" value={asset.id} />
                      <input type="hidden" name="project_id" value={project.id} />
                      <div className="field">
                        <label htmlFor={`alt-${asset.id}`}>Alternative text</label>
                        <input id={`alt-${asset.id}`} name="alt_text" defaultValue={asset.alt_text} required minLength={3} maxLength={200} />
                      </div>
                      <div className="field media-order-field">
                        <label htmlFor={`order-${asset.id}`}>Order</label>
                        <input id={`order-${asset.id}`} name="display_order" type="number" min={0} max={10000} step={1} defaultValue={asset.display_order} required />
                      </div>
                      <div className="form-actions">
                        <button className="button-secondary" type="submit">Save image details</button>
                      </div>
                    </form>
                    <form action={deleteProjectMediaAction}>
                      <input type="hidden" name="id" value={asset.id} />
                      <input type="hidden" name="project_id" value={project.id} />
                      <button className="button-danger" type="submit">Remove image</button>
                    </form>
                    <small>{asset.width} × {asset.height} · {(asset.byte_size / 1024).toFixed(0)} KiB · WebP</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state media-empty">No images yet. Upload a project image above.</p>
          )}
        </div>
      </section>
    </>
  );
}
