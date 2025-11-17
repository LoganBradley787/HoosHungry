import { useState, useRef, useEffect } from "react";
import Navigation from "../components/common/Navigation";
import DailyMealPlan from "../components/plan/DailyMealPlan";
import WeeklyCalendar from "../components/plan/WeeklyCalendar";
import ProgressStats from "../components/plan/ProgressStats";
import { useWeekPlan } from "../hooks/usePlanData";
import { useDailyPlan } from "../hooks/useDailyPlan";

// Helper to get week dates
function getWeekDates(date: Date): Date[] {
  const week = [];
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay(); // First day is Sunday

  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i));
    week.push(new Date(day));
  }
  return week;
}

export default function Plan() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(getWeekDates(new Date()));
  const weeklyCalendarRef = useRef<HTMLDivElement>(null);

  // Fetch week and daily plan data
  const { data: weekData, loading: weekLoading } = useWeekPlan(selectedDate);
  const {
    data: dailyData,
    loading: dailyLoading,
    refresh: refreshDaily,
  } = useDailyPlan(selectedDate);

  // Update week dates when selected date changes
  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate));
  }, [selectedDate]);

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-orange-50 to-yellow-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Title */}
        <h1 className="text-6xl font-bold text-orange-500 mb-8">Plan</h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column - Daily Meal Plan */}
          <div>
            <DailyMealPlan
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              dailyData={dailyData}
              loading={dailyLoading}
              onRefresh={refreshDaily}
            />
          </div>

          {/* Right Column - Progress & Weekly Calendar */}
          <div className="space-y-6">
            <ProgressStats dailyData={dailyData} goals={dailyData?.goals} />
            <WeeklyCalendar
              ref={weeklyCalendarRef}
              weekDates={weekDates}
              selectedDate={selectedDate}
              onDaySelect={handleDaySelect}
              onWeekChange={handleWeekChange}
              weekSummary={weekData?.week_summary}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
