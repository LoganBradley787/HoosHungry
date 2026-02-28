import React, { useState, useMemo, useEffect } from "react";
import { useMenuData } from "../hooks/useMenuData";
import Navigation from "../components/common/Navigation";
import PillButton from "../components/menu/PillButton";
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
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

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

  useEffect(() => {
    setSelectedStation(null);
  }, [hall, period, searchTerm, filters]);

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

  const sortedStations = useMemo(() => {
    if (!selectedStation) return filteredStations;
    const idx = filteredStations.findIndex((s) => s.name === selectedStation);
    if (idx <= 0) return filteredStations; // not found or already first
    return [
      filteredStations[idx],
      ...filteredStations.slice(0, idx),
      ...filteredStations.slice(idx + 1),
    ];
  }, [filteredStations, selectedStation]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      {/* Orange title strip */}
      <div style={{ backgroundColor: "var(--orange-deep)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1
            className="font-display italic"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, color: "var(--cream-on-orange)" }}
          >
            Menu
          </h1>
          {data && (
            <p
              className="font-mono-data mt-2"
              style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}
            >
              {data.day_name}, {data.date}
              <span style={{ margin: "0 0.5em", opacity: 0.5 }}>·</span>
              Hours {data.hall_hours.open_time}–{data.hall_hours.close_time}
              <span style={{ margin: "0 0.5em", opacity: 0.5 }}>·</span>
              {data.period.name} {data.period.start_time}–{data.period.end_time}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Control Row */}
        <div
          className="flex items-center justify-between gap-4 mb-8 pb-4"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          {/* Hall + Period unified — horizontal scroll on overflow */}
          <div
            className="hide-scrollbar flex items-center gap-5 overflow-x-auto flex-shrink-0 pr-4"
            style={{ scrollbarWidth: "none" }}
          >
            <PillButton active={hall === "ohill"} onClick={() => setHall("ohill")}>OHill</PillButton>
            <PillButton active={hall === "newcomb"} onClick={() => setHall("newcomb")}>Newcomb</PillButton>
            <PillButton active={hall === "runk"} onClick={() => setHall("runk")}>Runk</PillButton>

            <span
              className="select-none flex-shrink-0"
              style={{ color: "var(--rule)", fontSize: "1rem", lineHeight: 1 }}
              aria-hidden="true"
            >
              /
            </span>

            {loadingPeriods ? (
              <span className="text-xs" style={{ color: "var(--ink-muted)" }}>…</span>
            ) : availablePeriods.length === 0 ? (
              <span className="text-xs font-medium" style={{ color: "var(--orange)" }}>Closed today</span>
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

          {/* Search + Filter */}
          <div className="flex-shrink-0">
            <SearchFilter onSearchChange={setSearchTerm} onFilterChange={setFilters} />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-lg sm:text-xl animate-pulse" style={{ color: "var(--ink-muted)" }}>
              Loading menu...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 sm:p-6 text-center animate-fadeIn" style={{ border: "1px solid #FECACA", borderRadius: "8px", backgroundColor: "#FEF2F2" }}>
            <p className="text-red-600 font-semibold mb-2 text-sm sm:text-base">
              Error loading menu
            </p>
            <p className="text-red-500 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Menu Content with staggered animations */}
        {data && !loading && !error && showContent && (
          <>
            {/* Station selector bar */}
            {filteredStations.length > 1 && (
              <div
                className="hide-scrollbar flex items-center gap-6 overflow-x-auto pb-1 mb-6 animate-slideInStagger"
                style={{
                  animationDelay: "80ms",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                } as React.CSSProperties}
              >
                <button
                  className={`tab-link ${selectedStation === null ? "active" : ""}`}
                  onClick={() => setSelectedStation(null)}
                >
                  All
                </button>
                {filteredStations.map((station) => (
                  <button
                    key={station.id}
                    className={`tab-link ${selectedStation === station.name ? "active" : ""}`}
                    onClick={() => setSelectedStation(station.name)}
                  >
                    {station.name}
                  </button>
                ))}
              </div>
            )}

            {/* Show results count if filtering */}
            {(searchTerm || filters.allergens.length > 0) && (
              <div
                className="mb-4 text-xs sm:text-sm animate-slideInStagger"
                style={{ color: "var(--ink-muted)", animationDelay: "100ms" }}
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
            {sortedStations.length > 0 ? (
              sortedStations.map((station, index) => (
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
              <div
                className="p-8 sm:p-12 text-center animate-fadeIn"
                style={{
                  backgroundColor: "var(--warm-white)",
                  border: "1px solid var(--rule)",
                  borderRadius: "8px",
                }}
              >
                <p className="text-base sm:text-lg" style={{ color: "var(--ink-muted)" }}>
                  No items found matching your criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ allergens: [], excludeAllergens: true });
                  }}
                  className="mt-4 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--orange)", borderRadius: "4px" }}
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
