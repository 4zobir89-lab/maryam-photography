"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Award, Globe2, Heart, Sparkles, Star, LucideIcon } from "lucide-react";
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

type PhilosophyCard = {
  id: number;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
};

const iconMap: Record<string, LucideIcon> = {
  Camera, Globe2, Award, Heart, Sparkles, Star,
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function About() {
  const [s, setS] = useState<Settings | null>(null);
  const [philosophy, setPhilosophy] = useState<PhilosophyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLang();

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

  if (loading || !s) {
    return (
      <section id="about" className="py-32 md:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const tags = (s.aboutTags || "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <section id="about" className="py-28 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header — editorial left-aligned */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-20 md:mb-28 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-primary/60" />
            <span className="eyebrow">{s.aboutSubtitleEn}</span>
          </div>
          <h2 className="section-title mb-8">
            <span className="text-gold-gradient">قصة</span>{" "}
            <span className="text-foreground">خلف العدسة</span>
          </h2>
          <div className="hairline w-24" />
        </motion.div>

        {/* Bio layout */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-28">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto group">
              {/* Single hairline frame */}
              <div className="absolute -inset-2 border border-primary/15 pointer-events-none" />

              <div className="relative w-full h-full overflow-hidden bg-card">
                {s.aboutImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.aboutImageData}
                    alt="مريم"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 motion-ease"
                    loading="lazy"
                  />
                ) : (
                  <MonogramPortrait />
                )}

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Years badge — minimal */}
              <div className="absolute -top-3 -left-3 w-16 h-16 bg-background border border-border flex flex-col items-center justify-center">
                <span className="font-display text-lg text-primary font-medium leading-none">7+</span>
                <span className="font-inter text-[7px] tracking-[0.2em] text-muted-foreground uppercase mt-1">Years</span>
              </div>
            </div>
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="eyebrow">{t("The Story", "The Story")}</span>

            <h3 className="display-heading text-3xl md:text-4xl text-foreground">
              {s.aboutHeadingAr}
            </h3>

            <p className="body-lg">{s.aboutPara1}</p>
            <p className="body-lg">{s.aboutPara2}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-4">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-xs text-muted-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Signature */}
            <div className="pt-8 flex items-center gap-6">
              <div className="font-amiri text-2xl text-primary">
                {s.aboutSignature}
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className="text-left">
                <div className="font-display text-sm text-foreground tracking-wide">
                  Maryam Al-Hadhrami
                </div>
                <div className="font-inter text-[10px] tracking-[0.2em] text-muted-foreground uppercase mt-1">
                  Visual Storyteller
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Philosophy grid */}
        {philosophy.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="hairline mb-16" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {philosophy.map((item, i) => {
                const Icon = iconMap[item.icon] || Camera;
                return (
                  <motion.div
                    key={item.id ?? i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                    className="bg-background p-6 lg:p-8 lift-card"
                  >
                    <div className="w-10 h-10 flex items-center justify-center text-primary mb-5">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="eyebrow mb-2">{item.titleEn}</div>
                    <h4 className="font-amiri text-xl text-foreground mb-3">{item.titleAr}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.descAr}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* Monogram fallback — refined, no silhouette */
function MonogramPortrait() {
  return (
    <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="aboutBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="oklch(22% 0.005 285)" />
          <stop offset="100%" stopColor="oklch(11% 0.004 285)" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#aboutBg)" />
      <text
        x="150"
        y="240"
        textAnchor="middle"
        fill="oklch(80% 0.13 82)"
        fontSize="140"
        fontWeight="700"
        opacity="0.85"
        style={{ fontFamily: "var(--font-amiri)" }}
      >
        م
      </text>
      <text
        x="150"
        y="290"
        textAnchor="middle"
        fill="oklch(64% 0.004 90)"
        fontSize="11"
        letterSpacing="4"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        MARYAM
      </text>
    </svg>
  );
}
