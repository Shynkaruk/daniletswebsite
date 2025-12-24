// src/Components/Booking.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./Head";
import Footer from "./Footer";
import fon_booking from "../assets/photo/fon_booking.png";
import { auth, meApi, reqApi } from "../lib/api";

// Спільний крок
import Step1Search from "../Components/Booking/Step1Search";

// Cleaning – RESIDENTIAL (існуючі кроки — пропси НЕ міняю)
import StepCleaningPropertyType from "../Components/NewBooking/Cleaning/StepCleaningPropertyType";
import StepCleaningProjectType from "../Components/NewBooking/Cleaning/StepCleaningProjectType";
import StepCleaningAreas from "../Components/NewBooking/Cleaning/StepCleaningAreas";
import StepCleaningGeneralTasks from "../Components/NewBooking/Cleaning/StepCleaningGeneralTasks";
import StepCleaningKitchenTasks from "../Components/NewBooking/Cleaning/StepCleaningKitchenTasks";
import StepCleaningBudget from "../Components/NewBooking/Cleaning/StepCleaningBudget";
import StepCleaningContactDetails from "../Components/NewBooking/Cleaning/StepCleaningContactDetails";
import StepCleaningReview from "../Components/NewBooking/Cleaning/StepCleaningReview";
import StepCleaningPropertyDetails from "../Components/NewBooking/Cleaning/StepCleaningPropertyDetails";

// Cleaning – COMMERCIAL (новий 9-step flow, пропси НЕ міняю)
import StepCleaningCommercialContactInfo from "../Components/NewBooking/Cleaning/Commercial/StepCleaningCommercialContactInfo";
import StepCleaningCommercialCompanyInfo from "../Components/NewBooking/Cleaning/Commercial/StepCleaningCommercialCompanyInfo";
import StepCleaningCommercialProjectInformation from "../Components/NewBooking/Cleaning/Commercial/StepCleaningCommercialProjectInformation";
import StepCleaningCommercialAdditionalInfo from "../Components/NewBooking/Cleaning/Commercial/StepCleaningCommercialAdditional";
import StepCleaningCommercialSupplies from "../Components/NewBooking/Cleaning/Commercial/StepCleaningCommercialSupplies";
import StepCleaningCommercialAccess from "../Components/NewBooking/Cleaning/Commercial/StepCleaningCommercialAccess";
import StepCleaningCommercialReview from "../Components/NewBooking/Cleaning/Commercial/StepCleaningCommercialReview";

// Detailing
import StepDetailingGetQuoteType from "../Components/NewBooking/Detailing/StepDetailingGetQuoteType";

// PERSONAL Detailing steps
import StepDetailingVehicleInfo from "../Components/NewBooking/Detailing/Personal/StepDetailingVehicleInfo";
import StepDetailingVehicleHistory from "../Components/NewBooking/Detailing/Personal/StepDetailingVehicleHistory";
import StepDetailingVehicleCondition from "../Components/NewBooking/Detailing/Personal/StepDetailingVehicleCondition";
import StepDetailingServices from "../Components/NewBooking/Detailing/Personal/StepDetailingServices";
import StepDetailingMultipleVehicles from "../Components/NewBooking/Detailing/Personal/StepDetailingMultipleVehicles";
import StepDetailingLocationTimeline from "../Components/NewBooking/Detailing/Personal/StepDetailingLocationTimeline";
import StepDetailingTimeline from "../Components/NewBooking/Detailing/Personal/StepDetailingTimeline";
import StepDetailingContactInfo from "../Components/NewBooking/Detailing/Personal/StepDetailingContactInfo";
import StepDetailingAdditionalInfo from "../Components/NewBooking/Detailing/Personal/StepDetailingAdditionalInfo";
import StepReview from "../Components/NewBooking/Detailing/Personal/StepReview";

// BUSINESS Detailing steps
import StepDetailingBusinessContactInfo from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessContactInfo";
import StepDetailingBusinessDetails from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessDetails";
import StepDetailingBusinessServiceFrequency from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessServiceFrequency";
import StepDetailingBusinessVehicleTypes from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessVehicleTypes";
import StepDetailingBusinessServiceLocation from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessServiceLocation";
import StepDetailingBusinessServices from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessServices";
import StepDetailingBusinessTimeline from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessTimeline";
import StepDetailingBusinessAdditionalInfo from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessAdditionalInfo";
import StepDetailingBusinessReview from "../Components/NewBooking/Detailing/Business/StepDetailingBusinessReview";

import ProgressBar from "./NewBooking/ProgressBar";

/** ======= Google Places loader (no external libs) ======= */
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

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// Прогрес-бари
const CLEANING_TOTAL_STEPS = 9; // (і для res, і для com)
const DETAILING_PERSONAL_STEPS_COUNT = 11;
const DETAILING_BUSINESS_STEPS_COUNT = 10;

// Labels (для комерційного review summary/text)
const PROJECT_TYPE_LABELS = {
  office: "Office",
  airbnb: "Airbnb/rental properties",
  post_construction: "Post construction",
  other: "Other",
};

const BUSINESS_TYPE_LABELS = {
  office: "Office",
  retail: "Retail",
  medical: "Medical",
  hospitality: "Hospitality",
  property_mgmt: "Property Management",
  other: "Other",
};

