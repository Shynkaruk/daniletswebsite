// src/Components/Booking.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./Head";
import Footer from "./Footer";
import fon_booking from "../assets/photo/fon_booking.png";
import { auth, meApi, reqApi } from "../lib/api";

// Спільний крок
import Step1Search from "../Components/Booking/Step1Search";

// Cleaning – НОВІ кроки
import StepCleaningPropertyType from "../Components/NewBooking/Cleaning/StepCleaningPropertyType";
import StepCleaningProjectType from "../Components/NewBooking/Cleaning/StepCleaningProjectType";
import StepCleaningAreas from "../Components/NewBooking/Cleaning/StepCleaningAreas";
import StepCleaningGeneralTasks from "../Components/NewBooking/Cleaning/StepCleaningGeneralTasks";
import StepCleaningKitchenTasks from "../Components/NewBooking/Cleaning/StepCleaningKitchenTasks";
import StepCleaningBudget from "../Components/NewBooking/Cleaning/StepCleaningBudget";
import StepCleaningContactDetails from "../Components/NewBooking/Cleaning/StepCleaningContactDetails";
import StepCleaningReview from "../Components/NewBooking/Cleaning/StepCleaningReview";
import StepCleaningPropertyDetails from "../Components/NewBooking/Cleaning/StepCleaningPropertyDetails";

// Контактний крок, спільний (Cleaning + Detailing Personal)
import StepContactDetails from "../Components/NewBooking/StepConctactDetails";

// Section 1: Get Quote (Personal / Business)
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

// BUSINESS Detailing – нові кроки (1 секція = 1 компонент)
// BUSINESS Detailing steps (нові)
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

const CATEGORY_TABS = [
  { label: "Detailing", key: "detailing" },
  { label: "Cleaning", key: "cleaning" },
];

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

// к-сть кроків у прогрес-барах
const CLEANING_STEPS_COUNT = 10; // Cleaning: Type, Property, Budget, Contact
const DETAILING_PERSONAL_STEPS_COUNT = 11; // Personal: 1–11
const DETAILING_BUSINESS_STEPS_COUNT = 10; // Business: 1–10 (від Get Quote до Review)

