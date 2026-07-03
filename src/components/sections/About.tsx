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

  if (loading || !s) {
    return (
      <section id="about" className="py-32 md:py-48 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const tags = (s.aboutTags || "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <section id="about" className="relative py-32 md:py-48 bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-accent/[0.04] blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header — editorial */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-20 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-primary/60" />
            <span className="eyebrow">{s.aboutSubtitleEn}</span>
          </div>
          <h2 className="section-title mb-8">
            <span className="text-gold-gradient">قصة</span>{" "}
            <span className="text-foreground">خلف العدسة</span>
          </h2>
          <div className="gold-hairline w-32" />
        </motion.div>

        {/* Bio layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-28">
          {/* Portrait — with glass frame */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: EASE }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto group">
              {/* Double gold frame */}
              <div className="absolute -inset-3 border border-primary/15 rounded-2xl pointer-events-none" />
              <div className="absolute -inset-1.5 border border-primary/8 rounded-2xl pointer-events-none" />

              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-card shadow-velvet">
                {s.aboutImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.aboutImageData}
                    alt="مريم"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 motion-ease"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="font-amiri text-9xl text-primary/20">م</span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />

                {/* Glass caption */}
                <div className="absolute bottom-5 right-5 left-5 glass rounded-xl p-4">
                  <div className="font-inter text-[9px] tracking-[0.3em] text-primary uppercase mb-1">
                    Portrait
                  </div>
                  <div className="font-amiri text-base text-foreground">
                    {t("مريم · صنعاء", "Maryam · Sana'a")}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
                className="absolute -top-5 -right-5 w-20 h-20 rounded-full glass-strong flex flex-col items-center justify-center shadow-gold animate-float"
              >
                <span className="font-display text-xl text-gold-gradient font-bold leading-none">7+</span>
                <span className="font-inter text-[8px] tracking-[0.2em] text-muted-foreground uppercase mt-1">Years</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Bio text — story */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="eyebrow">{t("The Story", "The Story")}</span>

            <h3 className="display-heading text-3xl md:text-4xl text-foreground">
              {s.aboutHeadingAr}
            </h3>

            <p className="text-lg text-muted-foreground leading-loose">{s.aboutPara1}</p>
            <p className="text-base text-muted-foreground/80 leading-loose">{s.aboutPara2}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-4">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 text-xs text-muted-foreground border border-border rounded-full hover:border-primary/40 hover:text-primary transition-colors duration-300"
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

        {/* Philosophy grid — glass cards */}
        {philosophy.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="gold-hairline mb-16" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {philosophy.map((item, i) => {
                const Icon = iconMap[item.icon] || Camera;
                return (
                  <motion.div
                    key={item.id ?? i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                    className="group p-6 glass rounded-2xl lift-card relative overflow-hidden"
                  >
                    {/* Corner accents */}
                    <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-primary/40" />
                    <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-primary/40" />

                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
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
