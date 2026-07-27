"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/types";

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
        style={{ overflow: "hidden", cursor: "grab", marginTop: 52 }}
        onMouseEnter={() => {
          if (autoRef.current !== null) {
            clearInterval(autoRef.current);
          }
        }}
        onMouseLeave={resetAuto}
      >
        <div
          ref={trackRef}
          className="testi-slider-track"
          style={{ willChange: "transform" }}
        >
          {testimonials.map((t) => (
            <div key={t._id} className="testi-slide">
              <div className="testi-card">
                <div
                  className="testi-stars"
                  style={{
                    color: "var(--accent)",
                    fontSize: 13,
                    letterSpacing: 2,
                    marginBottom: 17,
                  }}
                >
                  {"★".repeat(t.rating)}
                </div>
                <p
                  className="testi-text"
                  style={{
                    fontSize: 15,
                    lineHeight: 1.78,
                    color: "var(--text2)",
                    fontStyle: "italic",
                    marginBottom: 24,
                  }}
                >
                  "{t.content}"
                </p>
                <div
                  className="testi-author"
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      overflow: "hidden",
                      position: "relative",
                      background: "var(--surface2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--f-d)",
                      fontWeight: 700,
                      fontSize: 17,
                      color: "var(--accent)",
                    }}
                  >
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        sizes="42px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : t.name[0]}
                  </div>
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--f-m)",
                        fontSize: 10,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 24,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {dots.map((_, i) => (
            <button
              key={i}
              className={`testi-dot${i === current ? " active" : ""}`}
              onClick={() => {
                goTo(i);
                resetAuto();
              }}
              aria-label={`Slide ${i + 1}`}
              style={{ transition: "background .28s, width .32s var(--ease)" }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            height: 1,
            background: "var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              background: "var(--accent)",
              transition: `width ${DUR}ms linear`,
              width: "100%",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
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
              style={{
                width: 42,
                height: 42,
                border: "1px solid var(--border2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text2)",
                background: "transparent",
                transition: "all .28s",
                fontSize: 16,
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
