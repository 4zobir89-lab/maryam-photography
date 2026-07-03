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
    <div className="relative bg-secondary border-y border-border overflow-hidden py-7" dir="ltr">
      <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
        {[...words, ...words, ...words].map((w, i) => {
          const isArabic = /[\u0600-\u06FF]/.test(w);
          return (
            <div key={i} className="flex items-center gap-12">
              <span
                className={
                  isArabic
                    ? "font-amiri text-2xl md:text-3xl text-secondary-foreground"
                    : "font-display italic text-xl md:text-2xl text-muted-foreground"
                }
              >
                {w}
              </span>
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 flex-shrink-0 text-primary/50">
                <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="currentColor" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
