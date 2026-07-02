import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://maryam-photography.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static top-level routes
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/booking`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic blog post entries
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: [{ createdAt: "desc" }],
    });
    blogEntries = posts.map((p) => {
      const lastModified =
        p.updatedAt instanceof Date
          ? p.updatedAt
          : p.createdAt instanceof Date
          ? p.createdAt
          : now;
      return {
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });
  } catch (e) {
    // DB unavailable — return only static entries
    console.error("Sitemap: failed to fetch blog posts:", e);
  }

  return [...staticEntries, ...blogEntries];
}
