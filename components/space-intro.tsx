"use client";

import { useEffect, useRef, useState } from "react";

const seenKey = "portfolio-space-intro-seen";

export function SpaceIntro() {
  const [shouldShow, setShouldShow] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      setShouldShow(window.localStorage.getItem(seenKey) !== "1");
    } catch {
      setShouldShow(true);
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (shouldShow && dialog && !dialog.open) {
      dialog.showModal();
      skipRef.current?.focus();
    }
  }, [shouldShow]);

  function dismiss() {
    try {
      window.localStorage.setItem(seenKey, "1");
    } catch {
      // Dismissal still works when browser storage is unavailable.
    }
    if (dialogRef.current?.open) dialogRef.current.close();
    setShouldShow(false);
  }

  return (
    <dialog
      className="space-intro-dialog"
      ref={dialogRef}
      aria-labelledby="space-intro-title"
      aria-describedby="space-intro-description"
      onCancel={(event) => { event.preventDefault(); dismiss(); }}
      onClose={() => document.getElementById("space-map-heading")?.focus()}
    >
      <div className="intro-starfield" aria-hidden="true"><span /><span /><span /><span /></div>
      <p className="eyebrow">A quick orientation</p>
      <h2 id="space-intro-title">Welcome to the map.</h2>
      <p id="space-intro-description" className="intro-lead">Pick a destination to explore a part of this portfolio.</p>
      <ol className="intro-directions">
        <li><span>01</span><p>Choose a destination below to open its page.</p></li>
        <li><span>02</span><p>Projects and Contact are always available in the top navigation.</p></li>
        <li><span>03</span><p>Use Tab and Enter, touch, or a direct link. Browser Back and Forward work as usual.</p></li>
      </ol>
      <div className="intro-actions">
        <button ref={skipRef} className="button-secondary" type="button" onClick={dismiss}>Skip introduction</button>
        <button className="button" type="button" onClick={dismiss}>Start exploring <span aria-hidden="true">↗</span></button>
      </div>
    </dialog>
  );
}
