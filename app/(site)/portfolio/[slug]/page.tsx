import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import "@/models/Category";
import "@/models/Tag";
import AnimatedSection from "@/components/site/AnimatedSection";
import Lightbox from "@/components/site/Lightbox";
import type { Project as IProject } from "@/types";
import "./portfolio-slug.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  try {
    await connectDB();
    const p = (await Project.findOne({
      slug,
      published: true,
    }).lean()) as unknown as IProject;
    if (!p) return { title: "Project Not Found" };
    return {
      title: p.title,
      description: p.excerpt,
      robots: p.noIndex ? { index: false, follow: false } : undefined,
    };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  let project: IProject | null = null;
  let prevProject: { slug: string; title: string } | null = null;
  let nextProject: { slug: string; title: string } | null = null;
  try {
    await connectDB();
    project = (await Project.findOne({
      slug,
      published: true,
    })
      .populate("category")
      .populate("tags")
      .lean()) as unknown as IProject;

    if (project) {
      const order = (await Project.find({ published: true })
        .sort({ featured: -1, createdAt: -1 })
        .select("slug title")
        .lean()) as unknown as { _id: string; slug: string; title: string }[];
      const idx = order.findIndex((p) => p.slug === slug);
      if (idx !== -1 && order.length > 1) {
        const prev = order[(idx - 1 + order.length) % order.length];
        const next = order[(idx + 1) % order.length];
        prevProject = { slug: prev.slug, title: prev.title };
        nextProject = { slug: next.slug, title: next.title };
      }
    }
  } catch {}
  if (!project) notFound();

  return (
    <main>
      {/* HERO */}
      <section className="sp-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div className="sp-breadcrumb">
              <Link href="/">
                Home
              </Link>
              <span>/</span>
              <Link href="/portfolio">
                Portfolio
              </Link>
              <span>/</span>
              <span>{project.title}</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div className="sp-tags-row">
              <span className="tag green">{project.category?.name || 'Uncategorized'}</span>
              <span className="tag">{project.year}</span>
              {project.client && (
                <span className="tag">Client Project</span>
              )}
              {project.duration && (
                <span className="tag">{project.duration}</span>
              )}
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="sp-title">
              {project.title}
            </h1>
          </AnimatedSection>
          <AnimatedSection from="fade">
            <div className="sp-stack-row">
              {project.stack.map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
              {(project.tags as any[] | undefined)?.map((t) => (
                <span key={t._id} className="tag">
                  {t.name}
                </span>
              ))}
            </div>
          </AnimatedSection>
          <AnimatedSection from="fade">
            <div className="sp-cta-row">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-accent"
                >
                  View Live ↗
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-outline"
                >
                  GitHub ↗
                </a>
              )}
              <Link href="/portfolio" className="btn btn-outline">
                ← All Projects
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CONTENT */}
      <div className="sp-content-wrap">
        <div className="sp-content-inner">
          {/* Featured image placeholder */}
          <AnimatedSection>
            <div className="sp-featured-img">
              {project.coverImage ? (
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="sp-featured-img-el"
                />
              ) : (
                (project.category?.name || '??').slice(0, 2).toUpperCase()
              )}
            </div>
          </AnimatedSection>

          {/* Overview */}
          <AnimatedSection className="sp-section">
            <div className="sp-overview-grid">
              <div>
                <div className="sp-eyebrow">
                  Project Overview
                </div>
                <h2 className="sp-h2 sp-overview-title">
                  About this project
                </h2>
                <p className="sp-body-text">
                  {project.excerpt}
                </p>
              </div>
              <div>
                <div className="sp-eyebrow">
                  Details
                </div>
                <div className="sp-details-grid">
                  {[
                    ["Category", project.category?.name || "Uncategorized"],
                    ["Year", project.year],
                    ["Client", project.client ? "Client Project" : "Personal Project"],
                    ["Duration", project.duration || "N/A"],
                  ].map(([k, v]) => (
                    <div
                      key={k as string}
                      className="sp-detail-cell"
                    >
                      <div className="sp-detail-label">
                        {k}
                      </div>
                      <div className="sp-detail-value">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Full content */}
          {project.content && (
            <AnimatedSection className="sp-section">
              <div className="sp-eyebrow">
                Case Study
              </div>
              <div
                className="markdown-content sp-body-text"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(project.content),
                }}
              />
            </AnimatedSection>
          )}

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <AnimatedSection className="sp-section">
              <div className="sp-eyebrow">
                Screenshots
              </div>
              <h2 className="sp-h2 sp-gallery-title">
                Visual walkthrough
              </h2>
              <p className="sp-gallery-hint">
                Click any image to view full-size.
              </p>
              <Lightbox images={project.gallery} />
            </AnimatedSection>
          )}

          {/* Tech Stack */}
          {project.stack && project.stack.length > 0 && (
            <AnimatedSection className="sp-section">
              <div className="sp-stack-header">
                <div>
                  <div className="sp-eyebrow">
                    Tech Stack
                  </div>
                  <h2 className="sp-h2">
                    Tools &amp; Technologies
                  </h2>
                </div>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-accent"
                  >
                    View Live Project ↗
                  </a>
                )}
              </div>
              <div className="sp-stack-pills">
                {project.stack.map((s) => (
                  <span key={s} className="tag sp-stack-pill">
                    {s}
                  </span>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      {/* PREV / NEXT */}
      {(prevProject || nextProject) && (
        <div className="sp-nav-grid">
          {prevProject && (
            <Link href={`/portfolio/${prevProject.slug}`} className="sp-nav-item">
              <span className="sp-nav-dir">← Previous Project</span>
              <span className="sp-nav-title">{prevProject.title}</span>
            </Link>
          )}
          {nextProject && (
            <Link href={`/portfolio/${nextProject.slug}`} className="sp-nav-item sp-next">
              <span className="sp-nav-dir">Next Project →</span>
              <span className="sp-nav-title">{nextProject.title}</span>
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
