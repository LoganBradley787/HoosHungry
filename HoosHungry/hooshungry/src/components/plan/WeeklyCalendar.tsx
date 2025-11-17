import { forwardRef, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DailySummary } from "../../api/planEndpoints";

interface WeeklyCalendarProps {
  weekDates: Date[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onWeekChange: (direction: "prev" | "next") => void;
  weekSummary?: DailySummary[];
}

const WeeklyCalendar = forwardRef<HTMLDivElement, WeeklyCalendarProps>(
  (
    { weekDates, selectedDate, onDaySelect, onWeekChange, weekSummary },
    ref
  ) => {
    const selectedDayRef = useRef<HTMLButtonElement>(null);

    // Scroll selected day into view when it changes
    useEffect(() => {
      if (selectedDayRef.current) {
        selectedDayRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, [selectedDate]);

    const formatDateKey = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    const isSelectedDate = (date: Date) => {
      return formatDateKey(date) === formatDateKey(selectedDate);
    };

    // Get summary for a specific date
    const getSummaryForDate = (date: Date): DailySummary | undefined => {
      const dateStr = formatDateKey(date);
      return weekSummary?.find((s) => s.date === dateStr);
    };

    // Get date range text
    const getDateRangeText = () => {
      const firstDay = weekDates[0];
      const lastDay = weekDates[6];

      const firstMonth = firstDay.toLocaleDateString("en-US", {
        month: "short",
      });
      const lastMonth = lastDay.toLocaleDateString("en-US", { month: "short" });
      const firstDate = firstDay.getDate();
      const lastDate = lastDay.getDate();

      if (firstMonth === lastMonth) {
        return `${firstMonth} ${firstDate} - ${lastDate}`;
      }
      return `${firstMonth} ${firstDate} - ${lastMonth} ${lastDate}`;
    };

    return (
      <div
        ref={ref}
        className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-lg"
      >
        {/* Header with Week Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
          <h3 className="font-bold text-base sm:text-lg">Weekly Meal Plan</h3>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <button
              onClick={() => onWeekChange("prev")}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <span className="text-xs sm:text-sm text-gray-600 min-w-[100px] text-center">
              {getDateRangeText()}
            </span>

            <button
              onClick={() => onWeekChange("next")}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Week Days Grid */}
        <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2">
          {weekDates.map((date, index) => {
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayDate = date.getDate();
            const isSelected = isSelectedDate(date);
            const summary = getSummaryForDate(date);
            const calories = summary?.total_calories || 0;
            const hasMeals = summary?.has_meals || false;

            return (
              <button
                key={index}
                ref={isSelected ? selectedDayRef : null}
                onClick={() => onDaySelect(date)}
                className={`w-full rounded-2xl p-2.5 sm:p-3 transition-all duration-500 ease-in-out ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-lg"
                    : hasMeals
                    ? "bg-white border-2 border-gray-200 hover:border-orange-300"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Day Info */}
                  <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isSelected ? "bg-white/20" : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium transition-colors duration-500 ${
                          isSelected ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {dayName}
                      </span>
                      <span
                        className={`text-base sm:text-lg font-bold transition-colors duration-500 ${
                          isSelected ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {dayDate}
                      </span>
                    </div>

                    <div className="text-left min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-medium truncate transition-colors duration-500 ${
                          isSelected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {calories} cal
                      </div>
                      <div
                        className={`text-xs truncate transition-colors duration-500 ${
                          isSelected ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {summary?.meal_count || 0} items
                      </div>
                    </div>
                  </div>

                  {/* Meal Indicators - only show if there are meals */}
                  {hasMeals && (
                    <div className="flex flex-col gap-0.5 text-right flex-shrink-0">
                      <div
                        className={`text-xs transition-colors duration-500 ${
                          isSelected ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        B: {summary?.breakfast_count || 0}
                      </div>
                      <div
                        className={`text-xs transition-colors duration-500 ${
                          isSelected ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        L: {summary?.lunch_count || 0}
                      </div>
                      <div
                        className={`text-xs transition-colors duration-500 ${
                          isSelected ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        D: {summary?.dinner_count || 0}
                      </div>
                    </div>
                  )}
                </div>
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
