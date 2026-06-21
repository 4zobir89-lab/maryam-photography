"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  id: number;
  quoteAr: string;
  nameAr: string;
  roleAr: string;
  roleEn: string;
  rating: number;
  avatar: string;
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((d) => setTestimonials(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Clamp idx when testimonials change so we never point past the end
  useEffect(() => {
    if (idx > 0 && idx >= testimonials.length) {
      setIdx(0);
    }
  }, [testimonials.length, idx]);

  const next = () => {
    setDirection(1);
    setIdx((p) => (p + 1) % Math.max(testimonials.length, 1));
  };
  const prev = () => {
    setDirection(-1);
    setIdx((p) => (p - 1 + testimonials.length) % Math.max(testimonials.length, 1));
  };

  if (loading) {
    return (
      <section
        id="testimonials"
        className="relative py-32 md:py-44 bg-[oklch(0.06_0.005_285)] overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const current = testimonials[Math.min(idx, testimonials.length - 1)];
  const avatarText =
    current.avatar ||
    current.nameAr
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join(" ");

  return (
    <section
      id="testimonials"
      className="relative py-32 md:py-44 bg-[oklch(0.06_0.005_285)] overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — Client Voices —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            <span className="text-foreground">آراء</span>{" "}
            <span className="text-gold-gradient">العملاء</span>
          </h2>
        </motion.div>

        {/* Testimonial card */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={idx}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-card rounded-sm p-8 md:p-14"
            >
              {/* Big quote */}
              <Quote className="absolute top-8 left-8 w-16 h-16 text-primary/15" />

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({ length: Math.min(current.rating || 0, 5) }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-amiri text-xl md:text-3xl leading-loose text-foreground text-center mb-10 max-w-3xl mx-auto">
                «{current.quoteAr}»
              </p>

              {/* Author */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <span className="font-amiri text-xl text-gold-gradient">
                    {avatarText}
                  </span>
                </div>
                <div className="text-center">
                  <div className="font-amiri text-xl text-foreground mb-1">
                    {current.nameAr}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {current.roleAr}
                  </div>
                  <div className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mt-1">
                    {current.roleEn}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > idx ? 1 : -1);
                    setIdx(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === idx
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`الرأي ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
        >
          {[
            { num: "+250", labelAr: "عميل سعيد" },
            { num: "+180", labelAr: "ألبوم منجز" },
            { num: "5.0★", labelAr: "متوسط التقييم" },
            { num: "+40", labelAr: "جائزة وتكريم" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl text-gold-gradient font-bold mb-2">
                {s.num}
              </div>
              <div className="text-xs text-muted-foreground tracking-wider">
                {s.labelAr}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
