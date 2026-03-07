import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(username, password, email);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 0",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--rule)",
    color: "var(--ink)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontSize: "0.65rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "var(--ink-muted)",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  };

  const ease = "cubic-bezier(0.4, 0, 0.2, 1)";

  const fadeUp = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    filter: visible ? "blur(0px)" : "blur(8px)",
    transition: `opacity 800ms ${ease} ${delay}ms, transform 800ms ${ease} ${delay}ms, filter 800ms ${ease} ${delay}ms`,
  });

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div
        className="flex flex-col justify-center px-8 sm:px-16 w-full lg:w-1/2"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="max-w-sm w-full mx-auto">
          <h1
            className="font-display italic mb-2"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "var(--ink)", fontWeight: 300, ...fadeUp(0) }}
          >
            Create account.
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--ink-muted)", ...fadeUp(120) }}>
            Start planning your meals today.
          </p>

          {error && (
            <div className="mb-6 text-sm py-2 px-3 rounded-sm" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div style={fadeUp(220)}>
              <label style={labelStyle}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
            </div>
            <div style={fadeUp(320)}>
              <label style={labelStyle}>Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div style={fadeUp(420)}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            </div>
            <div style={fadeUp(520)}>
              <button
                type="submit"
                className="w-full py-3 text-sm text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--orange)", borderRadius: "4px" }}
              >
                Register
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm" style={{ color: "var(--ink-muted)", ...fadeUp(620) }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--orange)" }}>
              Log in →
            </Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2"
        style={{
          background: "linear-gradient(135deg, var(--orange), var(--amber))",
          opacity: visible ? 1 : 0,
          transition: `opacity 1100ms ${ease} 100ms`,
        }}
      >
        <h2
          className="font-display italic text-white"
          style={{ fontSize: "clamp(3rem, 5vw, 5rem)", fontWeight: 300, opacity: 0.95, ...fadeUp(300) }}
        >
          HoosHungry
        </h2>
        <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif", ...fadeUp(450) }}>
          UVA Dining · Plan Smarter
        </p>
      </div>
    </div>
  );
}
