import React, { useState } from "react";

export default function SignIn({ onSignInSuccess, onNavigateToSignUp, onNavigateToForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      localStorage.setItem("token", data.access_token);
      onSignInSuccess(data.username, data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-outline-variant p-8 mx-auto page-enter" style={{ borderRadius: "0px" }}>
      <div className="mb-8 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface uppercase mb-2">Welcome Back</h2>
        <p className="font-body text-on-surface-variant text-xs uppercase tracking-wider font-semibold">Access your personalized World Cup archives.</p>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container border border-error p-4 mb-6 font-body text-sm" style={{ borderRadius: "0px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="email">
            Email or Username
          </label>
          <input
            id="email"
            type="text"
            className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
            style={{ borderRadius: "0px" }}
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="password">
            Password
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

        <div className="flex items-center justify-between py-1">
          <button
            type="button"
            onClick={onNavigateToForgotPassword}
            className="font-label text-xs text-primary hover:underline font-bold uppercase tracking-wider cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-label font-bold py-4 hover:bg-primary-container transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50"
          style={{ borderRadius: "0px" }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-body text-sm text-on-surface-variant">
          New to the hub?{" "}
          <button
            onClick={onNavigateToSignUp}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            Join Now
          </button>
        </p>
      </div>
    </div>
  );
}
