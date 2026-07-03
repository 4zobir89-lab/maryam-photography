"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { MotifSvg } from "@/components/shared/MotifSvg";
import { useLang } from "@/components/shared/LanguageProvider";

type Project = {
  id: number;
  titleAr: string;
  titleEn: string;
  category: string;
  year: string;
  location: string;
  imageData: string;
  palette1: string;
  palette2: string;
  palette3: string;
  motif: string;
};

type GalleryItem = {
  id: string;
  url: string;
  titleAr: string;
  year: string;
  category: string;
  motif: string;
  palette: string[];
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// Teaser section: show ~8 images
const MAX_IMAGES = 8;

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLang();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/projects");
        const projects: Project[] = await res.json();
        if (!Array.isArray(projects)) {
          if (!cancelled) setLoading(false);
          return;
        }

        // Fetch images for each project in parallel; collect covers + gallery images.
        const promises = projects.map(async (p) => {
          const palette = [p.palette1, p.palette2, p.palette3].filter(Boolean);
          const localItems: GalleryItem[] = [];

          if (p.imageData) {
            localItems.push({
              id: `cover-${p.id}`,
              url: p.imageData,
              titleAr: p.titleAr,
              year: p.year,
              category: p.category,
              motif: p.motif,
              palette,
            });
          }

          try {
            const imgRes = await fetch(`/api/projects/${p.id}/images`);
            if (imgRes.ok) {
              const imgs = await imgRes.json();
              for (const img of imgs) {
                if (img.url && !localItems.find((x) => x.url === img.url)) {
                  localItems.push({
                    id: `img-${img.id}`,
                    url: img.url,
                    titleAr: p.titleAr,
                    year: p.year,
                    category: p.category,
                    motif: p.motif,
                    palette,
                  });
                }
              }
            }
          } catch {}

          return localItems;
        });

        const results = await Promise.all(promises);
        const allItems: GalleryItem[] = [];
        for (const list of results) {
          for (const it of list) {
            if (allItems.length >= MAX_IMAGES * 2) break;
            allItems.push(it);
          }
        }

        if (!cancelled) {
          setItems(allItems.slice(0, MAX_IMAGES));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section id="gallery" className="py-28 md:py-40 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  // RTL: arrow points left (toward "more" direction); LTR: arrow points right.
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section
      id="gallery"
      className="relative py-28 md:py-40 bg-secondary overflow-hidden"
    >
      {/* Ambient decorations */}
      <div className="absolute top-1/3 right-0 w-[420px] h-[420px] rounded-full bg-primary/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[380px] h-[380px] rounded-full bg-accent/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header — eyebrow + title + description + view all */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-4 flex items-center gap-4"
            >
              <span className="w-12 h-px bg-primary/40" />
              <span className="eyebrow">
                {t("Full Gallery", "Full Gallery")}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="section-title mb-4"
            >
              <span className="text-foreground">المعرض</span>{" "}
              <span className="text-gold-gradient">الكامل</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="body-lg"
            >
              {t(
                "نظرة شاملة على أعمالي — لحظات مختارة من أعراس، بورتريهات، وثقافة يمنية أصيلة.",
                "A curated overview of my work — selected moments from weddings, portraits, and authentic Yemeni culture."
              )}
            </motion.p>
          </div>

          {/* View All button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="shrink-0"
          >
            <Link
              href="/gallery"
              className="btn-luxury inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase font-medium rounded-full hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.99] transition-all duration-500"
            >
              {t("عرض الكل", "View All")}
              <ArrowIcon size={14} strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>

        {/* Grid — 2/3/4 columns responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 8) * 0.05, ease: EASE }}
              className="group relative aspect-square rounded-xl overflow-hidden bg-card cursor-pointer"
            >
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.titleAr}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover image-luxury"
                />
              ) : (
                <MotifSvg motif={item.motif} palette={item.palette} />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Hover caption */}
              <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <p className="font-amiri text-sm text-white truncate">
                  {item.titleAr}
                </p>
                <p className="font-inter text-[11px] tracking-[0.2em] uppercase text-white/75">
                  {item.year}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
