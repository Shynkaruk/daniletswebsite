// src/pages/Booking.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../Head";
import Footer from "../Footer";
import fon_booking from "../../assets/photo/fon_booking.png";
import searchIcon from "../../assets/icons/search.svg?url";
import {
  FiMapPin,
  FiAlertTriangle,
  FiChevronLeft,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { LuTruck, LuStore, LuStar } from "react-icons/lu";
import { auth, meApi, reqApi, cardsApi } from "../../lib/api";

/** ======= Google Places loader (без сторонніх бібліотек) ======= */
function useGooglePlaces({
  language = "en",
  region = "US",
  countries = ["us"],
} = {}) {
  const [ready, setReady] = useState(false);
  const autoSvcRef = useRef(null);
  const placesSvcRef = useRef(null);

  useEffect(() => {
    const existing =
      window.google && window.google.maps && window.google.maps.places;
    if (existing) {
      setReady(true);
      return;
    }
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return;

    const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=${language}&region=${region}`;
    const id = "gmaps-places-sdk";
    if (document.getElementById(id)) return;

    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.src = src;
    s.onload = () => setReady(true);
    s.onerror = () => setReady(false);
    document.head.appendChild(s);
  }, [language, region]);

  const ensureServices = () => {
    if (!ready) return;
    if (!autoSvcRef.current) {
      autoSvcRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (!placesSvcRef.current) {
      const div = document.createElement("div");
      placesSvcRef.current = new window.google.maps.places.PlacesService(div);
    }
  };

  const getPredictions = (input) =>
    new Promise((resolve) => {
      if (!ready || !input?.trim()) return resolve([]);
      ensureServices();
      autoSvcRef.current.getPlacePredictions(
        {
          input,
          types: ["address"],
          componentRestrictions: countries?.length
            ? { country: countries }
            : undefined,
        },
        (preds) => resolve(preds || [])
      );
    });

  const getPlaceDetails = (placeId) =>
    new Promise((resolve) => {
      if (!ready || !placeId) return resolve(null);
      ensureServices();
      placesSvcRef.current.getDetails(
        {
          placeId,
          fields: [
            "formatted_address",
            "geometry",
            "address_components",
            "name",
            "place_id",
          ],
        },
        (res, status) => resolve(status === "OK" ? res : null)
      );
    });

  return { ready, getPredictions, getPlaceDetails };
}
/** ======= /loader ======= */

const GOLD = "#E1C07B";
const GRAY = "#A8A8AD";
  const CATEGORY_TABS = [
    { label: "Cleaning", key: "cleaning" },
    { label: "Detailing", key: "detailing" },
    { label: "Media", key: "media" },
    { label: "Pickleball", key: "pickleball" },
  ];

// податок (7%)
const TAX_RATE = 0.07;

const Booking = () => {
  // таби формуємо з мапи категорій
  const tabs = CATEGORY_TABS.map((t) => t.label);
  const [active, setActive] = useState(tabs[0]);
  // ключ (slug) активної категорії для запитів у БД
  const activeKey = React.useMemo(
    () => CATEGORY_TABS.find((t) => t.label === active)?.key || "",
    [active]
  );

  // Steps:
  // 1 — Search; 2 — Choose Locations; 3 — Our Shop Locations; 4 — Vehicle; 5 — Select Service;
  // 6 — Add More Services; 7 — Your Contact Details; 8 — Checkout
  const [step, setStep] = useState(1);

  // Google Places
  const { ready, getPredictions, getPlaceDetails } = useGooglePlaces({
    language: "en",
    region: "US",
    countries: ["us"],
  });

  /** ---------- STEP 1: Search ---------- */
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [selected, setSelected] = useState(null);
  const typingTimer = useRef(null);

  const fallbackSuggestions = useMemo(
    () =>
      [
        "10950 SW 5th St, Beaverton",
        "10950 SW 5th St, Beaverton",
        "10950 SW 5th St, Beaverton",
      ].map((addr, i) => ({ description: addr, place_id: `fallback-${i}` })),
    []
  );

  const handleChange = (val) => {
    setQuery(val);
    setSelected(null);
    if (typingTimer.current) clearTimeout(typingTimer.current);

    if (!val.trim()) {
      setPredictions([]);
      return;
    }

    typingTimer.current = setTimeout(async () => {
      if (ready) {
        const preds = await getPredictions(val);
        setPredictions(
          preds.map((p) => ({
            description: p.description,
            place_id: p.place_id,
            sf: p.structured_formatting,
          }))
        );
      } else {
        setPredictions(fallbackSuggestions);
      }
    }, 250);
  };

  const handleChoose = (item) => {
    setSelected(item);
    setQuery(item.description);
    setPredictions([]);
  };

  const onSearch = async () => {
    const target = selected || predictions[0];
    if (!target) return;
    const details = target.place_id?.startsWith("fallback-")
      ? {
          formatted_address: target.description,
          geometry: null,
          place_id: target.place_id,
        }
      : await getPlaceDetails(target.place_id);

    console.log("Search result:", details || target);
    setStep(2);
  };

  const hasInput = query.trim().length > 0;
  const visibleList = step === 1 && hasInput ? predictions : [];

  /** ---------- STEP 2: Choose Locations ---------- */
  const [serviceType, setServiceType] = useState("mobile"); // "mobile" | "shop"
  const mobileColor = serviceType === "mobile" ? GOLD : GRAY;
  const shopColor = serviceType === "shop" ? GOLD : GRAY;

  /** ---------- STEP 3: Our Shop Locations ---------- */
  const [shopMode, setShopMode] = useState("dropoff"); // "dropoff" | "pickup"
  const shopAddress = "4014 Gender Rd, Canal Winchester, OH";

  const [pickupQuery, setPickupQuery] = useState("");
  const [pickupPreds, setPickupPreds] = useState([]);
  const [pickupSelected, setPickupSelected] = useState(null);
  const pickupTimer = useRef(null);

  const handlePickupChange = (val) => {
    setPickupQuery(val);
    setPickupSelected(null);
    if (pickupTimer.current) clearTimeout(pickupTimer.current);

    if (!val.trim()) {
      setPickupPreds([]);
      return;
    }

    pickupTimer.current = setTimeout(async () => {
      if (ready) {
        const preds = await getPredictions(val);
        setPickupPreds(
          preds.map((p) => ({
            description: p.description,
            place_id: p.place_id,
            sf: p.structured_formatting,
          }))
        );
      } else {
        setPickupPreds(fallbackSuggestions);
      }
    }, 250);
  };

  const handlePickupChoose = (item) => {
    setPickupSelected(item);
    setPickupQuery(item.description);
    setPickupPreds([]);
  };

  const canContinueShop =
    shopMode === "dropoff" ? true : pickupQuery.trim().length > 0;

  /** ---------- STEP 4: Vehicle ---------- */
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const validYear = (y) =>
    /^\d{4}$/.test(y) && +y >= 1980 && +y <= new Date().getFullYear() + 1;
  const canContinueVehicle =
    validYear(vehicleYear) && vehicleMake.trim() && vehicleModel.trim();

  /** ---------- SERVICES FROM DB ---------- */
  const [servicesDb, setServicesDb] = useState([]);
  const [addonsDb, setAddonsDb] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const selectedServiceObj = useMemo(
    () => servicesDb.find((s) => s.id === selectedServiceId) || null,
    [servicesDb, selectedServiceId]
  );

  // завантаження сервісів для активної категорії
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingServices(true);
      try {
        const svc = await cardsApi.list({
          type: "service",
          published: 1,
          category: activeKey, // ✅ додаємо категорію
        });
        if (!ignore) {
          setServicesDb(Array.isArray(svc) ? svc : []);
          if (!selectedServiceId && Array.isArray(svc) && svc.length) {
            setSelectedServiceId(svc[0].id);
          }
        }
      } finally {
        if (!ignore) setLoadingServices(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [activeKey]); // ✅ перезапуск при зміні таба

  // завантаження аддонів для активної категорії
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingAddons(true);
      try {
        const ad = await cardsApi.list({
          type: "addon",
          published: 1,
          category: activeKey, // ✅ додаємо категорію
        });
        if (!ignore) setAddonsDb(Array.isArray(ad) ? ad : []);
      } finally {
        if (!ignore) setLoadingAddons(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [activeKey]); // ✅ перезапуск при зміні таба

  useEffect(() => {
    setSelectedAddOns(new Set());
  }, [activeKey]);

  /** ---------- STEP 5: Select Service ---------- */
  const canNextService = !!selectedServiceId;

  /** ---------- STEP 6: Add More Services (add-ons) ---------- */
  const [selectedAddOns, setSelectedAddOns] = useState(new Set()); // зберігаємо ID
  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  /** ---------- STEP 7: Your Contact Details ---------- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isPhone = (v) => v.replace(/[^\d]/g, "").length >= 7;
  const canContinueContact =
    firstName.trim() && lastName.trim() && isPhone(phone) && isEmail(email);

  /** ---------- STEP 8: Checkout ---------- */
  const [receiptOnly, setReceiptOnly] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const TIP_PRESETS = [5, 10, 20, 40, 50];
  const [tip, setTip] = useState(0);
  const [depositAmount, setDepositAmount] = useState(100);
  const [includeExtraAddress, setIncludeExtraAddress] = useState(true);

  // підрахунки
  const mainServicePrice = selectedServiceObj?.price
    ? Number(selectedServiceObj.price)
    : 0;
  const selectedAddOnsArr = useMemo(
    () => Array.from(selectedAddOns),
    [selectedAddOns]
  );
  const addOnsTotal = selectedAddOnsArr.reduce((acc, id) => {
    const found = addonsDb.find((a) => a.id === id);
    return acc + (found ? Number(found.price) || 0 : 0);
  }, 0);
  const subTotal = mainServicePrice + addOnsTotal;
  const tax = +(subTotal * TAX_RATE).toFixed(2);
  const total = +(subTotal + tax + tip).toFixed(2);

  // ========= Інтеграція із заявками =========
  const user = auth.getUser();
  const isLoggedIn = !!user;
  const [submitting, setSubmitting] = useState(false);

  // Автозаповнення контактів із профілю
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!isLoggedIn) return;
      try {
        const u = await meApi.profile();
        if (!ignore && u) {
          setFirstName(u.first_name || "");
          setLastName(u.last_name || "");
          setPhone(u.phone || "");
          setEmail(u.email || "");
        }
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  function buildLocationFields() {
    const baseAddress = query?.trim() || null;
    const shopAddr = "4014 Gender Rd, Canal Winchester, OH";

    if (serviceType === "shop") {
      if (shopMode === "pickup") {
        return {
          location_type: "pickup",
          service_address: shopAddr,
          pickup_address: pickupQuery || null,
          dropoff_address: shopAddr,
        };
      } else {
        return {
          location_type: "shop",
          service_address: shopAddr,
          pickup_address: null,
          dropoff_address: null,
        };
      }
    } else {
      // mobile
      return {
        location_type: "mobile",
        service_address: baseAddress,
        pickup_address: null,
        dropoff_address: null,
      };
    }
  }

  function buildItems() {
    const items = [];
    if (selectedServiceObj) {
      items.push({
        title: selectedServiceObj.title,
        price: Number(selectedServiceObj.price) || 0,
        qty: 1,
      });
    }
    selectedAddOnsArr.forEach((id) => {
      const add = addonsDb.find((a) => a.id === id);
      if (add)
        items.push({ title: add.title, price: Number(add.price) || 0, qty: 1 });
    });
    if (tip > 0) items.push({ title: "Tip", price: tip, qty: 1 });
    return items;
  }

  async function ensureVehicleId() {
    if (!isLoggedIn) return null;
    try {
      const my = await meApi.myVehicles();
      const found = (my || []).find(
        (v) =>
          String(v.year || "") === String(vehicleYear || "") &&
          String(v.make || "").toLowerCase() ===
            String(vehicleMake || "").toLowerCase() &&
          String(v.model || "").toLowerCase() ===
            String(vehicleModel || "").toLowerCase()
      );
      if (found) return found.id;

      const created = await meApi.saveVehicle({
        year: vehicleYear || null,
        make: vehicleMake || null,
        model: vehicleModel || null,
      });
      return created?.id || null;
    } catch {
      return null;
    }
  }

  async function submitRequest() {
    if (submitting) return;
    if (!isLoggedIn) {
      alert("Щоб надіслати заявку, увійдіть у свій акаунт.");
      return;
    }
    if (!canContinueVehicle || !canContinueContact) {
      alert("Заповніть, будь ласка, інформацію про авто та контакти.");
      return;
    }
    if (!selectedServiceObj) {
      alert("Будь ласка, виберіть послугу.");
      return;
    }

    setSubmitting(true);
    try {
      const vehicle_id = await ensureVehicleId();
      const loc = buildLocationFields();
      const items = buildItems();

      const notes = [
        `Booked via website`,
        `Service: ${selectedServiceObj.title}`,
        `Type: ${serviceType}${serviceType === "shop" ? ` (${shopMode})` : ""}`,
        `Vehicle: ${vehicleYear} ${vehicleMake} ${vehicleModel}`,
        `Address: ${loc.service_address || "-"}`,
        loc.pickup_address ? `Pickup: ${loc.pickup_address}` : null,
        loc.dropoff_address ? `Dropoff: ${loc.dropoff_address}` : null,
        `Deposit: $${depositAmount}`,
        `Extra address: ${includeExtraAddress ? "yes" : "no"}`,
        `Customer: ${firstName} ${lastName}, ${phone}, ${email}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const payload = {
        vehicle_id,
        status: "new",
        location_type: loc.location_type,
        service_date: null,
        time_window: null,
        service_address: loc.service_address,
        pickup_address: loc.pickup_address,
        dropoff_address: loc.dropoff_address,
        items_json: JSON.stringify(items),
        currency: "USD",
        subtotal: subTotal,
        tax,
        total,
        notes_customer: notes,
      };

      const saved = await reqApi.saveMine(payload);
      alert(
        `✅ Заявка створена (#${saved.id}). Ми звʼяжемось із вами найближчим часом.`
      );
      // Напр. редірект у профіль:
      // window.location.href = '/profile/requests';
    } catch (e) {
      const msg = e?.error || e?.message || "Failed to submit";
      alert("❌ Помилка надсилання: " + msg);
    } finally {
      setSubmitting(false);
    }
  }

  const progress = (activeCount) => (
    <div className="flex items-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="h-1 rounded-full flex-[1.2]"
          style={{
            background:
              i < activeCount
                ? "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)"
                : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="
        min-h-screen w-full
        grid grid-rows-[auto,1fr,auto]
        overflow-x-hidden
      "
      style={{
        backgroundImage: `url(${fon_booking})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />

      <main className="flex items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center text-center min-w-0">
          <h1 className="text-[#18181B] font-extrabold text-[26px] sm:text-[32px] mt-10 mb-6">
            Book with Danilets
          </h1>

          {/* Tabs */}
          <div className="w-full max-w-[100vw] -mx-4 px-4 overflow-x-auto touch-pan-x mb-6">
            <div className="w-max inline-flex items-center bg-[#F2F2F2]/90 rounded-full p-1 gap-2 whitespace-nowrap">
              {tabs.map((t) => {
                const isActive = active === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActive(t)}
                    className={[
                      "px-6 py-3 rounded-full text-[16px] sm:text-[18px] font-semibold transition",
                      isActive
                        ? "bg-white shadow text-[#18181B]"
                        : "text-[#5E5E61] hover:text-[#18181B]",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---------- STEP 1 ---------- */}
          {step === 1 && (
            <div className="w-full max-w-full min-w-0 space-y-3 text-left">
              <div className="relative">
                <img
                  src={searchIcon}
                  alt="Search"
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 z-10 select-none pointer-events-none"
                />
                <input
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  type="text"
                  placeholder="Enter your address"
                  className="
                    w-full max-w-full
                    h-[60px] sm:h-[64px]
                    rounded-full bg-white/90 backdrop-blur
                    pl-16 sm:pl-[4.5rem] pr-5
                    text-[16px] sm:text-[18px] text-[#18181B] placeholder:text-[#9CA3AF]
                    outline-none shadow box-border
                  "
                />
              </div>

              {hasInput && (
                <button
                  onClick={onSearch}
                  className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Search
                </button>
              )}

              {visibleList.length > 0 && (
                <ul className="space-y-2">
                  {visibleList.map((item, idx) => (
                    <li key={item.place_id || idx}>
                      <button
                        onClick={() => handleChoose(item)}
                        className="
                          w-full bg-white/90 backdrop-blur
                          rounded-[16px] px-3 py-3 shadow
                          flex items-center gap-3 text-left
                        "
                      >
                        <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F2F2F2]">
                          <FiMapPin className="text-[18px] text-[#18181B]" />
                        </span>
                        <span className="text-[#18181B] text-[15px] sm:text-[16px] truncate">
                          {item.sf?.main_text ? (
                            <>
                              <span className="font-semibold">
                                {item.sf.main_text}
                              </span>
                              {item.sf.secondary_text ? (
                                <span className="opacity-80">
                                  , {item.sf.secondary_text}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            item.description
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ---------- STEP 2 ---------- */}
          {step === 2 && (
            <div className="w-full max-w-full min-w-0 space-y-4 text-left">
              <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border-2 border-[#E5E7EB] bg-white inline-block" />
                  <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#18181B]">
                    Choose Locations
                  </h2>
                </div>

                {progress(1)}

                <div className="space-y-3">
                  <button
                    onClick={() => setServiceType("mobile")}
                    aria-pressed={serviceType === "mobile"}
                    className={`w-full rounded-[16px] px-3 py-3 shadow flex items-center justify-between
                      ${
                        serviceType === "mobile" ? "bg-[#F8F4EC]" : "bg-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <LuTruck
                        className="w-6 h-6"
                        style={{ color: mobileColor }}
                      />
                      <span className="text-[15px] sm:text-[16px] text-[#18181B]">
                        Mobile Service
                      </span>
                    </div>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center
                      ${
                        serviceType === "mobile"
                          ? "bg-[#E7D3A3]"
                          : "bg-[#EFEFEF]"
                      }`}
                    >
                      {serviceType === "mobile" ? "✓" : ""}
                    </span>
                  </button>

                  <button
                    onClick={() => setServiceType("shop")}
                    aria-pressed={serviceType === "shop"}
                    className={`w-full rounded-[16px] px-3 py-3 shadow flex items-center justify-between
                      ${serviceType === "shop" ? "bg-[#F8F4EC]" : "bg-white"}`}
                  >
                    <div className="flex items-center gap-3">
                      <LuStore
                        className="w-6 h-6"
                        style={{ color: shopColor }}
                      />
                      <span className="text-[15px] sm:text-[16px] text-[#18181B]">
                        Shop Service
                      </span>
                    </div>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center
                      ${
                        serviceType === "shop" ? "bg-[#E7D3A3]" : "bg-[#EFEFEF]"
                      }`}
                    >
                      {serviceType === "shop" ? "✓" : ""}
                    </span>
                  </button>

                  <div className="w-full rounded-[16px] px-3 py-3 bg-[#FFF7E5] border border-[#FDE68A] text-[#6B4E15] text-[14px] leading-snug flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 shrink-0">
                      <FiAlertTriangle className="text-[18px]" />
                    </span>
                    <span className="pr-2">
                      We only offer mobile service for 3 or more vehicles
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    serviceType === "shop" ? setStep(3) : setStep(4)
                  }
                  className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Continue <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 3 ---------- */}
          {step === 3 && serviceType === "shop" && (
            <div className="w-full max-w-full min-w-0 text-left">
              <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
                    aria-label="Back"
                  >
                    <FiChevronLeft className="text-[18px] text-[#18181B]" />
                  </button>
                  <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
                    Our Shop Locations
                  </h2>
                </div>

                {progress(2)}

                <div className="space-y-3">
                  <button
                    onClick={() => setShopMode("dropoff")}
                    aria-pressed={shopMode === "dropoff"}
                    className={`w-full rounded-[20px] px-4 py-4 flex items-center justify-between
                      ${
                        shopMode === "dropoff"
                          ? "bg-[#F8F4EC] shadow"
                          : "bg-white border border-[#E5E7EB]"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center">
                        <LuStore
                          className="w-5 h-5"
                          style={{
                            color: shopMode === "dropoff" ? GOLD : GRAY,
                          }}
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[16px] sm:text-[17px] font-bold text-[#18181B]">
                          Customer Drop-off
                        </div>
                        <div className="text-[14px] text-[#6B7280] truncate max-w-[220px] sm:max-w-[280px]">
                          {shopAddress}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${
                          shopMode === "dropoff"
                            ? "bg-[#E7D3A3]"
                            : "bg-[#EFEFEF]"
                        }`}
                    >
                      {shopMode === "dropoff" ? "✓" : ""}
                    </span>
                  </button>

                  <button
                    onClick={() => setShopMode("pickup")}
                    aria-pressed={shopMode === "pickup"}
                    className={`w-full rounded-[20px] px-4 py-4 flex items-center justify-between
                      ${
                        shopMode === "pickup"
                          ? "bg-[#F8F4EC] shadow"
                          : "bg-white border border-[#E5E7EB]"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center">
                        <LuStore
                          className="w-5 h-5"
                          style={{ color: shopMode === "pickup" ? GOLD : GRAY }}
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[16px] sm:text-[17px] font-bold text-[#18181B]">
                          Pick up &amp; Drop-off Service
                        </div>
                        <div className="text-[14px] text-[#6B7280]">
                          $5/mile
                        </div>
                      </div>
                    </div>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${
                          shopMode === "pickup"
                            ? "bg-[#E7D3A3]"
                            : "bg-[#EFEFEF]"
                        }`}
                    >
                      {shopMode === "pickup" ? "✓" : ""}
                    </span>
                  </button>

                  {shopMode === "pickup" && (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={searchIcon}
                          alt="Search"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 z-10 pointer-events-none select-none"
                        />
                        <input
                          value={pickupQuery}
                          onChange={(e) => handlePickupChange(e.target.value)}
                          type="text"
                          placeholder="Enter your address"
                          className="
                            w-full h-[56px] rounded-[16px]
                            bg-[#F4F4F5] pl-12 pr-4
                            text-[16px] text-[#18181B] placeholder:text-[#9CA3AF]
                            outline-none shadow-inner
                          "
                        />
                      </div>

                      {pickupPreds.length > 0 && (
                        <ul className="space-y-2">
                          {pickupPreds.map((item, idx) => (
                            <li key={item.place_id || idx}>
                              <button
                                onClick={() => handlePickupChoose(item)}
                                className="
                                  w-full bg-white/90 backdrop-blur
                                  rounded-[16px] px-3 py-3 shadow
                                  flex items-center gap-3 text-left
                                "
                              >
                                <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F2F2F2]">
                                  <FiMapPin className="text-[18px] text-[#18181B]" />
                                </span>
                                <span className="text-[#18181B] text-[15px] truncate">
                                  {item.sf?.main_text ? (
                                    <>
                                      <span className="font-semibold">
                                        {item.sf.main_text}
                                      </span>
                                      {item.sf.secondary_text ? (
                                        <span className="opacity-80">
                                          , {item.sf.secondary_text}
                                        </span>
                                      ) : null}
                                    </>
                                  ) : (
                                    item.description
                                  )}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="w-full rounded-[20px] px-4 py-3 bg-[#F2F2F2] text-[#1F2937] text-[14px] leading-snug flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EDE4D1] shrink-0">
                      <FiAlertTriangle
                        className="text-[18px]"
                        style={{ color: "#C89C3C" }}
                      />
                    </span>
                    <span className="pr-2">
                      Pick-up pricing calculated from shop location
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(4)}
                  disabled={!canContinueShop}
                  className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
                    ${!canContinueShop ? "opacity-60 cursor-not-allowed" : ""}`}
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Continue <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 4: Vehicle ---------- */}
          {step === 4 && (
            <div className="w-full max-w-full min-w-0 text-left">
              <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(serviceType === "shop" ? 3 : 2)}
                    className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
                    aria-label="Back"
                  >
                    <FiChevronLeft className="text-[18px] text-[#18181B]" />
                  </button>
                  <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
                    Tell Us About Your Vehicle
                  </h2>
                </div>

                {progress(3)}

                <div className="space-y-3">
                  <input
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    inputMode="numeric"
                    placeholder="Year of your car"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                  <input
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Make of your car"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                  <input
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Your car model"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                </div>

                <button
                  onClick={() => setStep(5)}
                  disabled={!canContinueVehicle}
                  className={`w-full h-[52px] rounded-[88px] font-semibold text_black shadow inline-flex items-center justify-center gap-2
                    ${
                      !canContinueVehicle ? "opacity-60 cursor-not-allowed" : ""
                    }`.replace("text_black", "text-black")}
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Continue <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 5: Select Service ---------- */}
          {step === 5 && (
            <div className="w-full max-w-full min-w-0 text-left">
              <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(4)}
                    className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
                    aria-label="Back"
                  >
                    <FiChevronLeft className="text-[18px] text-[#18181B]" />
                  </button>
                  <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
                    Select Service
                  </h2>
                </div>

                {progress(4)}

                <div className="space-y-3">
                  {loadingServices ? (
                    <div className="text-[#6B7280]">Loading…</div>
                  ) : servicesDb.length === 0 ? (
                    <div className="text-[#6B7280]">No services yet.</div>
                  ) : (
                    servicesDb.map((svc) => {
                      const active = selectedServiceId === svc.id;
                      return (
                        <button
                          key={svc.id}
                          onClick={() => setSelectedServiceId(svc.id)}
                          aria-pressed={active}
                          className={`w-full rounded-[20px] px-4 py-4 flex items-center justify-between
                            ${
                              active
                                ? "bg-[#F8F4EC] shadow"
                                : "bg-white border border-[#E5E7EB]"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <LuStar
                              className="w-5 h-5"
                              style={{ color: active ? GOLD : "#D5D5D8" }}
                            />
                            <span className="text-[16px] font-semibold text-[#18181B]">
                              {svc.title}
                              {svc.subtitle ? (
                                <span className="ml-2 text-[#6B7280] font-normal">
                                  · {svc.subtitle}
                                </span>
                              ) : null}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] text-[#6B7280]">
                              ${(Number(svc.price) || 0).toFixed(2)}
                            </span>
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center
                              ${active ? "bg-[#E7D3A3]" : "bg-[#EFEFEF]"}`}
                            >
                              {active ? "✓" : ""}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => setStep(6)}
                  disabled={!canNextService}
                  className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
                    ${!canNextService ? "opacity-60 cursor-not-allowed" : ""}`}
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Next <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 6: Add More Services (ADDONS) ---------- */}
          {step === 6 && (
            <div className="w-full max-w-full min-w-0 text-left">
              <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(5)}
                    className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
                    aria-label="Back"
                  >
                    <FiChevronLeft className="text-[18px] text-[#18181B]" />
                  </button>
                  <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
                    Add More Services
                  </h2>
                </div>

                {progress(5)}

                <div className="space-y-3">
                  {loadingAddons ? (
                    <div className="text-[#6B7280]">Loading…</div>
                  ) : addonsDb.length === 0 ? (
                    <div className="text-[#6B7280]">No add-ons available.</div>
                  ) : (
                    addonsDb.map((ad) => {
                      const active = selectedAddOns.has(ad.id);
                      return (
                        <button
                          key={ad.id}
                          onClick={() => toggleAddOn(ad.id)}
                          aria-pressed={active}
                          className={`
                            w-full rounded-[16px] px-4 py-3 flex items-center justify-between
                            ${
                              active
                                ? "bg-[#F8F4EC] shadow"
                                : "bg-white border border-[#E5E7EB]"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F2F2F2]">
                              <LuStar
                                className="w-4 h-4"
                                style={{ color: active ? GOLD : "#D5D5D8" }}
                              />
                            </span>
                            <span className="text-[15px] sm:text-[16px] text-[#18181B]">
                              {ad.title}
                              {ad.subtitle ? (
                                <span className="ml-2 text-[#6B7280]">
                                  · {ad.subtitle}
                                </span>
                              ) : null}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] text-[#6B7280]">
                              ${(Number(ad.price) || 0).toFixed(2)}
                            </span>
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center
                              ${active ? "bg-[#E7D3A3]" : "bg-[#EFEFEF]"}`}
                            >
                              {active ? "✓" : ""}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => setStep(7)}
                  className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Add Another Vehicle <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 7: Your Contact Details ---------- */}
          {step === 7 && (
            <div className="w-full max-w-full min-w-0 text-left">
              <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(6)}
                    className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
                    aria-label="Back"
                  >
                    <FiChevronLeft className="text-[18px] text-[#18181B]" />
                  </button>
                  <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
                    Your Contact Details
                  </h2>
                </div>

                {progress(6)}

                <div className="space-y-3">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                  <input
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    type="date"
                    placeholder="Enter your birthday"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-[56px] rounded-[16px] bg-[#F4F4F5] px-4 text-[16px] outline-none"
                  />
                </div>

                <button
                  onClick={() => setStep(8)}
                  disabled={!canContinueContact}
                  className={`w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2
                    ${
                      !canContinueContact ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Continue <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------- STEP 8: Checkout ---------- */}
          {step === 8 && (
            <div className="w-full max-w-full min-w-0 text-left space-y-4">
              <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-5 shadow space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep(7)}
                      className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
                      aria-label="Back"
                    >
                      <FiChevronLeft className="text-[18px] text-[#18181B]" />
                    </button>
                    <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#18181B]">
                      Checkout
                    </h2>
                  </div>

                  {/* Toggle receipt-only */}
                  <button
                    onClick={() => setReceiptOnly((v) => !v)}
                    className="inline-flex items-center gap-2 text-[14px] text-[#18181B]"
                    title={receiptOnly ? "Show details" : "Show receipt only"}
                  >
                    {receiptOnly ? <FiEyeOff /> : <FiEye />}
                    {receiptOnly ? "Receipt only" : "Show receipt only"}
                  </button>
                </div>

                {progress(6)}

                {/* PERSONAL INFO */}
                {!receiptOnly && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm text-[#6B7280] font-medium">
                        Your personal information
                      </div>
                      <div className="grid gap-2">
                        <input
                          disabled
                          value={firstName}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          disabled
                          value={lastName}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          disabled
                          value={phone}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          disabled
                          value={birthday}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          disabled
                          value={email}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                      </div>
                      <button
                        onClick={() => setStep(7)}
                        className="mt-2 inline-flex items-center justify-center h-[40px] rounded-[12px] px-4 text-sm font-semibold text-black"
                        style={{
                          background:
                            "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                        }}
                      >
                        Change Personal Information
                      </button>
                    </div>

                    {/* CAR INFO */}
                    <div className="space-y-2">
                      <div className="text-sm text-[#6B7280] font-medium">
                        Your car information
                      </div>
                      <div className="grid gap-2">
                        <input
                          disabled
                          value={`${vehicleYear} year`}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          disabled
                          value={vehicleMake}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          disabled
                          value={vehicleModel}
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                      </div>
                      <button
                        onClick={() => setStep(4)}
                        className="mt-2 inline-flex items-center justify-center h-[40px] rounded-[12px] px-4 text-sm font-semibold text-black"
                        style={{
                          background:
                            "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                        }}
                      >
                        Change Car Information
                      </button>
                    </div>

                    {/* CARD INFO (демо) */}
                    <div className="space-y-2">
                      <div className="text-sm text-[#6B7280] font-medium">
                        Your card information (demo)
                      </div>
                      <div className="grid gap-2">
                        <input
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVC"
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                        <input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 1234 1234 1234"
                          className="h-[44px] rounded-[12px] bg-[#F4F4F5] px-3"
                        />
                      </div>
                    </div>

                    {/* TIPS */}
                    <div className="space-y-2">
                      <div className="text-sm text-[#6B7280] font-medium">
                        Select tip amount (optional)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TIP_PRESETS.map((v) => (
                          <button
                            key={v}
                            onClick={() => setTip(v)}
                            className={`h-[36px] px-4 rounded-full border ${
                              tip === v
                                ? "border-transparent"
                                : "border-[#E5E7EB]"
                            }`}
                            style={{
                              background:
                                tip === v
                                  ? "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)"
                                  : "#fff",
                            }}
                          >
                            ${v}
                          </button>
                        ))}
                        <input
                          inputMode="numeric"
                          placeholder="Custom"
                          className="h-[36px] w-[100px] rounded-full border border-[#E5E7EB] px-3"
                          onChange={(e) => setTip(+e.target.value || 0)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* RECEIPT / CHECK */}
                <div
                  className="rounded-[16px] border p-4 space-y-3"
                  style={{
                    backgroundColor: "rgba(245,218,147,0.2)",
                    borderColor: "#E5E7EB",
                  }}
                >
                  <div className="font-semibold text-[#18181B]">
                    List of services you have selected
                  </div>

                  {/* Main service */}
                  <div className="flex items-center justify-between text-[15px]">
                    <span>{selectedServiceObj?.title || "—"}</span>
                    <span>${mainServicePrice.toFixed(2)}</span>
                  </div>

                  {/* Add-ons */}
                  {addonsDb.map((ad) =>
                    selectedAddOns.has(ad.id) ? (
                      <div
                        key={ad.id}
                        className="flex items-center justify-between text-[15px]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: GOLD }}
                          />
                          {ad.title}
                        </span>
                        <span>${(Number(ad.price) || 0).toFixed(2)}</span>
                      </div>
                    ) : null
                  )}

                  <div className="h-px bg-[#E5E7EB]" />

                  <div className="flex items-center justify-between text-[14px]">
                    <span>SUBTOTAL</span>
                    <span>${subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px]">
                    <span>TAX (7%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px]">
                    <span>TIP</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[16px] font-extrabold">
                    <span>TOTAL</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[14px]">
                    <span>DEPOSIT</span>
                    <span>${depositAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-start gap-2 text-[13px] text-[#374151]">
                    <input
                      id="extraAddress"
                      type="checkbox"
                      className="mt-1"
                      checked={includeExtraAddress}
                      onChange={(e) => setIncludeExtraAddress(e.target.checked)}
                    />
                    <label htmlFor="extraAddress">
                      Your additional address included to the route. Deposit
                      amount will be deducted from total.
                    </label>
                  </div>
                </div>

                <button
                  onClick={submitRequest}
                  disabled={submitting}
                  className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : `Confirm Deposit ($${depositAmount})`}
                  <span className="text-lg">›</span>
                </button>

                <button
                  onClick={() => setStep(6)}
                  className="w-full h-[52px] rounded-[88px] font-semibold text-black shadow inline-flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)",
                  }}
                >
                  Add More Services <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Booking;
