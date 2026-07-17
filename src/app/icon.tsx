import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Amber status-LED dot on the enclosure — the site's mark, in miniature. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1620",
          color: "#e39a2c",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        P
      </div>
    ),
    size,
  );
}
