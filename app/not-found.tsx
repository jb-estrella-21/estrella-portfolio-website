import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell" id="main-content" tabIndex={-1}>
      <section className="project-detail">
        <p className="eyebrow">Nothing at this coordinate</p>
        <h1>Page not found</h1>
        <p className="hero-copy">This page may have moved or is not published.</p>
        <p style={{ marginTop: 30 }}><Link className="back-link" href="/">← Return to the overview</Link></p>
      </section>
    </main>
  );
}
