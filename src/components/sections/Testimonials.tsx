"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Maximize2, X, BadgeCheck } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Testimonial = {
  id: number;
  quoteAr: string;
  nameAr: string;
  roleAr: string;
  roleEn: string;
  rating: number;
  avatar: string;
  imageData: string;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((d) => setTestimonials(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!viewImage) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setViewImage(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewImage]);

  if (loading) {
    return (
      <section id="testimonials" className="py-32 md:py-48 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-32 md:py-48 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section number */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="font-inter text-xs tracking-[0.3em] text-muted-foreground">04</span>
          <span className="w-12 h-px bg-border" />
          <span className="eyebrow">{t("Client Voices", "Client Voices")}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12"
        >
          <h2 className="section-title">
            <span className="text-foreground">آراء</span>{" "}
            <span className="text-gold-gradient">العملاء</span>
          </h2>
        </motion.div>

        {/* Grid — varied card sizes, magazine feel */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((tst, i) => {
            const avatarText = tst.avatar || tst.nameAr.split(" ").slice(0, 2).map((w) => w[0]).join(" ");
            // First card spans 2 columns on lg for variation
            const isFirst = i === 0;
            return (
              <motion.div
                key={tst.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className={`p-6 md:p-7 bg-card border border-border lift-card ${isFirst ? "lg:col-span-2 lg:row-span-1" : ""}`}
              >
                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-5">
                  {Array.from({ length: Math.min(tst.rating || 0, 5) }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" strokeWidth={0} />
                  ))}
                </div>

                {/* Quote — larger for first card */}
                <p className={`font-amiri text-foreground leading-relaxed mb-6 ${isFirst ? "text-xl md:text-2xl" : "text-base"}`}>
                  «{tst.quoteAr}»
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {tst.imageData ? (
                    <button
                      onClick={() => setViewImage(tst.imageData)}
                      className="relative w-10 h-10 overflow-hidden border border-primary/30 group shrink-0"
                      aria-label={t("عرض الصورة", "View image")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tst.imageData} alt={tst.nameAr} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 flex items-center justify-center transition-colors">
                        <Maximize2 className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                      </div>
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-amiri text-xs text-primary">{avatarText}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-amiri text-sm text-foreground truncate">{tst.nameAr}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{tst.roleAr}</div>
                  </div>
                  {tst.imageData && (
                    <BadgeCheck className="w-3.5 h-3.5 text-green-500 shrink-0" strokeWidth={1.5} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewImage(null)}
            className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center border border-border hover:border-primary transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewImage} alt={t("شهادة", "Testimonial")} className="w-full max-h-[82vh] object-contain border border-border" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
