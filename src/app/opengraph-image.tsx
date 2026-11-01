import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — software development and AI automation`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#ffffff",
          color: "#111111",
          fontFamily: "sans-serif",
        }}
      >
        {/* Swiss Red geometric field */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 360, height: 630, background: "#d90416", display: "flex" }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 860 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#d90416" }}>{siteConfig.wordmark.accent}</span>
            <span style={{ whiteSpace: "pre" }}>{siteConfig.wordmark.rest}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#525252", textTransform: "uppercase", marginBottom: 24 }}>
              Software development &amp; AI automation
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>
              <span>Your ideas.</span>
              <span style={{ color: "#d90416" }}>Built into software.</span>
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 26, color: "#525252" }}>
            {siteConfig.location.city}, {siteConfig.location.country}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
