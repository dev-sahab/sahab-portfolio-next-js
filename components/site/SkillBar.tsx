"use client";
import { useEffect, useRef } from "react";

interface Props {
  name: string;
  level: number;
}

export default function SkillBar({ name, level }: Props) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("go");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div className="d-flex justify-between about-skill-row-head">
        <span>{name}</span>
        <span className="about-skill-pct">{level}%</span>
      </div>
      <div className="about-skill-track">
        <div
          ref={fillRef}
          className="skill-fill"
          style={{ "--w": `${level}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
