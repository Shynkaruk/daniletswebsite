import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function AddressAutocomplete({
  value,
  onChange,
  onSelectAddress,
  placeholder = "Start typing address…",
  inputClass,
  componentRestrictions,
}) {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const sessionTokenRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  const canUseGoogle = !!window.google?.maps?.places;

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const computePos = () => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom, // прямо під інпутом
      left: r.left,
      width: r.width,
    });
  };

  // init google services
  useEffect(() => {
    if (!window.google?.maps?.places) return;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }

    if (!placesServiceRef.current) {
      const dummy = document.createElement("div");
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummy);
    }
  }, []);

  // close on outside click
  useEffect(() => {
    if (!open) return;

    const onDocDown = (e) => {
      const inp = inputRef.current;
      const dd = dropdownRef.current;
      if (!inp || !dd) return;
      if (inp.contains(e.target) || dd.contains(e.target)) return;
      close();
    };

    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [open]);

  // keep dropdown pinned to input (scroll/resize)
  useEffect(() => {
    if (!open) return;

    computePos();

    const onScrollResize = () => computePos();
    window.addEventListener("scroll", onScrollResize, true); // capture = true
    window.addEventListener("resize", onScrollResize);

    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open]);

  const fetchPredictions = (text) => {
    if (!window.google?.maps?.places) return;
    const svc = autocompleteServiceRef.current;
    const token = sessionTokenRef.current;
    if (!svc || !token) return;

    const q = (text || "").trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);

    svc.getPlacePredictions(
      {
        input: q,
        sessionToken: token,
        types: ["address"],
        ...(componentRestrictions ? { componentRestrictions } : {}),
      },
      (preds, status) => {
        setLoading(false);

        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !preds
        ) {
          setItems([]);
          setOpen(false);
          return;
        }

        setItems(preds);
        setOpen(true);
        setActiveIndex(-1);
        computePos();
      }
    );
  };

  const selectPrediction = (pred) => {
    const ps = placesServiceRef.current;
    const token = sessionTokenRef.current;
    if (!ps || !pred?.place_id) return;

    ps.getDetails(
      {
        placeId: pred.place_id,
        fields: ["formatted_address", "name"],
        sessionToken: token,
      },
      (place) => {
        // новий токен на наступну сесію
        sessionTokenRef.current =
          new window.google.maps.places.AutocompleteSessionToken();

        const formatted =
          place?.formatted_address || pred?.description || place?.name || "";

        if (formatted) onSelectAddress?.(formatted);

        setItems([]);
        close();
      }
    );
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      if (items.length) {
        setOpen(true);
        computePos();
      }
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        selectPrediction(items[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  // ✅ styles
  const dropdownStyle = {
    position: "fixed",
    top: pos.top,
    left: pos.left,
    width: pos.width,
    zIndex: 2147483647,

    borderLeft: "1px solid rgba(214,180,106,0.95)",
    borderRight: "1px solid rgba(214,180,106,0.95)",
    borderBottom: "1px solid rgba(214,180,106,0.95)",
    borderTop: "0px",

    borderRadius: "0 0 16px 16px",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
    overflow: "hidden",
  };

  const inputOpenStyle = open
    ? {
        border: "1px solid rgba(214,180,106,0.95)",
        borderBottom: "0px",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 0 0 1px rgba(214,180,106,0.35) inset",
        background: "rgba(255,255,255,0.60)",
      }
    : undefined;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          onChange?.(next);
          fetchPredictions(next);
        }}
        onClick={() => {
          // якщо вже є текст — спробуємо відкрити
          if (value?.trim()?.length >= 2) {
            computePos();
            fetchPredictions(value);
          }
        }}
        onFocus={() => {
          if (value?.trim()?.length >= 2) {
            computePos();
            fetchPredictions(value);
          }
        }}
        onKeyDown={onKeyDown}
        className={inputClass}
        style={inputOpenStyle}
        placeholder={placeholder}
        autoComplete="new-password"
        name="address__no_autofill"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        inputMode="text"
      />

      {!canUseGoogle && (
        <div className="text-[11px] text-[#9CA3AF] mt-1">
          Google Places not loaded (check API key / billing / Places API).
        </div>
      )}

      {open &&
        canUseGoogle &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 py-2 text-[12px] font-semibold text-[#111827]"
              style={{
                background:
                  "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)",
              }}
            >
              Address suggestions
            </div>

            <div className="max-h-[260px] overflow-auto">
              {loading && (
                <div className="px-4 py-3 text-[13px] text-[#6B7280]">
                  Loading…
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="px-4 py-3 text-[13px] text-[#6B7280]">
                  Start typing to see suggestions
                </div>
              )}

              {!loading &&
                items.map((pred, idx) => {
                  const active = idx === activeIndex;
                  const main =
                    pred.structured_formatting?.main_text || pred.description;
                  const secondary =
                    pred.structured_formatting?.secondary_text || "";

                  return (
                    <button
                      key={pred.place_id}
                      type="button"
                      className={`w-full text-left px-4 py-3 text-[14px] flex items-start gap-3
                        ${active ? "bg-[#FFF3D6]" : "bg-transparent"}
                        hover:bg-[#FFF3D6]`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => selectPrediction(pred)}
                    >
                      <span
                        className="mt-[2px] w-4 h-4 rounded-full flex-shrink-0 border border-[#D6B46A]"
                        style={{ background: active ? "#D6B46A" : "transparent" }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[#111827] truncate">
                          {main}
                        </div>
                        <div className="text-[#6B7280] text-[12px] truncate">
                          {secondary}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
