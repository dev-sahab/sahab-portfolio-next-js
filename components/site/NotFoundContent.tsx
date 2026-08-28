import Link from "next/link";
import { Telescope } from "lucide-react";
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
      <div className="container notfound-grid">
        <AnimatedSection>
          <span className="s-label">Error 404</span>
          <h1 className="cta-title notfound-code">404</h1>
          <h2 className="h-lg notfound-heading">
            This <span className="accent-word">page</span> wandered off
          </h2>
          <p className="notfound-sub">
            The page you&apos;re looking for doesn&apos;t exist, got moved, or
            never made it past a &quot;coming soon.&quot;
          </p>
          <div className="d-flex flex-wrap notfound-buttons">
            <Link href="/" className="btn btn-accent">
              Back to Home →
            </Link>
            <Link href="/portfolio" className="btn btn-outline">
              View My Work
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection from="fade" delay={0.15} className="notfound-art-wrap">
          <div className="notfound-art" aria-hidden="true">
            <div className="notfound-art-badge">
              <Telescope size={44} strokeWidth={1.5} />
            </div>
            <span className="notfound-art-dot notfound-art-dot-1" />
            <span className="notfound-art-dot notfound-art-dot-2" />
            <span className="notfound-art-dot notfound-art-dot-3" />
            <span className="notfound-art-ring" />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
