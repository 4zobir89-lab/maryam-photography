"use client";

import { useEffect, useState } from "react";

const defaultWords = [
  "بورتريه", "Portraits",
  "أعراس", "Weddings",
  "ثقافة", "Culture",
  "مناظر", "Landscapes",
  "صنعاء", "Sana'a",
  "عدن", "Aden",
];

export function Marquee() {
  const [words, setWords] = useState<string[]>(defaultWords);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.marqueeWords) {
          const arr = d.marqueeWords.split(",").map((w: string) => w.trim()).filter(Boolean);
          if (arr.length > 0) setWords(arr);
        }
      })
      .catch(() => {});
  }, []);

  if (words.length === 0) return null;

  return (
    <div className="relative bg-primary text-primary-foreground overflow-hidden py-8" dir="ltr">
      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
        {[...words, ...words, ...words].map((w, i) => {
          const isArabic = /[\u0600-\u06FF]/.test(w);
          return (
            <div key={i} className="flex items-center gap-12">
              <span
                className={
                  isArabic
                    ? "font-amiri text-2xl md:text-4xl font-bold"
                    : "font-display italic text-xl md:text-3xl opacity-80"
                }
              >
                {w}
              </span>
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 opacity-50">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
