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
    <section id="home" className="min-h-screen flex items-center bg-background pt-16">
      <div className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-6"
            >
              <span className="eyebrow">{s.taglineEn}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: EASE }}
              className="font-amiri font-bold leading-[0.92] mb-6"
              style={{ fontSize: "clamp(4rem, 12vw, 9rem)" }}
            >
              <span className="text-foreground">{s.heroTitleAr}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
              className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-10"
            >
              {s.heroDescAr}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45, ease: EASE }}
              onClick={() => scrollTo("portfolio")}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-300 motion-ease"
            >
              {s.heroCta1Ar}
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="relative aspect-[3/4] max-w-sm mx-auto">
              <div className="absolute -inset-1.5 border border-primary/15 pointer-events-none" />
              <div className="relative w-full h-full overflow-hidden bg-card">
                {s.heroImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.heroImageData} alt="مريم" className="w-full h-full object-cover ken-burns" />
                ) : (
                  <ApertureFallback />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ApertureFallback() {
  return (
    <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="400" fill="oklch(15% 0.003 285)" />
      <circle cx="150" cy="180" r="100" fill="none" stroke="oklch(78% 0.13 82)" strokeWidth="0.5" opacity="0.4" />
      <circle cx="150" cy="180" r="70" fill="none" stroke="oklch(78% 0.13 82)" strokeWidth="0.4" opacity="0.3" />
      <g stroke="oklch(78% 0.13 82)" strokeWidth="0.6" fill="none" opacity="0.5">
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 * Math.PI) / 180;
          return <line key={i} x1={150 + Math.cos(a) * 30} y1={180 + Math.sin(a) * 30} x2={150 + Math.cos(a + 0.7) * 85} y2={180 + Math.sin(a + 0.7) * 85} />;
        })}
      </g>
      <circle cx="150" cy="180" r="2" fill="oklch(78% 0.13 82)" opacity="0.7" />
      <text x="150" y="350" textAnchor="middle" fill="oklch(60% 0.003 90)" fontSize="9" letterSpacing="3" style={{ fontFamily: "var(--font-inter)" }}>ƒ/1.4 · 50mm</text>
    </svg>
  );
}
