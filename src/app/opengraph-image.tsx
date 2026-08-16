import { ImageResponse } from "next/og";
import { identity } from "@/data/portfolio";

export const alt = "Pratham Gosai — IT & network engineer turned AI-automation and full-stack builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Satori supports flexbox only — no grid — and caps the bundle at 500KB, so
 * this is deliberately plain: no custom fonts, no images.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f1620 0%, #16202c 60%, #101a24 100%)",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "20px",
              background: "#e39a2c",
              color: "#0f1620",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            PG
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#a3b0bd", letterSpacing: "0.14em" }}>
            PORTFOLIO
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "72px", height: "6px", background: "#e39a2c", marginBottom: 28 }} />
          <div style={{ display: "flex", fontSize: 78, fontWeight: 700, color: "#eef2f6", letterSpacing: "-0.02em" }}>
            {identity.name}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 34, color: "#a3b0bd", maxWidth: "920px" }}>
            {identity.oneLine}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#e39a2c", letterSpacing: "0.14em" }}>
          SURAT, INDIA · WORKFORCEIQ · CLAUDE API
        </div>
      </div>
    ),
    size,
  );
}
