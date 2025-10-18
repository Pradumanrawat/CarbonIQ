"use client"
import React, { useState } from "react";
import "./SignupPage.css";
import Navbar from "@/app/Navbar/page";

const SignupPage = () => {
  const [role, setRole] = useState("general user");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'general user',
    mineName: '',
    mineLocation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Update role based on selection
    const userRole = role === 'mine manager' ? 'mine manager' : 'general user';
    const submitData = {
      ...formData,
      role: userRole
    };

    try {
      const response = await fetch('/api/auth/Signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Please login.');
        setTimeout(() => {
          window.location.href = '/Signin';
        }, 2000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('Network error');
    }
    
    setLoading(false);
  };

  return (
    <div className="signup-container">
      
     <Navbar/>

      {/* Main Section */}
      <main className="signup-main">
        <div className="signup-box">
          <h2>Create  account</h2>
          

          <div className="role-switch">
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

          <form className="signup-form" onSubmit={handleSignup}>
            {role === "general user" && (
              <>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="@gmail.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </>
            )}

            {role === "mine manager" && (
              <>
                <div className="form-group">
                  <label>Manager Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter manager name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="manager@gmail.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter phone number" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mine Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter mine name" 
                    value={formData.mineName}
                    onChange={(e) => setFormData({...formData, mineName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mine Location</label>
                  <input 
                    type="text" 
                    placeholder="Enter mine location" 
                    value={formData.mineLocation}
                    onChange={(e) => setFormData({...formData, mineLocation: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>
                {success}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
    