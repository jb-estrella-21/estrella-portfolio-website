"use client";

import { useActionState, useState } from "react";
import { uploadProjectMediaAction } from "@/app/actions/media";
import type { ContentFormState } from "@/app/actions/content";

export function MediaUploadForm({ projectId }: { projectId: string }) {
  const action = uploadProjectMediaAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, {} as ContentFormState);
  const [altText, setAltText] = useState("");

  return (
    <form action={formAction} className="form media-upload-form">
      {state.message && <p className={state.message.includes("uploaded") ? "form-success" : "form-message"} role={state.message.includes("uploaded") ? "status" : "alert"}>{state.message}</p>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="media-file">Image</label>
          <input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" required aria-describedby="media-file-help" />
          <small id="media-file-help">JPEG, PNG, or WebP up to 5 MiB. Stored as an optimized WebP. If an upload fails, reselect the file before retrying.</small>
        </div>
        <div className="field">
          <label htmlFor="media-alt">Alternative text</label>
          <input id="media-alt" name="alt_text" value={altText} onChange={(event) => setAltText(event.target.value)} required minLength={3} maxLength={200} placeholder="Describe what the image shows" aria-describedby={state.errors?.alt_text ? "media-alt-error" : undefined} />
          {state.errors?.alt_text && <span className="field-error" id="media-alt-error">{state.errors.alt_text}</span>}
        </div>
      </div>
      {state.message && state.errors && <p className="form-message" role="alert">{state.message}</p>}
      <div className="form-actions">
        <button className="button" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Uploading…" : "Upload image"}</button>
      </div>
    </form>
  );
}
