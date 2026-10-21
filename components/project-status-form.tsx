import { changeProjectStatusAction } from "@/app/actions/projects";
import type { ProjectStatus } from "@/lib/supabase/database.types";

export function ProjectStatusForm({ id, status }: { id: string; status: ProjectStatus }) {
  const nextStatus: ProjectStatus = status === "published" ? "draft" : "published";
  const label = status === "published" ? "Unpublish" : status === "archived" ? "Restore as draft" : "Publish";
  const requestedStatus = status === "archived" ? "draft" : nextStatus;

  return (
    <form action={changeProjectStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={requestedStatus} />
      <button type="submit">{label}</button>
    </form>
  );
}
