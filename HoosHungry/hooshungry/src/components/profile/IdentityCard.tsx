import { useAuth } from "../../contexts/AuthContext";

function formatMemberSince(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function IdentityCard() {
  const { user } = useAuth();
  if (!user) return null;

  const { username, email, profile } = user;

  return (
    <div className="profile-identity-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="font-display italic"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--ink)", lineHeight: 1.1 }}
          >
            {username}
          </h2>
          {email && (
            <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)", marginTop: "0.25rem" }}>
              {email}
            </p>
          )}
        </div>
        {profile.premium_member && (
          <span className="profile-premium-badge" style={{ marginTop: "0.25rem", flexShrink: 0 }}>
            ★ Premium
          </span>
        )}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", marginTop: "0.5rem" }}>
        Member since {formatMemberSince(profile.created_at)}
      </p>
    </div>
  );
}
