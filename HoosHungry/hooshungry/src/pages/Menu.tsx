import { useState, useMemo, useEffect } from "react";
import { useMenuData } from "../hooks/useMenuData";
import Navigation from "../components/common/Navigation";
import PillButton from "../components/menu/PillButton";
import InfoBanner from "../components/menu/InfoBanner";
import StationSection from "../components/menu/StationSection";
import SearchFilter from "../components/menu/SearchFilter";
import { useAvailablePeriods } from "../hooks/useAvailablePeriods";

export default function Menu() {
  const [hall, setHall] = useState<"ohill" | "newcomb" | "runk">("ohill");
  const [period, setPeriod] = useState<
    "breakfast" | "lunch" | "dinner" | "late_night"
  >("breakfast");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    allergens: string[];
    excludeAllergens: boolean;
  }>({ allergens: [], excludeAllergens: true });
  const [showContent, setShowContent] = useState(false);

  const { periods: availablePeriods, loading: loadingPeriods } =
    useAvailablePeriods(hall);

  // Whenever hall changes, reset the period to the first available one
  useEffect(() => {
    if (availablePeriods.length > 0) {
      setPeriod(availablePeriods[0].key as any);
    }
  }, [availablePeriods, hall]);
  const { data, loading, error } = useMenuData({
    hall,
    period,
    skip: availablePeriods.length === 0,
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
      <div className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-6xl font-bold text-orange-500 mb-8">Menu</h1>

        {/* Control Pills and Search */}
        <div className="flex justify-between items-start mb-8 gap-4">
          {/* Left: Dining Hall Pills */}
          <div className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 shadow-sm">
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

          {/* Center: Period Pills */}
          <div className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 shadow-sm">
            {loadingPeriods ? (
              <div className="px-4 py-2 text-gray-500">Loading periods...</div>
            ) : availablePeriods.length === 0 ? (
              <div className="px-4 py-2 text-red-600 font-medium">
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

          {/* Right: Search and Filter */}
          <SearchFilter
            onSearchChange={setSearchTerm}
            onFilterChange={setFilters}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl text-gray-600 animate-pulse">
              Loading menu...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-fadeIn">
            <p className="text-red-600 font-semibold mb-2">
              Error loading menu
            </p>
            <p className="text-red-500 text-sm">{error}</p>
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
                className="mb-4 text-sm text-gray-600 animate-slideInStagger"
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
                  <StationSection station={station} />
                </div>
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center animate-fadeIn">
                <p className="text-gray-600 text-lg">
                  No items found matching your criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ allergens: [], excludeAllergens: true });
                  }}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
