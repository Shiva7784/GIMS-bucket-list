import React, { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  onNavigate: (page: string | null) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onNavigate, className }) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pages = [
    { id: "bucketList", label: "Bucket List", icon: "📌" },
    { id: "globeSpinner", label: "Globe Spinner", icon: "🌍" },
    { id: "moodExplorer", label: "Mood Explorer", icon: "😊" },
    { id: "virtualTour", label: "Virtual Tour", icon: "🎥" },
  ];

  const filteredPages = pages.filter((page) =>
    page.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (pageId: string) => {
    setQuery("");
    setShowDropdown(false);
    onNavigate(pageId);
  };

  const handleSearch = () => {
    if (filteredPages.length > 0) {
      handleSelect(filteredPages[0].id);
    } else {
      alert("Component not found.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <div className="flex flex-col sm:flex-row justify-center w-full">
        <input
          type="text"
          placeholder="Search features (e.g., Bucket List)..."
          aria-label="Search for features"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className={`border p-2 rounded-lg w-full transition-all outline-none focus:border-blue-500 focus:shadow-md ${query.length > 0 ? "text-blue-600 font-medium border-blue-300" : "text-gray-700 border-gray-200"
            }`}
        />
      </div>

      {showDropdown && query.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {filteredPages.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {filteredPages.map((page) => (
                <li
                  key={page.id}
                  onClick={() => handleSelect(page.id)}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <span className="text-xl">{page.icon}</span>
                  <span className="font-medium text-gray-800">{page.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500 italic">No features found...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
