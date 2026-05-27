import React, { useState } from "react";

export default function Feedback({ user, itinerary }) {
  const [username, setUsername] = useState(user?.username || "");
  const [acceptedRec, setAcceptedRec] = useState(
    itinerary ? `Gate ${itinerary.gate} and ${itinerary.food_stands?.[0]?.name || "Concessions"}` : ""
  );
  const [rejectedRec, setRejectedRec] = useState("");
  const [routeSatisfaction, setRouteSatisfaction] = useState(5);
  const [foodSatisfaction, setFoodSatisfaction] = useState(5);
  const [gateSatisfaction, setGateSatisfaction] = useState(5);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const targetUsername = user?.username || username;
    if (!targetUsername) {
      setError("Please specify a username.");
      setLoading(false);
      return;
    }

    if (!acceptedRec || !rejectedRec) {
      setError("Please fill in both accepted and rejected recommendations.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify({
          username: targetUsername,
          accepted_recommendation: acceptedRec,
          rejected_recommendation: rejectedRec,
          route_satisfaction: Number(routeSatisfaction),
          food_satisfaction: Number(foodSatisfaction),
          gate_satisfaction: Number(gateSatisfaction),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to submit feedback.");
      }

      setMessage("Feedback recorded successfully!");
      // Reset non-prefilled fields
      setRejectedRec("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white border-2 border-outline-variant p-8 mx-auto page-enter" style={{ borderRadius: "0px" }}>
      <div className="mb-8 text-center border-b border-outline-variant/30 pb-4">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface uppercase">Match Day Feedback</h2>
        <p className="font-body text-on-surface-variant text-xs uppercase tracking-wider font-semibold mt-1">Rate your recommendations and help KhelMitra learn.</p>
      </div>

      {error && (
        <div id="feedback-error" className="bg-error-container text-on-error-container border border-error p-4 mb-6 font-body text-sm" style={{ borderRadius: "0px" }}>
          {error}
        </div>
      )}

      {message && (
        <div id="feedback-success" className="bg-surface-container-high text-primary border border-primary p-4 mb-6 font-body text-sm" style={{ borderRadius: "0px" }}>
          {message}
        </div>
      )}

      <form id="feedback-form" onSubmit={handleSubmit} className="space-y-6">
        {!user && (
          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="feedback-username">
              Username *
            </label>
            <input
              id="feedback-username"
              type="text"
              className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
              style={{ borderRadius: "0px" }}
              placeholder="e.g. anonymousfan"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="accepted-rec">
            Accepted Recommendation *
          </label>
          <input
            id="accepted-rec"
            type="text"
            className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
            style={{ borderRadius: "0px" }}
            placeholder="e.g. Route through Gate A"
            value={acceptedRec}
            onChange={(e) => setAcceptedRec(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-label text-xs font-bold text-outline uppercase tracking-wider block" htmlFor="rejected-rec">
            Rejected Recommendation *
          </label>
          <input
            id="rejected-rec"
            type="text"
            className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body"
            style={{ borderRadius: "0px" }}
            placeholder="e.g. Pre-ordering Gujarati Dhokla"
            value={rejectedRec}
            onChange={(e) => setRejectedRec(e.target.value)}
          />
        </div>

        <div className="border-t border-outline-variant/30 pt-6 space-y-4">
          <h3 className="font-headline text-lg font-bold text-on-surface uppercase">Satisfaction Scores (1-5)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="font-label text-[10px] font-bold text-outline uppercase tracking-wider block" htmlFor="route-satisfaction">
                Transit Route
              </label>
              <select
                id="route-satisfaction"
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all font-body"
                style={{ borderRadius: "0px" }}
                value={routeSatisfaction}
                onChange={(e) => setRouteSatisfaction(Number(e.target.value))}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-[10px] font-bold text-outline uppercase tracking-wider block" htmlFor="food-satisfaction">
                Concessions
              </label>
              <select
                id="food-satisfaction"
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all font-body"
                style={{ borderRadius: "0px" }}
                value={foodSatisfaction}
                onChange={(e) => setFoodSatisfaction(Number(e.target.value))}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-[10px] font-bold text-outline uppercase tracking-wider block" htmlFor="gate-satisfaction">
                Gate Entry
              </label>
              <select
                id="gate-satisfaction"
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all font-body"
                style={{ borderRadius: "0px" }}
                value={gateSatisfaction}
                onChange={(e) => setGateSatisfaction(Number(e.target.value))}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
          </div>
        </div>

        <button
          id="submit-feedback-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-label font-bold py-4 hover:bg-primary-container transition-all active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50"
          style={{ borderRadius: "0px" }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
