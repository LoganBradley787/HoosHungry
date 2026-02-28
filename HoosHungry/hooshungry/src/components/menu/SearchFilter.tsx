import { useState } from "react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [excludeAllergens, setExcludeAllergens] = useState(true);

  const commonAllergens = [
    "Milk",
    "Eggs",
    "Wheat",
    "Soy",
    "Peanuts",
    "Tree Nuts",
    "Fish",
    "Shellfish",
  ];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
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
    onFilterChange({
      allergens: selectedAllergens,
      excludeAllergens: newExclude,
    });
  };

  const clearFilters = () => {
    setSelectedAllergens([]);
    setSearchTerm("");
    setExcludeAllergens(true);
    onSearchChange("");
    onFilterChange({ allergens: [], excludeAllergens: true });
  };

  return (
    <div className="relative w-full sm:w-auto">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 sm:min-w-[250px]">
          <input
            type="text"
            placeholder="Search dishes, ingredients..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full py-2 pl-8 pr-3 text-sm bg-transparent focus:outline-none"
            style={{
              borderBottom: "1px solid var(--rule)",
              color: "var(--ink)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <svg
            className="absolute left-0 top-2.5 w-4 h-4"
            style={{ color: "var(--ink-muted)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap pb-2 transition-colors"
          style={{
            color: selectedAllergens.length > 0 ? "var(--orange)" : "var(--ink-muted)",
            borderBottom: "1px solid var(--rule)",
            fontFamily: "'DM Sans', sans-serif",
            background: "none",
            cursor: "pointer",
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
      </div>

      {/* Filter Dropdown with animation */}
      {isFilterOpen && (
        <div
          className="absolute top-full mt-2 right-0 left-0 sm:left-auto p-5 sm:p-6 w-full sm:w-80 z-10 animate-slideDown"
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
              className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Exclude/Include Toggle */}
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: "var(--cream)" }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeAllergens}
                onChange={handleExcludeToggle}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400 transition-all"
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

          {/* Allergen Checkboxes */}
          <div>
            <h4 className="section-header-label mb-3">
              Allergens
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commonAllergens.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center gap-2 cursor-pointer p-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedAllergens.includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400 transition-all"
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
