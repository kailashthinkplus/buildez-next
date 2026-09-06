"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Damped pointer-follow parallax: writes eased --mx/--my CSS custom
 * properties onto the given element (consumed by marketing.css depth
 * transforms). Damping keeps it heavy/deliberate rather than snappy.
 */
export function usePointerParallax<T extends HTMLElement>(ref: RefObject<T | null>, damping = 0.08) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;

    const move = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      curX += (targetX - curX) * damping;
      curY += (targetY - curY) * damping;
      el.style.setProperty("--mx", curX.toFixed(4));
      el.style.setProperty("--my", curY.toFixed(4));
      if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [ref, damping]);
}

/**
 * Ambient global scroll effects shared across sections: the --scroll CSS
 * var (slow ambient drift on the orbit core / craft card) and the
 * IntersectionObserver behind .reveal fade-ins. Call once at page root.
 */
export function useGlobalScrollFx() {
  useEffect(() => {
    let animationFrame = 0;
    const onScroll = () => {
      if (animationFrame) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;
        document.documentElement.style.setProperty("--scroll", String(window.scrollY));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);
}

/** Thin fixed progress bar tracking total page scroll. Brand blue, subtle. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = barRef.current;
    if (!el) return;
    let animationFrame = 0;
    const onScroll = () => {
      if (animationFrame) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        el.style.transform = `scaleX(${p})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <i ref={barRef} />
    </div>
  );
}

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  strength?: number;
};

/** Buttons pull toward the cursor by a few px max — a hint of weight, never a bounce. */
export function MagneticButton({ children, className, href, onClick, strength = 4 }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  const commonProps = {
    className,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    style: { transition: "transform var(--dur-fast) var(--ease-out-soft)" },
  };

  if (href) {
    return (
      <a ref={ref as RefObject<HTMLAnchorElement>} href={href} onClick={onClick} {...commonProps}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref as RefObject<HTMLButtonElement>} onClick={onClick} {...commonProps}>
      {children}
    </button>
  );
}

type AmbientGlowProps = {
  className?: string;
  color?: string;
  size?: number;
  blur?: number;
  opacity?: number;
  style?: React.CSSProperties;
};

/** A single blurred light source — the product's own illumination entering a scene. */
export function AmbientGlow({ className, color = "var(--blue)", size = 600, blur = 160, opacity = 0.12, style }: AmbientGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

type ScrollRevealTextProps = {
  words: string[];
  progress: number;
  className?: string;
};

/** Progressive giant-type reveal: each word grows in as scroll progress crosses its slot. */
export function ScrollRevealText({ words, progress, className }: ScrollRevealTextProps) {
  const step = 1 / words.length;
  return (
    <div className={className}>
      {words.map((word, i) => {
        const local = Math.max(0, Math.min(1, (progress - i * step) / step));
        const scale = 0.7 + local * 0.3;
        const opacity = Math.min(1, local * 1.4);
        return (
          <span
            key={word}
            style={{
              display: "block",
              opacity,
              transform: `scale(${scale})`,
              transformOrigin: "left center",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
