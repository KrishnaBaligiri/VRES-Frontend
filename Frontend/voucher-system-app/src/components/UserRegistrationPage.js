import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import api from "../api"; // <-- 1. IMPORT our central 'api' instance

const UserRegistrationPage = () => {
  // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"; // <-- 2. REMOVED

  // State has been simplified to only include fields for the new form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const projectId = localStorage.getItem("selectedProjectId");
    if (!projectId) {
      toast.error("No project is selected. Please go back and select a project first.");
      setIsLoading(false);
      return;
    }

    const newUserPayload = {
      projectId: parseInt(projectId, 10),
      email,
      name,
      phone,
    };

    try {
      // --- 3. UPDATED to use 'api.post' ---
      // This automatically adds the Base URL and Authorization token
      const response = await api.post("/vres/users", newUserPayload);

      // axios provides data directly in `response.data`
      toast.success(response.data.message || "User registered to project successfully!");
      handleCancel(); // Clear the form after a successful submission

    } catch (err) {
      // axios puts error details in err.response
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resets the form fields to their initial empty state.
  const handleCancel = () => {
    setEmail("");
    setName("");
    setPhone("");
  };

  // --- NO CHANGES to the JSX (return statement) ---
  return (
    <div
      className="container"
      style={{
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#f8f9fa",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "40px auto",
        color: "#343a40",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#007bff", marginBottom: "24px" }}>
        User Registration
      </h2>

      <div
        style={{
          backgroundColor: "#e2f0fe",
          borderLeft: "5px solid #007bff",
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "4px",
          fontSize: "0.9em",
          color: "#0d6efd",
        }}
      >
        <p style={{ margin: 0, textAlign: "center" }}>
          <FaInfoCircle style={{ marginRight: '8px' }} />
          Add a new user to this project. Roles will be assigned later.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
        <div className="form-group">
          <label htmlFor="email" style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}>
            Email (User ID)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", boxSizing: "border-box" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="name" style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}>
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", boxSizing: "border-box" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}>
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "12px 24px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "12px 24px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegistrationPage;