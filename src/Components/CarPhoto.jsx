// src/Components/CarPhoto.jsx
// Fetches a representative car photo from Wikipedia (free, no API key, CORS-enabled).
// Falls back to a 🚗 placeholder if nothing is found.
import React, { useState, useEffect, useRef } from "react";

/**
 * Search Wikipedia for a car article and return its thumbnail URL.
 * We fetch up to 5 search results and return the first one that has a thumbnail,
 * preferring articles whose title contains the make name.
 */
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
      pithumbsize: "800",
      format:      "json",
      origin:      "*", // allows browser CORS requests
    });
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?${params.toString()}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    if (!pages.length) return null;

    // Prefer pages whose title includes the make (e.g. "BMW 1 Series" over "Formula 1")
    const makeWords = make.toLowerCase().split(/\s+/);
    const sorted = [...pages].sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const aMatch = makeWords.some((w) => aTitle.includes(w));
      const bMatch = makeWords.some((w) => bTitle.includes(w));
      return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
    });

    for (const page of sorted) {
      if (page?.thumbnail?.source) return page.thumbnail.source;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * CarPhoto — shows a car photo fetched from Wikipedia.
 *
 * Props:
 *   make    {string}
 *   model   {string}
 *   year    {string|number}
 *   color   {string}        — used for alt text only
 *   className {string}      — controls container size via Tailwind
 */
export default function CarPhoto({ make, model, year, color, className = "" }) {
  const [imgSrc,  setImgSrc]  = useState(null);
  const [uiState, setUiState] = useState("idle"); // idle | loading | ok | error
  const timerRef = useRef(null);

  useEffect(() => {
    if (!make?.trim() || !year?.toString().trim()) {
      setUiState("idle");
      setImgSrc(null);
      return;
    }

    // Debounce: wait 600 ms after last change before firing the API call
    clearTimeout(timerRef.current);
    setUiState("loading");
    setImgSrc(null);

    timerRef.current = setTimeout(() => {
      fetchWikiCarPhoto(make, model).then((url) => {
        if (url) {
          setImgSrc(url);
          // uiState → "ok" fires via img onLoad below
        } else {
          setUiState("error");
        }
      });
    }, 600);

    return () => clearTimeout(timerRef.current);
  }, [make, model, year]);

  // Nothing to show yet
  if (!make?.trim() || !year?.toString().trim()) return null;

  const alt = [year, make, model, color].filter(Boolean).join(" ");

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#F4F4F5] flex items-center justify-center min-h-[80px] ${className}`}
    >
      {/* Loading pulse */}
      {uiState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F4F4F5]">
          <span className="text-4xl opacity-30 animate-pulse select-none">🚗</span>
        </div>
      )}

      {/* Not found */}
      {uiState === "error" && (
        <div className="flex flex-col items-center justify-center gap-1 py-6 text-[#9CA3AF]">
          <span className="text-5xl select-none">🚗</span>
          <span className="text-xs">No photo found</span>
        </div>
      )}

      {/* Photo — hidden until fully loaded, then fades in */}
      {imgSrc && (
        <img
          key={imgSrc}
          src={imgSrc}
          alt={alt}
          onLoad={() => setUiState("ok")}
          onError={() => { setImgSrc(null); setUiState("error"); }}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            uiState === "ok" ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        />
      )}
    </div>
  );
}
