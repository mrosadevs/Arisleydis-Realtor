import { ImageResponse } from "next/og";

export const alt = "Arisleydis Cruz | Luxury Florida Real Estate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(145deg, #0c1a0f 0%, #1a2e1e 30%, #0f1f12 100%)",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gold accent line top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent 0%, #c9a96e 20%, #e8d5a3 50%, #c9a96e 80%, transparent 100%)",
          }}
        />

        {/* Subtle pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(201,169,110,0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(201,169,110,0.05) 0%, transparent 50%)",
          }}
        />

        {/* Gold glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: "13px",
            fontWeight: 400,
            color: "#c9a96e",
            letterSpacing: "6px",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}
        >
          Luxury Real Estate
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            fontSize: "68px",
            fontWeight: 700,
            color: "#f5f0e8",
            lineHeight: 1.1,
            letterSpacing: "-1px",
          }}
        >
          Arisleydis Cruz
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 400,
            color: "rgba(245,240,232,0.45)",
            marginTop: "16px",
            letterSpacing: "1px",
          }}
        >
          Your Trusted Realtor in Florida
        </div>

        {/* Divider + tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "50px",
              height: "1px",
              background: "linear-gradient(90deg, #c9a96e, rgba(201,169,110,0.2))",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "14px",
              color: "rgba(201,169,110,0.6)",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Buy &bull; Sell &bull; Invest
          </div>
        </div>

        {/* Gold accent line bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent 0%, #c9a96e 20%, #e8d5a3 50%, #c9a96e 80%, transparent 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
