import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import Marquee from "@/components/site/Marquee";
import AnimatedSection from "@/components/site/AnimatedSection";
import TestimonialSlider from "@/components/site/TestimonialSlider";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import BlogPost from "@/models/BlogPost";
import "@/models/Category";
import "@/models/Tag";
import Testimonial from "@/models/Testimonial";
import SiteSettings from "@/models/SiteSettings";
import type {
  Project as IProject,
  BlogPost as IBlogPost,
  Testimonial as ITestimonial,
  SiteSettings as ISettings,
} from "@/types";
import "./page.scss";

async function getData() {
  try {
    await connectDB();
    const [projects, posts, testimonials, settings] = await Promise.all([
      Project.find({ published: true })
        .sort({ featured: -1, createdAt: -1 })
        .limit(4)
        .populate("category")
        .populate("tags")
        .lean(),
      BlogPost.find({ published: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("category")
        .lean(),
      Testimonial.find({ featured: true }).sort({ order: 1 }).lean(),
      SiteSettings.findOne().lean(),
    ]);
    return { projects, posts, testimonials, settings };
  } catch {
    return { projects: [], posts: [], testimonials: [], settings: null };
  }
}

export default async function HomePage() {
  await connection();
  const { projects, posts, testimonials, settings } = await getData();
  const testimonialData = (testimonials as any[]).map((testimonial) => ({
    ...testimonial,
    _id: testimonial._id.toString(),
    createdAt: testimonial.createdAt?.toISOString(),
  })) as ITestimonial[];

  const s = settings as unknown as ISettings | null;
  const stats = s?.stats?.length
    ? s.stats
    : [
        { value: "6+", label: "Years Experience", target: 6, suffix: "+" },
        { value: "100+", label: "Projects Shipped", target: 100, suffix: "+" },
        { value: "60+", label: "Happy Clients", target: 60, suffix: "+" },
        { value: "5", label: "CMS Platforms", target: 5, suffix: "" },
      ];

  return (
    <main>
      {/* ── HERO ── */}
      <section id="hero">
        <div className="home-hero-bg">
          <div className="home-hero-dots" />
          <div className="home-hero-glow" />
        </div>

        <div className="home-hero-topbar">
          <AnimatedSection from="fade" className="home-hero-badge">
            <span className="home-hero-badge-dot" />
            {s?.availabilityText || "Available for new projects"}
          </AnimatedSection>
          <AnimatedSection from="fade" className="home-hero-right-info">
            <p>
              <strong>{s?.location || "Sylhet, Bangladesh"}</strong>
              <br />
              {s?.company || "PIXELVEGA"}
              <br />
              {s?.tagline || "WordPress & MERN Developer"}
            </p>
          </AnimatedSection>
        </div>

        <h1 className="hero-name">
          <AnimatedSection as="span" from="bottom" className="home-hero-line1">
            Sahab
          </AnimatedSection>
          <AnimatedSection
            as="span"
            className="line2"
            from="bottom"
            delay={0.13}
          >
            Uddin.
          </AnimatedSection>
        </h1>

        <div className="hero-bottom-bar">
          <AnimatedSection from="bottom" delay={0.2}>
            <p className="home-hero-desc">
              {s?.bio?.slice(0, 160) ||
                "WordPress & MERN developer turning Figma into pixel-perfect, high-converting websites. Available for freelance worldwide."}
            </p>
            <div className="home-hero-cta-row">
              <Link href="/portfolio" className="btn btn-accent">
                View Work ↓
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Start a Project
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection
            from="fade"
            className="home-hero-scroll-indicator"
            aria-hidden="true"
          >
            <div className="home-hero-scroll-bar">
              <div className="home-hero-scroll-drop" />
            </div>
            <span className="home-hero-scroll-label">scroll</span>
          </AnimatedSection>

          <AnimatedSection
            from="bottom"
            delay={0.2}
            className="home-hero-stats-col"
          >
            {stats.map((st) => (
              <p key={st.label} className="home-hero-stat-row">
                {st.label}{" "}
                <span className="home-hero-stat-val">{st.value}</span>
              </p>
            ))}
          </AnimatedSection>
        </div>
      </section>

      <Marquee />

      {/* ── STATS ── */}
      <div className="stats-bar">
        {stats.map((st) => (
          <div key={st.label} className="stat-cell">
            <div className="stat-num">{st.value}</div>
            <div className="stat-lbl">{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section className="section-pad home-border-top">
        <div className="container">
          <AnimatedSection>
            <span className="s-label">What I Do</span>
          </AnimatedSection>
          <div className="home-section-header-row">
            <AnimatedSection>
              <h2 className="h-xl">
                My <span className="accent-word">Services</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection from="fade">
              <Link href="/contact" className="home-services-link">
                Let's discuss →
              </Link>
            </AnimatedSection>
          </div>
          <div className="services-grid">
            {(s?.services?.length
              ? s.services
              : [
                  {
                    icon: "⚡",
                    title: "WordPress Development",
                    description:
                      "Custom themes, plugins, Elementor widgets, WooCommerce — built from your Figma file.",
                    tags: ["WordPress", "PHP", "Elementor", "WooCommerce"],
                    order: 1,
                  },
                  {
                    icon: "🎨",
                    title: "Webflow & Framer",
                    description:
                      "CMS collections, animations, Memberstack gating and Make.com automations.",
                    tags: ["Webflow", "Framer", "CMS", "Memberstack"],
                    order: 2,
                  },
                  {
                    icon: "🚀",
                    title: "MERN Stack Apps",
                    description:
                      "Full-stack apps with React, Node.js, MongoDB and Express. JWT auth, REST APIs.",
                    tags: ["React", "Node.js", "MongoDB", "REST API"],
                    order: 3,
                  },
                ]
            )
              .sort((a, b) => a.order - b.order)
              .map((svc, i) => (
                <AnimatedSection
                  key={i}
                  delay={i * 0.08}
                  className="service-card"
                >
                  <div className="home-service-index">0{i + 1}</div>
                  <div className="home-service-icon">{svc.icon}</div>
                  <h3 className="home-service-title">{svc.title}</h3>
                  <p className="home-service-desc">{svc.description}</p>
                  <div className="home-tag-row">
                    {svc.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </AnimatedSection>
              ))}
          </div>
        </div>
      </section>

      {/* ── WORK ── */}
      <section className="section-pad home-border-top">
        <div className="container">
          <div className="home-section-header-row">
            <div>
              <AnimatedSection>
                <span className="s-label">Selected Work</span>
              </AnimatedSection>
              <AnimatedSection>
                <h2 className="h-xl">
                  Recent <span className="accent-word">Projects</span>
                </h2>
              </AnimatedSection>
            </div>
            <AnimatedSection>
              <Link href="/portfolio" className="btn btn-outline">
                View All →
              </Link>
            </AnimatedSection>
          </div>
          <div className="work-grid">
            {(projects as unknown as IProject[]).map((p, i) => (
              <AnimatedSection key={p._id} delay={i * 0.06}>
                <Link href={`/portfolio/${p.slug}`} className="project-card">
                  <div className="home-project-thumb">
                    {p.coverImage ? (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="home-cover-img"
                      />
                    ) : (
                      (p.category?.name || "??").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="home-project-body">
                    <div className="home-project-meta">
                      {String(i + 1).padStart(2, "0")} / {p.year}
                    </div>
                    <h3 className="home-project-title">{p.title}</h3>
                    <p className="home-project-excerpt">{p.excerpt}</p>
                    <div className="home-project-footer">
                      <div className="home-tag-row">
                        {p.tags.slice(0, 2).map((t: any) => (
                          <span key={t._id} className="tag">
                            {t.name}
                          </span>
                        ))}
                      </div>
                      <div className="home-project-arrow">↗</div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="section-pad home-testimonials-section">
          <div className="container">
            <AnimatedSection>
              <span className="s-label">Client Stories</span>
            </AnimatedSection>
            <AnimatedSection>
              <h2 className="h-xl">
                What <span className="accent-word">clients</span> say
              </h2>
            </AnimatedSection>
            <TestimonialSlider testimonials={testimonialData} />
          </div>
        </section>
      )}

      {/* ── BLOG ── */}
      {posts.length > 0 && (
        <section className="section-pad home-border-top">
          <div className="container">
            <div className="home-section-header-row">
              <div>
                <AnimatedSection>
                  <span className="s-label">Latest Writing</span>
                </AnimatedSection>
                <AnimatedSection>
                  <h2 className="h-xl">
                    From the <span className="accent-word">Blog</span>
                  </h2>
                </AnimatedSection>
              </div>
              <AnimatedSection>
                <Link href="/blog" className="btn btn-outline">
                  All Articles →
                </Link>
              </AnimatedSection>
            </div>
            <div className="blog-grid">
              {(posts as unknown as IBlogPost[]).map((post, i) => (
                <AnimatedSection key={post._id} delay={i * 0.06}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="home-blog-card"
                  >
                    <div className="home-blog-thumb">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="home-cover-img"
                        />
                      ) : (
                        (post.category?.name || "??").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="home-blog-body">
                      <div className="home-blog-meta">
                        <span className="home-blog-cat">
                          {post.category?.name || "Uncategorized"}
                        </span>
                        <span>·</span>
                        <span>{post.readTime || 5} min read</span>
                      </div>
                      <h3 className="home-blog-title">{post.title}</h3>
                      <p className="home-blog-excerpt">{post.excerpt}</p>
                      <span className="home-blog-readmore">Read →</span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container home-cta-container">
          <AnimatedSection className="home-cta-inner">
            <span className="s-label justify-center">Let's Collaborate</span>
            <h2 className="cta-title">
              Have an <span className="accent-word">idea?</span>
              <br />
              Let's build it.
            </h2>
            <p className="home-cta-desc">
              Open for freelance projects, consulting & full-time roles. Reply
              within 24 hours.
            </p>
            <div className="home-cta-btns">
              <Link href="/get-quote" className="btn btn-accent">
                Get a Free Quote →
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Start a Project
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
