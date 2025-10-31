import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Simple icons for each nav item (replace with react-icons if needed)
const navIcons = {
  dashboard: "📊",
  "user-registration": "📝",
  "create-project": "📁",
  "create-voucher": "🎫",
  "initiate-project": "🚀",
  "beneficiary-list": "👥",
  "approve-beneficiary-list": "✅",
  "new-coordinator": "📝",
  "user-dashboard": "👤"// Using a simple user icon emoji
};

const navItems = {
  dashboard: "Dashboard",
  "user-registration": "User Registration",
  "create-project": "Create Project",
  "create-voucher": "Create Voucher",
  "initiate-project": "Initiate Project",
  "beneficiary-list": "Beneficiary List",
  "approve-beneficiary-list": "Approve Beneficiary List",
  "new-coordinator": "Register Coordinator",
  "user-dashboard": "User Dashboard",
};

const Header = ({ currentUser, handleLogout, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      {/* ==== Topbar ==== */}
      <header
        className="topbar"
        style={{
          paddingLeft: sidebarOpen ? 220 : 60,
          transition: "padding-left 0.3s",
        }}
      >
        <div className="topbar-left">
          VRES - Voucher Redemption & Execution System
        </div>
        <div className="topbar-right">
          <span className="role-label">Welcome, {currentUser.role}</span>

          {/* CHANGED: Removed hover events from this container */}
          <div className="dropdown">
            <button
              className="dropdown-toggle"
              // CHANGED: Added onClick to toggle the menu
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="User menu"
            >
              ⋮
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/reset-password");
                    setDropdownOpen(false); // Close menu after clicking
                  }}
                >
                  Update Password
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false); // Close menu after clicking
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==== Sidebar ==== */}
      <aside
        className="sidebar"
        style={{
          width: sidebarOpen ? 220 : 60,
          transition: "width 0.3s",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: sidebarOpen ? "flex-end" : "center",
            padding: "10px",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              cursor: "pointer",
              border: "none",
              background: "none",
              fontSize: 18,
            }}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "⬅️" : "➡️"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Make sure currentUser and currentUser.nav exist before mapping */}
          {currentUser &&
            currentUser.nav &&
            currentUser.nav.map((routeKey) => (
              <Link
                key={routeKey}
                to={`/${routeKey}`}
                className={`sidebar-link ${
                  location.pathname === "/" + routeKey ? "active" : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                  textDecoration: "none",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={!sidebarOpen ? navItems[routeKey] : ""}
              >
                <span style={{ marginRight: sidebarOpen ? 10 : 0 }}>
                  {navIcons[routeKey]}
                </span>
                {sidebarOpen && <span>{navItems[routeKey]}</span>}
              </Link>
            ))}
        </nav>
      </aside>
    </>
  );
};

export default Header;
