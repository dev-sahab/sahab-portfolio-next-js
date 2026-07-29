import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import "@/models/Category";
import "@/models/Tag";
import AnimatedSection from "@/components/site/AnimatedSection";
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
    return { title: p.title, description: p.excerpt };
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
  try {
    await connectDB();
    project = (await Project.findOne({
      slug,
      published: true,
    })
      .populate("category")
      .populate("tags")
      .lean()) as unknown as IProject;
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
              <span className="tag green">{project.category.name}</span>
              <span className="tag">{project.year}</span>
              {project.client && (
                <span className="tag">Client: {project.client}</span>
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
                project.category.name.slice(0, 2).toUpperCase()
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
                    ["Category", project.category.name],
                    ["Year", project.year],
                    ["Client", project.client || "Confidential"],
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
                style={{
                  fontSize: 15,
                  color: "var(--text2)",
                  lineHeight: 1.84,
                  whiteSpace: "pre-wrap",
                }}
              >
                {project.content}
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      {/* NAV */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Link
          href="/portfolio"
          style={{
            padding: "36px var(--px)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            transition: "background .3s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--f-m)",
              fontSize: 10,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 7,
            }}
          >
            ← Back to Portfolio
          </span>
          <span
            style={{
              fontFamily: "var(--f-d)",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-.01em",
            }}
          >
            All Projects
          </span>
        </Link>
        <Link
          href="/contact"
          style={{
            padding: "36px var(--px)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right",
            transition: "background .3s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--f-m)",
              fontSize: 10,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 7,
            }}
          >
            Start a Project →
          </span>
          <span
            style={{
              fontFamily: "var(--f-d)",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-.01em",
            }}
          >
            Work with me
          </span>
        </Link>
      </div>
    </main>
  );
}
