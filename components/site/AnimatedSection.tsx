"use client";
import { useEffect, useRef, JSX } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  from?: "bottom" | "left" | "fade";
  as?: keyof JSX.IntrinsicElements;
}

export default function AnimatedSection({
  children,
  className,
  style,
  delay = 0,
  from = "bottom",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;

    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const fromVars: gsap.TweenVars = { opacity: 0 };
        if (from === "bottom") fromVars.y = 34;
        if (from === "left") fromVars.x = -42;

        const toVars: gsap.TweenVars = {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.85,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 91%",
            toggleActions: "play none none none",
          },
        };

        gsap.fromTo(el, fromVars, toVars);

        cleanup = () => {
          ScrollTrigger.getAll().forEach((t) => {
            if (t.trigger === el) t.kill();
          });
        };
      });
    });

    return () => cleanup?.();
  }, [from, delay]);

  return (
    // @ts-ignore
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
