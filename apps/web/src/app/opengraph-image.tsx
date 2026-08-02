import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo";

export const runtime = "edge";
export const alt = siteConfig.description;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#C7FF3D",
          border: "8px solid #111111",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#111111",
            lineHeight: 0.95,
            letterSpacing: -2,
          }}
        >
          Stop refreshing
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            textTransform: "uppercase",
            color: "transparent",
            WebkitTextStroke: "3px #111111",
            lineHeight: 0.95,
          }}
        >
          NTA every
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#111111",
            lineHeight: 0.95,
          }}
        >
          15 minutes.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            color: "#111111",
            opacity: 0.8,
          }}
        >
          {siteConfig.tagline}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 36,
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#111111",
          }}
        >
          Aviso
        </div>
      </div>
    ),
    { ...size },
  );
}
