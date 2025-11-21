// src/pages/Booking.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Head";
import Footer from "./Footer";
import fon_booking from "../assets/photo/fon_booking.png";
import { auth, meApi, reqApi, cardsApi } from "../lib/api";

import Step1Search from "../Components/Booking/Step1Search";
import Step2ChooseLocationType from "../Components/Booking/Step2ChooseLocationType";
import Step3ShopLocations from "../Components/Booking/Step3ShopLocations";
import Step4Vehicle from "../Components/Booking/Step4Vehicle";
import Step5SelectService from "../Components/Booking/Step5SelectService";
import Step6AddOns from "../Components/Booking/Step6AddOns";
import Step7ContactDetails from "../Components/Booking/Step7ContactDetails";
import Step8Checkout from "../Components/Booking/Step8Checkout";
import StepCleaningDetails from "../Components/Booking/Cleaning/StepCleaningDetails";

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

const CATEGORY_TABS = [
  { label: "Cleaning", key: "cleaning" },
  { label: "Detailing", key: "detailing" },
  { label: "Media", key: "media" },
  { label: "Pickleball", key: "pickleball" },
];

const TAX_RATE = 0.07;

const Booking = () => {
  const tabs = CATEGORY_TABS.map((t) => t.label);
  const [active, setActive] = useState(tabs[0]); // стартуємо з Cleaning
  const activeKey = useMemo(
    () => CATEGORY_TABS.find((t) => t.label === active)?.key || "",
    [active]
  );

  // Головний step (1–8)
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

  /** ---------- STEP 2–4: Detailing only ---------- */
  const [serviceType, setServiceType] = useState("mobile"); // "mobile" | "shop"
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

  /** ---------- STEP 4: Vehicle (Detailing only) ---------- */
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const validYear = (y) =>
    /^\d{4}$/.test(y) && +y >= 1980 && +y <= new Date().getFullYear() + 1;
  const canContinueVehicle =
    validYear(vehicleYear) && vehicleMake.trim() && vehicleModel.trim();

  /** ---------- CLEANING: Residential + Commercial ---------- */
  const [propertyType, setPropertyType] = useState(""); // residential | commercial
  const [projectType, setProjectType] = useState(""); // deep_clean | ...

  // residential
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areas, setAreas] = useState([]);
  const [generalTasks, setGeneralTasks] = useState([]);
  const [kitchenTasks, setKitchenTasks] = useState([]);
  const [resBudget, setResBudget] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [extraDetails, setExtraDetails] = useState("");

  // commercial
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [frequency, setFrequency] = useState("");
  const [comBudget, setComBudget] = useState("");
  const [comExtraDetails, setComExtraDetails] = useState("");

  /** ---------- SERVICES FROM DB (для активної категорії) ---------- */
  const [servicesDb, setServicesDb] = useState([]);
  const [addonsDb, setAddonsDb] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const selectedServiceObj = useMemo(
    () => servicesDb.find((s) => s.id === selectedServiceId) || null,
    [servicesDb, selectedServiceId]
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingServices(true);
      try {
        const svc = await cardsApi.list({
          type: "service",
          published: 1,
          category: activeKey,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingAddons(true);
      try {
        const ad = await cardsApi.list({
          type: "addon",
          published: 1,
          category: activeKey,
        });
        if (!ignore) setAddonsDb(Array.isArray(ad) ? ad : []);
      } finally {
        if (!ignore) setLoadingAddons(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [activeKey]);

  const [selectedAddOns, setSelectedAddOns] = useState(new Set());

  useEffect(() => {
    setSelectedAddOns(new Set());
  }, [activeKey]);

  const canNextService = !!selectedServiceId;

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  /** ---------- STEP 7: Contact Details ---------- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isPhone = (v) => v.replace(/[^\d]/g, "").length >= 7;
  const canContinueContact =
    firstName.trim() && lastName.trim() && isPhone(phone) && isEmail(email);

  /** ---------- STEP 8: Checkout / Submit ---------- */
  const [receiptOnly, setReceiptOnly] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const TIP_PRESETS = [5, 10, 20, 40, 50];
  const [tip, setTip] = useState(0);
  const [depositAmount, setDepositAmount] = useState(100);
  const [includeExtraAddress, setIncludeExtraAddress] = useState(true);

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
      } catch {
        // ignore
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  function buildLocationFields() {
    const baseAddress = query?.trim() || null;
    const shopAddr = "4014 Gender Rd, Canal Winchester, OH";

    if (activeKey === "cleaning") {
      return {
        location_type: "cleaning",
        service_address: baseAddress,
        pickup_address: null,
        dropoff_address: null,
      };
    }

    if (serviceType === "shop") {
      if (shopMode === "pickup") {
        return {
          location_type: "pickup",
          service_address: shopAddr,
          pickup_address: pickupQuery || null,
          dropoff_address: shopAddr,
        };
      }
      return {
        location_type: "shop",
        service_address: shopAddr,
        pickup_address: null,
        dropoff_address: null,
      };
    }

    // mobile detailing
    return {
      location_type: "mobile",
      service_address: baseAddress,
      pickup_address: null,
      dropoff_address: null,
    };
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
    if (!isLoggedIn || activeKey === "cleaning") return null;
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
    if (!canContinueContact) {
      alert("Заповніть, будь ласка, контактні дані.");
      return;
    }
    if (!selectedServiceObj && activeKey !== "cleaning") {
      alert("Будь ласка, виберіть послугу.");
      return;
    }
    if (activeKey === "detailing" && !canContinueVehicle) {
      alert("Заповніть, будь ласка, інформацію про авто.");
      return;
    }

    setSubmitting(true);
    try {
      const vehicle_id = await ensureVehicleId();
      const loc = buildLocationFields();
      const items = buildItems();

      const notesParts = [
        `Booked via website`,
        `Category: ${activeKey}`,
        selectedServiceObj ? `Service: ${selectedServiceObj.title}` : null,
      ];

      if (activeKey === "detailing") {
        notesParts.push(
          `Type: ${serviceType}${
            serviceType === "shop" ? ` (${shopMode})` : ""
          }`,
          `Vehicle: ${vehicleYear} ${vehicleMake} ${vehicleModel}`
        );
      }

      if (activeKey === "cleaning") {
        if (propertyType) notesParts.push(`Property type: ${propertyType}`);
        if (projectType) notesParts.push(`Project type: ${projectType}`);

        if (propertyType === "residential") {
          if (bedrooms || bathrooms) {
            notesParts.push(
              `Bedrooms: ${bedrooms || 0}, Bathrooms: ${bathrooms || 0}`
            );
          }
          if (areas.length)
            notesParts.push(`Areas: ${areas.join(", ")}`);
          if (generalTasks.length)
            notesParts.push(`Tasks: ${generalTasks.join(", ")}`);
          if (kitchenTasks.length)
            notesParts.push(`Kitchen tasks: ${kitchenTasks.join(", ")}`);
          if (resBudget) notesParts.push(`Budget: ${resBudget}`);
          if (dueDate) notesParts.push(`Due date: ${dueDate}`);
          if (extraDetails) notesParts.push(`Notes: ${extraDetails}`);
        }

        if (propertyType === "commercial") {
          if (companyName) notesParts.push(`Company: ${companyName}`);
          if (companyAddress)
            notesParts.push(`Company address: ${companyAddress}`);
          if (squareFeet) notesParts.push(`Square feet: ${squareFeet}`);
          if (frequency) notesParts.push(`Frequency: ${frequency}`);
          if (comBudget) notesParts.push(`Budget: ${comBudget}`);
          if (comExtraDetails)
            notesParts.push(`Details: ${comExtraDetails}`);
        }
      }

      notesParts.push(
        `Address: ${loc.service_address || "-"}`,
        loc.pickup_address ? `Pickup: ${loc.pickup_address}` : null,
        loc.dropoff_address ? `Dropoff: ${loc.dropoff_address}` : null,
        `Deposit: $${depositAmount}`,
        `Extra address: ${includeExtraAddress ? "yes" : "no"}`,
        `Customer: ${firstName} ${lastName}, ${phone}, ${email}`
      );

      const notes = notesParts.filter(Boolean).join(" | ");

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
      const msg =
        activeKey === "cleaning"
          ? `✅ Заявка на прибирання створена (#${saved.id}). Ми з вами звʼяжемося найближчим часом.`
          : `✅ Заявка створена (#${saved.id}). Ми звʼяжемось із вами найближчим часом.`;
      alert(msg);
    } catch (e) {
      const m = e?.error || e?.message || "Failed to submit";
      alert("❌ Помилка надсилання: " + m);
    } finally {
      setSubmitting(false);
    }
  }

  const isCleaning = activeKey === "cleaning";

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

          {/* Tabs — тільки на першому кроці */}
          {step === 1 && (
            <div className="w-full max-w-[100vw] -mx-4 px-4 overflow-x-auto touch-pan-x mb-6">
              <div className="w-max inline-flex items-center bg-[#F2F2F2]/90 rounded-full p-1 gap-2 whitespace-nowrap">
                {tabs.map((t) => {
                  const isActiveTab = active === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setActive(t)}
                      className={[
                        "px-6 py-3 rounded-full text-[16px] sm:text-[18px] font-semibold transition",
                        isActiveTab
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
          )}

          {/* STEP 1 */}
          <Step1Search
            visible={step === 1}
            query={query}
            onChangeQuery={handleChange}
            predictions={visibleList}
            onChoosePrediction={handleChoose}
            onSearch={onSearch}
          />

          {/* STEP 2: Cleaning details OR Detailing location type */}
          {isCleaning ? (
            <StepCleaningDetails
              visible={step === 2}
              onBack={() => setStep(1)}
              onNext={() => setStep(7)} // одразу до контакту

              propertyType={propertyType}
              setPropertyType={setPropertyType}
              projectType={projectType}
              setProjectType={setProjectType}
              bedrooms={bedrooms}
              setBedrooms={setBedrooms}
              bathrooms={bathrooms}
              setBathrooms={setBathrooms}
              areas={areas}
              setAreas={setAreas}
              generalTasks={generalTasks}
              setGeneralTasks={setGeneralTasks}
              kitchenTasks={kitchenTasks}
              setKitchenTasks={setKitchenTasks}
              resBudget={resBudget}
              setResBudget={setResBudget}
              dueDate={dueDate}
              setDueDate={setDueDate}
              extraDetails={extraDetails}
              setExtraDetails={setExtraDetails}
              companyName={companyName}
              setCompanyName={setCompanyName}
              companyAddress={companyAddress}
              setCompanyAddress={setCompanyAddress}
              squareFeet={squareFeet}
              setSquareFeet={setSquareFeet}
              frequency={frequency}
              setFrequency={setFrequency}
              comBudget={comBudget}
              setComBudget={setComBudget}
              comExtraDetails={comExtraDetails}
              setComExtraDetails={setComExtraDetails}
            />
          ) : (
            <Step2ChooseLocationType
              visible={step === 2}
              serviceType={serviceType}
              setServiceType={setServiceType}
              onNext={() => (serviceType === "shop" ? setStep(3) : setStep(4))}
            />
          )}

          {/* STEP 3: Shop locations (Detailing only) */}
          <Step3ShopLocations
            visible={step === 3 && serviceType === "shop" && !isCleaning}
            shopMode={shopMode}
            setShopMode={setShopMode}
            shopAddress={shopAddress}
            pickupQuery={pickupQuery}
            onPickupChange={handlePickupChange}
            pickupPreds={pickupPreds}
            onPickupChoose={handlePickupChoose}
            canContinueShop={canContinueShop}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />

          {/* STEP 4: Vehicle (Detailing only) */}
          <Step4Vehicle
            visible={step === 4 && !isCleaning}
            vehicleYear={vehicleYear}
            setVehicleYear={setVehicleYear}
            vehicleMake={vehicleMake}
            setVehicleMake={setVehicleMake}
            vehicleModel={vehicleModel}
            setVehicleModel={setVehicleModel}
            canContinueVehicle={canContinueVehicle}
            onNext={() => setStep(5)}
            onBack={() => setStep(serviceType === "shop" ? 3 : 2)}
          />

          {/* STEP 5: Select Service (тільки Detailing) */}
          <Step5SelectService
            visible={step === 5 && !isCleaning}
            servicesDb={servicesDb}
            loadingServices={loadingServices}
            selectedServiceId={selectedServiceId}
            setSelectedServiceId={setSelectedServiceId}
            canNextService={canNextService}
            onNext={() => setStep(6)}
            onBack={() => setStep(4)}
          />

          {/* STEP 6: Add Ons (тільки Detailing) */}
          <Step6AddOns
            visible={step === 6 && !isCleaning}
            addonsDb={addonsDb}
            loadingAddons={loadingAddons}
            selectedAddOns={selectedAddOns}
            toggleAddOn={toggleAddOn}
            onNext={() => setStep(7)}
            onBack={() => setStep(5)}
          />

          {/* STEP 7: Contact Details (обидва флоу) */}
          <Step7ContactDetails
            visible={step === 7}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            phone={phone}
            setPhone={setPhone}
            birthday={birthday}
            setBirthday={setBirthday}
            email={email}
            setEmail={setEmail}
            canContinueContact={canContinueContact}
            onNext={() => setStep(8)}
            onBack={() => (isCleaning ? setStep(2) : setStep(6))}
            // прогрес: 4 сегменти для Cleaning, 6 — для Detailing
            progressActive={isCleaning ? 4 : 6}
          />

          {/* STEP 8: Checkout / Submit */}
          <Step8Checkout
            visible={step === 8}
            isCleaning={isCleaning}
            firstName={firstName}
            lastName={lastName}
            phone={phone}
            birthday={birthday}
            email={email}
            vehicleYear={vehicleYear}
            vehicleMake={vehicleMake}
            vehicleModel={vehicleModel}
            cardName={cardName}
            setCardName={setCardName}
            cardCvv={cardCvv}
            setCardCvv={setCardCvv}
            cardExpiry={cardExpiry}
            setCardExpiry={setCardExpiry}
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            TIP_PRESETS={TIP_PRESETS}
            tip={tip}
            setTip={setTip}
            subTotal={subTotal}
            tax={tax}
            total={total}
            depositAmount={depositAmount}
            includeExtraAddress={includeExtraAddress}
            setIncludeExtraAddress={setIncludeExtraAddress}
            selectedServiceObj={selectedServiceObj}
            addonsDb={addonsDb}
            selectedAddOns={selectedAddOns}
            receiptOnly={receiptOnly}
            setReceiptOnly={setReceiptOnly}
            submitting={submitting}
            submitRequest={submitRequest}
            onBack={() => setStep(7)}
            onEditPersonal={() => setStep(7)}
            onEditCar={() => setStep(4)}
            onAddMoreServices={() => setStep(6)}
            progressActive={6}
          />
        </div>
      </main>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Booking;
