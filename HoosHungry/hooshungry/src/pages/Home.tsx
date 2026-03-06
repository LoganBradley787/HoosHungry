import { useEffect, useState } from "react";
import globe from "../assets/globe.png";
import plan from "../assets/plan.png";
import stars from "../assets/stars.png";
import Navigation from "../components/common/Navigation";
import { Link } from "react-router-dom";
import SplitText from "../components/reactbits/SplitText";
import BlurText from "../components/reactbits/BlurText";
import FadeContent from "../components/reactbits/FadeContent";

function Home() {
  const [showEyebrow, setShowEyebrow] = useState(false);
  const [showCta1, setShowCta1] = useState(false);
  const [showCta2, setShowCta2] = useState(false);
  const [showCta3, setShowCta3] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowEyebrow(true), 100),
      setTimeout(() => setShowCta1(true), 700),
      setTimeout(() => setShowCta2(true), 820),
      setTimeout(() => setShowCta3(true), 940),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      {/* Orange gradient hero strip */}
      <div style={{ background: "linear-gradient(135deg, var(--orange-deep) 0%, var(--orange-mid) 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="max-w-2xl">
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "'DM Sans', sans-serif",
                opacity: showEyebrow ? 1 : 0,
                transform: showEyebrow ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              UVA Dining · Plan Smarter
            </p>
            <h1
              className="font-display italic mb-6 leading-tight"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                color: "var(--cream-on-orange)",
                fontWeight: 300,
              }}
            >
              <SplitText text="Finally, dining hall planning that just works." delay={250} staggerDelay={0.018} animateOnMount={true} />
            </h1>
            <div className="text-base sm:text-lg mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
              <BlurText
                text="Pick a hall, browse menu items, make a plan. How hungry are you, Hoo?"
                delay={900}
                duration={0.7}
                animateOnMount={true}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div style={{
                opacity: showCta1 ? 1 : 0,
                transform: showCta1 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 450ms cubic-bezier(0.4, 0, 0.2, 1), transform 450ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}>
                <Link
                  to="/menu"
                  className="text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cream-on-orange)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                >
                  See Menus →
                </Link>
              </div>
              <div style={{
                opacity: showCta2 ? 1 : 0,
                transform: showCta2 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 450ms cubic-bezier(0.4, 0, 0.2, 1), transform 450ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}>
                <Link
                  to="/plan"
                  className="text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cream-on-orange)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                >
                  View Plan →
                </Link>
              </div>
              <div style={{
                opacity: showCta3 ? 1 : 0,
                transform: showCta3 ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 450ms cubic-bezier(0.4, 0, 0.2, 1), transform 450ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}>
                <Link
                  to="/prompt"
                  className="px-5 py-2.5 text-sm font-medium rounded-sm transition-all"
                  style={{ backgroundColor: "var(--cream-on-orange)", color: "var(--orange-deep)" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Prompt AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cream content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px" style={{ backgroundColor: "var(--rule)" }}>
          <FadeContent direction="up" scale={true} delay={0} duration={600} threshold={0.15}>
            <Link to="/menu" className="block">
              <div
                className="p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--warm-white)",
                  transition: "background-color 200ms, transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.backgroundColor = "var(--cream)";
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 8px 24px rgba(26,18,8,0.08)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.backgroundColor = "var(--warm-white)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Browse
                </p>
                <img src={globe} alt="" className="w-6 h-6 object-contain mb-3 opacity-60" />
                <h3 className="font-display text-xl italic mb-2" style={{ color: "var(--ink)" }}>
                  Browse Dining Halls
                </h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Any location, any time of day.
                </p>
              </div>
            </Link>
          </FadeContent>

          <FadeContent direction="up" scale={true} delay={150} duration={600} threshold={0.15}>
            <Link to="/plan" className="block">
              <div
                className="p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--warm-white)",
                  transition: "background-color 200ms, transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.backgroundColor = "var(--cream)";
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 8px 24px rgba(26,18,8,0.08)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.backgroundColor = "var(--warm-white)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Plan
                </p>
                <img src={plan} alt="" className="w-6 h-6 object-contain mb-3 opacity-60" />
                <h3 className="font-display text-xl italic mb-2" style={{ color: "var(--ink)" }}>
                  Make a Plan
                </h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Click, click: simple as that.
                </p>
              </div>
            </Link>
          </FadeContent>

          <FadeContent direction="up" scale={true} delay={300} duration={600} threshold={0.15}>
            <Link to="/prompt" className="block sm:col-span-2 md:col-span-1">
              <div
                className="p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--warm-white)",
                  transition: "background-color 200ms, transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.backgroundColor = "var(--cream)";
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 8px 24px rgba(26,18,8,0.08)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.backgroundColor = "var(--warm-white)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Prompt
                </p>
                <img src={stars} alt="" className="w-6 h-6 object-contain mb-3 opacity-60" />
                <h3 className="font-display text-xl italic mb-2" style={{ color: "var(--ink)" }}>
                  Ask CavBot
                </h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Food tailored to your goals.
                </p>
              </div>
            </Link>
          </FadeContent>
        </div>
      </div>
    </div>
  );
}

export default Home;
