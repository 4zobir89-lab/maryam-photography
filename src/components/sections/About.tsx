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
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const tags = (s.aboutTags || "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <section id="about" className="py-32 md:py-48 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto group">
              <div className="absolute -inset-1.5 border border-primary/10 pointer-events-none" />
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
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="font-amiri text-8xl text-primary/30">م</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="lg:col-span-7"
          >
            <span className="eyebrow mb-4 block">{s.aboutSubtitleEn}</span>

            <h2 className="section-title mb-6">
              <span className="text-gold-gradient">قصة</span>{" "}
              <span className="text-foreground">خلف العدسة</span>
            </h2>

            <p className="body-lg mb-6">{s.aboutPara1}</p>
            <p className="body-lg mb-8">{s.aboutPara2}</p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 text-xs text-muted-foreground border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-5">
              <span className="font-amiri text-xl text-primary">{s.aboutSignature}</span>
              <span className="h-px flex-1 bg-border" />
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
