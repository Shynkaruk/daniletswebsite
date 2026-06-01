// SEO.jsx
// ============================================================
// Універсальний SEO компонент для всіх сторінок сайту.
// Використовує react-helmet-async для динамічного керування <head>.
//
// Підтримує всі 3 домени:
//   danilets.com            — головний сайт
//   daniletsdetailing.com   — авто детейлінг
//   daniletscleaning.com    — комерційне прибирання
//
// Використання:
//   <SEO title="..." description="..." />
//   <SEO title="..." description="..." canonical="https://..." />
// ============================================================

import { Helmet } from "react-helmet-async";

// Визначаємо базовий URL для canonical в залежності від домену
function getBaseUrl() {
  if (typeof window === "undefined") return "https://danilets.com";
  const host = window.location.hostname.toLowerCase();
  if (host.includes("daniletsdetailing")) return "https://daniletsdetailing.com";
  if (host.includes("daniletscleaning"))  return "https://daniletscleaning.com";
  return "https://danilets.com";
}

const SEO = ({
  // Назва сторінки (без суфіксу — додається автоматично)
  title,
  // Короткий опис (до 160 символів), відображається в результатах Google
  description,
  // Canonical URL (якщо не вказано — береться поточний шлях)
  canonical,
  // Open Graph зображення (за замовчуванням — перший hero)
  image = "/Top_of_Page/1.webp",
  // Тип сторінки для Open Graph
  type = "website",
  // Додаткові meta теги (наприклад noindex для /admin)
  noIndex = false,
}) => {
  const baseUrl  = getBaseUrl();
  const fullUrl  = canonical || (typeof window !== "undefined" ? window.location.href : baseUrl);
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  // Суфікс в тайтлі залежить від домену
  const siteName = baseUrl.includes("detailing")
    ? "Danilets Auto Detailing"
    : baseUrl.includes("cleaning")
    ? "Danilets Cleaning"
    : "Danilets";

  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Columbus, OH`;

  return (
    <Helmet>
      {/* === Базові теги === */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={fullUrl} />

      {/* === Open Graph (Facebook, LinkedIn, Telegram тощо) === */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={fullUrl} />
      <meta property="og:type"        content={type} />
      <meta property="og:image"       content={imageUrl} />
      <meta property="og:site_name"   content={siteName} />
      <meta property="og:locale"      content="en_US" />

      {/* === Twitter Card === */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={imageUrl} />
    </Helmet>
  );
};

export default SEO;
