"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  taglineEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroDescAr: string;
  heroCta1Ar: string;
  heroImageData: string;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Hero() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !s) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-background overflow-hidden pt-16"
    >
      {/* Single ambient glow — one focal point */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[50vw] h-[50vw] rounded-full bg-primary/[0.05] blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Text — 7/12 */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="w-8 h-px bg-primary/60" />
              <span className="eyebrow">{s.taglineEn}</span>
            </motion.div>

            {/* Massive name — ONE focal point */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
              className="font-amiri font-bold leading-[0.88] mb-8"
              style={{ fontSize: "clamp(4.5rem, 14vw, 12rem)" }}
            >
              <span className="text-foreground">{s.heroTitleAr}</span>
            </motion.h1>

            {/* Subtitle — small, spaced */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: EASE }}
              className="font-display tracking-[0.3em] text-muted-foreground uppercase mb-10"
              style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)" }}
            >
              {s.heroSubtitleEn}
            </motion.div>

            {/* Description — restrained */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.65, ease: EASE }}
              className="text-lg text-muted-foreground leading-relaxed max-w-md mb-10"
            >
              {s.heroDescAr}
            </motion.p>

            {/* Single CTA — one focus */}
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: EASE }}
              onClick={() => scrollTo("portfolio")}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-300 motion-ease"
            >
              {s.heroCta1Ar}
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* Visual — 5/12, single portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="relative aspect-[3/4] max-w-sm mx-auto">
              {/* Single hairline frame */}
              <div className="absolute -inset-2 border border-primary/15 pointer-events-none" />

              <div className="relative w-full h-full overflow-hidden bg-card">
                {s.heroImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.heroImageData} alt="مريم" className="w-full h-full object-cover ken-burns" />
                ) : (
                  <ApertureFallback />
                )}

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1, ease: EASE }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-inter text-[9px] tracking-[0.35em] text-muted-foreground uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-primary/40 to-transparent relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-3 bg-primary animate-scroll-dot" />
        </div>
      </motion.div>
    </section>
  );
}

function ApertureFallback() {
  return (
    <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="400" fill="oklch(15% 0.004 285)" />
      <circle cx="150" cy="180" r="100" fill="none" stroke="oklch(80% 0.13 80)" strokeWidth="0.5" opacity="0.4" />
      <circle cx="150" cy="180" r="70" fill="none" stroke="oklch(80% 0.13 80)" strokeWidth="0.4" opacity="0.3" />
      <g stroke="oklch(80% 0.13 80)" strokeWidth="0.6" fill="none" opacity="0.5">
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 * Math.PI) / 180;
          return <line key={i} x1={150 + Math.cos(a) * 30} y1={180 + Math.sin(a) * 30} x2={150 + Math.cos(a + 0.7) * 85} y2={180 + Math.sin(a + 0.7) * 85} />;
        })}
      </g>
      <circle cx="150" cy="180" r="2" fill="oklch(80% 0.13 80)" opacity="0.7" />
      <text x="150" y="350" textAnchor="middle" fill="oklch(60% 0.005 85)" fontSize="9" letterSpacing="3" style={{ fontFamily: "var(--font-inter)" }}>ƒ/1.4 · 50mm</text>
    </svg>
  );
}
