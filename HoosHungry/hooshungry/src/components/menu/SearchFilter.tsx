import { useEffect, useRef, useState } from "react";

interface SearchFilterProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: {
    allergens: string[];
    excludeAllergens: boolean;
  }) => void;
}

export default function SearchFilter({
  onSearchChange,
  onFilterChange,
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isSearchExpanded]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [excludeAllergens, setExcludeAllergens] = useState(true);

  const commonAllergens = [
    "Milk", "Eggs", "Wheat", "Soy",
    "Peanuts", "Tree Nuts", "Fish", "Shellfish",
  ];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleCollapseSearch = () => {
    setIsSearchExpanded(false);
    handleSearchChange("");
  };

  const handleAllergenToggle = (allergen: string) => {
    const newAllergens = selectedAllergens.includes(allergen)
      ? selectedAllergens.filter((a) => a !== allergen)
      : [...selectedAllergens, allergen];
    setSelectedAllergens(newAllergens);
    onFilterChange({ allergens: newAllergens, excludeAllergens });
  };

  const handleExcludeToggle = () => {
    const newExclude = !excludeAllergens;
    setExcludeAllergens(newExclude);
    onFilterChange({ allergens: selectedAllergens, excludeAllergens: newExclude });
  };

  const clearFilters = () => {
    setSelectedAllergens([]);
    setSearchTerm("");
    setExcludeAllergens(true);
    onSearchChange("");
    onFilterChange({ allergens: [], excludeAllergens: true });
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Horizontally sliding input — always mounted, no height change */}
      <div
        style={{
          width: isSearchExpanded ? "160px" : "0px",
          overflow: "hidden",
          transition: "width 220ms ease",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search dishes…"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            width: "160px",
            flexShrink: 0,
            borderBottom: "1px solid var(--rule)",
            color: "var(--ink)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.75rem",
            background: "transparent",
            outline: "none",
            paddingBottom: "2px",
          }}
        />
      </div>

      {/* Toggle button: search icon when collapsed, × when expanded */}
      <button
        onClick={isSearchExpanded ? handleCollapseSearch : () => setIsSearchExpanded(true)}
        style={{
          color: isSearchExpanded || searchTerm ? "var(--orange)" : "var(--ink-muted)",
          background: "none",
          cursor: "pointer",
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label={isSearchExpanded ? "Clear search" : "Search"}
      >
        {isSearchExpanded ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </button>

      {/* Filter button — always visible */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="tab-link flex items-center gap-2"
        style={{
          color: selectedAllergens.length > 0 ? "var(--orange)" : "var(--ink-muted)",
        }}
      >
        Filter
        {selectedAllergens.length > 0 && (
          <span
            className="text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center"
            style={{ backgroundColor: "var(--orange)", color: "white" }}
          >
            {selectedAllergens.length}
          </span>
        )}
      </button>

      {/* Filter dropdown — unchanged behaviour */}
      {isFilterOpen && (
        <div
          className="absolute top-full mt-2 right-0 p-5 sm:p-6 w-72 z-10 animate-slideDown"
          style={{
            backgroundColor: "var(--warm-white)",
            border: "1px solid var(--rule)",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(26,18,8,0.08)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-header-label">Filter Options</h3>
            <button
              onClick={clearFilters}
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--orange)" }}
            >
              Clear All
            </button>
          </div>

          <div className="mb-4 p-3 rounded" style={{ backgroundColor: "var(--cream)" }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeAllergens}
                onChange={handleExcludeToggle}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                Exclude selected allergens
              </span>
            </label>
            <p className="text-xs mt-1 ml-7" style={{ color: "var(--ink-muted)" }}>
              {excludeAllergens
                ? "Hide items containing these allergens"
                : "Show only items with these allergens"}
            </p>
          </div>

          <div>
            <h4 className="section-header-label mb-3">Allergens</h4>
            <div className="grid grid-cols-2 gap-2">
              {commonAllergens.map((allergen) => (
                <label key={allergen} className="flex items-center gap-2 cursor-pointer p-2">
                  <input
                    type="checkbox"
                    checked={selectedAllergens.includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm" style={{ color: "var(--ink)" }}>{allergen}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
