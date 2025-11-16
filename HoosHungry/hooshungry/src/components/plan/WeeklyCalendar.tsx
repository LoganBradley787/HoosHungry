import { forwardRef, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyCalendarProps {
  weekDates: Date[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onWeekChange: (direction: "prev" | "next") => void;
}

// Mock data for calories per day
const MOCK_DAY_CALORIES: { [key: string]: number } = {
  Mon: 0,
  Tue: 0,
  Wed: 3284,
  Thu: 0,
  Fri: 0,
};

const WeeklyCalendar = forwardRef<HTMLDivElement, WeeklyCalendarProps>(
  ({ weekDates, selectedDate, onDaySelect, onWeekChange }, ref) => {
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
        className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
      >
        {/* Header with Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Weekly Meal Plan</h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onWeekChange("prev")}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <span className="text-sm text-gray-600 min-w-[100px] text-center">
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
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {weekDates.map((date, index) => {
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayDate = date.getDate();
            const isSelected = isSelectedDate(date);
            const calories = MOCK_DAY_CALORIES[dayName] || 0;

            return (
              <button
                key={index}
                ref={isSelected ? selectedDayRef : null}
                onClick={() => onDaySelect(date)}
                className={`w-full rounded-2xl p-3 transition-all duration-500 ease-in-out ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-lg"
                    : calories > 0
                    ? "bg-white border-2 border-gray-200 hover:border-orange-300"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Day Info */}
                  <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-500 ${
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
                        className={`text-lg font-bold transition-colors duration-500 ${
                          isSelected ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {dayDate}
                      </span>
                    </div>

                    <div className="text-left min-w-0">
                      <div
                        className={`text-sm font-medium truncate transition-colors duration-500 ${
                          isSelected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {calories > 0 ? `${calories} cal` : "0 cal"}
                      </div>
                      <div
                        className={`text-xs truncate transition-colors duration-500 ${
                          isSelected ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {calories > 0 ? "0 items" : "0 items"}
                      </div>
                    </div>
                  </div>

                  {/* Meal Indicators - only show if there are meals */}
                  {calories > 0 && (
                    <div className="flex flex-col gap-0.5 text-right flex-shrink-0">
                      <div
                        className={`text-xs transition-colors duration-500 ${
                          isSelected ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        B: 0
                      </div>
                      <div
                        className={`text-xs transition-colors duration-500 ${
                          isSelected ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        L: 0
                      </div>
                      <div
                        className={`text-xs transition-colors duration-500 ${
                          isSelected ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        D: 0
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
