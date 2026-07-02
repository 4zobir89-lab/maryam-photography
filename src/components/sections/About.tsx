"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Award,
  Globe2,
  Heart,
  Sparkles,
  Star,
  LucideIcon,
} from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  aboutTitleAr: string;
  aboutSubtitleEn: string;
  aboutHeadingAr: string;
  aboutPara1: string;
  aboutPara2: string;
  aboutTags: string;
  aboutSignature: string;
  aboutImageData?: string;
};

type PhilosophyCard = {
  id: number;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
};

const iconMap: Record<string, LucideIcon> = {
  Camera,
  Globe2,
  Award,
  Heart,
  Sparkles,
  Star,
};

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Refined typographic monogram — a large editorial "M" set against a warm
 *  radial wash, framed by hairline rules and a small caption row.
 *  NOT a silhouette — pure typographic mark. */
function MonogramPortrait() {
  return (
    <svg
      viewBox="0 0 300 400"
      className="w-full h-full text-primary"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="monoWash" cx="50%" cy="42%" r="62%">
          <stop
            offset="0%"
            stopColor="oklch(0.22 0.012 285)"
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.1 0.005 285)"
            stopOpacity="1"
          />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#monoWash)" />

      {/* Outer hairline frame (inset) */}
      <rect
        x="24"
        y="24"
        width="252"
        height="352"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.35"
      />

      {/* Top label row */}
      <text
        x="150"
        y="58"
        textAnchor="middle"
        className="font-inter"
        fontSize="6"
        letterSpacing="4"
        fill="currentColor"
        opacity="0.55"
      >
        PORTRAIT · STUDIO M
      </text>

      {/* Hairline under top label */}
      <line
        x1="120"
        y1="68"
        x2="180"
        y2="68"
        stroke="currentColor"
        strokeWidth="0.4"
        opacity="0.4"
      />

      {/* Monogram — large serif M */}
      <text
        x="150"
        y="240"
        textAnchor="middle"
        className="font-amiri"
        fontSize="180"
        fontWeight="700"
        fill="currentColor"
        opacity="0.92"
      >
        م
      </text>

      {/* Small Latin M echo below */}
      <text
        x="150"
        y="288"
        textAnchor="middle"
        className="font-display"
        fontSize="14"
        letterSpacing="8"
        fill="currentColor"
        opacity="0.55"
      >
        MARYAM
      </text>

      {/* Bottom hairline + caption */}
      <line
        x1="120"
        y1="330"
        x2="180"
        y2="330"
        stroke="currentColor"
        strokeWidth="0.4"
        opacity="0.4"
      />
      <text
        x="150"
        y="348"
        textAnchor="middle"
        className="font-inter"
        fontSize="6"
        letterSpacing="3"
        fill="currentColor"
        opacity="0.55"
      >
        EST · 2018 · SANA'A
      </text>

      {/* Corner ticks */}
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.5">
        <line x1="24" y1="24" x2="36" y2="24" />
        <line x1="24" y1="24" x2="24" y2="36" />
        <line x1="276" y1="24" x2="264" y2="24" />
        <line x1="276" y1="24" x2="276" y2="36" />
        <line x1="24" y1="376" x2="36" y2="376" />
        <line x1="24" y1="376" x2="24" y2="364" />
        <line x1="276" y1="376" x2="264" y2="376" />
        <line x1="276" y1="376" x2="276" y2="364" />
      </g>
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <section
      id="about"
      className="relative py-28 md:py-40 overflow-hidden bg-background"
    >
      <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </section>
  );
}

export function About() {
  const [s, setS] = useState<Settings | null>(null);
  const [philosophy, setPhilosophy] = useState<PhilosophyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/philosophy").then((r) => r.json()),
    ])
      .then(([settings, cards]) => {
        setS(settings);
        setPhilosophy(Array.isArray(cards) ? cards : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !s) return <LoadingSkeleton />;

  const tags = (s.aboutTags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section
      id="about"
      dir="rtl"
      className="relative py-28 md:py-40 overflow-hidden bg-background"
    >
      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* === Editorial split header (left-aligned, NOT centered) === */}
        <motion.div
          {...fade(0)}
          className="flex flex-col gap-4 mb-16 md:mb-24 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/70" aria-hidden />
            <span className="eyebrow">
              {t("عن الفنانة", "About The Artist")}
            </span>
          </div>
          <h2 className="section-title text-foreground">
            {s.aboutTitleAr || t("قصة خلف العدسة", "The Story Behind The Lens")}
          </h2>
          <div className="hairline w-24 mt-2" />
        </motion.div>

        {/* === Bio layout — portrait 5/12, text 7/12 === */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-24 md:mb-32">
          {/* Portrait column */}
          <motion.div
            {...fade(0.1)}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[3/4] w-full max-w-md group">
              {/* Single thin gold hairline frame (1px) */}
              <div className="absolute -inset-px border border-primary/30 pointer-events-none" />

              {/* Image container */}
              <div className="relative w-full h-full overflow-hidden bg-card">
                {s.aboutImageData ? (
                  <img
                    src={s.aboutImageData}
                    alt={t("مريم — مصورة فوتوغرافية", "Maryam — Photographer")}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    style={{ transitionTimingFunction: "var(--ease)" }}
                  />
                ) : (
                  <div className="absolute inset-0">
                    <MonogramPortrait />
                  </div>
                )}
              </div>

              {/* Floating "7+ Years" badge — minimal, no pulse-glow */}
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-background border border-border-strong/40 flex flex-col items-center justify-center">
                <span className="font-display text-2xl text-primary leading-none font-semibold">
                  7+
                </span>
                <span className="text-[9px] tracking-[0.2em] text-muted-foreground uppercase mt-1">
                  {t("سنوات", "Years")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Text column */}
          <motion.div
            {...fade(0.2)}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary/70" aria-hidden />
              <span className="eyebrow">{t("القصة", "The Story")}</span>
            </div>

            <h3 className="display-heading text-3xl md:text-4xl text-foreground">
              {s.aboutHeadingAr}
            </h3>

            <p className="body-lg">{s.aboutPara1}</p>

            <p className="body-lg">{s.aboutPara2}</p>

            {/* Tags as inline pills (NOT cards) */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 text-xs tracking-wide text-muted-foreground border border-border rounded-full transition-colors duration-300 motion-ease hover:border-border-strong hover:text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Signature row — font-amiri gold + thin hairline + name label */}
            <div className="pt-6 flex items-center gap-5">
              <span className="font-amiri text-2xl md:text-3xl text-primary leading-none whitespace-nowrap">
                {s.aboutSignature || "مريم"}
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-l from-primary/40 via-border to-transparent"
              />
              <div className="text-left">
                <div className="font-display text-sm text-foreground tracking-wide">
                  Maryam Al-Hadhrami
                </div>
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-inter mt-0.5">
                  {t("راوية بصرية", "Visual Storyteller")}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* === Philosophy grid — 4 cards === */}
        {philosophy.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {philosophy.map((item, i) => {
              const Icon = iconMap[item.icon] || Camera;
              return (
                <motion.div
                  key={item.id ?? i}
                  {...fade(i * 0.08)}
                  className="surface-card group p-6 flex flex-col gap-3 transition-transform duration-500 motion-ease hover:-translate-y-1"
                >
                  <Icon
                    className="w-6 h-6 text-primary"
                    strokeWidth={1.5}
                  />
                  <div className="eyebrow">{item.titleEn}</div>
                  <h4 className="font-amiri text-2xl text-foreground leading-snug">
                    {item.titleAr}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.descAr}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
