import { db } from "@/lib/db";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import {
  GalleryClient,
  type GalleryImage,
} from "@/components/gallery/GalleryClient";

export const dynamic = "force-dynamic";

async function fetchGalleryData(): Promise<{
  images: GalleryImage[];
  projectCount: number;
}> {
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
      // Cover entry — even when imageData is empty (so MotifSvg placeholder shows up).
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
        createdAt:
          p.createdAt instanceof Date
            ? p.createdAt.toISOString()
            : String(p.createdAt),
      });
      // Additional gallery images
      for (const img of p.images) {
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
          createdAt:
            p.createdAt instanceof Date
              ? p.createdAt.toISOString()
              : String(p.createdAt),
        });
      }
    }
    return { images: out, projectCount: projects.length };
  } catch (e) {
    console.error("Gallery fetch error:", e);
    return { images: [], projectCount: 0 };
  }
}

export default async function GalleryPage() {
  const { images, projectCount } = await fetchGalleryData();

  return (
    <main className="relative min-h-screen flex flex-col bg-background">
      <Navbar />
      <GalleryClient images={images} projectCount={projectCount} />
      <Footer />
    </main>
  );
}
