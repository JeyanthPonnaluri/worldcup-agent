import React, { useState, useEffect } from "react";

export default function Profile({
  user,
  onUpdateSuccess,
  onLogout,
  language,
  handleLanguageChange,
  stadium,
  setStadium,
  MOCK_STADIUMS,
  matchAlertsActive,
  setMatchAlertsActive,
  liveScoresActive,
  setLiveScoresActive,
  onResetArchive,
  onDeactivateId,
  t
}) {
  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  const [crowdTolerance, setCrowdTolerance] = useState("medium");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [preferredGate, setPreferredGate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const DIETARY_OPTIONS = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "halal", label: "Halal" },
    { value: "gluten-free", label: "Gluten-Free" }
  ];

  const TEAM_OPTIONS = [
    { value: "IND", label: "India" },
    { value: "AUS", label: "Australia" },
    { value: "ENG", label: "England" },
    { value: "RSA", label: "South Africa" },
    { value: "PAK", label: "Pakistan" },
    { value: "NZL", label: "New Zealand" }
  ];

  const GATE_OPTIONS = [
    { value: "Gate A", label: "Gate A" },
    { value: "Gate B", label: "Gate B" },
    { value: "VIP Gate", label: "VIP Gate" }
  ];

  useEffect(() => {
    if (user) {
      setDietaryPrefs(user.dietary_preferences || []);
      setCrowdTolerance(user.crowd_tolerance || "medium");
      setFavoriteTeam(user.favorite_team || "");
      setPreferredGate(user.preferred_gate || "");
    }
  }, [user]);

  const handleDietaryChange = (value) => {
    if (dietaryPrefs.includes(value)) {
      setDietaryPrefs(dietaryPrefs.filter((p) => p !== value));
    } else {
      setDietaryPrefs([...dietaryPrefs, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          dietary_preferences: dietaryPrefs,
          crowd_tolerance: crowdTolerance,
          favorite_team: favoriteTeam,
          preferred_gate: preferredGate
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to update profile.");
      }

      setMessage("Profile updated successfully!");
      onUpdateSuccess({
        ...user,
        dietary_preferences: dietaryPrefs,
        crowd_tolerance: crowdTolerance,
        favorite_team: favoriteTeam,
        preferred_gate: preferredGate
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white border-2 border-outline-variant p-6 md:p-8 mx-auto page-enter" style={{ borderRadius: "0px" }}>
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-outline-variant/30">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface uppercase">{t.profileTitle || "Fan Profile"}</h2>
          <p className="font-body text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">{t.usernameLabel || "Username"}: {user?.username}</p>
        </div>
        <button
          onClick={onLogout}
          id="nav-logout"
          className="bg-error text-on-error font-label px-4 py-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider"
          style={{ borderRadius: "0px" }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container border border-error p-4 mb-6 font-body text-sm" style={{ borderRadius: "0px" }}>
          {error}
        </div>
      )}

      {message && (
        <div className="bg-surface-container-high text-primary border border-primary p-4 mb-6 font-body text-sm" style={{ borderRadius: "0px" }}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Backend Supported Fan Profile */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="font-headline text-lg font-bold text-on-surface border-b border-outline-variant pb-2 uppercase">Curator Preferences</h3>

          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="text"
              className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 text-outline transition-all font-body cursor-not-allowed text-sm"
              style={{ borderRadius: "0px" }}
              value={user?.email || ""}
              disabled
            />
          </div>

          <div className="space-y-2">
            <span className="font-label text-xs font-bold text-outline uppercase tracking-wider block">
              {t.dietaryRequirements || "Dietary Requirements"}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {DIETARY_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2 font-body text-sm text-on-surface cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary border border-outline-variant rounded-none"
                    checked={dietaryPrefs.includes(opt.value)}
                    onChange={() => handleDietaryChange(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="favorite-team">
                Favorite Team
              </label>
              <select
                id="favorite-team"
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-all font-body text-sm"
                style={{ borderRadius: "0px" }}
                value={favoriteTeam}
                onChange={(e) => setFavoriteTeam(e.target.value)}
              >
                <option value="">Select Team</option>
                {TEAM_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="preferred-gate">
                Preferred Entrance
              </label>
              <select
                id="preferred-gate"
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-all font-body text-sm"
                style={{ borderRadius: "0px" }}
                value={preferredGate}
                onChange={(e) => setPreferredGate(e.target.value)}
              >
                <option value="">Select Gate</option>
                {GATE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block">
              Crowd Tolerance
            </label>
            <div className="flex space-x-6">
              {["low", "medium", "high"].map((level) => (
                <label key={level} className="flex items-center space-x-2 font-body text-sm text-on-surface cursor-pointer select-none">
                  <input
                    type="radio"
                    name="profile-crowd-tolerance"
                    className="w-4 h-4 accent-primary"
                    value={level}
                    checked={crowdTolerance === level}
                    onChange={(e) => setCrowdTolerance(e.target.value)}
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label font-bold py-3.5 hover:bg-primary-container transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50"
            style={{ borderRadius: "0px" }}
          >
            {loading ? "Saving Preferences..." : "Save Preferences"}
          </button>
        </form>

        {/* Right Column: Global App Settings */}
        <div className="space-y-6">
          <h3 className="font-headline text-lg font-bold text-on-surface border-b border-outline-variant pb-2 uppercase">Application Settings</h3>

          {/* Active Match Arena Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">stadium</span>
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline">Active Match Arena</label>
            </div>
            <div className="relative">
              <select
                id="active-stadium"
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-all font-body text-sm"
                style={{ borderRadius: "0px" }}
              >
                {Object.keys(MOCK_STADIUMS).map((s) => (
                  <option key={s} value={s}>
                    {s} ({MOCK_STADIUMS[s].city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">language</span>
              <label className="font-label text-xs font-bold uppercase tracking-widest text-outline">
                {t.interfaceLanguage || "Interface Language"}
              </label>
            </div>
            <div className="relative">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-all font-body text-sm"
                style={{ borderRadius: "0px" }}
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish (ES)</option>
                <option value="pt">Portuguese (BR)</option>
              </select>
            </div>
          </div>

          {/* Smart Alerts Notification Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1">
              <span className="material-symbols-outlined text-primary text-sm">notifications_active</span>
              <h4 className="font-label text-xs font-bold uppercase tracking-widest text-outline">
                {t.smartAlerts || "Smart Alerts"}
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-body">
                <span>{t.matchStartAlerts || "Match Start Alerts"}</span>
                <button
                  onClick={() => setMatchAlertsActive(!matchAlertsActive)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 border cursor-pointer ${
                    matchAlertsActive ? "bg-primary border-primary" : "bg-surface-container border-outline-variant"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white absolute top-0.5 rounded-full transition-all duration-200 ${
                      matchAlertsActive ? "left-5" : "left-0.5"
                    }`}
                  ></div>
                </button>
              </div>
              <div className="flex justify-between items-center text-sm font-body border-t border-outline-variant/10 pt-2">
                <span>{t.liveScoreUpdates || "Live Score Updates"}</span>
                <button
                  onClick={() => setLiveScoresActive(!liveScoresActive)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 border cursor-pointer ${
                    liveScoresActive ? "bg-primary border-primary" : "bg-surface-container border-outline-variant"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white absolute top-0.5 rounded-full transition-all duration-200 ${
                      liveScoresActive ? "left-5" : "left-0.5"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone Governance */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-sm">security</span>
              <h4 className="font-label text-xs font-bold uppercase tracking-widest text-outline">{t.dataGovernance || "Data Governance"}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={onResetArchive}
                className="py-2.5 text-[10px] font-bold font-label tracking-widest border border-outline text-on-surface hover:bg-surface-container transition-all rounded uppercase cursor-pointer"
              >
                {t.resetPersonalArchive || "Reset Archive"}
              </button>
              <button
                onClick={onDeactivateId}
                className="py-2.5 text-[10px] font-bold font-label tracking-widest border border-error/30 text-error hover:bg-error-container/20 transition-all rounded uppercase cursor-pointer"
              >
                {t.deactivateGlobalId || "Deactivate ID"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
