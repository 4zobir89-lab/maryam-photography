import { db } from "@/lib/db";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { BlogClient } from "./BlogClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "المدوّنة — مريم",
  description:
    "خواطر فنية، شروحات تقنية، وقصص من خلف العدسة. مدوّنة مريم للتصوير.",
};

const VALID_CATEGORIES = [
  "general",
  "tutorials",
  "stories",
  "gear",
  "behind-the-scenes",
];

type BlogPost = {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  excerptAr: string;
  excerptEn: string;
  coverImage: string;
  category: string;
  readTime: number;
  featured: boolean;
  published: boolean;
  author: string;
  createdAt: Date | string;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const category =
    sp.category && VALID_CATEGORIES.includes(sp.category) ? sp.category : null;

  let posts: BlogPost[] = [];
  try {
    posts = await db.blogPost.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 60,
    });
  } catch (e) {
    console.error("Blog page fetch error:", e);
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-background">
      <Navbar />
      <BlogClient posts={posts} activeCategory={category} />
      <Footer />
    </main>
  );
}
