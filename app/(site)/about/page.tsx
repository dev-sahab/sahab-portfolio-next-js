import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import AnimatedSection from "@/components/site/AnimatedSection";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import type { SiteSettings as ISettings } from "@/types";
import Image from "next/image";

export const metadata: Metadata = { title: "About" };

async function getSettings(): Promise<ISettings | null> {
  try {
    await connectDB();
    return (await SiteSettings.findOne().lean()) as unknown as ISettings;
  } catch {
    return null;
  }
}

const timeline = [
  {
    year: "2024–Now",
    title: "Professional CMS Developer",
    company: "PIXELVEGA · Full-time",
    desc: "Leading WordPress, Webflow and Framer builds for global clients. Plugin development, performance optimization, team mentorship.",
  },
  {
    year: "2022–2024",
    title: "Freelance Web Developer",
    company: "Upwork · Top-Rated",
    desc: "Delivered 50+ projects across WordPress, Elementor, WooCommerce and custom PHP. 5-star average across 40+ reviews.",
  },
  {
    year: "2020–2022",
    title: "Junior WordPress Developer",
    company: "Local Agency · Bangladesh",
    desc: "Built WordPress sites, custom themes and plugins for SME clients. Learned WooCommerce, SEO and client communication.",
  },
  {
    year: "2019",
    title: "Started Coding",
    company: "Self-taught",
    desc: "First website: hand-coded HTML/CSS personal page. Found a passion for building on the web.",
  },
];

const skillGroups = [
  {
    name: "CMS & Builders",
    skills: [
      { name: "WordPress", level: 96 },
      { name: "Webflow", level: 94 },
      { name: "Elementor", level: 96 },
      { name: "WooCommerce", level: 90 },
      { name: "Framer", level: 82 },
    ],
  },
  {
    name: "Frontend Dev",
    skills: [
      { name: "HTML5 / CSS3", level: 96 },
      { name: "JavaScript ES6+", level: 88 },
      { name: "React / Next.js", level: 82 },
      { name: "Tailwind CSS", level: 92 },
      { name: "GSAP Animations", level: 78 },
    ],
  },
  {
    name: "Backend & DB",
    skills: [
      { name: "Node.js", level: 80 },
      { name: "MongoDB", level: 78 },
      { name: "REST APIs", level: 86 },
      { name: "MySQL", level: 80 },
    ],
  },
  {
    name: "Tools",
    skills: [
      { name: "Make.com", level: 88 },
      { name: "Stripe", level: 86 },
      { name: "Git / GitHub", level: 88 },
      { name: "Figma", level: 84 },
    ],
  },
];

