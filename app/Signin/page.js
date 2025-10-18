
"use client"

import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/Navbar/page";

const LoginPage = () => {
  const router = useRouter();

  const [role, setRole] = useState("general user");

  const [formData, setFormData] = useState({
  email: "",   // <-- default value is empty string
  password: "" // <-- if you have password field
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/auth/Signin', { ...formData, role });

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role using Next.js router
      if (data.user.role === 'mine manager') {
        router.push('/MineDashboard');
      } else {
        router.push('/Generaluser');
      }

    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Login failed');
      } else {
        setError('Network error');
      }
    }

    setLoading(false);
  };

  return (
    <div className="page-container">
      <Navbar/>
      <main className="main-section">
        <div className="form-container">
          <div className="login-box">
            <div className="login-header">
              <h2>LOGIN</h2>
            </div>

            <div className="role-selector">
              <button
                className={role === "general user" ? "active" : ""}
                onClick={() => setRole("general user")}
              >
                General User
              </button>
              <button
                className={role === "mine manager" ? "active" : ""}
                onClick={() => setRole("mine manager")}
              >
                Mine Manager
              </button>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              {error && (
                <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <p className="signup-text">
              {"Don't have an account? "}<Link href="/Signup">Signup</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
