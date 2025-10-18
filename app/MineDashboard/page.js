"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "./MineManagerDashboard.css";
import MineEmissionForm from "./MineEmissionForm/MineEmission"
import ScenarioSimulatorForm from "./ScenarioSimulatorForm/Scenarioform";
import CarbonCreditForm from "./CarbonCreditForm/Carboncredit";

const MineManagerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("mine-emission");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      if (userData.role === "general user") {
        router.push("/Generaluser");
        return;
      }
    } else {
      router.push("/Signin");
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <Link href="/" className="logo"> Carbon IQ</Link>
        <nav>
          <ul>
            <li
              className={activeSection === "mine-emission" ? "active" : ""}
              onClick={() => setActiveSection("mine-emission")}
            >
              🏭 Mine Emission
            </li>
            <li
              className={activeSection === "scenario-form" ? "active" : ""}
              onClick={() => setActiveSection("scenario-form")}
            >
              📊 Scenario Simulator
            </li>
            <li
              className={activeSection === "carbon-credit" ? "active" : ""}
              onClick={() => setActiveSection("carbon-credit")}
            >
              💰 Carbon Credit
            </li>
            <li onClick={handleLogout} className="logout-btn">
              Logout
            </li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        {activeSection === "mine-emission" && <MineEmissionForm/>}
        {activeSection === "scenario-form" && <ScenarioSimulatorForm />}
        {activeSection === "carbon-credit" && <CarbonCreditForm />}
      </main>
    </div>
  );
};

export default MineManagerDashboard;
