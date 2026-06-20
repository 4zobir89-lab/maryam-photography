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
  "صنعاء",
  "Sana'a",
  "عدن",
  "Aden",
  "حضرموت",
  "Hadramaut",
];

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

  return (
    <div className="relative py-10 bg-primary text-primary-foreground overflow-hidden border-y border-primary/20">
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
        {[...words, ...words, ...words].map((w, i) => (
          <div key={i} className="flex items-center gap-8">
            <span
              className={`text-3xl md:text-5xl ${
                /[\u0600-\u06FF]/.test(w)
                  ? "font-amiri"
                  : "font-display italic"
              }`}
            >
              {w}
            </span>
            <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0">
              <path
                d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