const Booking = () => {
  const navigate = useNavigate();

  const [service, setService] = useState("detailing");
  const isCleaning = service === "cleaning";

  // Detailing: режим Personal / Business (Section 1)
  const [detailingMode, setDetailingMode] = useState("personal"); // "personal" | "business"
  const isPersonalDetailing = !isCleaning && detailingMode === "personal";
  const isBusinessDetailing = !isCleaning && detailingMode === "business";

  // Main step (спільний для детайлінгу/кліінінгу)
  const [step, setStep] = useState(1);

  const renderCleaningProgress = (activeIndex) => (
    <ProgressBar activeCount={activeIndex} total={CLEANING_STEPS_COUNT} />
  );

  const renderPersonalDetailingProgress = (activeIndex) => (
    <ProgressBar
      activeCount={activeIndex}
      total={DETAILING_PERSONAL_STEPS_COUNT}
    />
  );

  const renderBusinessDetailingProgress = (activeIndex) => (
    <ProgressBar
      activeCount={activeIndex}
      total={DETAILING_BUSINESS_STEPS_COUNT}
    />
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
    // Після адреси → Section 1: Get Quote (Detailing) або Type (Cleaning)
    setStep(2);
  };

  const hasInput = query.trim().length > 0;
  const visibleList = step === 1 && hasInput ? predictions : [];

  /** ---------- DETAILING PERSONAL FLOW (стейти) ---------- */

  // Section 2: Vehicle Information
  const [detYear, setDetYear] = useState("");
  const [detMake, setDetMake] = useState("");
  const [detModel, setDetModel] = useState("");
  const [color, setColor] = useState("");
  const [seatMaterial, setSeatMaterial] = useState("");

  // Section 3: History & Condition
  const [lastDetailed, setLastDetailed] = useState("");
  const [conditionFlags, setConditionFlags] = useState([]); // чекбокси
  const [conditionRating, setConditionRating] = useState(""); // Very Clean / Dirty...
  const [conditionOtherText, setConditionOtherText] = useState("");

  // Section 4/5: Services + Multiple Vehicles
  const [detServices, setDetServices] = useState([]);
  const [servicesOtherText, setServicesOtherText] = useState("");
  const [detMultipleVehicles, setDetMultipleVehicles] = useState(false);
  const [detVehiclesCount, setDetVehiclesCount] = useState("");
  const [detVehicles, setDetVehicles] = useState([]);
  const [vehiclesDetails, setVehiclesDetails] = useState([]);

  // Section 7: Location
  const [detServiceLocation, setDetServiceLocation] = useState(""); // "drop_off" | "pickup" | "mobile"

  // Section 8: Timeline
  const [detCompletionDate, setDetCompletionDate] = useState("");

  // Section 11: Additional Information
  const [additionalInfo, setAdditionalInfo] = useState("");

  /** ---------- BUSINESS Detailing стейти ---------- */

  // Section 3: Vehicles + business type
  const [businessVehiclesCount, setBusinessVehiclesCount] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessTypeOther, setBusinessTypeOther] = useState("");

  // Section 4: Service frequency
  const [serviceFrequency, setServiceFrequency] = useState("");
  const [serviceFrequencyOther, setServiceFrequencyOther] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");

  // Section 2: Contact "How did you hear about us?"
  const [hearAbout, setHearAbout] = useState("");
  const [hearAboutOther, setHearAboutOther] = useState("");

  // Section 5: Vehicle types
  const [businessVehicleTypes, setBusinessVehicleTypes] = useState({
    sedans: "",
    suvs: "",
    pickups: "",
    minivans: "",
    transit_vans: "",
    semi_trucks: "",
    other: "",
  });
  const [businessVehicleOtherLabel, setBusinessVehicleOtherLabel] =
    useState("");

  // Section 6: Service location
  const [businessServiceLocation, setBusinessServiceLocation] = useState(""); // customer_dropoff | pickup_dropoff | mobile

  // Section 7: Services interested in
  const [businessServices, setBusinessServices] = useState([]);
  const [businessServicesOther, setBusinessServicesOther] = useState("");

  // Section 8: Timeline
  const [businessStartDate, setBusinessStartDate] = useState("");

  // Section 9: Additional info + contact preferences
  const [businessNotes, setBusinessNotes] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [contactTimePreference, setContactTimePreference] = useState("");

  // Contact info (shared / personal & cleaning & business)
  const [firstName, setFirstName] = useState("");
  const [lastNameState, setLastNameState] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // для Personal/Cleaning contact step
  const [heardAbout, setHeardAbout] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");

  /** ---------- CLEANING FLOW (стейти) ---------- */

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

  const [serviceDate, setServiceDate] = useState(null); // поки не використовуємо

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
        if (!ignore && u) {
          setFirstName(u.first_name || "");
          setLastNameState(u.last_name || "");
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

    // нормалізація (щоб join не падав)
    const heardAboutArr = Array.isArray(heardAbout)
      ? heardAbout
      : typeof heardAbout === "string"
      ? heardAbout.trim()
        ? [heardAbout.trim()]
        : []
      : [];

    const conditionFlagsArr = Array.isArray(conditionFlags)
      ? conditionFlags
      : [];
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
        heardAbout: heardAboutArr, // ✅ завжди масив
        extraInfo,
      },
      additionalInfo,
    };

    const notes = [
      "Detailing quote request (Personal)",
      `Name: ${firstName} ${lastNameState}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      heardAboutArr.length
        ? `Heard about us: ${heardAboutArr.join(", ")}`
        : null,
      query ? `Customer address: ${query}` : null,
      color ? `Color: ${color}` : null,
      seatMaterial ? `Seat material: ${seatMaterial}` : null,
      detYear && detMake && detModel
        ? `Vehicle: ${detYear} ${detMake} ${detModel}`
        : null,
      lastDetailed ? `Last detailed: ${lastDetailed}` : null,
      conditionRating ? `Condition rating: ${conditionRating}` : null,
      conditionFlagsArr.length
        ? `Condition flags: ${conditionFlagsArr.join(", ")}`
        : null,
      conditionOtherText ? `Condition other: ${conditionOtherText}` : null,
      detServicesArr.length ? `Services: ${detServicesArr.join(", ")}` : null,
      servicesOtherText ? `Services other: ${servicesOtherText}` : null,
      detMultipleVehicles
        ? `Multiple vehicles: Yes, count: ${detVehiclesCount || "n/a"}`
        : "Multiple vehicles: No",
      `Location type: ${loc.location_type}`,
      detCompletionDate
        ? `Preferred completion date: ${detCompletionDate}`
        : null,
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
      openInfoModal(
        "Vehicle count missing",
        "Please enter how many vehicles need detailing."
      );
      return;
    }

    if (!businessType) {
      openInfoModal(
        "Business type missing",
        "Please select what type of business you are."
      );
      return;
    }
    if (businessType === "Other" && !businessTypeOther.trim()) {
      openInfoModal(
        "Business type not specified",
        "Please specify your business type in the 'Other' field."
      );
      return;
    }

    if (!serviceFrequency) {
      openInfoModal(
        "Service frequency missing",
        "Please select how often you need detailing services."
      );
      return;
    }
    if (serviceFrequency === "Other" && !serviceFrequencyOther.trim()) {
      openInfoModal(
        "Service frequency not specified",
        "Please specify the frequency in the 'Other' field."
      );
      return;
    }

    if (!hearAbout) {
      openInfoModal(
        "Discovery source missing",
        "Please tell us how you heard about us."
      );
      return;
    }
    if (hearAbout === "Other" && !hearAboutOther.trim()) {
      openInfoModal(
        "Discovery source not specified",
        "Please specify how you heard about us in the 'Other' field."
      );
      return;
    }

    const totalFleetVehicles = Object.values(businessVehicleTypes || {}).reduce(
      (sum, v) => sum + (Number(v) || 0),
      0
    );
    if (totalFleetVehicles <= 0) {
      openInfoModal(
        "Fleet vehicles missing",
        "Please enter at least one vehicle in your fleet."
      );
      return;
    }

    if (
      Number(businessVehicleTypes.other || 0) > 0 &&
      !businessVehicleOtherLabel.trim()
    ) {
      openInfoModal(
        "Other vehicle type not specified",
        "Please specify what 'Other' vehicle type is."
      );
      return;
    }

    if (!businessServiceLocation) {
      openInfoModal(
        "Service location missing",
        "Please select where you would like the services to be performed."
      );
      return;
    }

    if (!businessServices.length) {
      openInfoModal(
        "Services not selected",
        "Please select at least one service for your fleet."
      );
      return;
    }
    if (businessServices.includes("Other") && !businessServicesOther.trim()) {
      openInfoModal(
        "Other services not specified",
        "Please specify which 'Other' services you need."
      );
      return;
    }

    if (!businessStartDate) {
      openInfoModal(
        "Timeline missing",
        "Please select when you would like us to start."
      );
      return;
    }

    if (!preferredContactMethod || !contactTimePreference) {
      openInfoModal(
        "Contact preferences missing",
        "Please select your preferred contact method and best time to reach you."
      );
      return;
    }

    // Локація для бізнесу
    const baseAddress = query?.trim() || null;
    let location_type = "unknown";
    let service_address = baseAddress || null;
    let pickup_address = null;
    let dropoff_address = null;

    if (
      businessServiceLocation === "customer_dropoff" ||
      businessServiceLocation === "drop_off"
    ) {
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
      timeline: {
        startDate: businessStartDate,
      },
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
      businessVehiclesCount
        ? `Number of vehicles (approx): ${businessVehiclesCount}`
        : null,
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
      businessServiceLocation
        ? `Service location: ${businessServiceLocation}`
        : null,
      businessServices?.length
        ? `Requested services: ${businessServices.join(", ")}`
        : null,
      businessServices.includes("Other") && businessServicesOther
        ? `Other services: ${businessServicesOther}`
        : null,
      businessStartDate ? `Preferred start date: ${businessStartDate}` : null,
      baseAddress ? `Customer location (base): ${baseAddress}` : null,
      preferredContactMethod
        ? `Preferred contact method: ${preferredContactMethod}`
        : null,
      contactTimePreference
        ? `Best time to contact: ${contactTimePreference}`
        : null,
      businessNotes ? `Notes: ${businessNotes}` : null,
    ];

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
      notes_customer: notesParts.filter(Boolean).join(" | "),
    };

    try {
      setSubmitting(true);
      const saved = await reqApi.saveMine(payload);
      setLastRequestId(saved?.id || null);
      setShowSuccessModal(true);
    } catch (e) {
      const m =
        e?.error ||
        e?.message ||
        "Failed to submit business detailing request.";
      openInfoModal("Submission failed", m);
    } finally {
      setSubmitting(false);
    }
  }

  /** ---------- SUBMIT: Cleaning quote ---------- */
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
      dueDate,
      extraDetails,

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
      "Cleaning quote request",
      propertyType ? `Property type: ${propertyType}` : null,
      projectType ? `Project type: ${projectType}` : null,
      bedrooms || bathrooms
        ? `Bedrooms: ${bedrooms || 0}, Bathrooms: ${bathrooms || 0}`
        : null,
      areas?.length ? `Areas: ${areas.join(", ")}` : null,
      generalTasks?.length ? `Tasks: ${generalTasks.join(", ")}` : null,
      kitchenTasks?.length ? `Kitchen tasks: ${kitchenTasks.join(", ")}` : null,
      resBudget ? `Budget (res): ${resBudget}` : null,
      dueDate ? `Due date: ${dueDate}` : null,
      extraDetails ? `Extra details: ${extraDetails}` : null,
      companyName ? `Company: ${companyName}` : null,
      companyAddress ? `Company address: ${companyAddress}` : null,
      squareFeet ? `Square feet: ${squareFeet}` : null,
      frequency ? `Frequency: ${frequency}` : null,
      comBudget ? `Budget (com): ${comBudget}` : null,
      comExtraDetails ? `Commercial details: ${comExtraDetails}` : null,
      query ? `Service address: ${query}` : null,
      `Customer: ${firstName} ${lastNameState}, ${phone}, ${email}`,
    ];

    const payload = {
      status: "new",
      service_type:
        propertyType === "commercial"
          ? "cleaning_quote_commercial"
          : "cleaning_quote_residential",

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
      notes_customer: notesParts.filter(Boolean).join(" | "),
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

  /** ---------- РЕНДЕР ---------- */

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
            Choose Your Service
          </h1>

          {/* STEP 1: Address search (спільний) */}
          <Step1Search
            visible={step === 1}
            query={query}
            value={service}
            onChange={setService}
            onChangeQuery={handleChange}
            predictions={visibleList}
            onChoosePrediction={handleChoose}
            onSearch={onSearch}
          />

          {/* ============= DETAILING: Section 1 (Get Quote: Personal / Business) ============= */}
          {!isCleaning && step === 2 && (
            <StepDetailingGetQuoteType
              visible
              detailingMode={detailingMode}
              setDetailingMode={setDetailingMode}
              onBack={() => setStep(1)}
              onNext={() =>
                setStep(
                  detailingMode === "business"
                    ? 3 // бізнес йде в свою секцію
                    : 3 // персонал теж з 3-го, просто інший флоу
                )
              }
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

          {/* ============= DETAILING PERSONAL FLOW ============= */}
          {!isCleaning && isPersonalDetailing && (
            <>
              {/* Section 2: Vehicle Information */}
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

              {/* Section 3: Vehicle History */}
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

              {/* Section 4: Vehicle Condition */}
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

              {/* Section 5: Services */}
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

              {/* Section 6: Multiple vehicles */}
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

              {/* Section 7: Location */}
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

              {/* Section 8: Timeline */}
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

              {/* Section 10: Contact details */}
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

              {/* Section 11: Additional Information */}
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

              {/* FINAL: Review & Submit */}
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

          {/* ============= DETAILING BUSINESS / FLEET FLOW ============= */}
          {/* ============= DETAILING BUSINESS / FLEET FLOW ============= */}
          {!isCleaning && isBusinessDetailing && (
            <>
              {/* Section 2: Contact Information */}
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

              {/* Section 3: Business Details */}
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

              {/* Section 4: Service Frequency */}
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

              {/* Section 5: Vehicle Types */}
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

              {/* Section 6: Service Location */}
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

              {/* Section 7: Services Interested In */}
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

              {/* Section 8: Timeline */}
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

              {/* Section 9: Additional Information */}
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

              {/* Preview / Review */}
              <StepDetailingBusinessReview
                visible={step === 11}
                onBack={() => setStep(10)}
                onSubmit={submitDetailingBusinessRequest}
                isSubmitting={submitting}
                /* progress */
                renderProgress={renderBusinessDetailingProgress}
                progressStepIndex={10}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
                /* Section 2 – Contact */
                firstName={firstName}
                lastName={lastNameState}
                companyName={companyName}
                companyAddress={companyAddress}
                phone={phone}
                email={email}
                hearAbout={hearAbout}
                hearAboutOther={hearAboutOther}
                /* Section 3 – Business details */
                businessVehiclesCount={businessVehiclesCount}
                businessType={businessType}
                businessTypeOther={businessTypeOther}
                /* Section 4 – Frequency */
                serviceFrequency={serviceFrequency}
                serviceFrequencyOther={serviceFrequencyOther}
                /* Section 5 – Vehicle types */
                businessVehicleTypes={businessVehicleTypes}
                businessVehicleOtherLabel={businessVehicleOtherLabel}
                /* Section 6 – Location */
                businessServiceLocation={businessServiceLocation}
                /* Section 7 – Services */
                businessServices={businessServices}
                businessServicesOther={businessServicesOther}
                /* Section 8 – Timeline */
                businessStartDate={businessStartDate}
                /* Section 9 – Additional */
                businessNotes={businessNotes}
                /* Change buttons */
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

          {/* ============= CLEANING FLOW ============= */}
          {isCleaning && (
            <>
              {/* STEP 1: Address search (вже вище, Step1Search visible={step === 1}) */}

              {/* STEP 2: Property type */}
              <StepCleaningPropertyType
                visible={step === 2}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                // якщо міняємо тип майна — скидаємо далі логічні поля
                onResetAfterTypeChange={() => {
                  setProjectType("");
                  setBedrooms("");
                  setBathrooms("");
                  setCompanyName("");
                  setCompanyAddress("");
                  setSquareFeet("");
                  setFrequency("");
                  setAreas([]);
                  setGeneralTasks([]);
                  setKitchenTasks([]);
                  setResBudget("");
                  setComBudget("");
                  setExtraDetails("");
                  setComExtraDetails("");
                }}
                renderProgress={renderCleaningProgress}
                progressStepIndex={1}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 3: Project type */}
              <StepCleaningProjectType
                visible={step === 3}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                propertyType={propertyType}
                projectType={projectType}
                setProjectType={setProjectType}
                renderProgress={renderCleaningProgress}
                progressStepIndex={2}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 4: Property details (твоє існуюче) */}
              <StepCleaningPropertyDetails
                visible={step === 4}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                propertyType={propertyType}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                bathrooms={bathrooms}
                setBathrooms={setBathrooms}
                companyName={companyName}
                setCompanyName={setCompanyName}
                companyAddress={companyAddress}
                setCompanyAddress={setCompanyAddress}
                squareFeet={squareFeet}
                setSquareFeet={setSquareFeet}
                frequency={frequency}
                setFrequency={setFrequency}
                renderProgress={renderCleaningProgress}
                progressStepIndex={3}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 5: Areas */}
              <StepCleaningAreas
                visible={step === 5}
                onBack={() => setStep(4)}
                onNext={() => setStep(6)}
                propertyType={propertyType}
                areas={areas}
                setAreas={setAreas}
                renderProgress={renderCleaningProgress}
                progressStepIndex={4}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 6: General tasks */}
              <StepCleaningGeneralTasks
                visible={step === 6}
                onBack={() => setStep(5)}
                onNext={() => setStep(7)}
                propertyType={propertyType}
                generalTasks={generalTasks}
                setGeneralTasks={setGeneralTasks}
                renderProgress={renderCleaningProgress}
                progressStepIndex={5}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 7: Kitchen tasks */}
              <StepCleaningKitchenTasks
                visible={step === 7}
                onBack={() => setStep(6)}
                onNext={() => setStep(8)}
                propertyType={propertyType}
                kitchenTasks={kitchenTasks}
                setKitchenTasks={setKitchenTasks}
                renderProgress={renderCleaningProgress}
                progressStepIndex={6}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 8: Budget */}
              <StepCleaningBudget
                visible={step === 8}
                onBack={() => setStep(7)}
                onNext={() => setStep(9)}
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
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 9: Contact */}
              <StepCleaningContactDetails
                visible={step === 9}
                onBack={() => setStep(8)}
                onNext={() => setStep(10)}
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
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 10: Review */}
              <StepCleaningReview
                visible={step === 10}
                onBack={() => setStep(9)}
                onSubmit={submitCleaningRequest}
                isSubmitting={submitting}
                renderProgress={renderCleaningProgress}
                progressStepIndex={9}
                totalSteps={CLEANING_STEPS_COUNT}
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
                onEditType={() => setStep(2)}
                onEditProject={() => setStep(3)}
                onEditProperty={() => setStep(4)}
                onEditAreas={() => setStep(5)}
                onEditGeneralTasks={() => setStep(6)}
                onEditKitchenTasks={() => setStep(7)}
                onEditBudget={() => setStep(8)}
                onEditContact={() => setStep(9)}
              />
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
            <h3 className="text-xl font-bold text-[#18181B]">
              {infoModal.title}
            </h3>
            <p className="text-sm text-[#4B5563] whitespace-pre-line">
              {infoModal.message}
            </p>
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
            <h3 className="text-xl font-bold text-[#18181B]">
              Request submitted
            </h3>

            <p className="text-sm text-[#4B5563]">
              {isCleaning
                ? `Your cleaning request${
                    lastRequestId ? ` (#${lastRequestId})` : ""
                  } has been submitted. Our team will contact you shortly to confirm the details.`
                : `Your detailing quote request${
                    lastRequestId ? ` (#${lastRequestId})` : ""
                  } has been submitted. Our team will contact you shortly with pricing and availability.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 h-[44px] rounded-full border border-[#D4D4D8] text-sm font-semibold text-[#18181B]"
              >
                Close
              </button>

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
