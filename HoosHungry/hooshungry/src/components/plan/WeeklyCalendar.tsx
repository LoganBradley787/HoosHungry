import { forwardRef, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DailySummary } from "../../api/planEndpoints";
import { toLocalDateString } from "../../utils/dateUtils";

interface WeeklyCalendarProps {
  weekDates: Date[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onWeekChange: (direction: "prev" | "next") => void;
  weekSummary?: DailySummary[];
}

const WeeklyCalendar = forwardRef<HTMLDivElement, WeeklyCalendarProps>(
  ({ weekDates, selectedDate, onDaySelect, onWeekChange, weekSummary: _weekSummary }, ref) => {
    const selectedDayRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      selectedDayRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, [selectedDate]);

    const formatDateKey = (date: Date) => toLocalDateString(date);
    const isSelectedDate = (date: Date) => formatDateKey(date) === formatDateKey(selectedDate);
    const isToday = (date: Date) => formatDateKey(date) === formatDateKey(new Date());
    const getDateRangeText = () => {
      const firstDay = weekDates[0];
      const lastDay = weekDates[6];
      const firstMonth = firstDay.toLocaleDateString("en-US", { month: "short" });
      const lastMonth = lastDay.toLocaleDateString("en-US", { month: "short" });
      if (firstMonth === lastMonth) return `${firstMonth} ${firstDay.getDate()}–${lastDay.getDate()}`;
      return `${firstMonth} ${firstDay.getDate()} – ${lastMonth} ${lastDay.getDate()}`;
    };

    return (
      <div ref={ref} className="card-editorial p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Weekly Plan
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onWeekChange("prev")}
              className="w-6 h-6 flex items-center justify-center transition-colors"
              style={{ color: "var(--ink-muted)" }}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
              {getDateRangeText()}
            </span>
            <button
              onClick={() => onWeekChange("next")}
              className="w-6 h-6 flex items-center justify-center transition-colors"
              style={{ color: "var(--ink-muted)" }}
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal day strip */}
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {weekDates.map((date, index) => {
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = date.getDate();
            const isSelected = isSelectedDate(date);
            const todayFlag = isToday(date);
            return (
              <button
                key={index}
                ref={isSelected ? selectedDayRef : null}
                onClick={() => onDaySelect(date)}
                className="flex flex-col items-center py-3 px-3 rounded flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: isSelected ? "var(--orange)" : "transparent",
                  minWidth: "52px",
                  border: isSelected ? "none" : "1px solid var(--rule)",
                }}
              >
                <span
                  className="text-xs uppercase tracking-wide mb-1"
                  style={{
                    color: isSelected ? "rgba(255,255,255,0.8)" : "var(--ink-muted)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.6rem",
                  }}
                >
                  {dayName}
                </span>
                <span
                  className="font-display italic leading-none"
                  style={{
                    fontSize: "1.4rem",
                    color: isSelected ? "white" : "var(--ink)",
                    fontWeight: 400,
                  }}
                >
                  {dayNum}
                </span>
                {/* Today dot indicator */}
                <div
                  className="w-1 h-1 rounded-full mt-2"
                  style={{
                    backgroundColor: todayFlag
                      ? isSelected ? "rgba(255,255,255,0.9)" : "var(--orange)"
                      : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

WeeklyCalendar.displayName = "WeeklyCalendar";
export default WeeklyCalendar;
