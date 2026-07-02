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

const ARABIC_RE = /[\u0600-\u06FF]/;

/** Small gold star/diamond separator (12px). */
function Separator() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3 h-3 flex-shrink-0 text-primary"
      aria-hidden
    >
      <path
        d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
        fill="currentColor"
        opacity="0.85"
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

  // Duplicate enough times to ensure the 50% translate loop is seamless.
  // The animation moves -50%, so we need at least 2 copies of the same set.
  const loop = [...words, ...words];

  return (
    <div
      aria-hidden
      dir="ltr"
      className="relative bg-secondary border-y border-border overflow-hidden group"
    >
      <div
        className="flex items-center gap-10 py-8 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: "40s" }}
      >
        {loop.map((w, i) => {
          const isArabic = ARABIC_RE.test(w);
          return (
            <div key={i} className="flex items-center gap-10">
              <span
                className={
                  isArabic
                    ? "font-amiri text-3xl md:text-4xl text-secondary-foreground"
                    : "font-display italic text-xl md:text-2xl text-muted-foreground"
                }
              >
                {w}
              </span>
              <Separator />
            </div>
          );
        })}
      </div>

      {/* Edge fades — subtle warm wash on each side */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary to-transparent" />
    </div>
  );
}
