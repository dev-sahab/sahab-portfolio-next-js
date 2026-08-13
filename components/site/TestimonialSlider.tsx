"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/types";
import "./TestimonialSlider.scss";

export default function TestimonialSlider({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DUR = 5000;

  const pv = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const maxIdx = () => Math.max(0, testimonials.length - pv());

  const goTo = async (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, maxIdx()));
    setCurrent(clamped);
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector(".testi-slide") as HTMLElement;
    if (!slide) return;
    const sw = slide.getBoundingClientRect().width + 2;
    const { gsap } = await import("gsap");
    gsap.to(track, {
      x: -(clamped * sw),
      duration: 0.55,
      ease: "power3.inOut",
      overwrite: true,
    });
    track.querySelectorAll(".testi-slide").forEach((s, i) => {
      s.classList.toggle("dim", i < clamped || i >= clamped + pv());
    });
  };

  const next = () => {
    const n = current >= maxIdx() ? 0 : current + 1;
    goTo(n);
  };
  const prev = () => {
    const n = current <= 0 ? maxIdx() : current - 1;
    goTo(n);
  };

  const resetAuto = () => {
    if (autoRef.current !== null) {
      clearInterval(autoRef.current);
    }

    autoRef.current = setInterval(next, DUR);
  };

  useEffect(() => {
    resetAuto();
    return () => {
      if (autoRef.current !== null) {
        clearInterval(autoRef.current);
      }
    };
  }, [current, testimonials.length]);

  useEffect(() => {
    const handleResize = () => goTo(Math.min(current, maxIdx()));
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [current]);

  const dots = Array.from({ length: maxIdx() + 1 });

  return (
    <div>
      <div
        ref={outerRef}
        className="testi-outer"
        onMouseEnter={() => {
          if (autoRef.current !== null) {
            clearInterval(autoRef.current);
          }
        }}
        onMouseLeave={resetAuto}
      >
        <div ref={trackRef} className="testi-slider-track">
          {testimonials.map((t) => (
            <div key={t._id} className="testi-slide">
              <div className="testi-card">
                <div className="testi-stars">{"★".repeat(t.rating)}</div>
                <p className="testi-text">"{t.content}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        sizes="42px"
                        className="testi-avatar-img"
                      />
                    ) : t.name[0]}
                  </div>
                  <div>
                    <div className="testi-author-name">{t.name}</div>
                    <div className="testi-author-role">
                      {t.role}
                      {t.company ? `, ${t.company}` : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="testi-controls">
        <div className="testi-dots">
          {dots.map((_, i) => (
            <button
              key={i}
              className={`testi-dot${i === current ? " active" : ""}`}
              onClick={() => {
                goTo(i);
                resetAuto();
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="testi-progress-track">
          <div className="testi-progress-fill" />
        </div>
        <div className="testi-nav-btns">
          {[
            { fn: prev, icon: "←" },
            { fn: next, icon: "→" },
          ].map(({ fn, icon }) => (
            <button
              key={icon}
              onClick={() => {
                fn();
                resetAuto();
              }}
              className="testi-arrow"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
