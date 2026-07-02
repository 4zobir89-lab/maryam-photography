import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "مدوّنة مريم";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori does not support oklch — use hex equivalents
const COLORS = {
  bgDark: "#0d0e12",
  bgLight: "#1a1c22",
  gold: "#d4a657",
  goldLight: "#e8c987",
  muted: "#9a9588",
  border: "#7d7a72",
};

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
          background: `linear-gradient(135deg, ${COLORS.bgLight}, ${COLORS.bgDark})`,
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
              `radial-gradient(circle at top right, rgba(212, 166, 87, 0.15), transparent 70%)`,
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: COLORS.gold,
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

        {/* Title */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: COLORS.goldLight,
            textAlign: "right",
            lineHeight: 1.15,
            maxWidth: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            textShadow: `0 0 30px rgba(212, 166, 87, 0.3)`,
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
            color: COLORS.muted,
            fontSize: 22,
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          {category && (
            <span style={{ color: COLORS.gold }}>
              {category}
            </span>
          )}
          {readTime > 0 && <span>{readTime} دقائق قراءة</span>}
          <span style={{ width: 80, height: 1, background: `rgba(125, 122, 114, 0.6)` }} />
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
            color: COLORS.gold,
            fontSize: 22,
            letterSpacing: 4,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `1px solid ${COLORS.gold}`,
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
