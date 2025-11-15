import { useLocation, Link } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl font-bold">H</span>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-[#141414] to-[#6A6A6A] bg-clip-text text-transparent">
          HoosHungry
        </span>
      </div>

      <div className="flex items-center gap-8">
        <Link
          to="/"
          className={`transition-colors ${
            location.pathname === "/"
              ? "text-orange-500 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Home
        </Link>
        <Link
          to="/menu"
          className={`transition-colors ${
            location.pathname === "/menu"
              ? "text-orange-500 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Menu
        </Link>
        <Link
          to="/plan"
          className={`transition-colors ${
            location.pathname === "/plan"
              ? "text-orange-500 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Plan
        </Link>
        <Link
          to="/prompt"
          className={`transition-colors ${
            location.pathname === "/prompt"
              ? "text-orange-500 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Prompt
        </Link>
      </div>

      <button className="w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center text-white font-semibold">
        S
      </button>
    </nav>
  );
}