const Booking = () => {
  const navigate = useNavigate();

  // service switch
  const [service, setService] = useState("detailing");
  const isCleaning = service === "cleaning";

  // ======= Global step тільки для: Search + Detailing =========
  // 1 = Search (спільний)
  // Detailing: 2..12 як у тебе
  const [step, setStep] = useState(1);

  // ======= Cleaning step окремо (щоб не змішувати флоу) =======
  // 1 не використовуємо (бо Search живе у step=1)
  // cleaningStep: 2..10 (візуально прогрес 1..9)
  const [cleaningStep, setCleaningStep] = useState(2);

  // Detailing: Personal/Business
  const [detailingMode, setDetailingMode] = useState("personal"); // "personal" | "business"
  const isPersonalDetailing = !isCleaning && detailingMode === "personal";
  const isBusinessDetailing = !isCleaning && detailingMode === "business";

  const renderCleaningProgress = (activeIndex) => (
    <ProgressBar activeCount={activeIndex} total={CLEANING_TOTAL_STEPS} />
  );
  const renderPersonalDetailingProgress = (activeIndex) => (
    <ProgressBar activeCount={activeIndex} total={DETAILING_PERSONAL_STEPS_COUNT} />
  );
  const renderBusinessDetailingProgress = (activeIndex) => (
    <ProgressBar activeCount={activeIndex} total={DETAILING_BUSINESS_STEPS_COUNT} />
  );

  // Google Places
  const { ready, getPredictions } = useGooglePlaces({
    language: "en",
    region: "US",
    countries: ["us"],
  });

  /** ---------- STEP 1: Search (спільний) ---------- */
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [selected, setSelected] = useState(null);
  const typingTimer = useRef(null);

  const fallbackSuggestions = useMemo(
    () =>
      [
        "4014 Gender Rd, Canal Winchester, OH",
        "4014 Gender Rd, Canal Winchester, OH",
        "4014 Gender Rd, Canal Winchester, OH",
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

  const onSearch = () => {
    // Після адреси:
    // - Detailing -> step=2
    // - Cleaning -> step=2 (показуємо Cleaning) + cleaningStep=2 (PropertyType)
    if (isCleaning) {
      setStep(2);
      setCleaningStep(2);
    } else {
      setStep(2);
    }
  };

  const hasInput = query.trim().length > 0;
  const visibleList = step === 1 && hasInput ? predictions : [];

  /** ---------- DETAILING PERSONAL FLOW (стейти) ---------- */
  const [detYear, setDetYear] = useState("");
  const [detMake, setDetMake] = useState("");
  const [detModel, setDetModel] = useState("");
  const [color, setColor] = useState("");
  const [seatMaterial, setSeatMaterial] = useState("");

  const [lastDetailed, setLastDetailed] = useState("");
  const [conditionFlags, setConditionFlags] = useState([]);
  const [conditionRating, setConditionRating] = useState("");
  const [conditionOtherText, setConditionOtherText] = useState("");

  const [detServices, setDetServices] = useState([]);
  const [servicesOtherText, setServicesOtherText] = useState("");
  const [detMultipleVehicles, setDetMultipleVehicles] = useState(false);
  const [detVehiclesCount, setDetVehiclesCount] = useState("");
  const [vehiclesDetails, setVehiclesDetails] = useState([]);

  const [detServiceLocation, setDetServiceLocation] = useState("");
  const [detCompletionDate, setDetCompletionDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  /** ---------- BUSINESS Detailing стейти ---------- */
  const [businessVehiclesCount, setBusinessVehiclesCount] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessTypeOther, setBusinessTypeOther] = useState("");

  const [serviceFrequency, setServiceFrequency] = useState("");
  const [serviceFrequencyOther, setServiceFrequencyOther] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");

  const [hearAbout, setHearAbout] = useState("");
  const [hearAboutOther, setHearAboutOther] = useState("");

  const [businessVehicleTypes, setBusinessVehicleTypes] = useState({
    sedans: "",
    suvs: "",
    pickups: "",
    minivans: "",
    transit_vans: "",
    semi_trucks: "",
    other: "",
  });
  const [businessVehicleOtherLabel, setBusinessVehicleOtherLabel] = useState("");

  const [businessServiceLocation, setBusinessServiceLocation] = useState("");
  const [businessServices, setBusinessServices] = useState([]);
  const [businessServicesOther, setBusinessServicesOther] = useState("");
  const [businessStartDate, setBusinessStartDate] = useState("");

  const [businessNotes, setBusinessNotes] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [contactTimePreference, setContactTimePreference] = useState("");

  // Shared contact (Personal + Residential cleaning)
  const [firstName, setFirstName] = useState("");
  const [lastNameState, setLastNameState] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [heardAbout, setHeardAbout] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");

  /** ---------- CLEANING RESIDENTIAL (старий) ---------- */
  const [propertyType, setPropertyType] = useState(""); // residential | commercial
  const [projectType, setProjectType] = useState(""); // deep_clean | ...

  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areas, setAreas] = useState([]);
  const [generalTasks, setGeneralTasks] = useState([]);
  const [kitchenTasks, setKitchenTasks] = useState([]);
  const [resBudget, setResBudget] = useState("");
  const [extraDetails, setExtraDetails] = useState("");

  // ці поля в твоєму старому коді були, але по residential не завжди потрібні:
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [frequency, setFrequency] = useState("");
  const [comBudget, setComBudget] = useState("");
  const [comExtraDetails, setComExtraDetails] = useState("");

  // residential "hearAboutUs" (як у тебе — не чіпаю)
  const [hearAboutUs, setHearAboutUs] = useState("");

  /** ---------- CLEANING COMMERCIAL (новий object-state) ---------- */
  const [cleaningCommercial, setCleaningCommercial] = useState(null);
  const c = cleaningCommercial || {};

  const setCC = (patch) =>
    setCleaningCommercial((prev) => ({ ...(prev || {}), ...(patch || {}) }));

  // helper: commercial "render text" для review
  const ensureCommercialTexts = () => {
    const source = c.hearAbout || "";
    const sourceText =
      source === "referral"
        ? `Referral/Friend${c.referralName ? `: ${c.referralName}` : ""}`
        : source === "other"
        ? `Other: ${c.hearAboutOther || ""}`
        : source;

    const bt = c.businessType || "";
    const btText =
      bt === "other"
        ? `Other: ${c.businessTypeOther || ""}`
        : BUSINESS_TYPE_LABELS[bt] || bt;

    const pt = projectType || "";
    const ptText = PROJECT_TYPE_LABELS[pt] || pt;

    setCC({
      hearAboutText: sourceText,
      businessTypeText: btText,
      projectTypeText: ptText,
    });
  };

  /** ---------- User + модалки ---------- */
  const user = auth.getUser();
  const isLoggedIn = !!user;
  const [submitting, setSubmitting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastRequestId, setLastRequestId] = useState(null);

  const [infoModal, setInfoModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const openInfoModal = (title, message) =>
    setInfoModal({ open: true, title, message });
  const closeInfoModal = () =>
    setInfoModal((prev) => ({ ...prev, open: false }));

  /** ---------- Автозаповнення контактів ---------- */
  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!isLoggedIn) return;
      try {
        const u = await meApi.profile();
        if (ignore || !u) return;

        const fn = u.first_name || "";
        const ln = u.last_name || "";
        const ph = u.phone || "";
        const em = u.email || "";

        // shared
        setFirstName(fn);
        setLastNameState(ln);
        setPhone(ph);
        setEmail(em);

        // якщо вже в commercial flow — м’яко підставляємо тільки порожні поля
        setCleaningCommercial((prev) => {
          const cur = prev || {};
          return {
            ...cur,
            firstName: cur.firstName || fn,
            lastName: cur.lastName || ln,
            phone: cur.phone || ph,
            email: cur.email || em,
          };
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  /** ---------- Service change: базове вирівнювання кроків ---------- */
  const onChangeService = (nextService) => {
    setService(nextService);

    // якщо юзер перемикає тип сервісу посеред форми — повертаємо на search
    setStep(1);
    setCleaningStep(2);

    // можна (за бажанням) не чистити всі дані, але архітектурно безпечніше:
    // (я не міняю пропси, але чистка стейтів тут ок)
    // cleaning
    setPropertyType("");
    setProjectType("");
    setBedrooms("");
    setBathrooms("");
    setAreas([]);
    setGeneralTasks([]);
    setKitchenTasks([]);
    setResBudget("");
    setExtraDetails("");
    setComBudget("");
    setComExtraDetails("");
    setCompanyName("");
    setCompanyAddress("");
    setSquareFeet("");
    setFrequency("");
    setHearAboutUs("");
    setCleaningCommercial(null);
  };

  /** ---------- Location builders ---------- */
  const shopAddress = "4014 Gender Rd, Canal Winchester, OH";

  function buildCleaningLocation() {
    const baseAddress = query?.trim() || null;
    return {
      location_type: "cleaning",
      service_address: baseAddress,
      pickup_address: null,
      dropoff_address: null,
    };
  }

  function buildDetailingLocation() {
    const baseAddress = query?.trim() || null;
    if (detServiceLocation === "pickup") {
      return {
        location_type: "pickup",
        service_address: shopAddress,
        pickup_address: baseAddress,
        dropoff_address: shopAddress,
      };
    }
    if (detServiceLocation === "drop_off") {
      return {
        location_type: "shop",
        service_address: shopAddress,
        pickup_address: null,
        dropoff_address: shopAddress,
      };
    }
    if (detServiceLocation === "mobile") {
      return {
        location_type: "mobile",
        service_address: baseAddress,
        pickup_address: null,
        dropoff_address: null,
      };
    }
    return {
      location_type: "unknown",
      service_address: baseAddress || null,
      pickup_address: null,
      dropoff_address: null,
    };
  }

  /** ---------- SUBMIT: Personal Detailing quote ---------- */
  async function submitDetailingRequest() {
    if (submitting) return;

    const isEmailLocal = (v) => /\S+@\S+\.\S+/.test(v || "");
    const isPhoneLocal = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

    if (
      !firstName.trim() ||
      !lastNameState.trim() ||
      !isPhoneLocal(phone) ||
      !isEmailLocal(email)
    ) {
      openInfoModal(
        "Contact details incomplete",
        "Please fill in your first name, last name, valid phone number and email."
      );
      return;
    }

    if (!detYear || !detMake || !detModel) {
      openInfoModal(
        "Vehicle info incomplete",
        "Please provide your vehicle year, make and model."
      );
      return;
    }
    if (!lastDetailed || !conditionRating) {
      openInfoModal(
        "History & condition incomplete",
        "Please fill in when your vehicle was last detailed and its current condition."
      );
      return;
    }
    if (!detServices.length) {
      openInfoModal(
        "Services not selected",
        "Please select at least one service you are interested in."
      );
      return;
    }
    if (!detServiceLocation) {
      openInfoModal(
        "Location missing",
        "Please choose where the service will be performed."
      );
      return;
    }
    if (!detCompletionDate) {
      openInfoModal(
        "Timeline missing",
        "Please select by what date the service should be completed."
      );
      return;
    }

    const loc = buildDetailingLocation();

    const heardAboutArr = Array.isArray(heardAbout)
      ? heardAbout
      : typeof heardAbout === "string"
      ? heardAbout.trim()
        ? [heardAbout.trim()]
        : []
      : [];

    const conditionFlagsArr = Array.isArray(conditionFlags) ? conditionFlags : [];
    const detServicesArr = Array.isArray(detServices) ? detServices : [];
    const vehiclesArr = Array.isArray(vehiclesDetails) ? vehiclesDetails : [];

    const itemsPayload = {
      quoteType: "personal",
      vehicle: {
        year: detYear,
        make: detMake,
        model: detModel,
        color,
        seatMaterial,
      },
      history: {
        lastDetailed,
        conditionFlags: conditionFlagsArr,
        conditionRating,
        other: conditionOtherText,
      },
      services: {
        selected: detServicesArr,
        other: servicesOtherText,
      },
      multipleVehicles: {
        enabled: !!detMultipleVehicles,
        count: detVehiclesCount,
        vehicles: vehiclesArr,
      },
      location: {
        ...loc,
        completionDate: detCompletionDate,
        baseAddress: query?.trim() || null,
      },
      contact: {
        firstName,
        lastName: lastNameState,
        phone,
        email,
        heardAbout: heardAboutArr,
        extraInfo,
      },
      additionalInfo,
    };

    const notes = [
      "Detailing quote request (Personal)",
      `Name: ${firstName} ${lastNameState}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      heardAboutArr.length ? `Heard about us: ${heardAboutArr.join(", ")}` : null,
      query ? `Customer address: ${query}` : null,
      color ? `Color: ${color}` : null,
      seatMaterial ? `Seat material: ${seatMaterial}` : null,
      detYear && detMake && detModel ? `Vehicle: ${detYear} ${detMake} ${detModel}` : null,
      lastDetailed ? `Last detailed: ${lastDetailed}` : null,
      conditionRating ? `Condition rating: ${conditionRating}` : null,
      conditionFlagsArr.length ? `Condition flags: ${conditionFlagsArr.join(", ")}` : null,
      conditionOtherText ? `Condition other: ${conditionOtherText}` : null,
      detServicesArr.length ? `Services: ${detServicesArr.join(", ")}` : null,
      servicesOtherText ? `Services other: ${servicesOtherText}` : null,
      detMultipleVehicles
        ? `Multiple vehicles: Yes, count: ${detVehiclesCount || "n/a"}`
        : "Multiple vehicles: No",
      `Location type: ${loc.location_type}`,
      detCompletionDate ? `Preferred completion date: ${detCompletionDate}` : null,
      additionalInfo ? `Additional info: ${additionalInfo}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      status: "new",
      service_type: "detailing_quote_personal",
      location_type: loc.location_type,
      service_date: detCompletionDate || null,
      time_window: null,
      service_address: loc.service_address,
      pickup_address: loc.pickup_address,
      dropoff_address: loc.dropoff_address,
      items_json: JSON.stringify(itemsPayload),
      currency: "USD",
      subtotal: 0,
      tax: 0,
      total: 0,
      notes_customer: notes,
    };

    try {
      setSubmitting(true);
      const saved = await reqApi.saveMine(payload);
      setLastRequestId(saved?.id || null);
      setShowSuccessModal(true);
    } catch (e) {
      const m = e?.error || e?.message || "Failed to submit detailing request.";
      openInfoModal("Submission failed", m);
    } finally {
      setSubmitting(false);
    }
  }

  /** ---------- SUBMIT: Business / Fleet Detailing ---------- */
  async function submitDetailingBusinessRequest() {
    if (submitting) return;

    const isEmailLocal = (v) => /\S+@\S+\.\S+/.test(v || "");
    const isPhoneLocal = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

    if (
      !firstName.trim() ||
      !lastNameState.trim() ||
      !isPhoneLocal(phone) ||
      !isEmailLocal(email)
    ) {
      openInfoModal(
        "Contact details incomplete",
        "Please fill in your first name, last name, valid phone number and email."
      );
      return;
    }

    const vehiclesCountNum = Number(businessVehiclesCount) || 0;
    if (vehiclesCountNum <= 0) {
      openInfoModal("Vehicle count missing", "Please enter how many vehicles need detailing.");
      return;
    }

    if (!businessType) {
      openInfoModal("Business type missing", "Please select what type of business you are.");
      return;
    }
    if (businessType === "Other" && !businessTypeOther.trim()) {
      openInfoModal("Business type not specified", "Please specify your business type in the 'Other' field.");
      return;
    }

    if (!serviceFrequency) {
      openInfoModal("Service frequency missing", "Please select how often you need detailing services.");
      return;
    }
    if (serviceFrequency === "Other" && !serviceFrequencyOther.trim()) {
      openInfoModal("Service frequency not specified", "Please specify the frequency in the 'Other' field.");
      return;
    }

    if (!hearAbout) {
      openInfoModal("Discovery source missing", "Please tell us how you heard about us.");
      return;
    }
    if (hearAbout === "Other" && !hearAboutOther.trim()) {
      openInfoModal("Discovery source not specified", "Please specify how you heard about us in the 'Other' field.");
      return;
    }

    const totalFleetVehicles = Object.values(businessVehicleTypes || {}).reduce(
      (sum, v) => sum + (Number(v) || 0),
      0
    );
    if (totalFleetVehicles <= 0) {
      openInfoModal("Fleet vehicles missing", "Please enter at least one vehicle in your fleet.");
      return;
    }

    if (Number(businessVehicleTypes.other || 0) > 0 && !businessVehicleOtherLabel.trim()) {
      openInfoModal("Other vehicle type not specified", "Please specify what 'Other' vehicle type is.");
      return;
    }

    if (!businessServiceLocation) {
      openInfoModal("Service location missing", "Please select where you would like the services to be performed.");
      return;
    }

    if (!businessServices.length) {
      openInfoModal("Services not selected", "Please select at least one service for your fleet.");
      return;
    }
    if (businessServices.includes("Other") && !businessServicesOther.trim()) {
      openInfoModal("Other services not specified", "Please specify which 'Other' services you need.");
      return;
    }

    if (!businessStartDate) {
      openInfoModal("Timeline missing", "Please select when you would like us to start.");
      return;
    }

    if (!preferredContactMethod || !contactTimePreference) {
      openInfoModal("Contact preferences missing", "Please select your preferred contact method and best time to reach you.");
      return;
    }

    // Локація для бізнесу
    const baseAddress = query?.trim() || null;
    let location_type = "unknown";
    let service_address = baseAddress || null;
    let pickup_address = null;
    let dropoff_address = null;

    if (businessServiceLocation === "customer_dropoff" || businessServiceLocation === "drop_off") {
      location_type = "shop";
      service_address = shopAddress;
    } else if (businessServiceLocation === "pickup_dropoff") {
      location_type = "pickup";
      service_address = shopAddress;
      pickup_address = baseAddress || null;
      dropoff_address = shopAddress;
    } else if (businessServiceLocation === "mobile") {
      location_type = "mobile";
      service_address = baseAddress || null;
    }

    const itemsPayload = {
      business: {
        vehiclesCount: businessVehiclesCount,
        businessType,
        businessTypeOther,
        serviceFrequency,
        serviceFrequencyOther,
      },
      contact: {
        firstName,
        lastName: lastNameState,
        phone,
        email,
        companyName,
        companyAddress,
        hearAbout,
        hearAboutOther,
      },
      fleet: {
        vehicleTypes: businessVehicleTypes,
        vehicleOtherLabel: businessVehicleOtherLabel,
        serviceLocation: businessServiceLocation,
        services: businessServices,
        servicesOther: businessServicesOther,
      },
      timeline: { startDate: businessStartDate },
      preferences: {
        preferredContactMethod,
        contactTimePreference,
        notes: businessNotes,
      },
      location: {
        location_type,
        service_address,
        pickup_address,
        dropoff_address,
        baseAddress,
      },
    };

    const notesParts = [
      "Detailing quote request (Business / Fleet)",
      `Contact: ${firstName} ${lastNameState}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      companyName ? `Company: ${companyName}` : null,
      companyAddress ? `Company address: ${companyAddress}` : null,
      businessType
        ? `Business type: ${
            businessType === "Other" && businessTypeOther
              ? `${businessType} – ${businessTypeOther}`
              : businessType
          }`
        : null,
      businessVehiclesCount ? `Number of vehicles (approx): ${businessVehiclesCount}` : null,
      serviceFrequency
        ? `Service frequency: ${
            serviceFrequency === "Other" && serviceFrequencyOther
              ? `${serviceFrequency} – ${serviceFrequencyOther}`
              : serviceFrequency
          }`
        : null,
      hearAbout
        ? `How they heard about us: ${
            hearAbout === "Other" && hearAboutOther
              ? `${hearAbout} – ${hearAboutOther}`
              : hearAbout
          }`
        : null,
      totalFleetVehicles ? `Fleet vehicles total: ${totalFleetVehicles}` : null,
      businessServiceLocation ? `Service location: ${businessServiceLocation}` : null,
      businessServices?.length ? `Requested services: ${businessServices.join(", ")}` : null,
      businessServices.includes("Other") && businessServicesOther ? `Other services: ${businessServicesOther}` : null,
      businessStartDate ? `Preferred start date: ${businessStartDate}` : null,
      baseAddress ? `Customer location (base): ${baseAddress}` : null,
      preferredContactMethod ? `Preferred contact method: ${preferredContactMethod}` : null,
      contactTimePreference ? `Best time to contact: ${contactTimePreference}` : null,
      businessNotes ? `Notes: ${businessNotes}` : null,
    ].filter(Boolean);

    const payload = {
      status: "new",
      service_type: "detailing_quote_business",
      location_type,
      service_date: null,
      time_window: null,
      service_address,
      pickup_address,
      dropoff_address,
      items_json: JSON.stringify(itemsPayload),
      currency: "USD",
      subtotal: 0,
      tax: 0,
      total: 0,
      notes_customer: notesParts.join(" | "),
    };

    try {
      setSubmitting(true);
      const saved = await reqApi.saveMine(payload);
      setLastRequestId(saved?.id || null);
      setShowSuccessModal(true);
    } catch (e) {
      const m = e?.error || e?.message || "Failed to submit business detailing request.";
      openInfoModal("Submission failed", m);
    } finally {
      setSubmitting(false);
    }
  }

  /** ---------- SUBMIT: Cleaning (Residential старий) ---------- */
  async function submitCleaningRequest() {
    if (submitting) return;

    const isEmailLocal = (v) => /\S+@\S+\.\S+/.test(v || "");
    const isPhoneLocal = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

    if (
      !firstName.trim() ||
      !lastNameState.trim() ||
      !isPhoneLocal(phone) ||
      !isEmailLocal(email)
    ) {
      openInfoModal(
        "Contact details incomplete",
        "Please fill in your first name, last name, valid phone number and email."
      );
      return;
    }

    const loc = buildCleaningLocation();

    const itemsPayload = {
      propertyType,
      projectType,

      bedrooms,
      bathrooms,
      areas,
      generalTasks,
      kitchenTasks,
      resBudget,
      extraDetails,

      // commercial legacy fields (для residential тут може бути пусто — ок)
      companyName,
      companyAddress,
      squareFeet,
      frequency,
      comBudget,
      comExtraDetails,

      contact: {
        firstName,
        lastName: lastNameState,
        phone,
        email,
      },
      location: {
        ...loc,
        baseAddress: query?.trim() || null,
      },
    };

    const notesParts = [
      "Cleaning quote request (Residential)",
      propertyType ? `Property type: ${propertyType}` : null,
      projectType ? `Project type: ${projectType}` : null,
      bedrooms || bathrooms ? `Bedrooms: ${bedrooms || 0}, Bathrooms: ${bathrooms || 0}` : null,
      areas?.length ? `Areas: ${areas.join(", ")}` : null,
      generalTasks?.length ? `Tasks: ${generalTasks.join(", ")}` : null,
      kitchenTasks?.length ? `Kitchen tasks: ${kitchenTasks.join(", ")}` : null,
      resBudget ? `Budget (res): ${resBudget}` : null,
      extraDetails ? `Extra details: ${extraDetails}` : null,
      query ? `Service address: ${query}` : null,
      `Customer: ${firstName} ${lastNameState}, ${phone}, ${email}`,
    ].filter(Boolean);

    const payload = {
      status: "new",
      service_type: "cleaning_quote_residential",
      location_type: loc.location_type,
      service_date: null,
      time_window: null,
      service_address: loc.service_address,
      pickup_address: loc.pickup_address,
      dropoff_address: loc.dropoff_address,
      items_json: JSON.stringify(itemsPayload),
      currency: "USD",
      subtotal: 0,
      tax: 0,
      total: 0,
      notes_customer: notesParts.join(" | "),
    };

    try {
      setSubmitting(true);
      const saved = await reqApi.saveMine(payload);
      setLastRequestId(saved?.id || null);
      setShowSuccessModal(true);
    } catch (e) {
      const m = e?.error || e?.message || "Failed to submit cleaning request.";
      openInfoModal("Submission failed", m);
    } finally {
      setSubmitting(false);
    }
  }

  /** ---------- SUBMIT: Cleaning Commercial (новий 9-step object-state) ---------- */
  async function submitCleaningCommercialRequest() {
    if (submitting) return;

    const isEmailLocal = (v) => /\S+@\S+\.\S+/.test(v || "");
    const isPhoneLocal = (v) => (v || "").replace(/[^\d]/g, "").length >= 7;

    // Валідація по commercial об’єкту
    if (
      !String(c.firstName || "").trim() ||
      !String(c.lastName || "").trim() ||
      !isPhoneLocal(c.phone) ||
      !isEmailLocal(c.email)
    ) {
      openInfoModal(
        "Contact details incomplete",
        "Please fill in your first name, last name, valid phone number and email."
      );
      return;
    }

    if (!propertyType || propertyType !== "commercial") {
      openInfoModal("Property type", "Commercial flow requires property type = commercial.");
      return;
    }

    if (!projectType) {
      openInfoModal("Project type missing", "Please select a project type.");
      return;
    }

    const loc = buildCleaningLocation();

    // трішки “підсумків” для review/нотаток
    ensureCommercialTexts();

    const itemsPayload = {
      propertyType,
      projectType,
      cleaningCommercial: c,
      contact: {
        firstName: c.firstName || "",
        lastName: c.lastName || "",
        phone: c.phone || "",
        email: c.email || "",
      },
      location: {
        ...loc,
        baseAddress: query?.trim() || null,
      },
    };

    const notesParts = [
      "Cleaning quote request (Commercial)",
      projectType ? `Project type: ${PROJECT_TYPE_LABELS[projectType] || projectType}` : null,

      c.companyName ? `Company: ${c.companyName}` : null,
      c.companyAddress ? `Company address: ${c.companyAddress}` : null,

      c.businessType
        ? `Business type: ${
            c.businessType === "other" && c.businessTypeOther
              ? `Other – ${c.businessTypeOther}`
              : BUSINESS_TYPE_LABELS[c.businessType] || c.businessType
          }`
        : null,

      c.hearAbout
        ? `How did you hear about us: ${
            c.hearAbout === "referral"
              ? `Referral/Friend${c.referralName ? ` – ${c.referralName}` : ""}`
              : c.hearAbout === "other"
              ? `Other – ${c.hearAboutOther || ""}`
              : c.hearAbout
          }`
        : null,

      c.projectSummary ? `Summary: ${c.projectSummary}` : null,
      c.supplies ? `Supplies: ${c.supplies}` : null,
      Array.isArray(c.preferredDaysTimes) && c.preferredDaysTimes.length
        ? `Preferred: ${c.preferredDaysTimes.join(", ")}`
        : null,

      query ? `Service address: ${query}` : null,
      `Customer: ${c.firstName || ""} ${c.lastName || ""}, ${c.phone || ""}, ${c.email || ""}`,
    ].filter(Boolean);

    const payload = {
      status: "new",
      service_type: "cleaning_quote_commercial",
      location_type: loc.location_type,
      service_date: null,
      time_window: null,
      service_address: loc.service_address,
      pickup_address: loc.pickup_address,
      dropoff_address: loc.dropoff_address,
      items_json: JSON.stringify(itemsPayload),
      currency: "USD",
      subtotal: 0,
      tax: 0,
      total: 0,
      notes_customer: notesParts.join(" | "),
    };

    try {
      setSubmitting(true);
      const saved = await reqApi.saveMine(payload);
      setLastRequestId(saved?.id || null);
      setShowSuccessModal(true);
    } catch (e) {
      const m =
        e?.error || e?.message || "Failed to submit commercial cleaning request.";
      openInfoModal("Submission failed", m);
    } finally {
      setSubmitting(false);
    }
  }

  /** ---------- CLEANING: reset при зміні типу ---------- */
  const resetCleaningAfterTypeChange = () => {
    // shared cleaning basics
    setProjectType("");

    // residential reset
    setBedrooms("");
    setBathrooms("");
    setAreas([]);
    setGeneralTasks([]);
    setKitchenTasks([]);
    setResBudget("");
    setExtraDetails("");
    setHearAboutUs("");

    // legacy commercial fields reset (на випадок твоїх review)
    setCompanyName("");
    setCompanyAddress("");
    setSquareFeet("");
    setFrequency("");
    setComBudget("");
    setComExtraDetails("");

    // NEW commercial object-state reset
    setCleaningCommercial(null);
  };

  /** ---------- RENDER ---------- */
  const isCommercial = isCleaning && propertyType === "commercial";
  const isResidential = isCleaning && propertyType === "residential";

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

      <main className="flex items-center justify-center px-4 lg:px-6">
        <div
          className="
            w-full
            max-w-xl
            lg:max-w-4xl
            flex flex-col
            items-center
            text-center
            min-w-0
          "
        >
          <h1 className="text-[#18181B] font-extrabold text-[26px] sm:text-[32px] mt-10 mb-6">
            .
          </h1>

          {/* STEP 1: Address search (спільний) */}
          <Step1Search
            visible={step === 1}
            query={query}
            value={service}
            onChange={onChangeService}
            onChangeQuery={handleChange}
            predictions={visibleList}
            onChoosePrediction={handleChoose}
            onSearch={onSearch}
          />

          {/* ======================= DETAILING (як було) ======================= */}
          {!isCleaning && step === 2 && (
            <StepDetailingGetQuoteType
              visible
              detailingMode={detailingMode}
              setDetailingMode={setDetailingMode}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              renderProgress={(idx) =>
                detailingMode === "business"
                  ? renderBusinessDetailingProgress(idx)
                  : renderPersonalDetailingProgress(idx)
              }
              progressStepIndex={1}
              totalSteps={
                detailingMode === "business"
                  ? DETAILING_BUSINESS_STEPS_COUNT
                  : DETAILING_PERSONAL_STEPS_COUNT
              }
            />
          )}

          {/* ===== DETAILING PERSONAL ===== */}
          {!isCleaning && isPersonalDetailing && (
            <>
              <StepDetailingVehicleInfo
                visible={step === 3}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                year={detYear}
                setYear={setDetYear}
                make={detMake}
                setMake={setDetMake}
                model={detModel}
                setModel={setDetModel}
                color={color}
                setColor={setColor}
                seatMaterial={seatMaterial}
                setSeatMaterial={setSeatMaterial}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={2}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingVehicleHistory
                visible={step === 4}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                lastDetailed={lastDetailed}
                setLastDetailed={setLastDetailed}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={3}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingVehicleCondition
                visible={step === 5}
                onBack={() => setStep(4)}
                onNext={() => setStep(6)}
                conditionFlags={conditionFlags}
                setConditionFlags={setConditionFlags}
                conditionRating={conditionRating}
                setConditionRating={setConditionRating}
                otherConditionText={conditionOtherText}
                setOtherConditionText={setConditionOtherText}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={4}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingServices
                visible={step === 6}
                onBack={() => setStep(5)}
                onNext={() => setStep(7)}
                services={detServices}
                setServices={setDetServices}
                otherServiceText={servicesOtherText}
                setOtherServiceText={setServicesOtherText}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={5}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingMultipleVehicles
                visible={step === 7}
                onBack={() => setStep(6)}
                onNext={() => setStep(8)}
                multipleVehicles={detMultipleVehicles}
                setMultipleVehicles={setDetMultipleVehicles}
                vehiclesCount={detVehiclesCount}
                setVehiclesCount={setDetVehiclesCount}
                vehiclesDetails={vehiclesDetails}
                setVehiclesDetails={setVehiclesDetails}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={6}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingLocationTimeline
                visible={step === 8}
                onBack={() => setStep(7)}
                onNext={() => setStep(9)}
                serviceLocation={detServiceLocation}
                pickupAddress={pickupAddress}
                setPickupAddress={setPickupAddress}
                setServiceLocation={setDetServiceLocation}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={7}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingTimeline
                visible={step === 9}
                onBack={() => setStep(8)}
                onNext={() => setStep(10)}
                completionDate={detCompletionDate}
                setCompletionDate={setDetCompletionDate}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={8}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingContactInfo
                visible={step === 10}
                onBack={() => setStep(9)}
                onNext={() => setStep(11)}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastNameState}
                setLastName={setLastNameState}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                heardAbout={heardAbout}
                setHeardAbout={setHeardAbout}
                extraInfo={extraInfo}
                setExtraInfo={setExtraInfo}
                user={user}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={9}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepDetailingAdditionalInfo
                visible={step === 11}
                onBack={() => setStep(10)}
                onNext={() => setStep(12)}
                additionalInfo={additionalInfo}
                setAdditionalInfo={setAdditionalInfo}
                renderProgress={renderPersonalDetailingProgress}
                progressStepIndex={10}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
              />

              <StepReview
                visible={step === 12}
                progressActive={11}
                totalSteps={DETAILING_PERSONAL_STEPS_COUNT}
                quoteType={detailingMode}
                year={detYear}
                make={detMake}
                model={detModel}
                color={color}
                seatMaterial={seatMaterial}
                lastDetailed={lastDetailed}
                conditionFlags={conditionFlags}
                conditionRating={conditionRating}
                otherConditionText={conditionOtherText}
                services={detServices}
                otherServiceText={servicesOtherText}
                multipleVehicles={detMultipleVehicles}
                vehiclesCount={detVehiclesCount}
                serviceLocation={detServiceLocation}
                completionDate={detCompletionDate}
                pickupAddress={pickupAddress}
                firstName={firstName}
                lastName={lastNameState}
                vehicles={vehiclesDetails}
                phone={phone}
                email={email}
                heardAbout={heardAbout}
                additionalInfo={additionalInfo}
                onBack={() => setStep(11)}
                onEditSection={(sectionKey) => {
                  const map = {
                    type: 2,
                    vehicle: 3,
                    history: 4,
                    condition: 5,
                    services: 6,
                    multiple: 7,
                    location: 8,
                    timeline: 9,
                    contact: 10,
                    additional: 11,
                  };
                  const targetStep = map[sectionKey];
                  if (targetStep) setStep(targetStep);
                }}
                submitting={submitting}
                onSubmit={submitDetailingRequest}
              />
            </>
          )}

          {/* ===== DETAILING BUSINESS ===== */}
          {!isCleaning && isBusinessDetailing && (
            <>
              <StepDetailingBusinessContactInfo
                visible={step === 3}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastNameState}
                setLastName={setLastNameState}
                companyName={companyName}
                setCompanyName={setCompanyName}
                companyAddress={companyAddress}
                setCompanyAddress={setCompanyAddress}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                heardAbout={hearAbout}
                setHeardAbout={setHearAbout}
                heardOther={hearAboutOther}
                setHeardOther={setHearAboutOther}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={2}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessDetails
                visible={step === 4}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                vehiclesCount={businessVehiclesCount}
                setVehiclesCount={setBusinessVehiclesCount}
                businessType={businessType}
                setBusinessType={setBusinessType}
                businessTypeOther={businessTypeOther}
                setBusinessTypeOther={setBusinessTypeOther}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={3}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessServiceFrequency
                visible={step === 5}
                onBack={() => setStep(4)}
                onNext={() => setStep(6)}
                serviceFrequency={serviceFrequency}
                setServiceFrequency={setServiceFrequency}
                serviceFrequencyOther={serviceFrequencyOther}
                setServiceFrequencyOther={setServiceFrequencyOther}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={4}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessVehicleTypes
                visible={step === 6}
                onBack={() => setStep(5)}
                onNext={() => setStep(7)}
                businessVehicleTypes={businessVehicleTypes}
                setBusinessVehicleTypes={setBusinessVehicleTypes}
                businessVehicleOtherLabel={businessVehicleOtherLabel}
                setBusinessVehicleOtherLabel={setBusinessVehicleOtherLabel}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={5}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessServiceLocation
                visible={step === 7}
                onBack={() => setStep(6)}
                onNext={() => setStep(8)}
                pickupAddress={pickupAddress}
                setPickupAddress={setPickupAddress}
                businessServiceLocation={businessServiceLocation}
                setBusinessServiceLocation={setBusinessServiceLocation}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={6}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessServices
                visible={step === 8}
                onBack={() => setStep(7)}
                onNext={() => setStep(9)}
                businessServices={businessServices}
                setBusinessServices={setBusinessServices}
                businessServicesOther={businessServicesOther}
                setBusinessServicesOther={setBusinessServicesOther}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={7}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessTimeline
                visible={step === 9}
                onBack={() => setStep(8)}
                onNext={() => setStep(10)}
                businessStartDate={businessStartDate}
                setBusinessStartDate={setBusinessStartDate}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={8}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessAdditionalInfo
                visible={step === 10}
                onBack={() => setStep(9)}
                onNext={() => setStep(11)}
                businessNotes={businessNotes}
                setBusinessNotes={setBusinessNotes}
                preferredContactMethod={preferredContactMethod}
                setPreferredContactMethod={setPreferredContactMethod}
                contactTimePreference={contactTimePreference}
                setContactTimePreference={setContactTimePreference}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={9}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              <StepDetailingBusinessReview
                visible={step === 11}
                onBack={() => setStep(10)}
                onSubmit={submitDetailingBusinessRequest}
                isSubmitting={submitting}
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={10}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
                firstName={firstName}
                lastName={lastNameState}
                companyName={companyName}
                companyAddress={companyAddress}
                phone={phone}
                email={email}
                hearAbout={hearAbout}
                hearAboutOther={hearAboutOther}
                businessVehiclesCount={businessVehiclesCount}
                businessType={businessType}
                businessTypeOther={businessTypeOther}
                serviceFrequency={serviceFrequency}
                serviceFrequencyOther={serviceFrequencyOther}
                businessVehicleTypes={businessVehicleTypes}
                businessVehicleOtherLabel={businessVehicleOtherLabel}
                businessServiceLocation={businessServiceLocation}
                businessServices={businessServices}
                businessServicesOther={businessServicesOther}
                businessStartDate={businessStartDate}
                businessNotes={businessNotes}
                onEditContact={() => setStep(3)}
                onEditVehiclesBusinessType={() => setStep(4)}
                onEditFrequency={() => setStep(5)}
                onEditVehicleTypes={() => setStep(6)}
                onEditLocation={() => setStep(7)}
                onEditServices={() => setStep(8)}
                onEditTimeline={() => setStep(9)}
                onEditAdditionalInfo={() => setStep(10)}
              />
            </>
          )}

          {/* ======================= CLEANING (НОВА архітектура) ======================= */}
          {isCleaning && step === 2 && (
            <>
              {/* STEP 1/9 (cleaningStep=2): Property type */}
              <StepCleaningPropertyType
                visible={cleaningStep === 2}
                onBack={() => {
                  setStep(1);
                  setCleaningStep(2);
                }}
                onNext={() => setCleaningStep(3)}
                propertyType={propertyType}
                setPropertyType={(v) => {
                  // якщо тип змінюється — чистимо і res, і com
                  setPropertyType(v);
                }}
                onResetAfterTypeChange={resetCleaningAfterTypeChange}
                renderProgress={renderCleaningProgress}
                progressStepIndex={1}
                totalSteps={CLEANING_TOTAL_STEPS}
              />

              {/* ================= RESIDENTIAL FLOW (старий, тільки step-структура інша) ================= */}
              {isResidential && (
                <>
                  {/* STEP 2/9 (cleaningStep=3): Project type */}
                  <StepCleaningProjectType
                    visible={cleaningStep === 3}
                    onBack={() => setCleaningStep(2)}
                    onNext={() => setCleaningStep(4)}
                    propertyType={propertyType}
                    projectType={projectType}
                    setProjectType={setProjectType}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={2}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 3/9 (cleaningStep=4): Property details (bed/bath) */}
                  <StepCleaningPropertyDetails
                    visible={cleaningStep === 4}
                    onBack={() => setCleaningStep(3)}
                    onNext={() => setCleaningStep(5)}
                    propertyType={propertyType}
                    bedrooms={bedrooms}
                    setBedrooms={setBedrooms}
                    bathrooms={bathrooms}
                    setBathrooms={setBathrooms}
                    // комерційні пропси лишаються, але тут вони не використовуються — передаю як було
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastNameState}
                    setLastName={setLastNameState}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    companyAddress={companyAddress}
                    setCompanyAddress={setCompanyAddress}
                    phoneNumber={phone}
                    setPhoneNumber={setPhone}
                    email={email}
                    setEmail={setEmail}
                    hearAboutUs={hearAboutUs}
                    setHearAboutUs={setHearAboutUs}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={3}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 4/9 */}
                  <StepCleaningAreas
                    visible={cleaningStep === 5}
                    onBack={() => setCleaningStep(4)}
                    onNext={() => setCleaningStep(6)}
                    propertyType={propertyType}
                    areas={areas}
                    setAreas={setAreas}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={4}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 5/9 */}
                  <StepCleaningGeneralTasks
                    visible={cleaningStep === 6}
                    onBack={() => setCleaningStep(5)}
                    onNext={() => setCleaningStep(7)}
                    propertyType={propertyType}
                    generalTasks={generalTasks}
                    setGeneralTasks={setGeneralTasks}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={5}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 6/9 */}
                  <StepCleaningKitchenTasks
                    visible={cleaningStep === 7}
                    onBack={() => setCleaningStep(6)}
                    onNext={() => setCleaningStep(8)}
                    propertyType={propertyType}
                    kitchenTasks={kitchenTasks}
                    setKitchenTasks={setKitchenTasks}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={6}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 7/9 */}
                  <StepCleaningBudget
                    visible={cleaningStep === 8}
                    onBack={() => setCleaningStep(7)}
                    onNext={() => setCleaningStep(9)}
                    propertyType={propertyType}
                    resBudget={resBudget}
                    setResBudget={setResBudget}
                    comBudget={comBudget}
                    setComBudget={setComBudget}
                    extraDetails={extraDetails}
                    setExtraDetails={setExtraDetails}
                    comExtraDetails={comExtraDetails}
                    setComExtraDetails={setComExtraDetails}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={7}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 8/9 */}
                  <StepCleaningContactDetails
                    visible={cleaningStep === 9}
                    onBack={() => setCleaningStep(8)}
                    onNext={() => setCleaningStep(10)}
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastNameState}
                    setLastName={setLastNameState}
                    user={user}
                    phone={phone}
                    setPhone={setPhone}
                    email={email}
                    setEmail={setEmail}
                    heardAbout={heardAbout}
                    setHeardAbout={setHeardAbout}
                    extraInfo={extraInfo}
                    setExtraInfo={setExtraInfo}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={8}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 9/9 */}
                  <StepCleaningReview
                    visible={cleaningStep === 10}
                    onBack={() => setCleaningStep(9)}
                    onSubmit={submitCleaningRequest}
                    isSubmitting={submitting}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={9}
                    totalSteps={CLEANING_TOTAL_STEPS}
                    serviceAddress={query}
                    propertyType={propertyType}
                    projectType={projectType}
                    bedrooms={bedrooms}
                    bathrooms={bathrooms}
                    companyName={companyName}
                    companyAddress={companyAddress}
                    squareFeet={squareFeet}
                    frequency={frequency}
                    areas={areas}
                    generalTasks={generalTasks}
                    kitchenTasks={kitchenTasks}
                    resBudget={resBudget}
                    comBudget={comBudget}
                    extraDetails={extraDetails}
                    comExtraDetails={comExtraDetails}
                    firstName={firstName}
                    lastName={lastNameState}
                    phone={phone}
                    email={email}
                    heardAbout={heardAbout}
                    extraInfo={extraInfo}
                    onEditType={() => setCleaningStep(2)}
                    onEditProject={() => setCleaningStep(3)}
                    onEditProperty={() => setCleaningStep(4)}
                    onEditAreas={() => setCleaningStep(5)}
                    onEditGeneralTasks={() => setCleaningStep(6)}
                    onEditKitchenTasks={() => setCleaningStep(7)}
                    onEditBudget={() => setCleaningStep(8)}
                    onEditContact={() => setCleaningStep(9)}
                  />
                </>
              )}

              {/* ================= COMMERCIAL FLOW (новий 9-step) ================= */}
              {isCommercial && (
                <>
                  {/* STEP 2/9 (cleaningStep=3): Commercial Contact Info */}
                  <StepCleaningCommercialContactInfo
                    visible={cleaningStep === 3}
                    onBack={() => setCleaningStep(2)}
                    onNext={() => {
                      ensureCommercialTexts();
                      setCleaningStep(4);
                    }}
                    firstName={c.firstName || ""}
                    setFirstName={(v) => setCC({ firstName: v })}
                    lastName={c.lastName || ""}
                    setLastName={(v) => setCC({ lastName: v })}
                    phone={c.phone || ""}
                    setPhone={(v) => setCC({ phone: v })}
                    email={c.email || ""}
                    setEmail={(v) => setCC({ email: v })}

                    hearAbout={c.hearAbout || ""}
                    setHearAbout={(v) => setCC({ hearAbout: v })}
                    referralName={c.referralName || ""}
                    setReferralName={(v) => setCC({ referralName: v })}
                    hearOther={c.hearAboutOther || ""}
                    setHearOther={(v) => setCC({ hearAboutOther: v })}

                    renderProgress={renderCleaningProgress}
                    progressStepIndex={2}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 3/9 (cleaningStep=4): Company Info */}
                  <StepCleaningCommercialCompanyInfo
                    visible={cleaningStep === 4}
                    onBack={() => setCleaningStep(3)}
                    onNext={() => {
                      ensureCommercialTexts();
                      setCleaningStep(5);
                    }}
                    companyName={c.companyName || ""}
                    setCompanyName={(v) => setCC({ companyName: v })}
                    companyAddress={c.companyAddress || ""}
                    setCompanyAddress={(v) => setCC({ companyAddress: v })}

                    businessType={c.businessType || ""}
                    setBusinessType={(v) => setCC({ businessType: v })}
                    businessTypeOther={c.businessTypeOther || ""}
                    setBusinessTypeOther={(v) => setCC({ businessTypeOther: v })}

                    renderProgress={renderCleaningProgress}
                    progressStepIndex={3}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 4/9 (cleaningStep=5): Project Type (shared component) */}
                  <StepCleaningProjectType
                    visible={cleaningStep === 5}
                    onBack={() => setCleaningStep(4)}
                    onNext={() => {
                      ensureCommercialTexts();
                      setCleaningStep(6);
                    }}
                    propertyType={propertyType}
                    projectType={projectType}
                    setProjectType={setProjectType}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={4}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 5/9 (cleaningStep=6): Project Information */}
                  <StepCleaningCommercialProjectInformation
                    visible={cleaningStep === 6}
                    onBack={() => setCleaningStep(5)}
                    onNext={() => {
                      // мінімально заповнимо summary для review (як у твоєму прикладі)
                      let summary = "";
                      if (projectType === "office") {
                        summary = `Office • ${c.officeSquareFootage || ""} sqft • ${
                          c.officeFrequency || ""
                        } • budget: ${c.officeBudget || ""}`;
                      } else if (projectType === "airbnb") {
                        summary = `Airbnb • units: ${c.airbnbUnits || ""} • turnover: ${
                          c.airbnbTurnover || ""
                        } • budget/unit: ${c.airbnbBudgetPerUnit || ""}`;
                      } else if (projectType === "post_construction") {
                        summary = `Post-construction • ${c.pcSquareFootage || ""} sqft • ${
                          c.pcFrequency || ""
                        } • budget: ${c.pcBudget || ""}`;
                      } else if (projectType === "other") {
                        summary = `Other • ${c.otherProjectDescription || ""} • ${
                          c.otherFrequency || ""
                        } • budget: ${c.otherBudget || ""}`;
                      }
                      setCC({ projectSummary: summary });
                      ensureCommercialTexts();
                      setCleaningStep(7);
                    }}
                    projectType={projectType}

                    /** ===== OFFICE ===== */
                    officeSquareFootage={c.officeSquareFootage || ""}
                    setOfficeSquareFootage={(v) => setCC({ officeSquareFootage: v })}
                    officeFloors={c.officeFloors || ""}
                    setOfficeFloors={(v) => setCC({ officeFloors: v })}
                    officeRestrooms={c.officeRestrooms || ""}
                    setOfficeRestrooms={(v) => setCC({ officeRestrooms: v })}
                    officePrivateOffices={c.officePrivateOffices || ""}
                    setOfficePrivateOffices={(v) => setCC({ officePrivateOffices: v })}
                    officeConferenceRooms={c.officeConferenceRooms || ""}
                    setOfficeConferenceRooms={(v) => setCC({ officeConferenceRooms: v })}
                    officeAreas={c.officeAreas || []}
                    setOfficeAreas={(v) => setCC({ officeAreas: v })}
                    officeAreasOther={c.officeAreasOther || ""}
                    setOfficeAreasOther={(v) => setCC({ officeAreasOther: v })}
                    officeFrequency={c.officeFrequency || ""}
                    setOfficeFrequency={(v) => setCC({ officeFrequency: v })}
                    officeFrequencyOther={c.officeFrequencyOther || ""}
                    setOfficeFrequencyOther={(v) => setCC({ officeFrequencyOther: v })}
                    officeBudget={c.officeBudget || ""}
                    setOfficeBudget={(v) => setCC({ officeBudget: v })}
                    officeOneTimeBudget={c.officeOneTimeBudget || ""}
                    setOfficeOneTimeBudget={(v) => setCC({ officeOneTimeBudget: v })}
                    officeStartDate={c.officeStartDate || ""}
                    setOfficeStartDate={(v) => setCC({ officeStartDate: v })}

                    /** ===== AIRBNB / RENTAL ===== */
                    airbnbUnits={c.airbnbUnits || ""}
                    setAirbnbUnits={(v) => setCC({ airbnbUnits: v })}
                    airbnbPropertyTypes={c.airbnbPropertyTypes || []}
                    setAirbnbPropertyTypes={(v) => setCC({ airbnbPropertyTypes: v })}
                    airbnbPropertyOther={c.airbnbPropertyOther || ""}
                    setAirbnbPropertyOther={(v) => setCC({ airbnbPropertyOther: v })}
                    airbnbAvgSqft={c.airbnbAvgSqft || ""}
                    setAirbnbAvgSqft={(v) => setCC({ airbnbAvgSqft: v })}
                    airbnbAvgBedrooms={c.airbnbAvgBedrooms || ""}
                    setAirbnbAvgBedrooms={(v) => setCC({ airbnbAvgBedrooms: v })}
                    airbnbAvgBathrooms={c.airbnbAvgBathrooms || ""}
                    setAirbnbAvgBathrooms={(v) => setCC({ airbnbAvgBathrooms: v })}
                    airbnbTurnover={c.airbnbTurnover || ""}
                    setAirbnbTurnover={(v) => setCC({ airbnbTurnover: v })}
                    airbnbTurnoverOther={c.airbnbTurnoverOther || ""}
                    setAirbnbTurnoverOther={(v) => setCC({ airbnbTurnoverOther: v })}
                    airbnbBudgetPerUnit={c.airbnbBudgetPerUnit || ""}
                    setAirbnbBudgetPerUnit={(v) => setCC({ airbnbBudgetPerUnit: v })}
                    airbnbLinenLaundry={c.airbnbLinenLaundry || ""}
                    setAirbnbLinenLaundry={(v) => setCC({ airbnbLinenLaundry: v })}
                    airbnbAreas={c.airbnbAreas || []}
                    setAirbnbAreas={(v) => setCC({ airbnbAreas: v })}
                    airbnbAreasOther={c.airbnbAreasOther || ""}
                    setAirbnbAreasOther={(v) => setCC({ airbnbAreasOther: v })}
                    airbnbKitchenTasks={c.airbnbKitchenTasks || []}
                    setAirbnbKitchenTasks={(v) => setCC({ airbnbKitchenTasks: v })}
                    airbnbKitchenOther={c.airbnbKitchenOther || ""}
                    setAirbnbKitchenOther={(v) => setCC({ airbnbKitchenOther: v })}
                    airbnbStartDate={c.airbnbStartDate || ""}
                    setAirbnbStartDate={(v) => setCC({ airbnbStartDate: v })}

                    /** ===== POST-CONSTRUCTION ===== */
                    pcConstructionType={c.pcConstructionType || ""}
                    setPcConstructionType={(v) => setCC({ pcConstructionType: v })}
                    pcConstructionOther={c.pcConstructionOther || ""}
                    setPcConstructionOther={(v) => setCC({ pcConstructionOther: v })}
                    pcSquareFootage={c.pcSquareFootage || ""}
                    setPcSquareFootage={(v) => setCC({ pcSquareFootage: v })}
                    pcFloors={c.pcFloors || ""}
                    setPcFloors={(v) => setCC({ pcFloors: v })}
                    pcPropertyType={c.pcPropertyType || ""}
                    setPcPropertyType={(v) => setCC({ pcPropertyType: v })}
                    pcPropertyTypeOther={c.pcPropertyTypeOther || ""}
                    setPcPropertyTypeOther={(v) => setCC({ pcPropertyTypeOther: v })}
                    pcSurfaces={c.pcSurfaces || []}
                    setPcSurfaces={(v) => setCC({ pcSurfaces: v })}
                    pcSurfacesOther={c.pcSurfacesOther || ""}
                    setPcSurfacesOther={(v) => setCC({ pcSurfacesOther: v })}
                    pcFrequency={c.pcFrequency || ""}
                    setPcFrequency={(v) => setCC({ pcFrequency: v })}
                    pcFrequencyOther={c.pcFrequencyOther || ""}
                    setPcFrequencyOther={(v) => setCC({ pcFrequencyOther: v })}
                    pcBudget={c.pcBudget || ""}
                    setPcBudget={(v) => setCC({ pcBudget: v })}
                    pcCompletionDate={c.pcCompletionDate || ""}
                    setPcCompletionDate={(v) => setCC({ pcCompletionDate: v })}

                    /** ===== OTHER ===== */
                    otherProjectDescription={c.otherProjectDescription || ""}
                    setOtherProjectDescription={(v) => setCC({ otherProjectDescription: v })}
                    otherProjectOther={c.otherProjectOther || ""}
                    setOtherProjectOther={(v) => setCC({ otherProjectOther: v })}
                    otherSquareFootage={c.otherSquareFootage || ""}
                    setOtherSquareFootage={(v) => setCC({ otherSquareFootage: v })}
                    otherFloors={c.otherFloors || ""}
                    setOtherFloors={(v) => setCC({ otherFloors: v })}
                    otherRestrooms={c.otherRestrooms || ""}
                    setOtherRestrooms={(v) => setCC({ otherRestrooms: v })}
                    otherCleaningService={c.otherCleaningService || ""}
                    setOtherCleaningService={(v) => setCC({ otherCleaningService: v })}
                    otherCleaningServiceOther={c.otherCleaningServiceOther || ""}
                    setOtherCleaningServiceOther={(v) => setCC({ otherCleaningServiceOther: v })}
                    otherAreas={c.otherAreas || []}
                    setOtherAreas={(v) => setCC({ otherAreas: v })}
                    otherAreasOther={c.otherAreasOther || ""}
                    setOtherAreasOther={(v) => setCC({ otherAreasOther: v })}
                    otherFrequency={c.otherFrequency || ""}
                    setOtherFrequency={(v) => setCC({ otherFrequency: v })}
                    otherFrequencyOther={c.otherFrequencyOther || ""}
                    setOtherFrequencyOther={(v) => setCC({ otherFrequencyOther: v })}
                    otherBudget={c.otherBudget || ""}
                    setOtherBudget={(v) => setCC({ otherBudget: v })}
                    otherContractType={c.otherContractType || ""}
                    setOtherContractType={(v) => setCC({ otherContractType: v })}
                    otherStartDate={c.otherStartDate || ""}
                    setOtherStartDate={(v) => setCC({ otherStartDate: v })}
                    otherUrgent={c.otherUrgent || ""}
                    setOtherUrgent={(v) => setCC({ otherUrgent: v })}
                    otherUrgentExplain={c.otherUrgentExplain || ""}
                    setOtherUrgentExplain={(v) => setCC({ otherUrgentExplain: v })}

                    renderProgress={renderCleaningProgress}
                    progressStepIndex={5}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 6/9 (cleaningStep=7): Supplies */}
                  <StepCleaningCommercialSupplies
                    visible={cleaningStep === 7}
                    onBack={() => setCleaningStep(6)}
                    onNext={() => setCleaningStep(8)}
                    cleaningCommercial={cleaningCommercial}
                    setCleaningCommercial={setCleaningCommercial}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={6}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 7/9 (cleaningStep=8): Access & Scheduling */}
                  <StepCleaningCommercialAccess
                    visible={cleaningStep === 8}
                    onBack={() => setCleaningStep(7)}
                    onNext={() => setCleaningStep(9)}
                    cleaningCommercial={cleaningCommercial}
                    setCleaningCommercial={setCleaningCommercial}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={7}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 8/9 (cleaningStep=9): Additional Info */}
                  <StepCleaningCommercialAdditionalInfo
                    visible={cleaningStep === 9}
                    onBack={() => setCleaningStep(8)}
                    onNext={() => setCleaningStep(10)}
                    cleaningCommercial={cleaningCommercial}
                    setCleaningCommercial={setCleaningCommercial}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={8}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />

                  {/* STEP 9/9 (cleaningStep=10): Review */}
                  <StepCleaningCommercialReview
                    visible={cleaningStep === 10}
                    onBack={() => setCleaningStep(9)}
                    onSubmit={submitCleaningCommercialRequest}
                    isSubmitting={submitting}
                    serviceAddress={query}
                    cleaningCommercial={cleaningCommercial}
                    onEditContact={() => setCleaningStep(3)}
                    onEditCompany={() => setCleaningStep(4)}
                    onEditProjectType={() => setCleaningStep(5)}
                    onEditProjectInfo={() => setCleaningStep(6)}
                    onEditSupplies={() => setCleaningStep(7)}
                    onEditAccess={() => setCleaningStep(8)}
                    onEditAdditional={() => setCleaningStep(9)}
                    renderProgress={renderCleaningProgress}
                    progressStepIndex={9}
                    totalSteps={CLEANING_TOTAL_STEPS}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <div className="mt-12">
        <Footer />
      </div>

      {/* Info / error modal */}
      {infoModal.open && (
        <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 sm:p-7 text-center space-y-4">
            <h3 className="text-xl font-bold text-[#18181B]">{infoModal.title}</h3>
            <p className="text-sm text-[#4B5563] whitespace-pre-line">{infoModal.message}</p>
            <div className="mt-2">
              <button
                type="button"
                onClick={closeInfoModal}
                className="w-full h-[44px] rounded-full border border-[#D4D4D8] text-sm font-semibold text-[#18181B]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 sm:p-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-[#18181B]">Request submitted</h3>

            <p className="text-sm text-[#4B5563]">
              {isCleaning
                ? `Your cleaning request has been submitted. Our team will contact you shortly to confirm the details.`
                : `Your detailing quote request has been submitted. Our team will contact you shortly with pricing and availability.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 h-[44px] rounded-full text-sm font-semibold text-black"
                style={{ background: GOLD_GRADIENT }}
              >
                Go to homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
