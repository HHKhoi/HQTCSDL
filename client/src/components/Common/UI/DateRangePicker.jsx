import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const DateRangePicker = ({ from, to, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  const containerRef = useRef(null);

  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isSelected = (date) => isSameDay(date, from) || isSameDay(date, to);

  const isInRange = (date) => {
    if (!from || !to) return false;
    return date > new Date(from) && date < new Date(to);
  };

  const isHoverInRange = (date) => {
    if (!from || to || !hoverDate) return false;
    const start = new Date(from);
    return (
      (date > start && date <= hoverDate) || (date < start && date >= hoverDate)
    );
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (!from || (from && to)) {
      onChange({ from: dateStr, to: "" });
    } else {
      const start = new Date(from);
      if (date < start) {
        onChange({ from: dateStr, to: from });
      } else {
        onChange({ from, to: dateStr });
        setIsOpen(false);
      }
    }
  };

  const { firstDay, days } = getDaysInMonth(viewDate);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-300 transition-all shadow-sm min-w-[240px]"
      >
        <CalendarIcon size={16} className="text-slate-400" />
        <span className="flex-1 text-left">
          {from ? (
            <>
              {formatDate(from)}
              {to && <span className="mx-2 text-slate-300">→</span>}
              {formatDate(to)}
            </>
          ) : (
            <span className="text-slate-400">Chọn khoảng thời gian...</span>
          )}
        </span>
        {from && (
          <X
            size={14}
            className="text-slate-300 hover:text-slate-500"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ from: "", to: "" });
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 p-5 bg-white border border-slate-100 shadow-2xl rounded-3xl z-50 animate-in fade-in zoom-in-95 duration-200 w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h4>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.setMonth(viewDate.getMonth() - 1)),
                  )
                }
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.setMonth(viewDate.getMonth() + 1)),
                  )
                }
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-tighter"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for padding */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {/* Days */}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const date = new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                day,
              );
              const isSel = isSelected(date);
              const inRng = isInRange(date);
              const inHvr = isHoverInRange(date);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={day}
                  onMouseEnter={() => setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative h-9 w-full rounded-lg text-xs font-bold transition-all cursor-pointer
                    ${isSel ? "bg-slate-900 text-white z-10" : "text-slate-700 hover:bg-slate-100"}
                    ${inRng || inHvr ? "bg-slate-100 rounded-none!" : ""}
                    ${inRng && isSameDay(date, new Date(from)) ? "rounded-l-lg" : ""}
                    ${inRng && isSameDay(date, new Date(to)) ? "rounded-r-lg" : ""}
                  `}
                >
                  {isToday && !isSel && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full" />
                  )}
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
