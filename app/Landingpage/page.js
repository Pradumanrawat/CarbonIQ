
"use client"

import React from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import "./landingpage.css";
import Navbar from "@/app/Navbar/page";

const LandingPage = () => {
  const router = useRouter();

  const handleNavigation = (role) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      // If user is logged in, check role
      if (role === "mine manager" && user.role === "mine manager") {
        router.push("/MineDashboard");
      } else if (role === "general user" && user.role === "general user") {
        router.push("/Generaluser");
      } else {
        toast.error("You do not have access to this page with your current role");
      }
    } else {
      // Not logged in → go to login page
      router.push("/Signin");
    }
  };

  return (
    <div className="landing-container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="landing-grow">
        <Navbar />

        <main className="landing-main">
          <div
            className="landing-bg"
            style={{
              backgroundImage:
                'linear-gradient(to top, rgba(17, 33, 23, 0.8) 0%, rgba(17, 33, 23, 0) 60%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuABN6Jb_q1RxnczU_tMgt7SOUNhjws25raDJhZdmuONBc0ZGFKDwgHK5p8j5rpL2O6drzPvqoc6-ZWJwxGrppLN-rJwUhAj6LdQ3IjJf-PFYOfMW6SdE8-JZxnTP0X8NSOF7QGymSpOy7y4aNM1FiXp0Sqz40gJQ_VUUhAMNixbKukRPtDWcs3z42Qhk_3xjQYmz_EiQCSLBH07nEt-_S8IppE-5bwl0P7F_ZspNpaIy8PiwvNKVBImKGXI7N2rBlrd7_2ZIgcjj0YF")',
              objectFit: "cover",
            }}
          ></div>

          <div className="landing-content">
            <div className="landing-text">
              <h1>
                Welcome to <span className="text-primary">CarbonIQ</span>
              </h1>
              <p>
                Our AI-powered sustainability assistant. Calculate and reduce your carbon footprint with ease.
              </p>
            </div>

            <div className="landing-buttons">
              <button
                className="landing-button primary"
                onClick={() => handleNavigation("mine manager")}
              >
                Mine Manager
              </button>
              <button
                className="landing-button secondary"
                onClick={() => handleNavigation("general user")}
              >
                General User
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
