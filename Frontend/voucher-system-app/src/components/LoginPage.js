import React, { useState } from "react";
// 1. Import 'Link' from react-router-dom
import { useNavigate, Link } from "react-router-dom";

const LoginPage = ({ handleLogin }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleCancel = () => {
    setUserId("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="page-title">Login</h2>
        <form onSubmit={(e) => handleLogin(e, navigate)} className="form-grid">
          
          {/* User ID */}
          <div className="form-group full-width">
            <label htmlFor="userId" className="form-label">User ID</label>
            <input
              type="text"
              name="username"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              className="form-input"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group full-width">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              required
            />
          </div>

          {/* Buttons */}
          <div className="button-group full-width">
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          </div>

          {/* Forgot Password (Corrected and Improved) */}
          <div className="form-footer" style={{ marginTop: "10px" }}>
            {/* 2. Use the Link component */}
            <Link to="/forgot-password" className="link-forgot">
              Reset/Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;