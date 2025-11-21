// src/Components/Booking/DatePicker.jsx
import React, { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMonths(date, delta) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
}

function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${d}.${m}.${y}`;
}

const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  disablePast = false,
  disableFuture = false,
}) => {
  const [open, setOpen] = useState(false);

  // якщо вже є значення – показуємо місяць цієї дати, інакше – поточний
  const initialDate = useMemo(
    () => (value ? startOfDay(new Date(value)) : startOfDay(new Date())),
    [value]
  );
  const [viewDate, setViewDate] = useState(initialDate);

  const today = startOfDay(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-11
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  // масив із null + датами, щоб зручно рендерити сітку 7хN
  const calendarCells = [];
  for (let i = 0; i < startWeekday; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d));
  }
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const selectedDate = value ? startOfDay(new Date(value)) : null;

  const isDisabled = (date) => {
    if (!date) return true;
    const d = startOfDay(date);
    if (disablePast && d < today) return true;
    if (disableFuture && d > today) return true;
    return false;
  };

  const handleSelect = (date) => {
    if (!date || isDisabled(date)) return;
    const iso = formatISO(date);
    onChange?.(iso);
    setOpen(false);
  };

  const canGoPrev =
    !disablePast || startOfDay(new Date(year, month, 1)) > today;
  const canGoNext =
    !disableFuture ||
    startOfDay(new Date(year, month + 1, 1)) <= today;

  return (
    <div className="relative w-full">
      {label && (
        <div className="mb-1 text-[14px] text-[#4B5563] font-medium">
          {label}
        </div>
      )}

      {/* "Інпут" */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          w-full h-[56px] rounded-[16px]
          bg-[#F4F4F5] px-4 pr-11
          flex items-center justify-between
          text-left text-[16px] text-[#18181B]
          outline-none border border-transparent
          hover:border-[#E1C07B] transition
        "
      >
        <span className={value ? "" : "text-[#9CA3AF]"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <FiCalendar className="text-[18px] text-[#9CA3AF]" />
      </button>

      {/* Поповер з календарем */}
      {open && (
        <div
          className="
            absolute z-30 mt-2 w-full
            bg-white rounded-[20px] shadow-lg
            border border-[#E5E7EB]
          "
        >
          {/* Хедер */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => canGoPrev && setViewDate(addMonths(viewDate, -1))}
              disabled={!canGoPrev}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                canGoPrev
                  ? "hover:bg-[#F4F4F5]"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <FiChevronLeft />
            </button>
            <div className="text-[14px] font-semibold text-[#111827]">
              {viewDate.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              type="button"
              onClick={() => canGoNext && setViewDate(addMonths(viewDate, 1))}
              disabled={!canGoNext}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                canGoNext
                  ? "hover:bg-[#F4F4F5]"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <FiChevronRight />
            </button>
          </div>

          {/* Дні тижня */}
          <div className="grid grid-cols-7 text-[11px] text-[#9CA3AF] px-3 pt-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center pb-1">
                {d}
              </div>
            ))}
          </div>

          {/* Дні місяця */}
          <div className="grid grid-cols-7 gap-1 px-2 pb-3 pt-1">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={idx} className="h-8" />;
              }
              const disabled = isDisabled(cell);
              const isSelected =
                selectedDate && +selectedDate === +startOfDay(cell);
              const isToday = +today === +startOfDay(cell);

              let classes =
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px]";

              if (isSelected) {
                classes +=
                  " text-black font-semibold shadow";
              } else if (disabled) {
                classes += " text-[#D1D5DB] cursor-not-allowed";
              } else {
                classes += " text-[#111827] hover:bg-[#F4F4F5] cursor-pointer";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={classes}
                  style={
                    isSelected
                      ? {
                          background:
                            "linear-gradient(107.27deg,#8B6134 -27.97%,#A8834E -12.13%,#F2D892 22.69%,#FFE79E 45.99%,#E1C07B 77.51%)",
                        }
                      : isToday && !disabled
                      ? { border: "1px solid #E1C07B" }
                      : undefined
                  }
                  onClick={() => handleSelect(cell)}
                  disabled={disabled}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
