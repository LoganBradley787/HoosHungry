import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import type { UserProfile } from "../../api/accountEndpoints";

interface Props {
  extProfile: UserProfile | null;
}

export default function OverviewTab({ extProfile }: Props) {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  const aiTotal = user?.profile.premium_member ? null : 10;
  const aiRemaining = user?.profile.remaining_ai_usages ?? 0;
  const aiPct = aiTotal ? Math.round((aiRemaining / aiTotal) * 100) : 0;

  const [animatedPct, setAnimatedPct] = useState(0);
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => setAnimatedPct(aiPct), 80);
    return () => clearTimeout(t);
  }, [aiPct, user]);

  if (!user) return null;

  const { profile } = user;

  const dietTags: string[] = [];
  if (extProfile?.is_vegan) dietTags.push("Vegan");
  if (extProfile?.is_vegetarian) dietTags.push("Vegetarian");
  if (extProfile?.is_gluten_free) dietTags.push("Gluten-Free");

  return (
    <div className="space-y-6">
      {/* AI Usage */}
      <div>
        <div className="section-header"><span className="section-header-label">CavBot Usage</span><span className="section-header-rule" /></div>
        <div className="profile-stat-card">
          <div className="profile-stat-label">Messages Remaining</div>
          {profile.premium_member ? (
            <div className="profile-stat-value" style={{ color: "var(--orange-deep)" }}>
              Unlimited
            </div>
          ) : (
            <>
              <div className="profile-stat-value">{aiRemaining} / {aiTotal}</div>
              <div className="profile-progress-track">
                <div className="profile-progress-fill" style={{ width: `${animatedPct}%` }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", marginTop: "0.5rem" }}>
                {aiRemaining === 0
                  ? "You've used all free messages."
                  : `${aiRemaining} free message${aiRemaining === 1 ? "" : "s"} left`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Favorites */}
      <div>
        <div className="section-header"><span className="section-header-label">Favorites</span><span className="section-header-rule" /></div>
        <Link to="/menu" style={{ textDecoration: "none" }}>
          <div
            className="profile-stat-card"
            style={{ cursor: "pointer", transition: "box-shadow 150ms" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(234,88,12,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
          >
            <div className="profile-stat-label">Saved Items</div>
            <div className="flex items-end justify-between">
              <div className="profile-stat-value">{favorites.size}</div>
              <span style={{ fontSize: "0.75rem", color: "var(--orange-deep)", fontWeight: 500 }}>
                View in Menu →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Dietary Preferences */}
      <div>
        <div className="section-header"><span className="section-header-label">Dietary Preferences</span><span className="section-header-rule" /></div>
        <div
          className="profile-stat-card"
          style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}
        >
          {dietTags.length > 0 ? (
            dietTags.map(tag => (
              <span key={tag} className="profile-pref-tag">{tag}</span>
            ))
          ) : extProfile === null ? (
            <span style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>Loading…</span>
          ) : (
            <span style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>None set</span>
          )}
        </div>
      </div>
    </div>
  );
}
