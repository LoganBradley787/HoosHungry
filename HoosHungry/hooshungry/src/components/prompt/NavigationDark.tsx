import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import brand_img from "../../assets/brand_img.png";
import { useState } from "react";

export default function NavigationDark() {
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
    <nav
      style={{
        backgroundColor: "rgba(17, 10, 4, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={brand_img}
            alt="HoosHungry"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <span
            className="font-display text-xl sm:text-2xl font-normal italic"
            style={{ color: "var(--cream-on-orange)" }}
          >
            HoosHungry
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="tab-link"
              style={{
                color:
                  location.pathname === link.to
                    ? "var(--cream-on-orange)"
                    : "rgba(255, 255, 255, 0.6)",
                borderBottomColor:
                  location.pathname === link.to ? "var(--amber)" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--cream-on-orange)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  location.pathname === link.to
                    ? "var(--cream-on-orange)"
                    : "rgba(255, 255, 255, 0.6)")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <span
                className="hidden lg:inline text-sm"
                style={{ color: "rgba(255, 255, 255, 0.65)" }}
              >
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm flex items-center gap-1 transition-colors"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--cream-on-orange)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255, 255, 255, 0.75)")
                }
              >
                Logout →
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="text-sm flex items-center gap-1 transition-colors"
              style={{ color: "rgba(255, 255, 255, 0.75)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--cream-on-orange)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255, 255, 255, 0.75)")
              }
            >
              Login →
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 transition-colors"
          style={{ color: "rgba(255, 255, 255, 0.75)" }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 py-4 space-y-4 animate-slideDown"
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(17, 10, 4, 0.95)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block tab-link"
              style={{
                color:
                  location.pathname === link.to
                    ? "var(--cream-on-orange)"
                    : "rgba(255, 255, 255, 0.6)",
                borderBottomColor:
                  location.pathname === link.to ? "var(--amber)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
              >
                Logout →
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
              >
                Login →
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
