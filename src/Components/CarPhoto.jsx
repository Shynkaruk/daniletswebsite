// src/Components/CarPhoto.jsx
// Auto-fetches a car stock photo via imagin.studio CDN
// Works for major makes (Toyota, Ford, BMW, Mercedes-Benz, Honda, etc.)
import React, { useState, useEffect } from "react";

/** Normalize user-typed make names → imagin.studio slugs */
const MAKE_MAP = {
  mercedes: "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  "mercedes-benz": "mercedes-benz",
  chevy: "chevrolet",
  chevrolet: "chevrolet",
  vw: "volkswagen",
  volkswagen: "volkswagen",
  "land rover": "land-rover",
  landrover: "land-rover",
  "land-rover": "land-rover",
  ford: "ford",
  toyota: "toyota",
  honda: "honda",
  bmw: "bmw",
  audi: "audi",
  nissan: "nissan",
  hyundai: "hyundai",
  kia: "kia",
  lexus: "lexus",
  acura: "acura",
  infiniti: "infiniti",
  subaru: "subaru",
  mazda: "mazda",
  jeep: "jeep",
  dodge: "dodge",
  chrysler: "chrysler",
  ram: "ram",
  gmc: "gmc",
  cadillac: "cadillac",
  buick: "buick",
  lincoln: "lincoln",
  volvo: "volvo",
  porsche: "porsche",
  jaguar: "jaguar",
  tesla: "tesla",
  mitsubishi: "mitsubishi",
  maserati: "maserati",
  ferrari: "ferrari",
  lamborghini: "lamborghini",
  bentley: "bentley",
  rollsroyce: "rolls-royce",
  "rolls royce": "rolls-royce",
  "rolls-royce": "rolls-royce",
  genesis: "genesis",
  alfa: "alfa-romeo",
  "alfa romeo": "alfa-romeo",
  mini: "mini",
  fiat: "fiat",
  peugeot: "peugeot",
  renault: "renault",
};

function normalizeMake(make) {
  if (!make) return "";
  const lower = make.toLowerCase().trim();
  return MAKE_MAP[lower] || lower.replace(/\s+/g, "-");
}

function buildUrl({ make, year }) {
  const slug = normalizeMake(make);
  if (!slug || !year) return null;
  const p = new URLSearchParams({
    customer: "img",
    make: slug,
    modelYear: String(year),
    zoomType: "fullscreen",
    angle: "22",
  });
  return `https://cdn.imagin.studio/getimage?${p.toString()}`;
}

/**
 * CarPhoto — shows a car stock photo from imagin.studio CDN.
 *
 * Props:
 *   make    {string}  — car brand (e.g. "Toyota", "Mercedes")
 *   model   {string}  — car model (e.g. "Camry") — used for alt text only
 *   year    {string|number} — model year (e.g. "2022")
 *   color   {string}  — color name — used for alt text only
 *   className {string} — extra Tailwind classes (controls size)
 */
export default function CarPhoto({ make, model, year, color, className = "" }) {
  const [state, setState] = useState("loading"); // loading | ok | error
  const url = buildUrl({ make, year });

  useEffect(() => {
    setState(url ? "loading" : "error");
  }, [url]);

  if (!make || !year) return null;

  const alt = [year, make, model, color].filter(Boolean).join(" ");

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#F4F4F5] flex items-center justify-center ${className}`}
    >
      {/* Skeleton / Placeholder */}
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F4F4F5]">
          <span className="text-4xl opacity-30 animate-pulse select-none">🚗</span>
        </div>
      )}

      {/* Error fallback */}
      {state === "error" && (
        <div className="flex flex-col items-center justify-center gap-1 py-6 text-[#9CA3AF]">
          <span className="text-5xl select-none">🚗</span>
          <span className="text-xs">No photo found</span>
        </div>
      )}

      {/* Actual image */}
      {url && (
        <img
          key={url}
          src={url}
          alt={alt}
          onLoad={() => setState("ok")}
          onError={() => setState("error")}
          className={`w-full h-full object-contain transition-opacity duration-500 ${
            state === "ok" ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        />
      )}
    </div>
  );
}
