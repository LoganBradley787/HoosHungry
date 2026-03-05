import { useState, useRef, useEffect } from "react";
import Navigation from "../components/common/Navigation";
import DailyMealPlan from "../components/plan/DailyMealPlan";
import WeeklyCalendar from "../components/plan/WeeklyCalendar";
import ProgressStats from "../components/plan/ProgressStats";
import GoalSetupModal from "../components/plan/GoalSetupModal";
import CalorieTrend from "../components/plan/CalorieTrend";
import { useWeekPlan } from "../hooks/usePlanData";
import { useDailyPlan } from "../hooks/useDailyPlan";
import FadeContent from "../components/reactbits/FadeContent";

function getWeekDates(date: Date): Date[] {
  const week = [];
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay();
  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i));
    week.push(new Date(day));
  }
  return week;
}

export default function Plan() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(getWeekDates(new Date()));
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const weeklyCalendarRef = useRef<HTMLDivElement>(null);

  const { data: weekData, loading: weekLoading, refetch: refetchWeek } = useWeekPlan(selectedDate);
  const {
    data: dailyData,
    loading: dailyLoading,
    updateItem,
    deleteItem,
    refetch: refetchDaily,
  } = useDailyPlan(selectedDate);

  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const t = setTimeout(() => setShowTitle(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Auto-open goal modal on first visit when no goals are set
  useEffect(() => {
    if (!weekLoading && weekData && weekData.daily_calorie_goal === null) {
      setGoalModalOpen(true);
    }
  }, [weekData, weekLoading]);

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

  const handleGoalsSaved = () => {
    refetchWeek?.();
    refetchDaily?.();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      {/* Orange title strip */}
      <div style={{ backgroundColor: "var(--orange-deep)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1
            className="font-display italic"
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 300,
              color: "var(--cream-on-orange)",
              opacity: showTitle ? 1 : 0,
              transform: showTitle ? "translateY(0)" : "translateY(50px)",
              filter: showTitle ? "blur(0px)" : "blur(12px)",
              transition: "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.4, 0, 0.2, 1), filter 700ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Plan
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column */}
          <FadeContent direction="left" delay={350} duration={700} distance={35}>
            <div>
              <DailyMealPlan
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                dailyData={dailyData}
                loading={dailyLoading}
                onItemUpdated={updateItem}
                onItemDeleted={deleteItem}
              />
            </div>
          </FadeContent>

          {/* Right Column */}
          <FadeContent direction="right" delay={450} duration={700} distance={35}>
            <div className="space-y-6">
              <ProgressStats
                dailyData={dailyData}
                goals={dailyData?.goals}
                onSetGoalsClick={() => setGoalModalOpen(true)}
              />
              <WeeklyCalendar
                ref={weeklyCalendarRef}
                weekDates={weekDates}
                selectedDate={selectedDate}
                onDaySelect={setSelectedDate}
                onWeekChange={handleWeekChange}
                weekSummary={weekData?.week_summary}
              />
              <CalorieTrend calorieGoal={weekData?.daily_calorie_goal ?? null} />
            </div>
          </FadeContent>
        </div>
      </div>

      {goalModalOpen && (
        <GoalSetupModal
          currentDate={selectedDate}
          onClose={() => setGoalModalOpen(false)}
          onSaved={handleGoalsSaved}
        />
      )}
    </div>
  );
}
