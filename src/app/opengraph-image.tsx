import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "مريم | Maryam Photography — Yemeni Visual Storyteller";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori (OG image engine) does not support oklch — use hex equivalents
// oklch(0.08 0.005 285) ≈ #14151a (dark background)
// oklch(0.16 0.02 285) ≈ #26282f (lighter dark)
// oklch(0.78 0.13 75) ≈ #d4a657 (champagne gold)
// oklch(0.85 0.12 80) ≈ #e8c987 (light gold)
// oklch(0.62 0.01 80) ≈ #9a9588 (muted)
// oklch(0.5 0.01 80) ≈ #7d7a72

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 45%, #26282f, #14151a)",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Decorative gold ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 460,
            height: 460,
            borderRadius: "50%",
            border: "1px solid rgba(212, 166, 87, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 380,
              height: 380,
              borderRadius: "50%",
              border: "1px solid rgba(212, 166, 87, 0.25)",
            }}
          />
        </div>

        {/* Top tagline */}
        <div
          style={{
            position: "absolute",
            top: 80,
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#d4a657",
            fontSize: 16,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 40, height: 1, background: "#d4a657" }} />
          <span>YEMENI VISUAL STORYTELLER</span>
          <span style={{ width: 40, height: 1, background: "#d4a657" }} />
        </div>

        {/* Main name — Arabic "مريم" in serif gold */}
        <div
          style={{
            fontSize: 220,
            fontWeight: 700,
            color: "#e8c987",
            textShadow: "0 0 40px rgba(212, 166, 87, 0.4)",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          مريم
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 24,
            fontSize: 44,
            fontWeight: 400,
            letterSpacing: 12,
            color: "#d4a657",
            textTransform: "uppercase",
          }}
        >
          Maryam Photography
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#9a9588",
            fontSize: 18,
            letterSpacing: 6,
          }}
        >
          <span style={{ width: 60, height: 1, background: "rgba(125, 122, 114, 0.6)" }} />
          <span>SANA&apos;A · YEMEN</span>
          <span style={{ width: 60, height: 1, background: "rgba(125, 122, 114, 0.6)" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
