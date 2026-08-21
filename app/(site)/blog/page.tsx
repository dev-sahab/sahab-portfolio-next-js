import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import AnimatedSection from "@/components/site/AnimatedSection";
import connectDB from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import "@/models/Category";
import "@/models/Tag";
import { formatDate } from "@/lib/utils";
import type { BlogPost as IPost } from "@/types";
import "@/styles/pages/(site)/blog/blog.scss";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  await connection();
  let posts: IPost[] = [];
  try {
    await connectDB();
    posts = (await BlogPost.find({ published: true })
      .sort({ createdAt: -1 })
      .populate("category")
      .lean()) as unknown as IPost[];
  } catch {}

  return (
    <main>
      <section className="page-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div className="blog-breadcrumb">
              <Link href="/">
                Home
              </Link>
              <span>/</span>
              <span>Blog</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="h-xl">
              The <span className="accent-word">Blog</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection from="fade">
            <p className="blog-hero-desc">
              Thoughts on WordPress, web development, freelancing and the modern
              web.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          {posts.length === 0 ? (
            <div className="blog-empty">
              <p>No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="d-flex flex-col gap-3">
              {posts.map((post, i) => (
                <AnimatedSection key={post._id} delay={i * 0.04}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="blog-list-item"
                  >
                    <div className="blog-list-item-thumb">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="200px"
                          className="blog-list-item-thumb-img"
                        />
                      ) : (
                        (post.category?.name || "??").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="blog-list-item-body">
                      <div className="blog-list-item-meta">
                        <span className="accent">
                          {post.category?.name || "Uncategorized"}
                        </span>
                        <span>·</span>
                        <span>{post.readTime || 5} min read</span>
                        <span>·</span>
                        <span>
                          {post.createdAt ? formatDate(post.createdAt) : ""}
                        </span>
                      </div>
                      <div className="blog-list-item-title">
                        {post.title}
                      </div>
                      <p className="blog-list-item-excerpt">
                        {post.excerpt}
                      </p>
                      <span className="blog-list-item-cta">
                        Read Article →
                      </span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
