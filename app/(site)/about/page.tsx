import type { Metadata } from "next";
import Link from "next/link";
import AnimatedSection from "@/components/site/AnimatedSection";
import SkillBar from "@/components/site/SkillBar";
import { getSiteSettings } from "@/lib/publicData";
import type { SiteSettings as ISettings } from "@/types";
import Image from "next/image";
import "@/styles/pages/(site)/about/about.scss";

export const metadata: Metadata = { title: "About" };
export const revalidate = 3600;

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
  const s = (await getSiteSettings()) as ISettings | null;

  return (
    <main>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div className="about-breadcrumb">
              <Link href="/">Home</Link>
              <span className="about-breadcrumb-sep">/</span>
              <span>About</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="h-xl">
              About <span className="accent-word">Me</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection from="fade">
            <p className="about-hero-desc">
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
      <section className="section-pad about-split-section">
        <div className="container">
          <div className="about-split-grid">
            {/* Image side */}
            <AnimatedSection from="left">
              <div className="relative">
                <div className="about-photo-frame">
                  <Image
                    src="/images/profile/shahabuddin.png"
                    alt="Sahab Uddin Mintu"
                    fill
                    priority
                    className="about-photo-img"
                  />
                </div>

                <div className="about-location-badge">
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
                <h2 className="h-lg about-story-title">
                  I obsess over clean code and experiences that{" "}
                  <span className="accent-word">convert</span>.
                </h2>
              </AnimatedSection>
              <AnimatedSection from="fade">
                <div className="about-story-text mb-5">
                  <p>
                    {s?.bio ||
                      "Currently a Professional CMS Developer at PIXELVEGA, I've shipped 100+ projects across WordPress, Webflow, Wix and Framer — pairing pixel-perfect Figma translations with clean, scalable code."}
                  </p>
                  <p>
                    I write custom Elementor widgets, build Webflow CMS systems,
                    integrate Memberstack, Stripe, Airtable & Make.com, and ship
                    full-stack MERN apps when needed.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection from="fade">
                <div className="about-tag-list">
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
                <div className="d-flex flex-wrap gap-3">
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

      {/* INFO GRID */}
      <section className="about-bordered-section">
        <div className="container">
          <AnimatedSection>
            <div className="about-meta-grid">
              <div className="about-meta-item">
                <div className="about-meta-key">Role</div>
                <div className="about-meta-value">
                  WordPress &amp; MERN Developer
                </div>
              </div>
              <div className="about-meta-item">
                <div className="about-meta-key">Company</div>
                <div className="about-meta-value">
                  {s?.company || "PIXELVEGA"}
                </div>
              </div>
              <div className="about-meta-item">
                <div className="about-meta-key">Experience</div>
                <div className="about-meta-value">6+ years</div>
              </div>
              <div className="about-meta-item">
                <div className="about-meta-key">Location</div>
                <div className="about-meta-value">
                  {s?.location || "Sylhet, Bangladesh"}
                </div>
              </div>
              <div className="about-meta-item">
                <div className="about-meta-key">Languages</div>
                <div className="about-meta-value">EN · BN · HI</div>
              </div>
              <div className="about-meta-item">
                <div className="about-meta-key">Availability</div>
                <div className="about-meta-value">
                  {s?.availabilityText || "Freelance & Contracts"}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="about-bordered-section">
        <div className="container">
          <AnimatedSection>
            <span className="s-label">Experience</span>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="h-lg about-section-heading">
              My <span className="accent-word">Journey</span>
            </h2>
          </AnimatedSection>
          <div>
            {timeline.map((t) => (
              <AnimatedSection key={t.year} className="about-timeline-item">
                <div className="about-timeline-year">{t.year}</div>
                <div>
                  <h4 className="about-timeline-title mb-1">{t.title}</h4>
                  <div className="about-timeline-company">{t.company}</div>
                  <p className="about-timeline-desc">{t.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section className="about-shaded-section">
        <div className="container">
          <AnimatedSection>
            <span className="s-label">Skills</span>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="h-lg about-section-heading">
              What I <span className="accent-word">build</span> with
            </h2>
          </AnimatedSection>
          <div className="about-skills-grid">
            {skillGroups.map((group) => (
              <AnimatedSection key={group.name}>
                <h3 className="about-skill-group-title">{group.name}</h3>
                <div className="d-flex flex-col about-skill-list">
                  {group.skills.map((skill) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                    />
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container about-cta-inner text-center">
          <AnimatedSection>
            <span className="s-label justify-center">
              Let's Work Together
            </span>
            <h2 className="cta-title">
              Ready to <span className="accent-word">build</span> something?
            </h2>
            <p className="cta-sub">
              Open for new projects, part-time contracts, and full-time
              opportunities.
            </p>
            <div className="d-flex justify-center flex-wrap about-cta-buttons">
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
