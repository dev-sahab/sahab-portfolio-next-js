import Link from "next/link";
import AnimatedSection from "@/components/site/AnimatedSection";
import "@/styles/pages/(site)/not-found.scss";

/**
 * The actual 404 message/CTA — shared by app/(site)/not-found.tsx (used for
 * a notFound() thrown from a page already inside the (site) route group,
 * e.g. a bad portfolio/blog slug — rendered with the full Navbar/Footer via
 * that group's layout) and the root app/not-found.tsx (Next's fallback for
 * a URL that never matches any route at all, which sits outside that
 * layout — so it renders the same chrome manually around this component).
 */
export default function NotFoundContent() {
  return (
    <section className="notfound-hero page-hero">
      <div className="ph-dots" aria-hidden="true" />
      <div className="container notfound-inner text-center">
        <AnimatedSection>
          <span className="s-label justify-center">Error 404</span>
          <h1 className="cta-title notfound-code">404</h1>
          <h2 className="h-lg notfound-heading">
            This <span className="accent-word">page</span> wandered off
          </h2>
          <p className="cta-sub">
            The page you&apos;re looking for doesn&apos;t exist, got moved, or
            never made it past a &quot;coming soon.&quot;
          </p>
          <div className="d-flex justify-center flex-wrap notfound-buttons">
            <Link href="/" className="btn btn-accent">
              Back to Home →
            </Link>
            <Link href="/portfolio" className="btn btn-outline">
              View My Work
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
