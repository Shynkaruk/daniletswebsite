import React, { useEffect, useRef, useState, useCallback } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { AddressAutocomplete } from "./AddressAutocomplete";

const GOLD_GRADIENT =
  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)";

const HEAR_OPTIONS = [
  "Google Search",
  "Instagram",
  "Facebook",
  "Referral / Friend",
  "Returning Client",
  "Other",
];

// Google Places loader (без змін)
let __gmapsPromise = null;
function loadGooglePlaces() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (window.google?.maps?.places) return Promise.resolve(true);
  if (__gmapsPromise) return __gmapsPromise;
  if (!key) return Promise.resolve(false);

  __gmapsPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-gmaps="places"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-gmaps", "places");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return __gmapsPromise;
}

export default function StepDetailingBusinessContactInfo({
  visible,
  onBack,
  onNext,

  firstName,
  setFirstName,
  lastName,
  setLastName,
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  phone,
  setPhone,
  email,
  setEmail,

  heardAbout,
  setHeardAbout,
  heardOther,
  setHeardOther,

  user,

  renderProgress,
  progressStepIndex = 2,
  totalSteps = 11,
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isLoggedIn = !!user;
  const [mode, setMode] = useState(isLoggedIn ? "account" : "manual");

  // Auto-fill personal fields from account (company fields are always manual)
  useEffect(() => {
    if (!isLoggedIn || mode !== "account") return;
    if (user?.first_name) setFirstName?.(user.first_name);
    if (user?.last_name)  setLastName?.(user.last_name);
    if (user?.phone)      setPhone?.(user.phone);
    if (user?.email)      setEmail?.(user.email);
  }, [isLoggedIn, mode, user, setFirstName, setLastName, setPhone, setEmail]);

  const first = firstName ?? "";
  const last = lastName ?? "";
  const comp = companyName ?? "";
  const addr = companyAddress ?? "";
  const ph = phone ?? "";
  const em = email ?? "";
  const heard = heardAbout ?? "";
  const heardO = heardOther ?? "";

  const computeErrors = useCallback((fields) => {
    const phoneRegex = /^(\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    for (const field of fields) {
      switch (field) {
        case "firstName":
          if (!first.trim()) newErrors.firstName = "First name is required";
          break;
        case "lastName":
          if (!last.trim()) newErrors.lastName = "Last name is required";
          break;
        case "companyName":
          if (!comp.trim()) newErrors.companyName = "Company name is required";
          break;
        case "companyAddress":
          if (!addr.trim()) newErrors.companyAddress = "Company address is required";
          break;
        case "phone":
          if (!ph.trim()) newErrors.phone = "Phone number is required";
          else if (!phoneRegex.test(ph)) newErrors.phone = "Please enter a valid US phone number (e.g. (123) 456-7890)";
          break;
        case "email":
          if (!em) newErrors.email = "Email is required";
          else if (!emailRegex.test(em)) newErrors.email = "Please enter a valid email address";
          break;
        case "heardAbout":
          if (!heard) newErrors.heardAbout = "Please tell us how you heard about us";
          break;
        case "heardOther":
          if (heard === "Other" && !heardO.trim()) newErrors.heardOther = "Please specify how you heard about us";
          break;
        default:
          break;
      }
    }
    return newErrors;
  }, [first, last, comp, addr, ph, em, heard, heardO]);

  const validateField = useCallback((field) => {
    setErrors(prev => {
      const fieldErrors = computeErrors([field]);
      const next = { ...prev };
      if (fieldErrors[field]) next[field] = fieldErrors[field];
      else delete next[field];
      return next;
    });
  }, [computeErrors]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleContinue = () => {
    const isAccountModeNow = isLoggedIn && mode === "account";
    const allFields = isAccountModeNow
      ? ["companyName", "companyAddress", "heardAbout"]
      : ["firstName", "lastName", "companyName", "companyAddress", "phone", "email", "heardAbout"];
    if (heard === "Other") allFields.push("heardOther");

    const newTouched = {};
    allFields.forEach(f => { newTouched[f] = true; });
    setTouched(prev => ({ ...prev, ...newTouched }));

    const currentErrors = computeErrors(allFields);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      onNext?.();
    }
  };

  // Google Places (без змін)
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!visible) return;

    loadGooglePlaces().then((ok) => {
      if (cancelled) return;
      setPlacesReady(!!ok);
    });

    return () => { cancelled = true; };
  }, [visible]);

  useEffect(() => {
    if (!visible || !placesReady || !addressInputRef.current || !window.google?.maps?.places) return;
    if (autocompleteRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      fields: ["formatted_address", "address_components", "geometry", "name"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace?.();
      const formatted = place?.formatted_address || place?.name || "";
      if (formatted) setCompanyAddress?.(formatted);
    });

    autocompleteRef.current = ac;
  }, [visible, placesReady, setCompanyAddress]);

  if (!visible) return null;

  const isAccountMode = isLoggedIn && mode === "account";
  const personalReadOnly = isAccountMode;
  const inputClass = "w-full h-[52px] rounded-[16px] px-4 text-[15px] outline-none bg-[#F4F4F5]";

  const getInputClass = (field, isPersonal = false) => {
    const readonly = isPersonal && personalReadOnly;
    return [
      inputClass,
      readonly ? "bg-[#EBEBEB] text-[#6B7280] cursor-default" : "",
      !readonly && touched[field] && errors[field] ? "border-2 border-red-500 bg-red-50" : "",
    ].join(" ");
  };

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-5 sm:p-6 lg:p-8 shadow space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div>
            <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#18181B]">
              Contact Information
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#9CA3AF]">
              Step {progressStepIndex} of {totalSteps}
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {renderProgress ? (
          renderProgress(progressStepIndex)
        ) : (
          <ProgressBar activeCount={progressStepIndex} total={totalSteps} />
        )}

        {/* Account / Manual toggle */}
        {isLoggedIn && (
          <section className="space-y-3">
            <div className="text-sm text-[#6B7280] font-medium">
              How would you like to provide your personal details?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("account")}
                className={`h-[44px] rounded-[16px] border text-sm font-semibold
                  ${mode === "account" ? "border-transparent text-black" : "border-[#E5E7EB] text-[#4B5563] bg-white"}`}
                style={{ background: mode === "account" ? GOLD_GRADIENT : undefined }}
              >
                Use my account
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`h-[44px] rounded-[16px] border text-sm font-semibold
                  ${mode === "manual" ? "border-transparent text-black" : "border-[#E5E7EB] text-[#4B5563] bg-white"}`}
                style={{ background: mode === "manual" ? GOLD_GRADIENT : undefined }}
              >
                Enter different details
              </button>
            </div>
          </section>
        )}

        {/* FORM */}
        <section className="space-y-4">
          {/* First + Last */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#6B7280] font-medium">First Name</div>
              <input
                value={first}
                readOnly={personalReadOnly}
                onChange={(e) => !personalReadOnly && setFirstName?.(e.target.value)}
                onBlur={() => !personalReadOnly && handleBlur("firstName")}
                className={getInputClass("firstName", true)}
                placeholder="Enter first name"
              />
              {!personalReadOnly && touched.firstName && errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <div className="text-sm text-[#6B7280] font-medium">Last Name</div>
              <input
                value={last}
                readOnly={personalReadOnly}
                onChange={(e) => !personalReadOnly && setLastName?.(e.target.value)}
                onBlur={() => !personalReadOnly && handleBlur("lastName")}
                className={getInputClass("lastName", true)}
                placeholder="Enter last name"
              />
              {!personalReadOnly && touched.lastName && errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Company Name */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium">Company Name</div>
            <input
              value={comp}
              onChange={(e) => setCompanyName?.(e.target.value)}
              onBlur={() => handleBlur("companyName")}
              className={getInputClass("companyName")}
              placeholder="Enter your company name"
            />
            {touched.companyName && errors.companyName && <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>}
          </div>

          {/* Company Address */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium">Company Address</div>
            <AddressAutocomplete
              value={addr}
              onChange={(v) => setCompanyAddress?.(v)}
              onSelectAddress={(formatted) => setCompanyAddress?.(formatted)}
              inputClass={getInputClass("companyAddress")}
              placeholder="Start typing address…"
              ref={addressInputRef}
              onBlur={() => handleBlur("companyAddress")}
            />
            {touched.companyAddress && errors.companyAddress && <p className="text-red-600 text-sm mt-1">{errors.companyAddress}</p>}
            {!placesReady && import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
              <p className="text-[11px] text-[#9CA3AF] mt-1">Loading address suggestions…</p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#6B7280] font-medium">Phone Number</div>
              <input
                value={ph}
                readOnly={personalReadOnly}
                onChange={(e) => !personalReadOnly && setPhone?.(e.target.value)}
                onBlur={() => !personalReadOnly && handleBlur("phone")}
                placeholder="(123) 456-7890"
                className={getInputClass("phone", true)}
              />
              {!personalReadOnly && touched.phone && errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <div className="text-sm text-[#6B7280] font-medium">Email</div>
              <input
                value={em}
                type="email"
                readOnly={personalReadOnly}
                onChange={(e) => !personalReadOnly && setEmail?.(e.target.value)}
                onBlur={() => !personalReadOnly && handleBlur("email")}
                className={getInputClass("email", true)}
                placeholder="Enter email"
              />
              {!personalReadOnly && touched.email && errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Heard about */}
          <div>
            <div className="text-sm text-[#6B7280] font-medium">How did you hear about us?</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {HEAR_OPTIONS.map((opt) => {
                const active = heard === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setHeardAbout?.(opt)}
                    className={`h-[44px] rounded-[16px] border text-sm font-medium ${
                      active
                        ? "border-transparent text-black"
                        : "border-[#E5E7EB] text-[#4B5563] bg-white"
                    }`}
                    style={{ background: active ? GOLD_GRADIENT : undefined }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {touched.heardAbout && errors.heardAbout && <p className="text-red-600 text-sm mt-1">{errors.heardAbout}</p>}

            {heard === "Other" && (
              <input
                value={heardO}
                onChange={(e) => setHeardOther?.(e.target.value)}
                onBlur={() => handleBlur("heardOther")}
                className={`${inputClass} mt-3 ${getInputClass("heardOther")}`}
                placeholder="Please specify"
              />
            )}
            {touched.heardOther && errors.heardOther && <p className="text-red-600 text-sm mt-1">{errors.heardOther}</p>}
          </div>
        </section>

        {/* CONTINUE */}
        <button
          type="button"
          onClick={handleContinue}
          className={`
            w-full h-[52px] sm:h-[56px] rounded-[88px] font-semibold text-black shadow
            inline-flex items-center justify-between px-6
          `}
          style={{ background: GOLD_GRADIENT }}
          disabled={false}
        >
          <span>Continue</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}