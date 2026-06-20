"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Award, Globe2, Heart, LucideIcon } from "lucide-react";

type Settings = {
  aboutTitleAr: string;
  aboutSubtitleEn: string;
  aboutHeadingAr: string;
  aboutPara1: string;
  aboutPara2: string;
  aboutTags: string;
  aboutSignature: string;
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
};

function LoadingSkeleton() {
  return (
    <section
      id="about"
      className="relative py-32 md:py-44 overflow-hidden bg-background"
    >
      <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </section>
  );
}

export function About() {
  const [s, setS] = useState<Settings | null>(null);
  const [philosophy, setPhilosophy] = useState<PhilosophyCard[]>([]);
  const [loading, setLoading] = useState(true);

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
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <section
      id="about"
      className="relative py-32 md:py-44 overflow-hidden bg-background"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.78_0.13_75_/_0.04)] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.55_0.1_40_/_0.05)] blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — {s.aboutSubtitleEn} —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            {(() => {
              const parts = (s.aboutTitleAr || "").split(" ");
              const first = parts.shift() || "";
              const rest = parts.join(" ");
              return (
                <>
                  <span className="text-gold-gradient">{first}</span>
                  {rest && (
                    <>
                      {" "}
                      <span className="text-foreground">{rest}</span>
                    </>
                  )}
                </>
              );
            })()}
          </h2>
          <div className="hairline w-32 mx-auto" />
        </motion.div>

        {/* Bio layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          {/* Portrait placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto group">
              {/* Frame */}
              <div className="absolute -inset-3 border border-primary/30 rounded-sm" />
              <div className="absolute -inset-1.5 border border-primary/15 rounded-sm" />

              {/* Image */}
              <div className="relative w-full h-full overflow-hidden rounded-sm bg-gradient-to-br from-[oklch(0.18_0.02_50)] via-[oklch(0.12_0.01_285)] to-[oklch(0.06_0.005_285)]">
                {/* Silhouette of photographer */}
                <svg
                  viewBox="0 0 300 400"
                  className="absolute inset-0 w-full h-full opacity-90"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <radialGradient id="bgGrad" cx="50%" cy="35%" r="60%">
                      <stop
                        offset="0%"
                        stopColor="oklch(0.3 0.08 50)"
                        stopOpacity="0.5"
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.05 0 0)"
                        stopOpacity="1"
                      />
                    </radialGradient>
                    <linearGradient id="silGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="oklch(0.15 0.02 50)" />
                      <stop offset="100%" stopColor="oklch(0.04 0 0)" />
                    </linearGradient>
                  </defs>
                  <rect width="300" height="400" fill="url(#bgGrad)" />
                  {/* Silhouette */}
                  <ellipse cx="150" cy="140" rx="55" ry="65" fill="url(#silGrad)" />
                  <path
                    d="M 80 400 Q 80 250 150 230 Q 220 250 220 400 Z"
                    fill="url(#silGrad)"
                  />
                  {/* Camera */}
                  <rect
                    x="120"
                    y="280"
                    width="60"
                    height="40"
                    rx="4"
                    fill="oklch(0.1 0 0)"
                    stroke="oklch(0.78 0.13 75)"
                    strokeWidth="1"
                  />
                  <circle cx="150" cy="300" r="10" fill="none" stroke="oklch(0.78 0.13 75)" strokeWidth="1" />
                  <circle cx="150" cy="300" r="5" fill="oklch(0.78 0.13 75)" opacity="0.5" />
                </svg>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                {/* Caption */}
                <div className="absolute bottom-6 right-6 left-6">
                  <div className="text-[10px] tracking-[0.4em] text-primary/80 uppercase font-inter mb-1">
                    Portrait
                  </div>
                  <div className="font-amiri text-2xl text-foreground">
                    مريم الحضرمي
                  </div>
                  <div className="font-display text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    Sana'a · 2024
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-background border border-primary/30 flex flex-col items-center justify-center pulse-glow">
                <span className="font-display text-2xl text-gold-gradient font-bold">
                  7+
                </span>
                <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
                  Years
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="font-inter text-xs tracking-[0.4em] text-primary uppercase">
              The Story
            </span>

            <h3 className="font-amiri text-4xl md:text-5xl font-bold leading-tight text-foreground">
              {s.aboutHeadingAr}
            </h3>

            <p className="text-lg md:text-xl text-muted-foreground leading-loose">
              {s.aboutPara1}
            </p>

            <p className="text-base md:text-lg text-muted-foreground/80 leading-loose">
              {s.aboutPara2}
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 text-sm border border-border rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Signature */}
            <div className="pt-8 flex items-center gap-6">
              <div className="font-amiri text-3xl text-gold-gradient">
                {s.aboutSignature}
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
              <div className="text-right">
                <div className="font-display text-sm text-foreground tracking-wider">
                  Maryam Al-Hadhrami
                </div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                  Visual Storyteller
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Philosophy grid */}
        {philosophy.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {philosophy.map((item, i) => {
            const Icon = iconMap[item.icon] || Camera;
            return (
              <motion.div
                key={item.id ?? i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="lift-card group relative p-6 bg-card/40 backdrop-blur-sm border border-border/60 rounded-sm overflow-hidden"
              >
                {/* Corner accents */}
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-primary/40" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-primary/40" />

                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mb-2">
                  {item.titleEn}
                </div>
                <h4 className="font-amiri text-2xl text-foreground mb-3">
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
