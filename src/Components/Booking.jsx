import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./Head";
import Footer from "./Footer";
import fon_booking from "../assets/photo/fon_booking.png";
import { auth, meApi, reqApi } from "../lib/api";

// Спільний крок
import Step1Search from "../Components/Booking/Step1Search";

// Cleaning – НОВІ кроки
import StepCleaningTypeProject from "../Components/NewBooking/Cleaning/StepCleaningTypeProject";
import StepCleaningPropertyDetails from "../Components/NewBooking/Cleaning/StepCleaningPropertyDetails";
import StepCleaningBudgetExtras from "../Components/NewBooking/Cleaning/StepCleaningBudgetExtras";
import StepReviewSubmitCleaning from "../Components/NewBooking/StepReviewSubmitCleaning";

// Detailing – персональні кроки
import StepDetailingVehicle from "../Components/NewBooking/Detailing/StepDetailingVehicle";
import StepDetailingHistoryCondition from "../Components/NewBooking/Detailing/StepDetailingHistoryCondition";
import StepDetailingServices from "../Components/NewBooking/Detailing/StepDetailingServices";
import StepDetailingLocationTimeline from "../Components/NewBooking/Detailing/StepDetailingLocationTimeline";
import StepContactDetails from "../Components/NewBooking/StepConctactDetails";
import StepReviewSubmit from "../Components/NewBooking/StepReviewSubmit";

// Detailing – бізнес / флот кроки
import StepDetailingBusinessDetails from "../Components/NewBooking/Detailing/StepDetailingBusinessDetails";
import StepDetailingBusinessContact from "../Components/NewBooking/Detailing/StepDetailingBusinessContact";
import StepDetailingBusinessVehiclesServices from "../Components/NewBooking/Detailing/StepDetailingBusinessVehiclesServices";
import StepDetailingBusinessReview from "../Components/NewBooking/Detailing/StepDetailingBusinessReview";

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

const CLEANING_STEPS_COUNT = 4; // 1 - Type, 2 - Property, 3 - Budget, 4 - Contact
const DETAILING_BUSINESS_STEPS_COUNT = 4; // Business: Details, Contact, Fleet&Services, Review

