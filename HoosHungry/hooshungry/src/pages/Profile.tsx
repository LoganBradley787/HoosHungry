import { useState, useEffect } from "react";
import Navigation from "../components/common/Navigation";
import IdentityCard from "../components/profile/IdentityCard";
import OverviewTab from "../components/profile/OverviewTab";
import SettingsTab from "../components/profile/SettingsTab";
import { accountAPI } from "../api/accountEndpoints";
import type { UserProfile } from "../api/accountEndpoints";
import { useAuth } from "../contexts/AuthContext";
import FadeContent from "../components/reactbits/FadeContent";
import "../styles/profile.css";

type Tab = "overview" | "settings";

export default function Profile() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [extProfile, setExtProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    if (!token) return;
    accountAPI.getProfile().then(setExtProfile).catch(() => setProfileError(true));
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => setShowTitle(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      {/* Orange title strip */}
      <div style={{ backgroundColor: "var(--orange-deep)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1
            className="font-display italic"
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 300,
              color: "var(--cream-on-orange)",
              opacity: showTitle ? 1 : 0,
              transform: showTitle ? "translateY(0)" : "translateY(50px)",
              filter: showTitle ? "blur(0px)" : "blur(12px)",
              transition:
                "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.4, 0, 0.2, 1), filter 700ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Profile
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeContent direction="up" delay={200} duration={600} distance={24}>
          <div className="space-y-6">
            <IdentityCard />

            <div>
              <div
                className="flex items-end gap-5 pb-4 mb-6"
                style={{ borderBottom: "1px solid var(--rule)" }}
              >
                <button
                  className={`tab-link ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`tab-link ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </div>

              {activeTab === "overview" && (
                <div key="overview" className="profile-tab-content">
                  <OverviewTab extProfile={extProfile} />
                </div>
              )}
              {activeTab === "settings" && extProfile && (
                <div key="settings" className="profile-tab-content">
                  <SettingsTab
                    profile={extProfile}
                    onSaved={setExtProfile}
                  />
                </div>
              )}
              {activeTab === "settings" && !extProfile && (
                <div key="settings-loading" className="profile-tab-content" style={{ padding: "2rem 0", color: profileError ? "#c0392b" : "var(--ink-muted)", fontSize: "0.875rem" }}>
                  {profileError ? "Could not load profile settings. Please refresh." : "Loading…"}
                </div>
              )}
            </div>
          </div>
        </FadeContent>
      </div>
    </div>
  );
}
