"use client";

import { useEffect, useState } from "react";

const defaultWords = [
  "بورتريه",
  "Portraits",
  "أعراس",
  "Weddings",
  "ثقافة",
  "Culture",
  "مناظر",
  "Landscapes",
];

function GoldStar({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 2 L14.5 9 L22 9.5 L16 14 L18 22 L12 17.5 L6 22 L8 14 L2 9.5 L9.5 9 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Marquee() {
  const [words, setWords] = useState<string[]>(defaultWords);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.marqueeWords) {
          const arr = d.marqueeWords
            .split(",")
            .map((w: string) => w.trim())
            .filter(Boolean);
          if (arr.length > 0) setWords(arr);
        }
      })
      .catch(() => {});
  }, []);

  if (words.length === 0) return null;

  // Enough copies to comfortably exceed 2x viewport width for seamless loop
  const loop = [...words, ...words, ...words, ...words];

  return (
    <div
      className="relative bg-primary text-primary-foreground overflow-hidden py-8"
      dir="ltr"
    >
      {/* Shimmer overlay — white/5 gradient vignettes on edges */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 78%, rgba(255,255,255,0.06) 100%)",
        }}
      />
      {/* Top + bottom hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-primary-foreground/10 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-primary-foreground/10 pointer-events-none" />

      {/* Marquee track — animate-marquee is defined in globals.css (50s linear infinite) */}
      <div className="flex items-center gap-10 animate-marquee whitespace-nowrap will-change-transform">
        {loop.map((w, i) => {
          const isArabic = /[\u0600-\u06FF]/.test(w);
          return (
            <div key={i} className="flex items-center gap-10 shrink-0">
              <span
                className={
                  isArabic
                    ? "font-amiri text-2xl md:text-3xl text-primary-foreground"
                    : "italic text-xl md:text-2xl text-primary-foreground/85"
                }
                style={
                  isArabic
                    ? undefined
                    : { fontFamily: "var(--font-cormorant), serif" }
                }
              >
                {w}
              </span>
              <GoldStar className="text-accent" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
