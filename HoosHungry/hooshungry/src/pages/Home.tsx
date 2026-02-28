import globe from "../assets/globe.png";
import plan from "../assets/plan.png";
import stars from "../assets/stars.png";
import Navigation from "../components/common/Navigation";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Hero */}
        <div className="max-w-2xl mb-16 sm:mb-24">
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}
          >
            UVA Dining · Plan Smarter
          </p>
          <h1
            className="font-display italic mb-6 leading-tight"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: "var(--ink)",
              fontWeight: 300,
            }}
          >
            Finally, dining hall planning that just works.
          </h1>
          <p className="text-base sm:text-lg mb-8" style={{ color: "var(--ink-muted)" }}>
            Pick a hall, browse menu items, make a plan. How hungry are you, Hoo?
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/menu"
              className="text-sm transition-colors"
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
            >
              See Menus →
            </Link>
            <Link
              to="/plan"
              className="text-sm transition-colors"
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
            >
              View Plan →
            </Link>
            <Link
              to="/prompt"
              className="px-5 py-2.5 text-sm font-medium text-white rounded-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Prompt AI
            </Link>
          </div>
        </div>

        {/* Rule */}
        <hr className="editorial-rule mb-12" />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px" style={{ backgroundColor: "var(--rule)" }}>
          <Link to="/menu" className="block">
            <div
              className="p-6 sm:p-8 transition-colors"
              style={{ backgroundColor: "var(--warm-white)" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--warm-white)")}
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

          <Link to="/plan" className="block">
            <div
              className="p-6 sm:p-8 transition-colors"
              style={{ backgroundColor: "var(--warm-white)" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--warm-white)")}
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

          <Link to="/prompt" className="block sm:col-span-2 md:col-span-1">
            <div
              className="p-6 sm:p-8 transition-colors"
              style={{ backgroundColor: "var(--warm-white)" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--warm-white)")}
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
        </div>
      </div>
    </div>
  );
}

export default Home;
