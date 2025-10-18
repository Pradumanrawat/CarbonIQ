
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./generaluser.css";
import Navbar from "@/app/Navbar/page";
import axios from "axios";

const Generaluser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    totaldistance: "",
    vehicletype: "",
    electricityusage: "",
    householdmembers: "",
    renewableusage: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      if (userData.role === "mine manager") {
        router.push("/MineDashboard");
        return;
      }
    } else {
      router.push("/Signin");
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await axios.post("/api/UserEmssion", formData);
      setResult(data);
    } catch (err) {
      if (err.response) setError(err.response.data.error || "Something went wrong");
      else setError("Network error");
    }

    setFormLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-center">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator-container">
      <Navbar />
      <main className="calculator-main">
        <div className="calculator-box">
          <h1>Calculate Emission</h1>
          <p>Enter your details below to calculate your carbon footprint.</p>

          <form className="calculator-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="distance">Total Distance Covered (km)</label>
              <input
                id="distance"
                type="number"
                placeholder="e.g., 50"
                value={formData.totaldistance}
                onChange={(e) => setFormData({ ...formData, totaldistance: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vehicle-type">Vehicle Type</label>
              <select
                id="vehicle-type"
                value={formData.vehicletype}
                onChange={(e) => setFormData({ ...formData, vehicletype: e.target.value })}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="carpetrol">Car (Petrol)</option>
                <option value="cardiesel">Car (Diesel)</option>
                <option value="bus">Bus</option>
                <option value="ev">Electric Vehicle</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="electricity-usage">Electricity Usage (kWh)</label>
              <input
                id="electricity-usage"
                type="number"
                placeholder="e.g., 300"
                value={formData.electricityusage}
                onChange={(e) => setFormData({ ...formData, electricityusage: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="household-number">Household Number</label>
              <input
                id="household-number"
                type="number"
                placeholder="e.g., 4"
                value={formData.householdmembers}
                onChange={(e) => setFormData({ ...formData, householdmembers: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="renewable-energy">Renewable Energy Usage (%)</label>
              <input
                id="renewable-energy"
                type="number"
                placeholder="e.g., 25"
                value={formData.renewableusage}
                onChange={(e) => setFormData({ ...formData, renewableusage: e.target.value })}
                min="0"
                max="100"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-submit" disabled={formLoading}>
              {formLoading ? "Calculating..." : "Calculate Emissions"}
            </button>
          </form>

          {result && (
            <div className="result-container">
              <h3>Emission Results</h3>
              <div className="result-grid">
                <div className="result-card">
                  <h4>Total Emission</h4>
                  <p>{result.totalemission?.toFixed(2)} kg CO2</p>
                </div>
                <div className="result-card">
                  <h4>Per Capita Emission</h4>
                  <p>{result.percaptaemission?.toFixed(2)} kg CO2</p>
                </div>
                <div className="result-card">
                  <h4>Transport Emission</h4>
                  <p>{result.totaltransportemission?.toFixed(2)} kg CO2</p>
                </div>
                <div className="result-card">
                  <h4>Electricity Emission</h4>
                  <p>{result.totalelectricityemission?.toFixed(2)} kg CO2</p>
                </div>
              </div>

              <div className="recommendations">
                <h4>Recommendations</h4>
                <div>
                  <p><strong>Transport:</strong> {result.status?.transport}</p>
                  <p><strong>Electricity:</strong> {result.status?.electricity}</p>
                  <p><strong>Renewable:</strong> {result.status?.renewable}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Generaluser;
