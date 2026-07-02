import { db } from "@/lib/db";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { CursorGlow } from "@/components/shared/CursorGlow";
import {
  GalleryClient,
  type GalleryImage,
} from "@/components/gallery/GalleryClient";
import { Images } from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchGalleryImages(): Promise<GalleryImage[]> {
  try {
    const projects = await db.project.findMany({
      where: { published: true },
      include: {
        images: {
          orderBy: [{ order: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ order: "asc" }, { id: "desc" }],
    });

    const out: GalleryImage[] = [];
    for (const p of projects) {
      const palette = [p.palette1, p.palette2, p.palette3].filter(Boolean);
      // Cover image (only if it has a real URL — if not, we still emit an entry
      // so the MotifSvg placeholder shows up in the gallery).
      out.push({
        id: `cover-${p.id}`,
        url: p.imageData || "",
        titleAr: p.titleAr,
        titleEn: p.titleEn,
        category: p.category,
        year: p.year,
        location: p.location,
        description: p.description,
        motif: p.motif,
        palette,
        featured: p.featured,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
      });
      // Gallery images
      for (const img of p.images) {
        // Skip duplicate cover URL
        if (img.url === p.imageData) continue;
        out.push({
          id: `img-${img.id}`,
          url: img.url,
          titleAr: p.titleAr,
          titleEn: p.titleEn,
          category: p.category,
          year: p.year,
          location: p.location,
          description: img.caption || p.description,
          motif: p.motif,
          palette,
          featured: false,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
        });
      }
    }
    return out;
  } catch (e) {
    console.error("Gallery fetch error:", e);
    return [];
  }
}

export default async function GalleryPage() {
  const images = await fetchGalleryImages();

  return (
    <main className="relative min-h-screen flex flex-col bg-background">
      <CursorGlow />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[oklch(0.55_0.1_40_/_0.05)] rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center">
          <div className="font-inter text-[10px] tracking-[0.5em] text-primary uppercase mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-primary/40" />
            Full Gallery
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h1 className="font-amiri text-5xl md:text-7xl text-foreground mb-4 leading-tight">
            <span className="text-gold-gradient">المعرض</span> الكامل
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            تجميعة شاملة لأعمالي — أغلفة المشاريع وصور المعرض الإضافية في مكان
            واحد. استعرض بالفلاتر، بدّل بين التخطيط المتعرّج والشبكي، وافتح أي صورة
            لرؤيتها بملء الشاشة.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 mt-6">
            <Images className="w-3.5 h-3.5" />
            <span>{images.length} صورة من أرشيف مريم</span>
          </div>
        </div>
      </section>

      <GalleryClient images={images} />

      <Footer />
    </main>
  );
}
