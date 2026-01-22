import React, { useMemo, useState, useEffect } from "react";
import { FiChevronLeft } from "react-icons/fi";
import ProgressBar from "../../ProgressBar";
import { GOLD_GRADIENT } from "../_ui";
import DatePicker from "../../DatePicker";

/** маленькі UI-хелпери */
function OptionButton({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-[44px] rounded-[16px] border text-sm font-semibold px-3 text-left",
        active
          ? "border-transparent text-black"
          : "border-[#E5E7EB] text-[#4B5563] bg-white",
        className,
      ].join(" ")}
      style={{ background: active ? GOLD_GRADIENT : undefined }}
    >
      {children}
    </button>
  );
}

function ToggleMulti({
  value = [],
  setValue,
  options,
  otherKey = null,
  otherLabel = "Other (please specify)",
  otherText = "",
  setOtherText,
}) {
  const arr = Array.isArray(value) ? value : [];
  const toggle = (k) => {
    const next = arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k];
    setValue(next);
    if (otherKey && k === otherKey && next.includes(otherKey) === false) {
      setOtherText?.("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <OptionButton
            key={opt.key}
            active={arr.includes(opt.key)}
            onClick={() => toggle(opt.key)}
          >
            {opt.label}
          </OptionButton>
        ))}

        {otherKey && (
          <OptionButton
            active={arr.includes(otherKey)}
            onClick={() => toggle(otherKey)}
          >
            {otherLabel}
          </OptionButton>
        )}
      </div>

      {otherKey && arr.includes(otherKey) && (
        <div className="pt-2">
          <label className="text-sm font-semibold text-[#111827]">
            Please specify
          </label>
          <input
            value={otherText}
            onChange={(e) => setOtherText?.(e.target.value)}
            className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
          />
        </div>
      )}
    </div>
  );
}

function SingleSelect({
  value,
  setValue,
  options,
  otherKey,
  otherText,
  setOtherText,
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <OptionButton
            key={opt.key}
            active={value === opt.key}
            onClick={() => {
              setValue(opt.key);
              if (otherKey && opt.key !== otherKey) setOtherText?.("");
            }}
          >
            {opt.label}
          </OptionButton>
        ))}
      </div>

      {otherKey && value === otherKey && (
        <div className="pt-2">
          <label className="text-sm font-semibold text-[#111827]">
            Please specify
          </label>
          <input
            value={otherText}
            onChange={(e) => setOtherText?.(e.target.value)}
            className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
          />
        </div>
      )}
    </div>
  );
}

const isFilled = (v) => String(v ?? "").trim().length > 0;
const hasSome = (arr) => Array.isArray(arr) && arr.length > 0;

