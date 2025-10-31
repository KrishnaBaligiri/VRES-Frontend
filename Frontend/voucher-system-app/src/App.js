import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// --- IMPORT API ---
import api from "./api";

import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
// --- IMPORT DASHBOARD PAGE ---
import ProjectDashboardPage from "./components/ProjectDashboardPage"; // From Teammate

// ===========================================
// *** NEW IMPORT: User Dashboard Page ***
// ===========================================
import UserDashboardPage from "./components/UserDashboardPage"; 

// ---
import UserRegistrationPage from "./components/UserRegistrationPage";
import CreateProjectPage from "./components/CreateProjectPage";
import CreateVoucherPage from "./components/CreateVoucherPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import InitiateProjectPage from "./components/InitiateProjectPage";
import BeneficiaryListPage from "./components/UploadBeneficiaryListPage";
import ApproveBeneficiaryListPage from "./components/ApproveBeneficiaryListPage";
import UploadBeneficiaryListPage from "./components/UploadBeneficiaryListPage";
import SelectProjectPage from "./components/SelectProjectPage";
import RegisterCoordinatorPage from "./components/RegisterCoordinatorPage";
// --- IMPORT AdminDashboard IF YOU HAVE IT ---
// import AdminDashboard from "./components/AdminDashboard"; // Assuming filename

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/main.css";

