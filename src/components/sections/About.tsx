"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Camera,
  Award,
  Globe2,
  type LucideIcon,
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
  aboutImageData: string;
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Stat = {
  value: string;
  labelAr: string;
  labelEn: string;
  icon: LucideIcon;
};

const stats: Stat[] = [
  { value: "12+", labelAr: "سنوات", labelEn: "Years", icon: CalendarDays },
  { value: "500+", labelAr: "مشاريع", labelEn: "Projects", icon: Camera },
  { value: "15", labelAr: "جوائز", labelEn: "Awards", icon: Award },
  { value: "8", labelAr: "دول", labelEn: "Countries", icon: Globe2 },
];

export function About() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !s) {
    return (
      <section id="about" className="py-28 md:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const tags = (s.aboutTags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  // Two-tone heading: split the title at the last space so the last word
  // gets the gold-gradient treatment (matches the original design pattern).
  const titleRaw = (s.aboutTitleAr || "").trim();
  const titleWords = titleRaw.split(/\s+/);
  const titleMain =
    titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : "";
  const titleAccent =
    titleWords.length > 1
      ? titleWords[titleWords.length - 1]
      : titleWords[0] || "";

  // x-offset direction depends on lang so columns slide in from their visual edge
  const portraitX = lang === "ar" ? 40 : -40;
  const textX = lang === "ar" ? -40 : 40;

  return (
    <section
      id="about"
      className="relative py-28 md:py-40 bg-background overflow-hidden"
    >
      {/* Ambient decorations */}
      <div className="absolute top-0 right-0 w-[440px] h-[440px] rounded-full bg-primary/[0.05] blur-[150px] pointer-events-none animate-slow-pulse" />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/[0.05] blur-[150px] pointer-events-none animate-slow-pulse"
        style={{ animationDelay: "2.5s" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Eyebrow with line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="w-12 h-px bg-primary/40" />
          <span className="eyebrow">{s.aboutSubtitleEn || t("الفنانة", "The Artist")}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* LEFT — Portrait with decorative frame and floating glass card */}
          <motion.div
            initial={{ opacity: 0, x: portraitX }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: EASE }}
            className="relative"
          >
            <div className="relative max-w-[480px] mx-auto lg:mx-0">
              {/* Decorative border frame */}
              <div className="absolute -top-4 -right-4 w-full h-full rounded-xl border border-primary/30 pointer-events-none" />

              {/* Portrait */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl bg-card">
                {s.aboutImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.aboutImageData}
                    alt="مريم"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105 motion-ease"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                    <span className="font-amiri text-9xl text-primary/30">م</span>
                  </div>
                )}
              </div>

              {/* Floating glass-dark card — bottom-right with italic quote */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
                className="absolute bottom-6 right-6 max-w-[220px] glass-dark rounded-xl p-4"
              >
                <p className="font-display italic text-base text-white/90 leading-snug">
                  &ldquo;Light is my first language.&rdquo;
                </p>
                <p className="font-inter text-[10px] tracking-[0.25em] uppercase text-primary/90 mt-2">
                  — Maryam
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT — Heading, paragraphs, pull quote, stats */}
          <motion.div
            initial={{ opacity: 0, x: textX }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
            className="space-y-7"
          >
            {/* Display heading with text-gradient second line */}
            <h2 className="display-heading text-[clamp(2.2rem,5vw,3.75rem)]">
              {titleMain && (
                <span className="block text-foreground">{titleMain}</span>
              )}
              {titleAccent && (
                <span className="block text-gradient">{titleAccent}</span>
              )}
              {!titleRaw && (
                <>
                  <span className="block text-foreground">
                    {t("خلف كل إطار", "Behind Every Frame,")}
                  </span>
                  <span className="block text-gradient">
                    {t("حكاية تُروى", "A Story Unfolds")}
                  </span>
                </>
              )}
            </h2>

            {/* Two body paragraphs */}
            <div className="space-y-5">
              <p className="body-lg">{s.aboutPara1}</p>
              <p className="body-lg">{s.aboutPara2}</p>
            </div>

            {/* Pull quote */}
            <blockquote className="border-r-2 border-primary/30 pr-6 py-2">
              <p className="font-amiri text-xl md:text-2xl text-foreground leading-relaxed">
                {s.aboutHeadingAr}
              </p>
            </blockquote>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="text-primary text-[10px]">✦</span>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-6 mt-2 border-t border-border">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + i * 0.08,
                      ease: EASE,
                    }}
                    className="flex flex-col items-start gap-2"
                  >
                    <div className="w-9 h-9 flex items-center justify-center border border-primary/30 rounded-lg text-primary">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div
                        className="font-display text-2xl text-foreground leading-none"
                        dir="ltr"
                      >
                        {stat.value}
                      </div>
                      <div className="font-inter text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1.5">
                        {t(stat.labelAr, stat.labelEn)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Signature */}
            <div className="pt-4 flex items-center gap-5">
              <span className="font-amiri text-2xl text-primary">
                {s.aboutSignature}
              </span>
              <span className="h-px flex-1 bg-border max-w-[100px]" />
              <span className="font-inter text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                Visual Storyteller
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
