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
            className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
          />
          <svg
            className="absolute left-3 top-3 w-5 h-5 text-gray-400"
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
          className={`px-4 sm:px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            selectedAllergens.length > 0 || searchTerm
              ? "bg-orange-500 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${
              isFilterOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="hidden sm:inline">Filter</span>
          {selectedAllergens.length > 0 && (
            <span className="bg-white text-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {selectedAllergens.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Dropdown with animation */}
      {isFilterOpen && (
        <div className="absolute top-full mt-2 right-0 left-0 sm:left-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 w-full sm:w-96 z-10 animate-slideDown">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base sm:text-lg">Filter Options</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Exclude/Include Toggle */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeAllergens}
                onChange={handleExcludeToggle}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400 transition-all"
              />
              <span className="text-sm font-medium text-gray-700">
                Exclude selected allergens
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              {excludeAllergens
                ? "Hide items containing these allergens"
                : "Show only items with these allergens"}
            </p>
          </div>

          {/* Allergen Checkboxes */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Allergens
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commonAllergens.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedAllergens.includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400 transition-all"
                  />
                  <span className="text-sm text-gray-700">{allergen}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
