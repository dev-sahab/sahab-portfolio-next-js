import type { Metadata } from "next";
import { connection } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Category from "@/models/Category";
import "@/models/Tag";
import PortfolioFilter from "@/components/site/PortfolioFilter";
import AnimatedSection from "@/components/site/AnimatedSection";
import Link from "next/link";
import type { Project as IProject, Category as ICategory } from "@/types";
import "./portfolio.scss";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  await connection();
  let projects: IProject[] = [];
  let categories: ICategory[] = [];
  try {
    await connectDB();
    [projects, categories] = await Promise.all([
      Project.find({ published: true })
        .sort({ featured: -1, createdAt: -1 })
        .populate("category")
        .populate("tags")
        .lean() as unknown as IProject[],
      Category.find({ type: "project" })
        .sort({ name: 1 })
        .lean() as unknown as ICategory[],
    ]);
  } catch {}

  const projectsData = JSON.parse(JSON.stringify(projects)) as IProject[];
  const categoriesData = JSON.parse(JSON.stringify(categories)) as ICategory[];

  return (
    <main>
      <section className="page-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div className="pf-breadcrumb">
              <Link href="/">
                Home
              </Link>
              <span className="pf-breadcrumb-sep">/</span>
              <span>Portfolio</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="h-xl">
              Selected <span className="accent-word">Work</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection from="fade">
            <p className="pf-hero-desc">
              A curated collection — WordPress, Webflow, MERN and more.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="container">
        {projects.length === 0 ? (
          <div className="pf-empty">
            <p>
              Projects coming soon. Check back later!
            </p>
          </div>
        ) : (
          <PortfolioFilter
            projects={projectsData}
            categories={categoriesData}
          />
        )}
      </div>

      <section className="pf-cta-section">
        <div className="container">
          <AnimatedSection>
            <span className="s-label">
              Your project next
            </span>
            <h2 className="h-xl">
              Got an <span className="accent-word">idea?</span>
            </h2>
            <p className="pf-cta-desc">
              Let's turn your vision into a live, high-performance product.
            </p>
            <Link href="/contact" className="btn btn-accent">
              Start a Project →
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