export default async function AboutPage() {
  await connection();
  const s = await getSettings();

  return (
    <main>
      {/* PAGE HERO */}
      <section className="page-hero">
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
                marginBottom: 17,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Link
                href="/"
                style={{ color: "var(--muted)", transition: "color .3s" }}
              >
                Home
              </Link>
              <span style={{ color: "var(--border2)" }}>/</span>
              <span>About</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="h-xl">
              About <span className="accent-word">Me</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection from="fade">
            <p
              style={{
                fontSize: 16,
                color: "var(--text2)",
                maxWidth: 540,
                marginTop: 17,
                lineHeight: 1.72,
              }}
            >
              Developer, builder, and detail obsessive based in{" "}
              {s?.location || "Sylhet, Bangladesh"}.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        {[
          ["6+", "Years Experience"],
          ["100+", "Projects Shipped"],
          ["60+", "Happy Clients"],
          ["5★", "Average Rating"],
        ].map(([v, l]) => (
          <div key={l} className="stat-cell">
            <div className="stat-num">{v}</div>
            <div className="stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      {/* SPLIT */}
      <section
        className="section-pad"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 88,
              alignItems: "center",
            }}
          >
            {/* Image side */}
            <AnimatedSection from="left">
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "3/4",
                    overflow: "hidden",
                    borderRadius: "var(--r)",
                  }}
                >
                  <Image
                    src="/images/profile/shahabuddin.png"
                    alt="Sahab Uddin Mintu"
                    fill
                    priority
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: -18,
                    left: -18,
                    background: "var(--accent)",
                    color: "var(--bg)",
                    padding: "18px 22px",
                    borderRadius: "var(--r)",
                    fontFamily: "var(--f-m)",
                    fontSize: 10,
                    letterSpacing: ".12em",
                    lineHeight: 1.8,
                  }}
                >
                  {s?.location || "Sylhet, Bangladesh"}
                  <br />
                  Open to freelance ✦
                </div>
              </div>
            </AnimatedSection>

            {/* Text side */}
            <div>
              <AnimatedSection>
                <span className="s-label">My Story</span>
              </AnimatedSection>
              <AnimatedSection>
                <h2 className="h-lg" style={{ marginBottom: 20 }}>
                  I obsess over clean code and experiences that{" "}
                  <span className="accent-word">convert</span>.
                </h2>
              </AnimatedSection>
              <AnimatedSection from="fade">
                <div
                  style={{
                    fontSize: 15,
                    color: "var(--text2)",
                    lineHeight: 1.84,
                    marginBottom: 24,
                  }}
                >
                  <p style={{ marginBottom: 13 }}>
                    {s?.bio ||
                      "Currently a Professional CMS Developer at PIXELVEGA, I've shipped 100+ projects across WordPress, Webflow, Wix and Framer — pairing pixel-perfect Figma translations with clean, scalable code."}
                  </p>
                  <p style={{ marginBottom: 13 }}>
                    I write custom Elementor widgets, build Webflow CMS systems,
                    integrate Memberstack, Stripe, Airtable & Make.com, and ship
                    full-stack MERN apps when needed.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection from="fade">
                <div
                  style={{
                    display: "flex",
                    gap: 9,
                    flexWrap: "wrap",
                    marginBottom: 28,
                  }}
                >
                  {[
                    "WordPress",
                    "Webflow",
                    "React",
                    "Node.js",
                    "Figma",
                    "WooCommerce",
                    "Framer",
                    "Elementor",
                  ].map((t) => (
                    <span key={t} className="tag green">
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/contact" className="btn btn-accent">
                    Work With Me →
                  </Link>
                  <Link href="/portfolio" className="btn btn-outline">
                    See My Work
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section
        style={{ borderTop: "1px solid var(--border)", padding: "80px 0" }}
      >
        <div className="container">
          <AnimatedSection>
            <span className="s-label">Experience</span>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="h-lg" style={{ marginBottom: 44 }}>
              My <span className="accent-word">Journey</span>
            </h2>
          </AnimatedSection>
          <div>
            {timeline.map((t) => (
              <AnimatedSection
                key={t.year}
                style={{
                  display: "grid",
                  gridTemplateColumns: "108px 1fr",
                  gap: 34,
                  padding: "30px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--f-d)",
                    fontWeight: 800,
                    fontSize: 18,
                    color: "var(--accent)",
                    letterSpacing: "-.01em",
                  }}
                >
                  {t.year}
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--f-d)",
                      fontWeight: 600,
                      fontSize: 18,
                      letterSpacing: "-.01em",
                      marginBottom: 4,
                    }}
                  >
                    {t.title}
                  </h4>
                  <div
                    style={{
                      fontFamily: "var(--f-m)",
                      fontSize: 10,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: 7,
                    }}
                  >
                    {t.company}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text2)",
                      lineHeight: 1.72,
                    }}
                  >
                    {t.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "80px 0",
        }}
      >
        <div className="container">
          <AnimatedSection>
            <span className="s-label">Skills</span>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="h-lg" style={{ marginBottom: 44 }}>
              What I <span className="accent-word">build</span> with
            </h2>
          </AnimatedSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 60,
            }}
          >
            {skillGroups.map((group) => (
              <AnimatedSection key={group.name}>
                <h3
                  style={{
                    fontFamily: "var(--f-m)",
                    fontSize: 10,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 20,
                  }}
                >
                  {group.name}
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {group.skills.map((skill) => (
                    <div key={skill.name}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        <span>{skill.name}</span>
                        <span
                          style={{
                            fontFamily: "var(--f-m)",
                            fontSize: 11,
                            color: "var(--accent)",
                          }}
                        >
                          {skill.level}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 2,
                          background: "var(--border2)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="skill-fill"
                          style={
                            { "--w": `${skill.level}%` } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div
          className="container"
          style={{ position: "relative", zIndex: 1, textAlign: "center" }}
        >
          <AnimatedSection>
            <span className="s-label" style={{ justifyContent: "center" }}>
              Let's Work Together
            </span>
            <h2 className="cta-title">
              Ready to <span className="accent-word">build</span> something?
            </h2>
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 36,
              }}
            >
              <Link href="/contact" className="btn btn-accent">
                Get In Touch →
              </Link>
              <Link href="/portfolio" className="btn btn-outline">
                View My Work
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
