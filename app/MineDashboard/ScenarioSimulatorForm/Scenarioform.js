







"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ScenarioPlanning.css";

const ScenarioPlanning = () => {
  const [formData, setFormData] = useState({
    baselinemission: "", // optional/manual baseline
    dieselreduction: "",
    methanecapture: "",
    renewableenergyusage: "",
    additionalafforestation: "",
    evadoption: "",
  });

  const [mineEmissionAvailable, setMineEmissionAvailable] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMineEmission = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/api/MineEmission", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.totalemission && !formData.baselinemission) {
  setFormData(prev => ({
    ...prev,
    baselinemission: res.data.totalemission,
  }));
  setMineEmissionAvailable(true);
}
      } catch (err) {
        setMineEmissionAvailable(false);
      }
    };

    fetchMineEmission();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(""); // clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const baselineValue = formData.baselinemission ;

    // Show warning if baseline is missing
    if (!mineEmissionAvailable && !baselineValue) {
      setError(
        "Please fill the Mine Emission form first or enter baseline emission manually."
      );
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login.");

      const response = await axios.post("/api/ScenarioForm", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || err.message || "Failed to calculate scenario"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <main className="main">
        <div className="form-container">
          <div className="form-card">
            <h1>Scenario Planning</h1>
            <p>Enter values to model different carbon reduction scenarios.</p>

            <form className="scenario-form" onSubmit={handleSubmit}>
              {/* Baseline Emission */}
              <div className="form-group">
                <label htmlFor="baselinemission">
                  Baseline Emission (tCO₂e)
                  <span style={{ color: "gray", fontSize: "0.9rem" }}>
                    {mineEmissionAvailable
                      ? " (auto-filled from Mine Emission)"
                      : " (required if not available from Mine Emission)"}
                  </span>
                </label>
                <input
                  type="number"
                  id="baselinemission"
                  value={formData.baselinemission}
                  onChange={handleChange}
                  placeholder="Enter baseline emission"
                  required={!mineEmissionAvailable}
                  className={error ? "input-error" : ""}
                />
                {error && <div className="error-text">{error}</div>}
              </div>

              {/* Other Inputs */}
              {[
                { id: "dieselreduction", label: "Diesel Reduction (%)" },
                { id: "methanecapture", label: "Methane Capture (%)" },
                { id: "renewableenergyusage", label: "Renewable Energy Usage (%)" },
                { id: "additionalafforestation", label: "Additional Afforestation (Hectares)" },
                { id: "evadoption", label: "EV Adoption (%)" },
              ].map((field) => (
                <div className="form-group" key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input
                    type="number"
                    id={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    placeholder={`Enter ${field.label}`}
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                className="analyze-btn"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Scenario"}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className="result-container">
                <div className="result-card">
                  <h4>Baseline Emission</h4>
                  <p>{result.baselinemission} tCO₂e</p>
                </div>
                <div className="result-card">
                  <h4>New Emission</h4>
                  <p>{result.newemission} tCO₂e</p>
                </div>
                <div className="result-card">
                  <h4>Carbon Sink</h4>
                  <p>{result.carbonsink} tCO₂e</p>
                </div>
                <div className="result-card">
                  <h4>Net Emission Reduction</h4>
                  <p>{result.netemissionreduction} tCO₂e</p>
                </div>
                <div
                  className={`result-card status-card ${
                    result.netemissionreduction < 0 ? "negative" : ""
                  }`}
                >
                  <h4>Status</h4>
                  <p>{result.statusmsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScenarioPlanning;
