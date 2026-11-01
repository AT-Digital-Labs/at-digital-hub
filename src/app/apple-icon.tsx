import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Interim monogram until an approved logo is supplied.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d90416",
          color: "#ffffff",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        AT
      </div>
    ),
    size,
  );
}
