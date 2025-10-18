

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get logged-in user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <header className="landing-header">
      <div className="logo">
        <Link href="/">Carbon IQ</Link>
      </div>

      <div className="buttons-container">
        {user ? (
          <>
  
          

            {/* Chat Bot Button */}
            <Link href="/Chatbots" className="button-chat">
               Chat Bot
            </Link>
             <button className="button-logout" onClick={handleLogout}>
              Logout
            </button>
              <div className="user-initializer">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {/* Logout Button */}
           
          </>
        ) : (
          <>
            <Link href="/Signin" className="button-login">
              Log In
            </Link>
            <Link href="/Signup" className="button-signup">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
