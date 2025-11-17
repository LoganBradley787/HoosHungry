import { useState, useMemo, useEffect } from "react";
import { useMenuData } from "../hooks/useMenuData";
import Navigation from "../components/common/Navigation";
import PillButton from "../components/menu/PillButton";
import InfoBanner from "../components/menu/InfoBanner";
import StationSection from "../components/menu/StationSection";
import SearchFilter from "../components/menu/SearchFilter";
import { useAvailablePeriods } from "../hooks/useAvailablePeriods";
import type { MenuItem } from "../api/endpoints";
import ItemDetailsPanel from "../components/menu/ItemDetailsPanel";
import AddToPlanPopup from "../components/menu/AddToPlanPopup";

export default function Menu() {
  const [hall, setHall] = useState<"ohill" | "newcomb" | "runk">("ohill");
  const [period, setPeriod] = useState<
    "breakfast" | "lunch" | "dinner" | "late_night"
  >("breakfast");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [addToPlanItem, setAddToPlanItem] = useState<MenuItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    allergens: string[];
    excludeAllergens: boolean;
  }>({ allergens: [], excludeAllergens: true });
  const [showContent, setShowContent] = useState(false);

  const {
    periods: availablePeriods,
    loading: loadingPeriods,
    currentHall,
  } = useAvailablePeriods(hall);

  // Whenever hall changes, reset the period to the first available one
  useEffect(() => {
    if (availablePeriods.length > 0) {
      const periodExistsInNewHall = availablePeriods.some(
        (p) => p.key === period
      );

      if (!periodExistsInNewHall) {
        setPeriod(availablePeriods[0].key as any);
      }
    }
  }, [availablePeriods]);
  const { data, loading, error } = useMenuData({
    hall,
    period,
    skip:
      currentHall !== hall || // Skip if periods don't match current hall
      availablePeriods.length === 0 ||
      !availablePeriods.some((p) => p.key === period),
  });

  // Trigger animation when data changes
  useEffect(() => {
    if (data && !loading) {
      setShowContent(false);
      // Small delay to ensure clean transition
      setTimeout(() => setShowContent(true), 50);
    }
  }, [data, loading, hall, period]);

  // Filter stations and menu items
  const filteredStations = useMemo(() => {
    if (!data) return [];

    return data.period.stations
      .map((station) => {
        const filteredItems = station.menu_items.filter((item) => {
          // Search filter
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = item.item_name
              .toLowerCase()
              .includes(searchLower);
            const matchesDescription = item.item_description
              ?.toLowerCase()
              .includes(searchLower);
            const matchesIngredients = item.ingredients
              ?.toLowerCase()
              .includes(searchLower);

            if (!matchesName && !matchesDescription && !matchesIngredients) {
              return false;
            }
          }

          // Allergen filter
          if (filters.allergens.length > 0) {
            const itemAllergens = item.allergens.map((a) => a.name);
            const hasSelectedAllergen = filters.allergens.some((allergen) =>
              itemAllergens.includes(allergen)
            );

            if (filters.excludeAllergens) {
              // Exclude mode: hide items with selected allergens
              if (hasSelectedAllergen) return false;
            } else {
              // Include mode: show only items with selected allergens
              if (!hasSelectedAllergen) return false;
            }
          }

          return true;
        });

        return {
          ...station,
          menu_items: filteredItems,
        };
      })
      .filter((station) => station.menu_items.length > 0); // Remove empty stations
  }, [data, searchTerm, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-orange-50 to-yellow-100">
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-500 mb-6 sm:mb-8">
          Menu
        </h1>

        {/* Control Pills and Search - Responsive Layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 sm:mb-8">
          {/* Left Side: Dining Hall Pills */}
          <div className="flex justify-center lg:justify-start">
            <div className="flex gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 shadow-sm overflow-x-auto">
              <PillButton
                active={hall === "ohill"}
                onClick={() => setHall("ohill")}
              >
                OHill
              </PillButton>
              <PillButton
                active={hall === "newcomb"}
                onClick={() => setHall("newcomb")}
              >
                Newcomb
              </PillButton>
              <PillButton
                active={hall === "runk"}
                onClick={() => setHall("runk")}
              >
                Runk
              </PillButton>
            </div>
          </div>

          {/* Center: Period Pills */}
          <div className="flex justify-center lg:justify-start overflow-x-auto">
            <div className="flex gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 shadow-sm min-w-fit">
              {loadingPeriods ? (
                <div className="px-3 sm:px-4 py-2 text-gray-500 text-xs sm:text-sm">
                  Loading periods...
                </div>
              ) : availablePeriods.length === 0 ? (
                <div className="px-3 sm:px-4 py-2 text-red-600 font-medium text-xs sm:text-sm">
                  This hall is closed today
                </div>
              ) : (
                availablePeriods.map((p) => (
                  <PillButton
                    key={p.key}
                    active={period === p.key}
                    onClick={() => setPeriod(p.key as any)}
                  >
                    {p.name}
                  </PillButton>
                ))
              )}
            </div>
          </div>

          {/* Right Side: Search and Filter */}
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md">
            <SearchFilter
              onSearchChange={setSearchTerm}
              onFilterChange={setFilters}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-lg sm:text-xl text-gray-600 animate-pulse">
              Loading menu...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 text-center animate-fadeIn">
            <p className="text-red-600 font-semibold mb-2 text-sm sm:text-base">
              Error loading menu
            </p>
            <p className="text-red-500 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Menu Content with staggered animations */}
        {data && !loading && !error && showContent && (
          <>
            {/* Info Banner - appears first */}
            <div
              className="animate-slideInStagger"
              style={{ animationDelay: "0ms" }}
            >
              <InfoBanner
                dayName={data.day_name}
                date={data.date}
                hallHours={data.hall_hours}
                periodName={data.period.name}
                periodHours={{
                  start_time: data.period.start_time,
                  end_time: data.period.end_time,
                }}
              />
            </div>

            {/* Show results count if filtering */}
            {(searchTerm || filters.allergens.length > 0) && (
              <div
                className="mb-4 text-xs sm:text-sm text-gray-600 animate-slideInStagger"
                style={{ animationDelay: "100ms" }}
              >
                Found{" "}
                {filteredStations.reduce(
                  (acc, s) => acc + s.menu_items.length,
                  0
                )}{" "}
                items
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            )}

            {/* Stations - each appears with increasing delay */}
            {filteredStations.length > 0 ? (
              filteredStations.map((station, index) => (
                <div
                  key={station.id}
                  className="animate-slideInStagger"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <StationSection
                    station={station}
                    onDetails={(item) => {
                      setSelectedItem(item);
                      setIsDetailsOpen(true);
                    }}
                    onAddToPlan={(item) => setAddToPlanItem(item)}
                  />
                </div>
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center animate-fadeIn">
                <p className="text-gray-600 text-base sm:text-lg">
                  No items found matching your criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ allergens: [], excludeAllergens: true });
                  }}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {isDetailsOpen && selectedItem && (
        <ItemDetailsPanel
          item={selectedItem}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
      {addToPlanItem && (
        <AddToPlanPopup
          item={addToPlanItem}
          stationMealType={period}
          onClose={() => setAddToPlanItem(null)}
        />
      )}
    </div>
  );
}
