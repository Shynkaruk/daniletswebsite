// src/Components/CarPhoto.jsx
// Shows a car photo from Wikipedia + CSS color-blend overlay matching the selected color.
import React, { useState, useEffect, useRef } from "react";

// ── CSS colors for each vehicle color name ──────────────────────────────────
const COLOR_CSS = {
  // whites / lights
  "white":        "#FFFFFF",
  "pearl white":  "#F5F5F0",
  "off white":    "#FAF0E6",
  "cream":        "#FFFDD0",
  "champagne":    "#EFE0B0",
  "beige":        "#E8DCC8",
  "tan":          "#C9A97A",
  // grays / blacks
  "black":        "#0A0A0A",
  "gloss black":  "#050505",
  "matte black":  "#1A1A1A",
  "charcoal":     "#2C3540",
  "dark gray":    "#333333",
  "gray":         "#707070",
  "grey":         "#707070",
  "silver":       "#B8B8B8",
  // reds
  "red":          "#CC1800",
  "dark red":     "#7A0000",
  "burgundy":     "#6E001A",
  "maroon":       "#620000",
  // blues
  "blue":         "#1035A8",
  "dark blue":    "#00007A",
  "navy":         "#00114A",
  "sky blue":     "#6AAEE8",
  "light blue":   "#90C8F0",
  // greens
  "green":        "#1A7A1A",
  "dark green":   "#004A00",
  "forest green": "#1A4A1A",
  "olive":        "#5A6200",
  // others
  "yellow":       "#E8C800",
  "gold":         "#A07800",
  "orange":       "#CC4400",
  "brown":        "#6A2E0E",
  "purple":       "#5A0080",
  "bronze":       "#A05C20",
  "copper":       "#8C4E1E",
  "pink":         "#E870A0",
};

function cssForColor(colorName) {
  if (!colorName) return null;
  return COLOR_CSS[colorName.toLowerCase().trim()] ?? null;
}

// ── Wikipedia photo search ───────────────────────────────────────────────────
async function fetchWikiCarPhoto(make, model) {
  const query = [make, model].filter(Boolean).join(" ").trim();
  if (!query) return null;
  try {
    const params = new URLSearchParams({
      action:      "query",
      generator:   "search",
      gsrsearch:   query,
      gsrlimit:    "5",
      prop:        "pageimages",
      pithumbsize: "900",
      format:      "json",
      origin:      "*",
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    if (!pages.length) return null;

    // Prefer pages whose title contains the make name
    const makeWords = make.toLowerCase().split(/\s+/);
    const sorted = [...pages].sort((a, b) => {
      const aOk = makeWords.some((w) => (a.title || "").toLowerCase().includes(w));
      const bOk = makeWords.some((w) => (b.title || "").toLowerCase().includes(w));
      return aOk === bOk ? 0 : aOk ? -1 : 1;
    });

    for (const page of sorted) {
      if (page?.thumbnail?.source) return page.thumbnail.source;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CarPhoto({ make, model, year, color, className = "" }) {
  const [imgSrc,  setImgSrc]  = useState(null);
  const [uiState, setUiState] = useState("idle"); // idle | loading | ok | error
  const timerRef = useRef(null);

  // Re-fetch when make / model / year change (color only affects overlay, no refetch)
  useEffect(() => {
    if (!make?.trim() || !year?.toString().trim()) {
      setUiState("idle");
      setImgSrc(null);
      return;
    }
    clearTimeout(timerRef.current);
    setUiState("loading");
    setImgSrc(null);

    timerRef.current = setTimeout(() => {
      fetchWikiCarPhoto(make, model).then((url) => {
        if (url) {
          setImgSrc(url);
        } else {
          setUiState("error");
        }
      });
    }, 600);

    return () => clearTimeout(timerRef.current);
  }, [make, model, year]);

  if (!make?.trim() || !year?.toString().trim()) return null;

  const alt      = [year, make, model, color].filter(Boolean).join(" ");
  const colorCss = cssForColor(color);

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#F4F4F5] ${className}`}>

      {/* Loading */}
      {uiState === "loading" && (
        <div className="flex items-center justify-center h-[120px]">
          <span className="text-4xl opacity-30 animate-pulse select-none">🚗</span>
        </div>
      )}

      {/* Not found */}
      {uiState === "error" && (
        <div className="flex flex-col items-center justify-center gap-1 h-[120px] text-[#9CA3AF]">
          <span className="text-5xl select-none">🚗</span>
          <span className="text-xs">No photo found</span>
        </div>
      )}

      {/* Photo */}
      {imgSrc && (
        <>
          <img
            key={imgSrc}
            src={imgSrc}
            alt={alt}
            onLoad={() => setUiState("ok")}
            onError={() => { setImgSrc(null); setUiState("error"); }}
            className={`w-full h-auto block transition-opacity duration-500 ${
              uiState === "ok" ? "opacity-100" : "opacity-0 h-0"
            }`}
          />

          {/* Color blend overlay — shifts the image hue toward the selected color */}
          {uiState === "ok" && colorCss && (
            <div
              aria-hidden="true"
              style={{
                position:       "absolute",
                inset:          0,
                backgroundColor: colorCss,
                mixBlendMode:   "color",   // preserves luminance, applies color hue
                opacity:        0.55,
                pointerEvents:  "none",
              }}
            />
          )}

          {/* Color badge — bottom-right corner */}
          {uiState === "ok" && color && (
            <div
              style={{ position: "absolute", bottom: 10, right: 10 }}
              className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full shadow text-[12px] font-semibold text-[#111827]"
            >
              {colorCss && (
                <span
                  style={{
                    display:      "inline-block",
                    width:        12,
                    height:       12,
                    borderRadius: "50%",
                    background:   colorCss,
                    border:       "1.5px solid rgba(0,0,0,0.15)",
                    flexShrink:   0,
                  }}
                />
              )}
              {color}
            </div>
          )}
        </>
      )}
    </div>
  );
}
