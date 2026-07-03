"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function About() {
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
      <section id="about" className="py-32 md:py-48 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const tags = (s.aboutTags || "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <section id="about" className="py-32 md:py-48 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section number — editorial marker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="font-inter text-xs tracking-[0.3em] text-muted-foreground">01</span>
          <span className="w-12 h-px bg-border" />
          <span className="eyebrow">{s.aboutSubtitleEn}</span>
        </motion.div>

        {/* Layout: large quote on right, portrait + text on left — DIFFERENT from Hero */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Portrait — smaller, offset */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="lg:col-span-4 lg:sticky lg:top-32"
          >
            <div className="relative aspect-[3/4] max-w-xs">
              <div className="absolute -inset-2 border border-primary/10 pointer-events-none" />
              <div className="relative w-full h-full overflow-hidden bg-card">
                {s.aboutImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.aboutImageData}
                    alt="مريم"
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105 motion-ease"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="font-amiri text-8xl text-primary/20">م</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Text + quote — editorial */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Heading — large, left-aligned */}
            <h2 className="section-title">
              <span className="text-gold-gradient">قصة</span>{" "}
              <span className="text-foreground">خلف العدسة</span>
            </h2>

            {/* Pull quote — different treatment */}
            <blockquote className="border-r-2 border-primary/40 pr-6 py-2">
              <p className="font-amiri text-2xl md:text-3xl text-foreground leading-relaxed">
                {s.aboutHeadingAr}
              </p>
            </blockquote>

            {/* Body paragraphs */}
            <div className="space-y-6 max-w-2xl">
              <p className="body-lg">{s.aboutPara1}</p>
              <p className="body-base">{s.aboutPara2}</p>
            </div>

            {/* Tags — inline, no cards */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
                {tags.map((tag, i) => (
                  <span key={i} className="text-sm text-muted-foreground">
                    <span className="text-primary mr-2">—</span>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Signature — minimal */}
            <div className="pt-8 flex items-center gap-5">
              <span className="font-amiri text-2xl text-primary">{s.aboutSignature}</span>
              <span className="h-px flex-1 bg-border max-w-[100px]" />
              <span className="font-inter text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Visual Storyteller
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
