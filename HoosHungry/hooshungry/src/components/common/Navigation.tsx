import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import brand_img from "../../assets/brand_img.png";
import { useState } from "react";

export default function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/plan", label: "Plan" },
    { to: "/prompt", label: "Prompt" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={brand_img}
            alt="HoosHungry"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#141414] to-[#6A6A6A] bg-clip-text text-transparent">
            HoosHungry
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors ${
                location.pathname === link.to
                  ? "text-orange-500 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700 hidden lg:inline">
                Welcome, {user.username}!
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
            >
              Login
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-800 transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            // X icon
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Hamburger icon
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 transition-colors ${
                  location.pathname === link.to
                    ? "text-orange-500 font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth */}
            <div className="pt-3 border-t border-gray-200">
              {user ? (
                <>
                  <span className="block text-gray-700 py-2 text-sm">
                    Welcome, {user.username}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition text-center"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
