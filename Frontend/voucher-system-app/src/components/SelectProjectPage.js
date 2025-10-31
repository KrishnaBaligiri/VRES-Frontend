import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// This config helps determine where to go after selecting a project.
// --- ADDED VENDOR FOR COMPLETENESS ---
const navConfig = {
  ADMIN: { 
    nav: ["initiate-project", "new-coordinator"], 
    defaultRoute: "/new-coordinator" 
  },
  "PROJECT COORDINATOR": {
    nav: ["user-registration", "create-project"],
    defaultRoute: "/user-registration",
  },
  ISSUER: { 
    nav: ["create-voucher"], 
    defaultRoute: "/create-voucher" 
  },
  OBSERVER: { 
    nav: ["dashboard"], 
    defaultRoute: "/dashboard" 
  },
  CHECKER: {
    nav: ["approve-beneficiary-list"],
    defaultRoute: "/approve-beneficiary-list",
  },
  MAKER: {
    nav: ["beneficiary-list", "approve-beneficiary-list", "upload-beneficiary-list"],
    defaultRoute: "/upload-beneficiary-list",
  },
};


const SelectProjectPage = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  // Pre-select the first project in the dropdown
  const [selectedProjectId, setSelectedProjectId] = useState(
    currentUser?.projects?.[0]?.projectId || ""
  );

  useEffect(() => {
    if (!currentUser?.projects || currentUser.projects.length === 0) {
      toast.error(
        "You are not assigned to any projects. Please contact an administrator."
      );
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleProjectSelect = (e) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.warn("Please select a project to continue.");
      return;
    }

    // --- CORRECTED LOGIC ---

    // 1. Find the full project object from the currentUser state
    const selectedProject = currentUser.projects.find(
        (p) => p.projectId.toString() === selectedProjectId.toString()
    );

    if (!selectedProject) {
      toast.error("An error occurred. Could not find the selected project.");
      return;
    }

    // 2. Get the role from the SELECTED project and find its navigation config
    const roleForSession = selectedProject.role;
    const roleConfig = navConfig[roleForSession];

    if (!roleConfig) {
      toast.error(`Could not determine destination for role: ${roleForSession}`);
      return;
    }

    // 3. Create the updated user object, now with a top-level role
    const updatedUser = {
      ...currentUser,
      role: roleForSession, // Set the active role for the session
      selectedProjectId: parseInt(selectedProjectId, 10),
      nav: roleConfig.nav, // Set the specific nav links for the sidebar
    };
    setCurrentUser(updatedUser);
    
    // 4. Update localStorage with the full user object and specific IDs
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    localStorage.setItem("selectedProjectId", selectedProjectId);

    // If the user's role for this project is MAKER or CHECKER, store the departmentId
    if (roleForSession === "MAKER" || roleForSession === "CHECKER") {
      if (selectedProject.departmentId) {
        localStorage.setItem("departmentId", selectedProject.departmentId);
      } else {
        localStorage.removeItem("departmentId");
        console.warn(`Project "${selectedProject.projectName}" has no departmentId for this role.`);
      }
    }

    // 5. Navigate to the correct destination page
    toast.success(`Switched to project: ${selectedProject.projectName}`);
    navigate(roleConfig.defaultRoute);
  };

  if (!currentUser?.projects) {
    return null; // Render nothing while loading
  }

  // --- JSX (NO CHANGES NEEDED HERE) ---
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 100px)",
      }}
    >
      <div className="form-card-dark">
        <h2 className="page-title">Select Your Project</h2>
        <p className="page-subtitle" style={{ textAlign: "center" }}>
          Welcome, {currentUser.name}. Please choose a project to work on.
        </p>
        <form onSubmit={handleProjectSelect} style={{ width: "100%" }}>
          <div className="form-group">
            <label htmlFor="project-select">Assigned Projects</label>
            <select
              id="project-select"
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Choose a project --
              </option>
              {currentUser.projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName} (Role: {project.role})
                </option>
              ))}
            </select>
          </div>
          <div className="button-group" style={{ justifyContent: "center" }}>
            <button type="submit" className="btn btn-primary">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectProjectPage;