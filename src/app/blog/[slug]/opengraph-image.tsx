import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "edge";
export const alt = "مدوّنة مريم";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://maryam-photography.vercel.app";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  let title = "مدوّنة مريم";
  let category = "";
  let readTime = 0;
  try {
    const post = await db.blogPost.findUnique({
      where: { slug: params.slug },
      select: { titleAr: true, titleEn: true, category: true, readTime: true },
    });
    if (post) {
      title = post.titleAr || post.titleEn || title;
      category = post.category || "";
      readTime = post.readTime || 0;
    }
  } catch (e) {
    console.error("OG image (blog): DB error:", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: "0 80px",
          background:
            "linear-gradient(135deg, oklch(0.1 0.01 285), oklch(0.06 0.005 285))",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Decorative gold corner accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle at top right, oklch(0.78 0.13 75 / 0.15), transparent 70%)",
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "oklch(0.78 0.13 75)",
            fontSize: 18,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 30,
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          <span>مدوّنة مريم · Maryam&apos;s Journal</span>
        </div>

        {/* Title — Arabic, gold gradient via solid gold (ImageResponse doesn't support text gradients well) */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: "oklch(0.85 0.12 80)",
            textAlign: "right",
            lineHeight: 1.15,
            maxWidth: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            textShadow: "0 0 30px oklch(0.78 0.13 75 / 0.3)",
          }}
        >
          {title}
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 40,
            color: "oklch(0.62 0.01 80)",
            fontSize: 22,
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          {category && (
            <span style={{ color: "oklch(0.78 0.13 75)" }}>
              {category}
            </span>
          )}
          {readTime > 0 && <span>{readTime} دقائق قراءة</span>}
          <span style={{ width: 80, height: 1, background: "oklch(0.5 0.01 80 / 0.6)" }} />
        </div>

        {/* Bottom brand */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            right: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "oklch(0.78 0.13 75)",
            fontSize: 22,
            letterSpacing: 4,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid oklch(0.78 0.13 75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            M
          </span>
          <span>MARYAM PHOTOGRAPHY</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
