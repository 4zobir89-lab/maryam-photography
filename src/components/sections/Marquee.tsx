"use client";

import { useEffect, useState } from "react";

const defaultWords = ["بورتريه", "Portraits", "أعراس", "Weddings", "ثقافة", "Culture", "مناظر", "Landscapes"];

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
    <div className="bg-secondary border-y border-border overflow-hidden py-8" dir="ltr">
      <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
        {[...words, ...words, ...words].map((w, i) => {
          const isArabic = /[\u0600-\u06FF]/.test(w);
          return (
            <span
              key={i}
              className={
                isArabic
                  ? "font-amiri text-xl md:text-2xl text-foreground"
                  : "font-display italic text-lg md:text-xl text-muted-foreground"
              }
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
}
