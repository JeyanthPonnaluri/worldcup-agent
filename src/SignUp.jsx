import React, { useState } from "react";

export default function SignUp({ onSignUpSuccess, onNavigateToSignIn }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  const [crowdTolerance, setCrowdTolerance] = useState("medium");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [preferredGate, setPreferredGate] = useState("");
  
  const [loading, setLoading] = useState(false);
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

  const handleDietaryChange = (value) => {
    if (dietaryPrefs.includes(value)) {
      setDietaryPrefs(dietaryPrefs.filter((p) => p !== value));
    } else {
      setDietaryPrefs([...dietaryPrefs, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all required fields (Username, Email, Password).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          dietary_preferences: dietaryPrefs,
          crowd_tolerance: crowdTolerance,
          favorite_team: favoriteTeam,
          preferred_gate: preferredGate
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      onSignUpSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white border-2 border-outline-variant p-8 mx-auto page-enter" style={{ borderRadius: "0px" }}>
      <div className="mb-8 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface uppercase mb-2">Join KhelMitra</h2>
        <p className="font-body text-on-surface-variant text-xs uppercase tracking-wider font-semibold">Your curated World Cup experience begins here.</p>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container border border-error p-4 mb-6 font-body text-sm" style={{ borderRadius: "0px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="username">
              Username *
            </label>
            <input
              id="username"
              type="text"
              className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
              style={{ borderRadius: "0px" }}
              placeholder="e.g. smartfan99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="email">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
              style={{ borderRadius: "0px" }}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="password">
            Password *
          </label>
          <input
            id="password"
            type="password"
            className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
            style={{ borderRadius: "0px" }}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="border-t border-outline-variant/30 pt-6 space-y-4">
          <h3 className="font-headline text-lg font-bold text-on-surface uppercase">Match Day Preferences</h3>
          
          <div className="space-y-2">
            <span className="font-label text-xs font-bold text-outline uppercase tracking-wider block">
              Dietary Requirements
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="favorite-team">
                Favorite Team
              </label>
              <select
                id="favorite-team"
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all font-body"
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
                Preferred Entrance Gate
              </label>
              <select
                id="preferred-gate"
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all font-body"
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

          <div className="space-y-1.5 pt-2">
            <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block">
              Crowd Tolerance
            </label>
            <div className="flex space-x-6">
              {["low", "medium", "high"].map((level) => (
                <label key={level} className="flex items-center space-x-2 font-body text-sm text-on-surface cursor-pointer select-none">
                  <input
                    type="radio"
                    name="crowd-tolerance"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-label font-bold py-4 hover:bg-primary-container transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50"
          style={{ borderRadius: "0px" }}
        >
          {loading ? "Registering..." : "Create Account"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-body text-sm text-on-surface-variant">
          Already a member?{" "}
          <button
            onClick={onNavigateToSignIn}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
