// StructuredData.jsx
// ============================================================
// JSON-LD structured data (Schema.org) для всіх сторінок.
//
// Телефон, email та адреса завантажуються з ContentBlock API
// через хук useBusinessInfo — їх можна змінювати у /admin/settings
// без деплою.
//
// Google використовує ці дані для:
//   - Knowledge Panel (бізнес картка у пошуку)
//   - Local Pack (карта + контакти)
//   - Rich Results (розширені результати)
// ============================================================

import { Helmet } from "react-helmet-async";
import { useBusinessInfo } from "../hooks/useBusinessInfo.js";

// ---- Головна сторінка: показує обидва напрямки бізнесу ----
export function MainStructuredData() {
  const { phone, email, address, loading } = useBusinessInfo();
  if (loading) return null; // не рендеримо JSON-LD поки дані не завантажені

  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoWash"],
    name: "Danilets",
    alternateName: "Danilets Family Services",
    description: "Columbus' trusted family-owned provider of premium auto detailing and commercial cleaning services. Serving Central Ohio since 2013.",
    url: "https://danilets.com",
    telephone: phone,
    email: email,
    foundingDate: "2013",
    priceRange: "$$",
    image: "https://danilets.com/Top_of_Page/1.webp",
    logo: "https://danilets.com/Symbol_D_filled with white.svg",
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Columbus",
      addressRegion: "OH",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: 39.9612, longitude: -82.9988 },
    areaServed: [
      { "@type": "City", name: "Columbus", containedInPlace: { "@type": "State", name: "Ohio" } },
      { "@type": "City", name: "Dublin" },
      { "@type": "City", name: "Westerville" },
      { "@type": "City", name: "Hilliard" },
      { "@type": "City", name: "Grove City" },
    ],
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "16:00" },
    ],
    sameAs: ["https://daniletsdetailing.com", "https://daniletscleaning.com"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Our Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Auto Detailing", description: "Premium mobile auto detailing: interior & exterior cleaning, ceramic coating, paint protection.", url: "https://daniletsdetailing.com" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial & Residential Cleaning", description: "Professional cleaning services: residential, commercial, move-in/move-out, deep cleaning.", url: "https://daniletscleaning.com" } },
      ],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ---- Сторінка авто детейлінгу ----
export function DetailingStructuredData() {
  const { phone, email, address, loading } = useBusinessInfo();
  if (loading) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoWash"],
    name: "Danilets Auto Detailing",
    description: "Professional auto detailing in Columbus, Ohio. Mobile detailing, ceramic coating, paint protection, interior & exterior detailing for personal and fleet vehicles.",
    url: "https://daniletsdetailing.com",
    telephone: phone,
    email: email,
    priceRange: "$$",
    image: "https://daniletsdetailing.com/Top_of_Page/2.webp",
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Columbus",
      addressRegion: "OH",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: 39.9612, longitude: -82.9988 },
    areaServed: { "@type": "State", name: "Ohio" },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "16:00" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Detailing Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Interior & Exterior Detailing" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ceramic Coating" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Paint Protection Film" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mobile Detailing" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fleet Detailing" } },
      ],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://daniletsdetailing.com" },
        { "@type": "ListItem", position: 2, name: "Auto Detailing Services", item: "https://daniletsdetailing.com/#services" },
      ],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ---- Сторінка прибирання ----
export function CleaningStructuredData() {
  const { phone, email, address, loading } = useBusinessInfo();
  if (loading) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HousePainter"],
    "@id": "https://daniletscleaning.com/#business",
    name: "Danilets Cleaning",
    description: "Professional cleaning services in Columbus, Ohio. Residential, commercial, move-in/move-out, and deep cleaning. Eco-friendly products, flexible scheduling.",
    url: "https://daniletscleaning.com",
    telephone: phone,
    email: email,
    priceRange: "$$",
    image: "https://daniletscleaning.com/Portfolio_Cleaning/Box 1/Main.webp",
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Columbus",
      addressRegion: "OH",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: 39.9612, longitude: -82.9988 },
    areaServed: { "@type": "State", name: "Ohio" },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "16:00" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Residential Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Move-In / Move-Out Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Deep Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fleet / Vehicle Interior Cleaning" } },
      ],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://daniletscleaning.com" },
        { "@type": "ListItem", position: 2, name: "Cleaning Services", item: "https://daniletscleaning.com/#services" },
      ],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