export default function StepCleaningCommercialProjectInformation({
  visible,
  onBack,
  onNext,

  /** projectType: "office" | "airbnb" | "post_construction" | "other" */
  projectType,

  /** ===== OFFICE ===== */
  officeSquareFootage,
  setOfficeSquareFootage,
  officeFloors,
  setOfficeFloors,
  officeRestrooms,
  setOfficeRestrooms,
  officePrivateOffices,
  setOfficePrivateOffices,
  officeConferenceRooms,
  setOfficeConferenceRooms,
  officeAreas,
  setOfficeAreas, // array
  officeAreasOther,
  setOfficeAreasOther,
  officeFrequency,
  setOfficeFrequency, // string
  officeFrequencyOther,
  setOfficeFrequencyOther,
  officeBudget,
  setOfficeBudget, // string
  officeOneTimeBudget,
  setOfficeOneTimeBudget,
  officeStartDate,
  setOfficeStartDate,

  /** ===== AIRBNB / RENTAL ===== */
  airbnbUnits,
  setAirbnbUnits,
  airbnbPropertyTypes,
  setAirbnbPropertyTypes, // array
  airbnbPropertyOther,
  setAirbnbPropertyOther,
  airbnbAvgSqft,
  setAirbnbAvgSqft,
  airbnbAvgBedrooms,
  setAirbnbAvgBedrooms,
  airbnbAvgBathrooms,
  setAirbnbAvgBathrooms,
  airbnbTurnover,
  setAirbnbTurnover, // string
  airbnbTurnoverOther,
  setAirbnbTurnoverOther,
  airbnbBudgetPerUnit,
  setAirbnbBudgetPerUnit, // string
  airbnbLinenLaundry,
  setAirbnbLinenLaundry, // "yes" | "no" | ""
  airbnbAreas,
  setAirbnbAreas, // array
  airbnbAreasOther,
  setAirbnbAreasOther,
  airbnbKitchenTasks,
  setAirbnbKitchenTasks, // array
  airbnbKitchenOther,
  setAirbnbKitchenOther,
  airbnbStartDate,
  setAirbnbStartDate,

  /** ===== POST-CONSTRUCTION ===== */
  pcConstructionType,
  setPcConstructionType, // string
  pcConstructionOther,
  setPcConstructionOther,
  pcSquareFootage,
  setPcSquareFootage,
  pcFloors,
  setPcFloors,
  pcPropertyType,
  setPcPropertyType, // string
  pcPropertyTypeOther,
  setPcPropertyTypeOther,
  pcSurfaces,
  setPcSurfaces, // array
  pcSurfacesOther,
  setPcSurfacesOther,
  pcFrequency,
  setPcFrequency, // string
  pcFrequencyOther,
  setPcFrequencyOther,
  pcBudget,
  setPcBudget, // string
  pcCompletionDate,
  setPcCompletionDate,

  /** ===== OTHER ===== */
  otherProjectDescription,
  setOtherProjectDescription, // string
  otherProjectOther,
  setOtherProjectOther,
  otherSquareFootage,
  setOtherSquareFootage,
  otherFloors,
  setOtherFloors,
  otherRestrooms,
  setOtherRestrooms,
  otherCleaningService,
  setOtherCleaningService, // string
  otherCleaningServiceOther,
  setOtherCleaningServiceOther,
  otherAreas,
  setOtherAreas, // array
  otherAreasOther,
  setOtherAreasOther,
  otherFrequency,
  setOtherFrequency, // string
  otherFrequencyOther,
  setOtherFrequencyOther,
  otherBudget,
  setOtherBudget, // string
  otherContractType,
  setOtherContractType, // string
  otherStartDate,
  setOtherStartDate,
  otherUrgent,
  setOtherUrgent, // "yes" | "no" | ""
  otherUrgentExplain,
  setOtherUrgentExplain,

  /** ЗОВНІШНІЙ прогрес */
  renderProgress,
  progressStepIndex = 5,
  totalSteps = 10,
}) {
  if (!visible) return null;

  /** Options */
  const OFFICE_AREAS = [
    { key: "offices", label: "Offices" },
    { key: "conference", label: "Conference Rooms" },
    { key: "kitchen", label: "Kitchen/Break Room" },
    { key: "restrooms", label: "Restrooms" },
    { key: "reception", label: "Reception/Lobby" },
    { key: "hallways", label: "Hallways" },
    { key: "windows", label: "Windows" },
  ];

  const OFFICE_FREQUENCY = [
    { key: "one_time", label: "One-Time" },
    { key: "daily", label: "Daily" },
    { key: "2_3_week", label: "2-3 Times per Week" },
    { key: "weekly", label: "Weekly" },
    { key: "bi_weekly", label: "Bi-Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "other", label: "Other (please specify)" },
  ];

  const OFFICE_BUDGET = [
    { key: "below_500_month", label: "Below $500/month" },
    { key: "500_1000_month", label: "$500–$1,000/month" },
    { key: "1000_2500_month", label: "$1,000–$2,500/month" },
    { key: "2500_5000_month", label: "$2,500–$5,000/month" },
    { key: "5000_plus_month", label: "$5,000+/month" },
    { key: "one_time", label: "One-Time Budget: (please specify amount)" },
  ];

  const AIRBNB_PROPERTY_TYPES = [
    { key: "apartment", label: "Apartment" },
    { key: "house", label: "House" },
    { key: "condo", label: "Condo" },
    { key: "townhouse", label: "Townhouse" },
  ];

  const AIRBNB_TURNOVER = [
    { key: "after_every_guest", label: "After Every Guest" },
    { key: "weekly", label: "Weekly" },
    { key: "bi_weekly", label: "Bi-Weekly" },
    { key: "as_needed", label: "As Needed" },
    { key: "other", label: "Other (please specify)" },
  ];

  const AIRBNB_BUDGET = [
    { key: "below_100", label: "Below $100 per turnover" },
    { key: "100_200", label: "$100–$200 per turnover" },
    { key: "200_350", label: "$200–$350 per turnover" },
    { key: "350_500", label: "$350–$500 per turnover" },
    { key: "500_plus", label: "$500+ per turnover" },
  ];

  const AIRBNB_AREAS = [
    { key: "kitchen", label: "Kitchen" },
    { key: "bathrooms", label: "Bathrooms" },
    { key: "bedrooms", label: "Bedrooms" },
    { key: "living", label: "Living Areas" },
    { key: "balcony", label: "Balcony/Patio" },
    { key: "laundry", label: "Laundry Room" },
    { key: "all", label: "All Areas" },
  ];

  const AIRBNB_KITCHEN_TASKS = [
    { key: "countertops", label: "Countertops" },
    { key: "cabinets", label: "Cabinets (Inside/Outside)" },
    { key: "appliances", label: "Appliances (Inside/Outside)" },
    { key: "sink", label: "Sink" },
    { key: "floor", label: "Floor" },
    { key: "inside_oven", label: "Inside Oven" },
    { key: "inside_fridge", label: "Inside Refrigerator" },
    { key: "inside_microwave", label: "Inside Microwave" },
    { key: "inside_dishwasher", label: "Inside Dishwasher" },
  ];

  const PC_CONSTRUCTION_TYPE = [
    { key: "new_build", label: "New Build" },
    { key: "renovation", label: "Renovation" },
    { key: "remodel", label: "Remodel" },
    { key: "addition", label: "Addition" },
    { key: "other", label: "Other (please specify)" },
  ];

  const PC_PROPERTY_TYPE = [
    { key: "office_commercial", label: "Office/Commercial" },
    { key: "residential", label: "Residential" },
    { key: "mixed_use", label: "Mixed-Use" },
    { key: "industrial", label: "Industrial" },
    { key: "other", label: "Other (please specify)" },
  ];

  const PC_SURFACES = [
    { key: "windows", label: "Windows (Interior/Exterior)" },
    { key: "floors", label: "Floors (Hardwood, Tile, Carpet, etc.)" },
    { key: "walls", label: "Walls" },
    { key: "ceilings", label: "Ceilings" },
    { key: "fixtures", label: "Fixtures (Light fixtures, hardware, etc.)" },
    { key: "cabinets_countertops", label: "Cabinets/Countertops" },
    { key: "bathrooms", label: "Bathrooms" },
    { key: "kitchen", label: "Kitchen" },
    { key: "hvac", label: "HVAC Vents/Ducts" },
  ];

  const PC_FREQUENCY = [
    { key: "one_time_final", label: "One-Time Final Clean" },
    {
      key: "multiple_phases",
      label: "Multiple Phases (Rough Clean, Final Clean)",
    },
    { key: "ongoing", label: "Ongoing During Construction" },
    { key: "other", label: "Other (please specify)" },
  ];

  const PC_BUDGET = [
    { key: "below_1000", label: "Below $1,000" },
    { key: "1000_3000", label: "$1,000–$3,000" },
    { key: "3000_5000", label: "$3,000–$5,000" },
    { key: "5000_10000", label: "$5,000–$10,000" },
    { key: "10000_plus", label: "$10,000+" },
  ];

  const OTHER_PROJECT_DESC = [
    { key: "event_venue", label: "Event/Venue Cleaning" },
    { key: "medical_facility", label: "Medical Facility" },
    { key: "retail_store", label: "Retail Store" },
    { key: "restaurant", label: "Restaurant/Food Service" },
    { key: "warehouse", label: "Warehouse/Industrial" },
    { key: "school", label: "School/Educational Facility" },
    { key: "gym", label: "Gym/Fitness Center" },
    { key: "religious", label: "Religious Facility" },
    { key: "government", label: "Government Building" },
    { key: "other", label: "Other (please specify)" },
  ];

  const OTHER_CLEANING_SERVICE = [
    { key: "regular", label: "Regular Maintenance Cleaning" },
    { key: "deep", label: "Deep Clean" },
    { key: "specialized", label: "Specialized Cleaning (please specify)" },
    { key: "move_in_out", label: "Move-In/Move-Out" },
    { key: "event", label: "Event Cleaning (Before/After)" },
    { key: "emergency", label: "Emergency/One-Time Clean" },
    { key: "other", label: "Other (please specify)" },
  ];

  const OTHER_AREAS = [
    { key: "workspaces", label: "Offices/Workspaces" },
    { key: "meeting", label: "Conference/Meeting Rooms" },
    { key: "kitchen", label: "Kitchen/Break Room" },
    { key: "restrooms", label: "Restrooms" },
    { key: "reception", label: "Reception/Lobby/Waiting Area" },
    { key: "common", label: "Hallways/Common Areas" },
    { key: "windows", label: "Windows (Interior/Exterior)" },
    { key: "floors", label: "Floors (Carpet, Tile, Hardwood, etc.)" },
    { key: "storage", label: "Storage Areas" },
    { key: "exterior", label: "Exterior (Entrance, Walkways, etc.)" },
  ];

  const OTHER_FREQUENCY = [
    { key: "one_time", label: "One-Time" },
    { key: "daily", label: "Daily" },
    { key: "2_3_week", label: "2-3 Times per Week" },
    { key: "weekly", label: "Weekly" },
    { key: "bi_weekly", label: "Bi-Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "seasonal", label: "Seasonal" },
    { key: "as_needed", label: "As Needed" },
    { key: "other", label: "Other (please specify)" },
  ];

  const OTHER_BUDGET = [
    { key: "below_500", label: "Below $500" },
    { key: "500_1500", label: "$500–$1,500" },
    { key: "1500_3000", label: "$1,500–$3,000" },
    { key: "3000_5000", label: "$3,000–$5,000" },
    { key: "5000_10000", label: "$5,000–$10,000" },
    { key: "10000_plus", label: "$10,000+" },
    { key: "prefer_discuss", label: "Prefer to discuss" },
  ];

  const OTHER_CONTRACT = [
    { key: "one_time", label: "One-Time Service" },
    { key: "ongoing", label: "Ongoing Contract" },
    { key: "trial", label: "Trial Period with Option to Continue" },
    { key: "undecided", label: "Undecided" },
  ];

  // ====== СЕКЦІЇ всередині цього кроку (без окремого прогресу) ======
  const [section, setSection] = useState(0);

  const sections = useMemo(() => {
    if (projectType === "office") {
      return [
        { key: "size", title: "Size & Layout" },
        { key: "areas", title: "Areas" },
        { key: "frequency", title: "Frequency" },
        { key: "budget_date", title: "Budget & Start Date" },
      ];
    }
    if (projectType === "airbnb") {
      return [
        { key: "units", title: "Units & Property" },
        { key: "details", title: "Unit Details" },
        { key: "scope", title: "Scope of Work" },
        { key: "budget_date", title: "Start Date" },
      ];
    }
    if (projectType === "post_construction") {
      return [
        { key: "construction", title: "Construction Type" },
        { key: "property", title: "Property Details" },
        { key: "surfaces", title: "Surfaces & Frequency" },
        { key: "budget_date", title: "Budget & Completion" },
      ];
    }
    if (projectType === "other") {
      return [
        { key: "desc", title: "Project Type" },
        { key: "property", title: "Property Details" },
        { key: "scope", title: "Scope of Work" },
        { key: "budget_date", title: "Budget & Timing" },
      ];
    }
    return [];
  }, [projectType]);

  const totalSections = Math.max(1, sections.length);
  const sectionKey = sections[section]?.key;

  useEffect(() => {
    setSection(0);
  }, [projectType]);

  // ✅ Підключаємося до ЗОВНІШНЬОГО прогрес-бару:
  // даємо "плавний" прогрес всередині одного кроку: progressStepIndex + частка секції.
  // (якщо твій ProgressBar не підтримує дроби — скажеш, зроблю варіант через globalTotal)
  const outerProgressValue = useMemo(() => {
    const frac = totalSections > 0 ? section / totalSections : 0;
    return progressStepIndex + frac;
  }, [progressStepIndex, section, totalSections]);

  const goBack = () => {
    if (section > 0) setSection((s) => s - 1);
    else onBack?.();
  };

  const goNext = () => {
    if (section < totalSections - 1) setSection((s) => s + 1);
    else onNext?.();
  };

  // ====== CAN CONTINUE (по поточній секції) ======
  const canContinue = useMemo(() => {
    if (!projectType || !sectionKey) return false;

    if (projectType === "office") {
      if (sectionKey === "size") {
        return (
          isFilled(officeSquareFootage) &&
          isFilled(officeFloors) &&
          isFilled(officeRestrooms) &&
          isFilled(officePrivateOffices) &&
          isFilled(officeConferenceRooms)
        );
      }
      if (sectionKey === "areas") {
        if (!hasSome(officeAreas)) return false;
        if (officeAreas.includes("other") && !isFilled(officeAreasOther))
          return false;
        return true;
      }
      if (sectionKey === "frequency") {
        if (!isFilled(officeFrequency)) return false;
        if (officeFrequency === "other" && !isFilled(officeFrequencyOther))
          return false;
        return true;
      }
      if (sectionKey === "budget_date") {
        if (!isFilled(officeBudget)) return false;
        if (officeBudget === "one_time" && !isFilled(officeOneTimeBudget))
          return false;
        if (!isFilled(officeStartDate)) return false;
        return true;
      }
    }

    if (projectType === "airbnb") {
      if (sectionKey === "units") {
        if (!isFilled(airbnbUnits)) return false;
        if (!hasSome(airbnbPropertyTypes)) return false;
        if (
          airbnbPropertyTypes.includes("other") &&
          !isFilled(airbnbPropertyOther)
        )
          return false;
        return true;
      }
      if (sectionKey === "details") {
        // не required
        return true;
      }
      if (sectionKey === "scope") {
        if (!isFilled(airbnbTurnover)) return false;
        if (airbnbTurnover === "other" && !isFilled(airbnbTurnoverOther))
          return false;

        if (!isFilled(airbnbBudgetPerUnit)) return false;

        if (!hasSome(airbnbAreas)) return false;
        if (airbnbAreas.includes("other") && !isFilled(airbnbAreasOther))
          return false;

        if (!hasSome(airbnbKitchenTasks)) return false;
        if (airbnbKitchenTasks.includes("other") && !isFilled(airbnbKitchenOther))
          return false;

        return true;
      }
      if (sectionKey === "budget_date") {
        return isFilled(airbnbStartDate);
      }
    }

    if (projectType === "post_construction") {
      if (sectionKey === "construction") {
        if (!isFilled(pcConstructionType)) return false;
        if (pcConstructionType === "other" && !isFilled(pcConstructionOther))
          return false;
        return true;
      }
      if (sectionKey === "property") {
        if (!isFilled(pcSquareFootage)) return false;
        if (!isFilled(pcPropertyType)) return false;
        if (pcPropertyType === "other" && !isFilled(pcPropertyTypeOther))
          return false;
        return true;
      }
      if (sectionKey === "surfaces") {
        if (!hasSome(pcSurfaces)) return false;
        if (pcSurfaces.includes("other") && !isFilled(pcSurfacesOther))
          return false;

        if (!isFilled(pcFrequency)) return false;
        if (pcFrequency === "other" && !isFilled(pcFrequencyOther))
          return false;

        return true;
      }
      if (sectionKey === "budget_date") {
        if (!isFilled(pcBudget)) return false;
        if (!isFilled(pcCompletionDate)) return false;
        return true;
      }
    }

    if (projectType === "other") {
      if (sectionKey === "desc") {
        if (!isFilled(otherProjectDescription)) return false;
        if (otherProjectDescription === "other" && !isFilled(otherProjectOther))
          return false;
        return true;
      }
      if (sectionKey === "property") {
        return isFilled(otherSquareFootage);
      }
      if (sectionKey === "scope") {
        if (!isFilled(otherCleaningService)) return false;
        if (
          (otherCleaningService === "specialized" ||
            otherCleaningService === "other") &&
          !isFilled(otherCleaningServiceOther)
        )
          return false;

        if (!hasSome(otherAreas)) return false;
        if (otherAreas.includes("other") && !isFilled(otherAreasOther))
          return false;

        if (!isFilled(otherFrequency)) return false;
        if (otherFrequency === "other" && !isFilled(otherFrequencyOther))
          return false;

        return true;
      }
      if (sectionKey === "budget_date") {
        if (!isFilled(otherBudget)) return false;
        if (!isFilled(otherContractType)) return false;
        if (!isFilled(otherStartDate)) return false;

        if (!isFilled(otherUrgent)) return false;
        if (otherUrgent === "yes" && !isFilled(otherUrgentExplain)) return false;

        return true;
      }
    }

    return false;
  }, [
    projectType,
    sectionKey,

    officeSquareFootage,
    officeFloors,
    officeRestrooms,
    officePrivateOffices,
    officeConferenceRooms,
    officeAreas,
    officeAreasOther,
    officeFrequency,
    officeFrequencyOther,
    officeBudget,
    officeOneTimeBudget,
    officeStartDate,

    airbnbUnits,
    airbnbPropertyTypes,
    airbnbPropertyOther,
    airbnbAvgSqft,
    airbnbAvgBedrooms,
    airbnbAvgBathrooms,
    airbnbTurnover,
    airbnbTurnoverOther,
    airbnbBudgetPerUnit,
    airbnbLinenLaundry,
    airbnbAreas,
    airbnbAreasOther,
    airbnbKitchenTasks,
    airbnbKitchenOther,
    airbnbStartDate,

    pcConstructionType,
    pcConstructionOther,
    pcSquareFootage,
    pcFloors,
    pcPropertyType,
    pcPropertyTypeOther,
    pcSurfaces,
    pcSurfacesOther,
    pcFrequency,
    pcFrequencyOther,
    pcBudget,
    pcCompletionDate,

    otherProjectDescription,
    otherProjectOther,
    otherSquareFootage,
    otherFloors,
    otherRestrooms,
    otherCleaningService,
    otherCleaningServiceOther,
    otherAreas,
    otherAreasOther,
    otherFrequency,
    otherFrequencyOther,
    otherBudget,
    otherContractType,
    otherStartDate,
    otherUrgent,
    otherUrgentExplain,
  ]);

  return (
    <div className="w-full max-w-full min-w-0 text-left">
      <div className="bg-white/90 backdrop-blur rounded-[24px] p-4 sm:p-6 shadow space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-[#F2F2F2] inline-flex items-center justify-center"
            aria-label="Back"
            type="button"
          >
            <FiChevronLeft className="text-[18px] text-[#18181B]" />
          </button>

          <div className="min-w-0">
            <h2 className="text-[26px] font-extrabold text-[#111827]">
              Project Information
            </h2>
            {!!sections?.length && (
              <div className="text-sm font-semibold text-[#111827] truncate">
                {sections[section]?.title}
              </div>
            )}
          </div>
        </div>

        {/* ✅ ТІЛЬКИ зовнішній прогрес */}
        {renderProgress ? (
          renderProgress(outerProgressValue)
        ) : (
          <ProgressBar activeCount={outerProgressValue} total={totalSteps} />
        )}

        {/* ===== OFFICE ===== */}
        {projectType === "office" && (
          <div className="space-y-6">
            {sectionKey === "size" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    Office square footage?
                  </label>
                  <input
                    value={officeSquareFootage}
                    onChange={(e) => setOfficeSquareFootage(e.target.value)}
                    className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      How many floors/levels?
                    </label>
                    <input
                      value={officeFloors}
                      onChange={(e) => setOfficeFloors(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      How many restrooms?
                    </label>
                    <input
                      value={officeRestrooms}
                      onChange={(e) => setOfficeRestrooms(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      How many private offices?
                    </label>
                    <input
                      value={officePrivateOffices}
                      onChange={(e) => setOfficePrivateOffices(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      How many conference rooms?
                    </label>
                    <input
                      value={officeConferenceRooms}
                      onChange={(e) => setOfficeConferenceRooms(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </>
            )}

            {sectionKey === "areas" && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-[#111827]">
                  What areas do you need cleaned? (Select all that apply)
                </div>
                <ToggleMulti
                  value={officeAreas}
                  setValue={setOfficeAreas}
                  options={OFFICE_AREAS}
                  otherKey="other"
                  otherLabel="Other (please specify)"
                  otherText={officeAreasOther}
                  setOtherText={setOfficeAreasOther}
                />
              </div>
            )}

            {sectionKey === "frequency" && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-[#111827]">
                  Frequency of cleaning?
                </div>
                <SingleSelect
                  value={officeFrequency}
                  setValue={setOfficeFrequency}
                  options={OFFICE_FREQUENCY}
                  otherKey="other"
                  otherText={officeFrequencyOther}
                  setOtherText={setOfficeFrequencyOther}
                />
              </div>
            )}

            {sectionKey === "budget_date" && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What is your budget?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {OFFICE_BUDGET.map((opt) => (
                      <OptionButton
                        key={opt.key}
                        active={officeBudget === opt.key}
                        onClick={() => {
                          setOfficeBudget(opt.key);
                          if (opt.key !== "one_time")
                            setOfficeOneTimeBudget?.("");
                        }}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>

                  {officeBudget === "one_time" && (
                    <div className="pt-2">
                      <label className="text-sm font-semibold text-[#111827]">
                        One-Time Budget: (please specify amount)
                      </label>
                      <input
                        value={officeOneTimeBudget}
                        onChange={(e) => setOfficeOneTimeBudget(e.target.value)}
                        className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    By what date does the service need to start?
                  </label>
                  <DatePicker
                    value={officeStartDate}
                    onChange={(v) =>
                      setOfficeStartDate(v?.target?.value ?? v)
                    }
                    placeholder="MM/DD/YYYY"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== AIRBNB / RENTAL ===== */}
        {projectType === "airbnb" && (
          <div className="space-y-6">
            {sectionKey === "units" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    How many units do you need cleaned?
                  </label>
                  <input
                    value={airbnbUnits}
                    onChange={(e) => setAirbnbUnits(e.target.value)}
                    className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Property type? (Select all that apply)
                  </div>
                  <ToggleMulti
                    value={airbnbPropertyTypes}
                    setValue={setAirbnbPropertyTypes}
                    options={AIRBNB_PROPERTY_TYPES}
                    otherKey="other"
                    otherLabel="Other (please specify)"
                    otherText={airbnbPropertyOther}
                    setOtherText={setAirbnbPropertyOther}
                  />
                </div>
              </>
            )}

            {sectionKey === "details" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    Average square footage per unit?
                  </label>
                  <input
                    value={airbnbAvgSqft}
                    onChange={(e) => setAirbnbAvgSqft(e.target.value)}
                    className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      Average number of bedrooms per unit?
                    </label>
                    <input
                      value={airbnbAvgBedrooms}
                      onChange={(e) => setAirbnbAvgBedrooms(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      Average number of bathrooms per unit?
                    </label>
                    <input
                      value={airbnbAvgBathrooms}
                      onChange={(e) => setAirbnbAvgBathrooms(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </>
            )}

            {sectionKey === "scope" && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Turnover frequency?
                  </div>
                  <SingleSelect
                    value={airbnbTurnover}
                    setValue={setAirbnbTurnover}
                    options={AIRBNB_TURNOVER}
                    otherKey="other"
                    otherText={airbnbTurnoverOther}
                    setOtherText={setAirbnbTurnoverOther}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What is your budget per unit?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AIRBNB_BUDGET.map((opt) => (
                      <OptionButton
                        key={opt.key}
                        active={airbnbBudgetPerUnit === opt.key}
                        onClick={() => setAirbnbBudgetPerUnit(opt.key)}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Do you need linen/laundry services?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <OptionButton
                      active={airbnbLinenLaundry === "yes"}
                      onClick={() => setAirbnbLinenLaundry("yes")}
                    >
                      Yes
                    </OptionButton>
                    <OptionButton
                      active={airbnbLinenLaundry === "no"}
                      onClick={() => setAirbnbLinenLaundry("no")}
                    >
                      No
                    </OptionButton>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What areas do you need cleaned? (Select all that apply)
                  </div>
                  <ToggleMulti
                    value={airbnbAreas}
                    setValue={setAirbnbAreas}
                    options={AIRBNB_AREAS}
                    otherKey="other"
                    otherLabel="Other (please specify)"
                    otherText={airbnbAreasOther}
                    setOtherText={setAirbnbAreasOther}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What will we be doing in the kitchen? (Select all that apply)
                  </div>
                  <ToggleMulti
                    value={airbnbKitchenTasks}
                    setValue={setAirbnbKitchenTasks}
                    options={AIRBNB_KITCHEN_TASKS}
                    otherKey="other"
                    otherLabel="Other (please specify)"
                    otherText={airbnbKitchenOther}
                    setOtherText={setAirbnbKitchenOther}
                  />
                </div>
              </>
            )}

            {sectionKey === "budget_date" && (
              <div>
                <label className="text-sm font-semibold text-[#111827]">
                  By what date does the service need to start?
                </label>
                <DatePicker
                  value={airbnbStartDate}
                  onChange={(v) => setAirbnbStartDate(v?.target?.value ?? v)}
                  className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                  placeholder="MM/DD/YYYY"
                />
              </div>
            )}
          </div>
        )}

        {/* ===== POST-CONSTRUCTION ===== */}
        {projectType === "post_construction" && (
          <div className="space-y-6">
            {sectionKey === "construction" && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-[#111827]">
                  What type of construction?
                </div>
                <SingleSelect
                  value={pcConstructionType}
                  setValue={setPcConstructionType}
                  options={PC_CONSTRUCTION_TYPE}
                  otherKey="other"
                  otherText={pcConstructionOther}
                  setOtherText={setPcConstructionOther}
                />
              </div>
            )}

            {sectionKey === "property" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    Property square footage
                  </label>
                  <input
                    value={pcSquareFootage}
                    onChange={(e) => setPcSquareFootage(e.target.value)}
                    className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    How many floors/levels? (optional)
                  </label>
                  <input
                    value={pcFloors}
                    onChange={(e) => setPcFloors(e.target.value)}
                    className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Property type?
                  </div>
                  <SingleSelect
                    value={pcPropertyType}
                    setValue={setPcPropertyType}
                    options={PC_PROPERTY_TYPE}
                    otherKey="other"
                    otherText={pcPropertyTypeOther}
                    setOtherText={setPcPropertyTypeOther}
                  />
                </div>
              </>
            )}

            {sectionKey === "surfaces" && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What specific surfaces need attention? (Select all that apply)
                  </div>
                  <ToggleMulti
                    value={pcSurfaces}
                    setValue={setPcSurfaces}
                    options={PC_SURFACES}
                    otherKey="other"
                    otherLabel="Other (please specify)"
                    otherText={pcSurfacesOther}
                    setOtherText={setPcSurfacesOther}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Frequency of cleaning?
                  </div>
                  <SingleSelect
                    value={pcFrequency}
                    setValue={setPcFrequency}
                    options={PC_FREQUENCY}
                    otherKey="other"
                    otherText={pcFrequencyOther}
                    setOtherText={setPcFrequencyOther}
                  />
                </div>
              </>
            )}

            {sectionKey === "budget_date" && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What is your budget?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PC_BUDGET.map((opt) => (
                      <OptionButton
                        key={opt.key}
                        active={pcBudget === opt.key}
                        onClick={() => setPcBudget(opt.key)}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    By what date does the service need to be completed?
                  </label>
                  <DatePicker
                    value={pcCompletionDate}
                    onChange={(v) => setPcCompletionDate(v?.target?.value ?? v)}
                    placeholder="MM/DD/YYYY"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== OTHER ===== */}
        {projectType === "other" && (
          <div className="space-y-6">
            {sectionKey === "desc" && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-[#111827]">
                  Please describe your project type:
                </div>
                <SingleSelect
                  value={otherProjectDescription}
                  setValue={setOtherProjectDescription}
                  options={OTHER_PROJECT_DESC}
                  otherKey="other"
                  otherText={otherProjectOther}
                  setOtherText={setOtherProjectOther}
                />
              </div>
            )}

            {sectionKey === "property" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    Property square footage
                  </label>
                  <input
                    value={otherSquareFootage}
                    onChange={(e) => setOtherSquareFootage(e.target.value)}
                    className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      How many floors/levels? (optional)
                    </label>
                    <input
                      value={otherFloors}
                      onChange={(e) => setOtherFloors(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#111827]">
                      How many restrooms? (optional)
                    </label>
                    <input
                      value={otherRestrooms}
                      onChange={(e) => setOtherRestrooms(e.target.value)}
                      className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </>
            )}

            {sectionKey === "scope" && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What type of cleaning service do you need?
                  </div>
                  <SingleSelect
                    value={otherCleaningService}
                    setValue={setOtherCleaningService}
                    options={OTHER_CLEANING_SERVICE}
                    otherKey={null}
                  />
                  {(otherCleaningService === "specialized" ||
                    otherCleaningService === "other") && (
                    <div className="pt-2">
                      <label className="text-sm font-semibold text-[#111827]">
                        Please specify
                      </label>
                      <input
                        value={otherCleaningServiceOther}
                        onChange={(e) =>
                          setOtherCleaningServiceOther(e.target.value)
                        }
                        className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What areas do you need cleaned? (Select all that apply)
                  </div>
                  <ToggleMulti
                    value={otherAreas}
                    setValue={setOtherAreas}
                    options={OTHER_AREAS}
                    otherKey="other"
                    otherLabel="Other (please specify)"
                    otherText={otherAreasOther}
                    setOtherText={setOtherAreasOther}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Frequency of cleaning?
                  </div>
                  <SingleSelect
                    value={otherFrequency}
                    setValue={setOtherFrequency}
                    options={OTHER_FREQUENCY}
                    otherKey="other"
                    otherText={otherFrequencyOther}
                    setOtherText={setOtherFrequencyOther}
                  />
                </div>
              </>
            )}

            {sectionKey === "budget_date" && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    What is your budget?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {OTHER_BUDGET.map((opt) => (
                      <OptionButton
                        key={opt.key}
                        active={otherBudget === opt.key}
                        onClick={() => setOtherBudget(opt.key)}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Is this an ongoing contract or one-time service?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {OTHER_CONTRACT.map((opt) => (
                      <OptionButton
                        key={opt.key}
                        active={otherContractType === opt.key}
                        onClick={() => setOtherContractType(opt.key)}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#111827]">
                    By what date does the service need to start?
                  </label>
                  <DatePicker
                    value={otherStartDate}
                    onChange={(v) => setOtherStartDate(v?.target?.value ?? v)}
                    className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#111827]">
                    Is this project time-sensitive or urgent?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <OptionButton
                      active={otherUrgent === "yes"}
                      onClick={() => setOtherUrgent("yes")}
                    >
                      Yes
                    </OptionButton>
                    <OptionButton
                      active={otherUrgent === "no"}
                      onClick={() => {
                        setOtherUrgent("no");
                        setOtherUrgentExplain?.("");
                      }}
                    >
                      No
                    </OptionButton>
                  </div>

                  {otherUrgent === "yes" && (
                    <div className="pt-2">
                      <label className="text-sm font-semibold text-[#111827]">
                        If Yes, please explain:
                      </label>
                      <input
                        value={otherUrgentExplain}
                        onChange={(e) => setOtherUrgentExplain(e.target.value)}
                        className="mt-2 w-full h-[52px] rounded-[18px] border border-[#E5E7EB] px-4 outline-none"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={goBack}
            className="h-[46px] px-6 rounded-full border border-[#D1D5DB] text-sm font-semibold text-[#111827]"
          >
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            className={[
              "h-[46px] px-8 rounded-full text-sm font-semibold text-black",
              !canContinue ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
            style={{ background: GOLD_GRADIENT }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