// --- MERGED Nav config ---
const navConfig = {
  // ADMIN: Can initiate, register coord, view dashboard
  ADMIN: {
    // ===========================================
    // *** UPDATED NAV: Added 'user-dashboard' ***
    // ===========================================
    nav: ["dashboard", "user-dashboard", "initiate-project", "new-coordinator"], 
    defaultRoute: "/dashboard", 
  },
  // PROJECT COORDINATOR: Dashboard, user reg, create project
  "PROJECT COORDINATOR": {
    nav: ["dashboard", "user-registration", "create-project"], // Added "dashboard"
    defaultRoute: "/dashboard", // Changed default to Dashboard
  },
  ISSUER: {
    nav: ["create-voucher"],
    defaultRoute: "/create-voucher",
  },
  // OBSERVER: Dashboard is the main view
  OBSERVER: {
    nav: ["dashboard"], // Added "dashboard"
    defaultRoute: "/dashboard", // Changed default to Dashboard
  },
   // CHECKER: Approve list + Dashboard
  CHECKER: {
     nav: ["approve-beneficiary-list"], // Added "dashboard"
     defaultRoute: "/approve-beneficiary-list", // Changed default to Dashboard
   },
  // MAKER
  MAKER: {
     nav: [
       "beneficiary-list",
       "approve-beneficiary-list", 
       "upload-beneficiary-list",
     ],
     defaultRoute: "/upload-beneficiary-list",
  },
};
// --- END MERGED CONFIG ---

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  // We need to fetch projects for the dashboard's project selector
  const [projects, setProjects] = useState([]); 
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("jwtToken");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      const storedProjectId = localStorage.getItem("selectedProjectId");
      if (storedProjectId) {
        user.selectedProjectId = parseInt(storedProjectId, 10);
      }
      setCurrentUser(user);
    }
  }, []);

  // --- ADDED: Fetch projects if user is logged in (for Dashboard dropdown) ---
  useEffect(() => {
    if (currentUser) {
      api
        .get("/vres/projects") // Fetches all projects
        .then((res) => {
          setProjects(res.data || []);
        })
        .catch((err) => {
            console.error("Error fetching projects:", err);
            toast.error("Could not load project list.");
        });
    }
  }, [currentUser]); // Run when user logs in

  // --- Login Handler (Your Corrected Version) ---
  const handleLogin = (e, navigate) => {
    e.preventDefault();
    const loginPayload = {
      userId: e.target.username.value,
      password: e.target.password.value,
    };

    api
      .post("/vres/auth/login", loginPayload)
      .then((res) => {
        const userData = res.data;
        console.log("userData from login:", userData);

        if (!userData.jwtToken) {
          console.error("Login response missing JWT token!");
          toast.error("Login failed: No token received.");
          return;
        }
        localStorage.setItem("jwtToken", userData.jwtToken);

        const role = userData.role;
        const config = navConfig[role];

        if (!config) {
          toast.error(`Login failed: No UI configuration for role "${role}".`);
          localStorage.removeItem("jwtToken");
          return;
        }

        const user = {
          ...userData,
          nav: config.nav
        };

        localStorage.setItem("currentUser", JSON.stringify(user));
        setCurrentUser(user);
        toast.success(`Welcome ${user.name}!`);

        // Redirect Logic (Your Corrected Version)
        if (role === "ADMIN") {
            navigate(config.defaultRoute); // Go to Admin default (/dashboard)
        } else if (!userData.projects || userData.projects.length === 0) {
            // New PC or other role without projects
             toast.info("You have no projects assigned yet.");
             navigate(config.defaultRoute); // Go to their default page (e.g., /dashboard)
        } else {
            // Any other user with projects must select one
            navigate("/select-project");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.message || // Check both .message and .data
          "Invalid credentials. Please try again.";
        toast.error(errorMessage);
      });
  };
  // --- END LOGIN HANDLER ---

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("selectedProjectId");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("departmentId");
    setCurrentUser(null);
    toast.info("You have been logged out.");
  };

  return (
    <>
      <Router>
        {currentUser ? (
          <div className="layout">
            <Header
              currentUser={currentUser}
              handleLogout={handleLogout}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            <main
              className="main-content"
              style={{
                marginLeft: sidebarOpen ? 220 : 60,
                transition: "margin-left 0.3s",
                padding: 20,
              }}
            >
              <Routes>
                {/* --- PROJECT DASHBOARD ROUTE --- */}
                <Route
                  path="/dashboard"
                  element={
                      <ProjectDashboardPage 
                        currentUser={currentUser} 
                        allProjects={projects} // Pass the fetched project list
                      />
                  }
                />
                {/* --- END PROJECT DASHBOARD ROUTE --- */}

                {/* =========================================== */}
                {/* *** NEW ROUTE: User Dashboard Page *** */}
                {/* =========================================== */}
                <Route
                  path="/user-dashboard"
                  element={<UserDashboardPage />} 
                />

                {/* --- Your existing routes --- */}
                <Route
                  path="/user-registration"
                  element={<UserRegistrationPage />}
                />
                <Route
                  path="/create-project"
                  element={
                    <CreateProjectPage 
                        currentUser={currentUser} 
                        // Pass setProjects to update list on new project creation
                        setProjects={setProjects} 
                    />
                  }
                />
                <Route
                  path="/new-coordinator"
                  element={<RegisterCoordinatorPage />}
                />
                <Route
                  path="/create-voucher"
                  element={<CreateVoucherPage currentUser={currentUser} />}
                />
                <Route
                  path="/select-project"
                  element={
                    <SelectProjectPage
                      currentUser={currentUser}
                      setCurrentUser={setCurrentUser}
                    />
                  }
                />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/initiate-project"
                  element={<InitiateProjectPage />}
                />
                <Route
                  path="/beneficiary-list"
                  element={
                    <BeneficiaryListPage
                      readOnly={currentUser?.role === "CHECKER"}
                    />
                  }
                />
                <Route
                  path="/approve-beneficiary-list"
                  element={
                    <ApproveBeneficiaryListPage
                      role={
                        currentUser?.role ? currentUser.role.toLowerCase() : ""
                      }
                      projectId={currentUser?.selectedProjectId}
                    />
                  }
                />
                <Route
                  path="/upload-beneficiary-list"
                  element={<UploadBeneficiaryListPage />}
                />

                {/* --- Redirect Logic (Your Corrected Version) --- */}
                <Route
                  path="*"
                  element={
                    currentUser.role === "ADMIN" ? (
                      <Navigate
                        to={navConfig[currentUser.role].defaultRoute}
                        replace
                      />
                    ) :
                    !currentUser.selectedProjectId ? (
                      <Navigate to="/select-project" replace />
                    ) : (
                      <Navigate
                        to={
                          navConfig[currentUser.role]?.defaultRoute || "/login"
                        }
                        replace
                      />
                    )
                  }
                />
              </Routes>
            </main>
          </div>
        ) : (
          // Logged-out routes
          <Routes>
            <Route
              path="/login"
              element={<LoginPage handleLogin={handleLogin} />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default App;