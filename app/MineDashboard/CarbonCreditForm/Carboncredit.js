
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Carboncredit.css";

const CarbonCalculatorForm = () => {
  const [netemission, setNetEmission] = useState("");
  const [carbonPrice, setCarbonPrice] = useState("");
  const [results, setResults] = useState(null);
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(true);

  // 1️⃣ Fetch netEmission from Mine Emission form
  useEffect(() => {
    const fetchNetEmission = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/MineEmission", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.netemission) {
          setNetEmission(response.data.netemission);
        } else {
          setWarning(
            "Net emission not found. Please fill the Mine Emission form first."
          );
        }
      } catch (err) {
        console.error(err);
        setWarning(
          "Could not fetch net emission. Please fill the Mine Emission form first."
        );
      } finally {
        setLoading(false);
        setCarbonPrice("");
      }
    };

    fetchNetEmission();
  }, []);

  // 2️⃣ Handle submit - call Carbon Credit API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!netemission) {
      alert("Cannot calculate: Net Emission not available. Fill Mine Emission form first.");
      return;
    }
    if (!carbonPrice) {
      alert("Please enter Carbon Price.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/CarbonCredit",
        { carbonPrice }, // we only need carbonPrice, netEmission comes from server
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(response.data);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error || "Error calculating carbon credits."
      );
    }
  };

  if (loading) return <p>Loading net emission...</p>;

  return (
    <div className="calculator-container">
      <h1>Carbon Credit Calculator</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="netemission">Net Emission (tCO₂e)</label>
          <input
            type="number"
            id="netEmission"
            value={netemission}
            disabled
            placeholder="Fetched from Mine Emission form"
          />
        </div>

        <div className="form-group">
          <label htmlFor="carbonPrice">Carbon Price ($/tCO₂e)</label>
          <input
            type="number"
            id="carbonPrice"
            value={carbonPrice}
            onChange={(e) => setCarbonPrice(e.target.value)}
            placeholder="Enter carbon price"
            required
          />
        </div>

        {warning && <p className="warning">{warning}</p>}

        <button type="submit" className="calculate-btn">
          Calculate
        </button>
      </form>

      {results && (
        <div className="result-section">
          <h2>Results</h2>
          <p><strong>Baseline:</strong> {results.baseline} tCO₂e</p>
          <p><strong>Net Emission:</strong> {results.netEmission} tCO₂e</p>
          <p><strong>Reduction:</strong> {results.reduction} tCO₂e</p>
          <p><strong>Revenue:</strong> ₹{results.revenue}</p>
          <p><strong>Status:</strong> {results.status}</p>
          {results.msg && <p><strong>Message:</strong> {results.msg}</p>}
        </div>
      )}
    </div>
  );
};

export default CarbonCalculatorForm;
