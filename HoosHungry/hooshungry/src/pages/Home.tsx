import React from "react";
import globe from "../assets/globe.png";
import plan from "../assets/plan.png";
import stars from "../assets/stars.png";
import logo from "../assets/logo.png";
import Navigation from "../components/common/Navigation";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-orange-50 to-yellow-100">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="bg-white/45 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 lg:gap-8">
            {/* Left Column */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#F48210] to-[#FFC831] text-transparent pb-4 sm:pb-6 mb-2 bg-clip-text">
                Finally, dining hall planning that just works
              </h1>
              <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                Pick a hall, browse menu items, make a plan. How hungry are you,
                Hoo?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/menu"
                  className="px-6 py-3 bg-white rounded-full font-semibold text-gray-800 shadow-sm hover:shadow-md transition text-center"
                >
                  See Menus
                </Link>

                <Link
                  to="/plan"
                  className="px-6 py-3 bg-white rounded-full font-semibold text-gray-800 shadow-sm hover:shadow-md transition text-center"
                >
                  View Plan
                </Link>
                <button className="px-6 py-3 rounded-full font-semibold text-white shadow-md hover:shadow-lg transition bg-gradient-to-r from-[#F48210] to-[#FFC831]">
                  Prompt AI
                </button>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 lg:mt-0">
              <div className="bg-gradient-to-b from-[#EDF9FF] to-[#FFFFFF] rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Locate</div>
                <div className="font-bold text-base sm:text-lg mb-2">
                  Where can I find grilled chicken?
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  The Hearth @ OHill
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#F1FFED] to-[#FFFFFF] rounded-2xl p-4 sm:p-6 shadow-sm sm:transform sm:-rotate-4">
                <div className="text-sm text-gray-600 mb-2">Prompt</div>
                <div className="font-bold text-base sm:text-lg">
                  "Low sodium dinner @ Runk?"
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#FFEDED] to-[#FFFFFF] rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Filter</div>
                <div className="font-bold text-base sm:text-lg mb-3">
                  No dairy or meat for me, please!
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white rounded-full text-sm flex items-center gap-1 border border-[#b8b6b6]/50">
                    🥛 Dairy-free
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm flex items-center gap-1 border border-[#b8b6b6]/50">
                    🌱 Vegetarian
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#F8EDFF] to-[#FFFFFF] rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Plan</div>
                <div className="font-bold text-base sm:text-lg">
                  3 meals/day, 3500 cals, 150g protein, low-sugar.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <Link to="/menu" className="block">
            <div className="bg-gradient-to-b from-[#FEFFDF] to-[#FFFFFF] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition border border-white cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src={globe}
                    alt="Browse dining halls"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1">
                    Browse Dining Halls
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Any location, any time of day!
                  </p>
                </div>
              </div>
            </div>
          </Link>
          <Link to="/plan" className="block">
            <div className="bg-gradient-to-b from-[#FFDFDF] to-[#FFFFFF] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition border border-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src={plan}
                    alt="Make a plan"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1">
                    Make a Plan
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Click, click: simple as that.
                  </p>
                </div>
              </div>
            </div>
          </Link>
          <Link to="/prompt" className="block sm:col-span-2 md:col-span-1">
            <div className="bg-gradient-to-b from-[#DFFCFF] to-[#FFFFFF] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition border border-white cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src={stars}
                    alt="Ask CavBot"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1">
                    Ask CavBot
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Food tailored to your goals.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
