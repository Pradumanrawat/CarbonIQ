
"use client";
import React, { useState } from "react";
import axios from "axios";
import "./Mineemission.css";

const MineEmissionForm = () => {
  const [mineEmissionData, setMineEmissionData] = useState({
    dieselconsumption: "",
    electricityusage: "",
    vehiclemovement: "",
    coalproduction: "",
    methanerelease: "",
    totalworkers: "",
    minetype: "",
    carbonsinks: [
      {
        sinktype: "",
        area: "",
        vegetationtype: "",
        sequestrationrate: "",
        soiltype: "",
        soilmanagementpractices: "",
      },
    ],
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMineEmissionChange = (e) => {
    setMineEmissionData({ ...mineEmissionData, [e.target.name]: e.target.value });
  };

  const handleMineEmissionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/MineEmission", mineEmissionData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data);

      // ✅ Update token if backend returned a new one (which includes mineid)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("✅ New token saved with mineid");
      }

      setResult(response.data);
      alert("Mine Emission saved successfully!");

    } catch (err) {
      if (err.response) setError(err.response.data.error || "Failed to calculate emissions");
      else setError("Network error: " + err.message);
    }

    setLoading(false);
  };

  // Units map
  const unitsMap = {
    emissions: "tCO₂e",
    dieselconsumption: "liters",
    electricityusage: "kWh",
    vehiclemovement: "km",
    coalproduction: "t",
    methanerelease: "tCO₂",
    totalworkers: "people",
    sequestrationrate: "tCO₂/ha/yr",
    area: "ha",
  };

  return (
    <div className="section">
      <h2>Mine Emission Calculator</h2>
      <div className="form-wrapper">
        <form className="mine-form" onSubmit={handleMineEmissionSubmit}>
          {/* Mine Details */}
          <h3>Mine Details</h3>
          <div className="form-group">
            <label>Mine Type</label>
            <select
              name="minetype"
              value={mineEmissionData.minetype}
              onChange={handleMineEmissionChange}
              required
            >
              <option value="">Select</option>
              <option value="opencast">Opencast</option>
              <option value="underground">Underground</option>
            </select>
          </div>

          {[
            "dieselconsumption",
            "electricityusage",
            "vehiclemovement",
            "coalproduction",
            "methanerelease",
            "totalworkers",
          ].map((field, i) => (
            <div className="form-group" key={i}>
              <label>
                {field.replace(/([A-Z])/g, " $1")} ({unitsMap[field]})
              </label>
              <input
                type="number"
                name={field}
                value={mineEmissionData[field]}
                onChange={handleMineEmissionChange}
                required
              />
            </div>
          ))}

          {/* Carbon Sinks */}
          <h3>Carbon Sinks</h3>
          {mineEmissionData.carbonsinks.map((sink, index) => (
            <div className="carbon-sink" key={index}>
              <div className="form-group">
                <label>Sink Type</label>
                <select
                  value={sink.sinktype}
                  onChange={(e) => {
                    const newSinks = [...mineEmissionData.carbonsinks];
                    newSinks[index].sinktype = e.target.value;
                    setMineEmissionData({ ...mineEmissionData, carbonsinks: newSinks });
                  }}
                >
                  <option value="">Select</option>
                  <option value="Afforestation">Afforestation</option>
                  <option value="Rehabilitation">Rehabilitation</option>
                  <option value="Soilcarbon">Soil Carbon</option>
                </select>
              </div>

              <div className="form-group">
                <label>Area ({unitsMap.area})</label>
                <input
                  type="number"
                  value={sink.area}
                  onChange={(e) => {
                    const newSinks = [...mineEmissionData.carbonsinks];
                    newSinks[index].area = e.target.value;
                    setMineEmissionData({ ...mineEmissionData, carbonsinks: newSinks });
                  }}
                  placeholder="e.g., 10"
                />
              </div>

              {["Afforestation", "Rehabilitation"].includes(sink.sinktype) && (
                <>
                  <div className="form-group">
                    <label>Vegetation Type</label>
                    <input
                      type="text"
                      value={sink.vegetationtype}
                      onChange={(e) => {
                        const newSinks = [...mineEmissionData.carbonsinks];
                        newSinks[index].vegetationtype = e.target.value;
                        setMineEmissionData({ ...mineEmissionData, carbonsinks: newSinks });
                      }}
                      placeholder="e.g., Tropical Forest"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sequestration Rate ({unitsMap.sequestrationrate})</label>
                    <input
                      type="number"
                      value={sink.sequestrationrate}
                      onChange={(e) => {
                        const newSinks = [...mineEmissionData.carbonsinks];
                        newSinks[index].sequestrationrate = e.target.value;
                        setMineEmissionData({ ...mineEmissionData, carbonsinks: newSinks });
                      }}
                      placeholder="e.g., 2.5"
                    />
                  </div>
                </>
              )}

              {sink.sinktype === "Soilcarbon" && (
                <>
                  <div className="form-group">
                    <label>Soil Type</label>
                    <input
                      type="text"
                      value={sink.soiltype}
                      onChange={(e) => {
                        const newSinks = [...mineEmissionData.carbonsinks];
                        newSinks[index].soiltype = e.target.value;
                        setMineEmissionData({ ...mineEmissionData, carbonsinks: newSinks });
                      }}
                      placeholder="e.g., Loamy"
                    />
                  </div>
                  <div className="form-group">
                    <label>Soil Management Practice</label>
                    <select
                      value={sink.soilmanagementpractices}
                      onChange={(e) => {
                        const newSinks = [...mineEmissionData.carbonsinks];
                        newSinks[index].soilmanagementpractices = e.target.value;
                        setMineEmissionData({ ...mineEmissionData, carbonsinks: newSinks });
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Notillfarming">No-till Farming</option>
                      <option value="Covercropping">Cover Cropping</option>
                      <option value="organicamendments">Organic Amendments</option>
                      <option value="Mulching">Mulching</option>
                      <option value="Agroforestry">Agroforestry</option>
                      <option value="Contourfarming">Contour Farming</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          ))}

          <button type="submit" className="btn-calculate" disabled={loading}>
            {loading ? "Calculating..." : "Calculate Emissions"}
          </button>
        </form>

        {/* Result Section */}
        {result && (
          <div className="result-container">
            {result.totalemission !== undefined && (
              <div className="result-card">
                <h4>Total Emissions</h4>
                <p>{result.totalemission} tCO₂e</p>
              </div>
            )}
            {result.percaptaemission !== undefined && (
              <div className="result-card">
                <h4>Per Capita Emission</h4>
                <p>{result.percaptaemission} tCO₂e/person</p>
              </div>
            )}
            {result.netemission !== undefined && (
              <div className="result-card">
                <h4>Net Emission</h4>
                <p>{result.netemission} tCO₂e</p>
              </div>
            )}
            {result.status && (
              <div className="result-card status-card">
                <h4>Status</h4>
                <p>{result.status}</p>
              </div>
            )}
            {result.totalcarbonsink !== undefined && (
              <div className="result-card">
                <h4>Total Carbon Sink</h4>
                <p>{result.totalcarbonsink} tCO₂e</p>
              </div>
            )}
          </div>
        )}

        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
};

export default MineEmissionForm;