const Booking = () => {
  const navigate = useNavigate();

  const tabs = CATEGORY_TABS.map((t) => t.label);
  const [active, setActive] = useState(tabs[0]); // default: Detailing
  const activeKey = useMemo(
    () => CATEGORY_TABS.find((t) => t.label === active)?.key || "",
    [active]
  );
  const isCleaning = activeKey === "cleaning";

  // Detailing: режим Personal / Business
  const [detailingMode, setDetailingMode] = useState("personal"); // "personal" | "business"
  const isPersonalDetailing = !isCleaning && detailingMode === "personal";
  const isBusinessDetailing = !isCleaning && detailingMode === "business";

  // Main step (спільний для вкладки Detailing або Cleaning)
  const [step, setStep] = useState(1);

  const renderCleaningProgress = (activeIndex) => (
    <ProgressBar activeCount={activeIndex} total={CLEANING_STEPS_COUNT} />
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

  const onSearch = () => {
    setStep(2);
  };

  const hasInput = query.trim().length > 0;
  const visibleList = step === 1 && hasInput ? predictions : [];

  /** ---------- DETAILING FLOW (стейти) ---------- */

  // Personal Detailing – Step 2: Vehicle info
  const [detYear, setDetYear] = useState("");
  const [detMake, setDetMake] = useState("");
  const [detModel, setDetModel] = useState("");

  // Personal – Step 3: History & condition
  const [lastDetailed, setLastDetailed] = useState("");
  const [conditionFlags, setConditionFlags] = useState([]);
  const [conditionRating, setConditionRating] = useState("");

  // Personal – Step 4: Services
  const [detServices, setDetServices] = useState([]);
  const [detMultipleVehicles, setDetMultipleVehicles] = useState(false);
  const [detVehiclesCount, setDetVehiclesCount] = useState("");
  const [detVehicles, setDetVehicles] = useState([]);

  // Personal – Step 5: Location & date
  const [detServiceLocation, setDetServiceLocation] = useState(""); // "drop_off" | "pickup"
  const [detCompletionDate, setDetCompletionDate] = useState("");

  // Business Detailing – Step 2: Business details
  const [businessVehiclesCount, setBusinessVehiclesCount] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessTypeOther, setBusinessTypeOther] = useState("");
  const [serviceFrequency, setServiceFrequency] = useState("");
  const [serviceFrequencyOther, setServiceFrequencyOther] = useState("");

  // Business Detailing – Step 3: Contact (how did you hear about us)
  const [hearAbout, setHearAbout] = useState("");
  const [hearAboutOther, setHearAboutOther] = useState("");

  // Business Detailing – Step 4: Vehicle types & services
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
  const [businessServiceLocation, setBusinessServiceLocation] = useState(""); // on_site | drop_off | mixed
  const [businessServices, setBusinessServices] = useState([]);
  const [businessServicesOther, setBusinessServicesOther] = useState("");

  // Business Detailing – Step 5: preferences & notes
  const [businessNotes, setBusinessNotes] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [contactTimePreference, setContactTimePreference] = useState("");

  // Contact info (shared / personal & cleaning)
  const [firstName, setFirstName] = useState("");
  const [lastNameState, setLastNameState] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [heardAbout, setHeardAbout] = useState([]); // для StepContactDetails
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

  // (опційно) окрема дата для Cleaning – зараз не обов’язкова
  const [serviceDate, setServiceDate] = useState(null);

  /** ---------- Валідація контактів (для Cleaning) ---------- */

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isPhone = (v) => v.replace(/[^\d]/g, "").length >= 7;

  const canContinueContactCleaning =
    firstName.trim() && lastNameState.trim() && isPhone(phone) && isEmail(email);

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

    if (
      !firstName.trim() ||
      !lastNameState.trim() ||
      !isPhone(phone) ||
      !isEmail(email)
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
    if (!detServiceLocation || !detCompletionDate) {
      openInfoModal(
        "Location or date missing",
        "Please choose where the service will be performed and by what date."
      );
      return;
    }

    const loc = buildDetailingLocation();

    const itemsPayload = {
      vehicle: {
        year: detYear,
        make: detMake,
        model: detModel,
      },
      history: {
        lastDetailed,
        conditionFlags,
        conditionRating,
      },
      services: detServices,
      multipleVehicles: detMultipleVehicles,
      vehicles: detVehicles,
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
        heardAbout,
        extraInfo,
      },
    };

    const notes = [
      "Detailing quote request (Personal)",
      `Name: ${firstName} ${lastNameState}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      heardAbout?.length ? `Heard about us: ${heardAbout.join(", ")}` : null,
      query ? `Customer address: ${query}` : null,
      `Preferred completion date: ${detCompletionDate}`,
      `Location type: ${loc.location_type}`,
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

  /** ---------- SUBMIT: Business / Fleet Detailing interest ---------- */

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

    // перевірка типів авто / послуг – теоретично це вже провалідовано в степі, але підстрахуємось
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
    if (
      businessServices.includes("Other") &&
      !businessServicesOther.trim()
    ) {
      openInfoModal(
        "Other services not specified",
        "Please specify which 'Other' services you need."
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

    if (businessServiceLocation === "on_site") {
      location_type = "on_site";
      service_address = baseAddress || null;
    } else if (businessServiceLocation === "drop_off") {
      location_type = "shop";
      service_address = shopAddress;
    } else if (businessServiceLocation === "mixed") {
      location_type = "mixed";
      service_address = shopAddress;
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
      baseAddress ? `Customer location (base): ${baseAddress}` : null,
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
    const isPhoneLocal = (v) =>
      (v || "").replace(/[^\d]/g, "").length >= 7;

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
      service_type: "cleaning_quote",
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

      <main className="flex items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center text-center min-w-0">
          <h1 className="text-[#18181B] font-extrabold text-[26px] sm:text-[32px] mt-10 mb-6">
            Book with Danilets
          </h1>

          {/* Tabs: Detailing / Cleaning */}
          <div className="w-full max-w-[100vw] -mx-4 px-4 overflow-x-auto touch-pan-x mb-6">
            <div className="w-max inline-flex items-center bg-[#F2F2F2]/90 rounded-full p-1 gap-2 whitespace-nowrap">
              {tabs.map((t) => {
                const isActiveTab = active === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setActive(t);
                      setStep(1);
                    }}
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

          {/* STEP 1: Address search (спільний) */}
          <Step1Search
            visible={step === 1}
            query={query}
            onChangeQuery={handleChange}
            predictions={visibleList}
            onChoosePrediction={handleChoose}
            onSearch={onSearch}
          />

          {/* Перемикач режиму всередині Detailing: Personal / Business */}
          {!isCleaning && step > 1 && (
            <div className="w-full mb-4">
              <div className="inline-flex items-center bg-[#F2F2F2]/90 rounded-full p-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailingMode("personal");
                    setStep(2);
                  }}
                  className={[
                    "px-5 py-2 rounded-full text-sm sm:text-[15px] font-semibold transition",
                    detailingMode === "personal"
                      ? "bg-white shadow text-[#18181B]"
                      : "text-[#5E5E61] hover:text-[#18181B]",
                  ].join(" ")}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetailingMode("business");
                    setStep(2);
                  }}
                  className={[
                    "px-5 py-2 rounded-full text-sm sm:text-[15px] font-semibold transition",
                    detailingMode === "business"
                      ? "bg-white shadow text-[#18181B]"
                      : "text-[#5E5E61] hover:text-[#18181B]",
                  ].join(" ")}
                >
                  Business / Fleet
                </button>
              </div>
            </div>
          )}

          {/* ============= DETAILING PERSONAL FLOW (1–7) ============= */}
          {!isCleaning && isPersonalDetailing && (
            <>
              <StepDetailingVehicle
                visible={step === 2}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                year={detYear}
                setYear={setDetYear}
                make={detMake}
                setMake={setDetMake}
                model={detModel}
                setModel={setDetModel}
              />

              <StepDetailingHistoryCondition
                visible={step === 3}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                lastDetailed={lastDetailed}
                setLastDetailed={setLastDetailed}
                conditionFlags={conditionFlags}
                setConditionFlags={setConditionFlags}
                conditionRating={conditionRating}
                setConditionRating={setConditionRating}
              />

              <StepDetailingServices
                visible={step === 4}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                services={detServices}
                setServices={setDetServices}
                multipleVehicles={detMultipleVehicles}
                setMultipleVehicles={setDetMultipleVehicles}
                vehiclesCount={detVehiclesCount}
                setVehiclesCount={setDetVehiclesCount}
                vehicles={detVehicles}
                setVehicles={setDetVehicles}
              />

              <StepDetailingLocationTimeline
                visible={step === 5}
                onBack={() => setStep(4)}
                onNext={() => setStep(6)}
                serviceLocation={detServiceLocation}
                setServiceLocation={setDetServiceLocation}
                completionDate={detCompletionDate}
                setCompletionDate={setDetCompletionDate}
              />

              <StepContactDetails
                visible={step === 6}
                onBack={() => setStep(5)}
                onNext={() => setStep(7)}
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
                isCleaning={false}
              />

              <StepReviewSubmit
                visible={step === 7}
                onBack={() => setStep(6)}
                onSubmit={submitDetailingRequest}
                year={detYear}
                make={detMake}
                model={detModel}
                lastDetailed={lastDetailed}
                conditionFlags={conditionFlags}
                conditionRating={conditionRating}
                services={detServices}
                multipleVehicles={detMultipleVehicles}
                vehicles={detVehicles}
                serviceLocation={detServiceLocation}
                completionDate={detCompletionDate}
                firstName={firstName}
                lastName={lastNameState}
                phone={phone}
                email={email}
                heardAbout={heardAbout}
                extraInfo={extraInfo}
              />
            </>
          )}

          {/* ============= DETAILING BUSINESS / FLEET FLOW ============= */}
          {!isCleaning && isBusinessDetailing && (
            <>
              {/* STEP 2: Business details + frequency */}
              <StepDetailingBusinessDetails
                visible={step === 2}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                businessVehiclesCount={businessVehiclesCount}
                setBusinessVehiclesCount={setBusinessVehiclesCount}
                businessType={businessType}
                setBusinessType={setBusinessType}
                businessTypeOther={businessTypeOther}
                setBusinessTypeOther={setBusinessTypeOther}
                serviceFrequency={serviceFrequency}
                setServiceFrequency={setServiceFrequency}
                serviceFrequencyOther={serviceFrequencyOther}
                setServiceFrequencyOther={setServiceFrequencyOther}
                renderProgress={renderBusinessDetailingProgress}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              {/* STEP 3: Business contact info */}
              <StepDetailingBusinessContact
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
                hearAbout={hearAbout}
                setHearAbout={setHearAbout}
                hearAboutOther={hearAboutOther}
                setHearAboutOther={setHearAboutOther}
                renderProgress={renderBusinessDetailingProgress}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              {/* STEP 4: Vehicle types, location, services */}
              <StepDetailingBusinessVehiclesServices
                visible={step === 4}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                businessVehicleTypes={businessVehicleTypes}
                setBusinessVehicleTypes={setBusinessVehicleTypes}
                businessVehicleOtherLabel={businessVehicleOtherLabel}
                setBusinessVehicleOtherLabel={setBusinessVehicleOtherLabel}
                businessServiceLocation={businessServiceLocation}
                setBusinessServiceLocation={setBusinessServiceLocation}
                businessServices={businessServices}
                setBusinessServices={setBusinessServices}
                businessServicesOther={businessServicesOther}
                setBusinessServicesOther={setBusinessServicesOther}
                renderProgress={renderBusinessDetailingProgress}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />

              {/* STEP 5: Review + preferences + submit */}
              <StepDetailingBusinessReview
                visible={step === 5}
                onBack={() => setStep(4)}
                onSubmit={submitDetailingBusinessRequest}
                isSubmitting={submitting}
                // Step 2
                businessVehiclesCount={businessVehiclesCount}
                businessType={businessType}
                businessTypeOther={businessTypeOther}
                serviceFrequency={serviceFrequency}
                serviceFrequencyOther={serviceFrequencyOther}
                // Step 3
                firstName={firstName}
                lastName={lastNameState}
                companyName={companyName}
                companyAddress={companyAddress}
                phone={phone}
                email={email}
                hearAbout={hearAbout}
                hearAboutOther={hearAboutOther}
                // Step 4
                businessVehicleTypes={businessVehicleTypes}
                businessVehicleOtherLabel={businessVehicleOtherLabel}
                businessServiceLocation={businessServiceLocation}
                businessServices={businessServices}
                businessServicesOther={businessServicesOther}
                // Final
                businessNotes={businessNotes}
                setBusinessNotes={setBusinessNotes}
                preferredContactMethod={preferredContactMethod}
                setPreferredContactMethod={setPreferredContactMethod}
                contactTimePreference={contactTimePreference}
                setContactTimePreference={setContactTimePreference}
                renderProgress={renderBusinessDetailingProgress}
                totalSteps={DETAILING_BUSINESS_STEPS_COUNT}
              />
            </>
          )}

          {/* ============= CLEANING FLOW (1–4) ============= */}
          {isCleaning && (
            <>
              {/* STEP 2: Type + project */}
              <StepCleaningTypeProject
                visible={step === 2}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                projectType={projectType}
                setProjectType={setProjectType}
                renderProgress={renderCleaningProgress}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 3: Property details */}
              <StepCleaningPropertyDetails
                visible={step === 3}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
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
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 4: Areas / tasks / budget */}
              <StepCleaningBudgetExtras
                visible={step === 4}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                propertyType={propertyType}
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
                comBudget={comBudget}
                setComBudget={setComBudget}
                comExtraDetails={comExtraDetails}
                setComExtraDetails={setComExtraDetails}
                renderProgress={renderCleaningProgress}
                totalSteps={CLEANING_STEPS_COUNT}
              />

              {/* STEP 5: Contact details – субмітить Cleaning */}
              <StepContactDetails
                visible={step === 5}
                onBack={() => setStep(4)}
                onNext={submitCleaningRequest}
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
                isCleaning={true}
                renderProgress={renderCleaningProgress}
                progressStepIndex={4}
                totalSteps={CLEANING_STEPS_COUNT}
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
              {activeKey === "cleaning"
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
