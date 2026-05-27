// src/Components/AutocompleteInput.jsx
// Reusable combobox input with a filtered dropdown list.
import React, { useState, useRef, useEffect } from "react";

/**
 * Props:
 *   value         {string}   — controlled value
 *   onChange      {fn}       — called with new string value
 *   options       {string[]} — all available options (filtered client-side)
 *   placeholder   {string}
 *   inputClassName {string}  — Tailwind classes for the <input>
 *   loading       {bool}     — show "Loading..." when fetching options async
 *   disabled      {bool}
 *   maxVisible    {number}   — max dropdown rows (default 8)
 */
export default function AutocompleteInput({
  value = "",
  onChange,
  options = [],
  placeholder = "",
  inputClassName = "",
  loading = false,
  disabled = false,
  maxVisible = 8,
}) {
  const [open, setOpen]           = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const listRef      = useRef(null);

  // Filter options that include the typed value
  const term     = (value || "").toLowerCase().trim();
  const filtered = options
    .filter((opt) => !term || opt.toLowerCase().includes(term))
    .slice(0, maxVisible);

  const showDropdown = open && (loading || filtered.length > 0);

  // Close on outside click / focus-out
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const handleChange = (e) => {
    onChange?.(e.target.value);
    setOpen(true);
    setHighlighted(-1);
  };

  const select = (opt) => {
    onChange?.(opt);
    setOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown") { setOpen(true); setHighlighted(0); e.preventDefault(); }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        e.preventDefault();
        break;
      case "ArrowUp":
        setHighlighted((h) => Math.max(h - 1, 0));
        e.preventDefault();
        break;
      case "Enter":
        if (highlighted >= 0 && filtered[highlighted]) {
          select(filtered[highlighted]);
          e.preventDefault();
        }
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        className={inputClassName}
      />

      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xl overflow-y-auto max-h-[232px] py-1"
        >
          {loading ? (
            <li className="px-4 py-3 text-[13px] text-[#9CA3AF] select-none">
              Loading models…
            </li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt}
                onMouseDown={(e) => { e.preventDefault(); select(opt); }}
                className={`
                  px-4 py-[10px] text-[14px] cursor-pointer select-none transition-colors leading-tight
                  ${i === highlighted
                    ? "bg-[#FFF7E6] font-semibold text-[#111827]"
                    : "text-[#374151] hover:bg-[#F9FAFB]"}
                `}
              >
                {opt}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
