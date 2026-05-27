import React, { useState } from "react";

export default function ForgotPassword({ onNavigateToSignIn }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Request failed.");
      }

      setMessage(data.message || "Simulated password reset email sent successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-outline-variant p-8 mx-auto page-enter" style={{ borderRadius: "0px" }}>
      <div className="mb-8 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface uppercase mb-2">Reset Password</h2>
        <p className="font-body text-on-surface-variant text-xs uppercase tracking-wider font-semibold">Enter your email to receive recovery instructions.</p>
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

      {!message ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
              style={{ borderRadius: "0px" }}
              placeholder="curator@alexandria.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label font-bold py-4 hover:bg-primary-container transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50"
            style={{ borderRadius: "0px" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div className="text-center pt-2">
          <p className="font-body text-sm text-on-surface-variant mb-6">
            Please check your inbox. If the email is registered, you will receive a reset link shortly.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <button
          onClick={onNavigateToSignIn}
          className="text-primary font-bold hover:underline cursor-pointer font-label text-xs uppercase tracking-wider"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
