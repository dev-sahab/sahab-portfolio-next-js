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
      <section
        style={{
          padding: "136px var(--px) 54px",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div
              style={{
                fontFamily: "var(--f-m)",
                fontSize: 10,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Link href="/" style={{ color: "var(--muted)" }}>
                Home
              </Link>
              <span>/</span>
              <Link href="/portfolio" style={{ color: "var(--muted)" }}>
                Portfolio
              </Link>
              <span>/</span>
              <span>{project.title}</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
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
            <h1
              style={{
                fontFamily: "var(--f-d)",
                fontWeight: 800,
                fontSize: "clamp(36px,6.2vw,88px)",
                lineHeight: 0.94,
                letterSpacing: "-.04em",
                marginBottom: 26,
              }}
            >
              {project.title}
            </h1>
          </AnimatedSection>
          <AnimatedSection from="fade">
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 34,
              }}
            >
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
            <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
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
      <div style={{ padding: "0 var(--px)" }}>
        <div
          style={{
            maxWidth: "calc(var(--max) + var(--px)*2)",
            margin: "0 auto",
          }}
        >
          {/* Featured image placeholder */}
          <AnimatedSection>
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                background:
                  "linear-gradient(135deg, var(--surface), var(--surface2))",
                borderRadius: "var(--r)",
                overflow: "hidden",
                margin: "54px 0",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--f-d)",
                fontWeight: 800,
                fontSize: 80,
                color: "var(--border2)",
                letterSpacing: "-.04em",
              }}
            >
              {project.coverImage ? (
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                (project.category?.name || '??').slice(0, 2).toUpperCase()
              )}
            </div>
          </AnimatedSection>

          {/* Overview */}
          <AnimatedSection
            style={{ padding: "68px 0", borderTop: "1px solid var(--border)" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 68,
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--f-m)",
                    fontSize: 10,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: 12,
                  }}
                >
                  Project Overview
                </div>
                <h2
                  style={{
                    fontFamily: "var(--f-d)",
                    fontWeight: 700,
                    fontSize: "clamp(20px,2.6vw,36px)",
                    letterSpacing: "-.02em",
                    marginBottom: 20,
                  }}
                >
                  About this project
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text2)",
                    lineHeight: 1.84,
                  }}
                >
                  {project.excerpt}
                </p>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--f-m)",
                    fontSize: 10,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: 12,
                  }}
                >
                  Details
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  {[
                    ["Category", project.category?.name || "Uncategorized"],
                    ["Year", project.year],
                    ["Client", project.client ? "Client Project" : "Personal Project"],
                    ["Duration", project.duration || "N/A"],
                  ].map(([k, v]) => (
                    <div
                      key={k as string}
                      style={{
                        background: "var(--surface)",
                        padding: "16px 18px",
                        borderRadius: "var(--r)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--f-m)",
                          fontSize: 9,
                          letterSpacing: ".18em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          marginBottom: 5,
                        }}
                      >
                        {k}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
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
            <AnimatedSection
              style={{
                padding: "0 0 68px",
                borderTop: "1px solid var(--border)",
                paddingTop: 68,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--f-m)",
                  fontSize: 10,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 12,
                }}
              >
                Case Study
              </div>
              <div
                className="markdown-content"
                style={{
                  fontSize: 15,
                  color: "var(--text2)",
                  lineHeight: 1.84,
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(project.content),
                }}
              />
            </AnimatedSection>
          )}

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <AnimatedSection
              style={{
                padding: "0 0 68px",
                borderTop: "1px solid var(--border)",
                paddingTop: 68,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--f-m)",
                  fontSize: 10,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 12,
                }}
              >
                Screenshots
              </div>
              <h2
                style={{
                  fontFamily: "var(--f-d)",
                  fontWeight: 700,
                  fontSize: "clamp(20px,2.6vw,36px)",
                  letterSpacing: "-.02em",
                  marginBottom: 10,
                }}
              >
                Visual walkthrough
              </h2>
              <p style={{ fontSize: 14, color: "var(--text2)" }}>
                Click any image to view full-size.
              </p>
              <Lightbox images={project.gallery} />
            </AnimatedSection>
          )}

          {/* Tech Stack */}
          {project.stack && project.stack.length > 0 && (
            <AnimatedSection
              style={{
                padding: "0 0 68px",
                borderTop: "1px solid var(--border)",
                paddingTop: 68,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 40,
                  flexWrap: "wrap",
                  marginBottom: 30,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--f-m)",
                      fontSize: 10,
                      letterSpacing: ".18em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      marginBottom: 12,
                    }}
                  >
                    Tech Stack
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--f-d)",
                      fontWeight: 700,
                      fontSize: "clamp(20px,2.6vw,36px)",
                      letterSpacing: "-.02em",
                    }}
                  >
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
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
