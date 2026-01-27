import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Club Seminario - Institución deportiva y social";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#730d32",
          backgroundImage:
            "linear-gradient(135deg, #730d32 0%, #5a0a28 50%, #730d32 100%)",
        }}
      >
        {/* Logo placeholder - circles representing wolves */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: "#f7b643",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: 60,
                color: "#730d32",
                fontWeight: 700,
              }}
            >
              CS
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-2px",
              marginBottom: 16,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            Club Seminario
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#f7b643",
              fontWeight: 500,
            }}
          >
            Institución deportiva, social y cultural
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 60,
            marginTop: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "white",
              }}
            >
              +1000
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Socios
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "white",
              }}
            >
              22
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Categorías
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "white",
              }}
            >
              +600
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Partidos/año
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #f7b643 0%, #e5a331 100%)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
