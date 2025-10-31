import React, { useState } from "react";
// import axios from "axios"; // <-- 1. REMOVED
import api from "../api"; // <-- 2. ADDED: Import our central api instance
import { toast } from "react-toastify";

const RegisterCoordinatorPage = () => {
  // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"; // <-- 3. REMOVED
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      email,
      phone,
    };

    try {
      // --- 4. UPDATED to use 'api.post' and a relative URL ---
      const response = await api.post(
        "/vres/users/register-coordinator",
        payload
      );

      toast.success(`Coordinator "${response.data.name}" registered successfully!`);
      handleCancel(); // Clear the form on success
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to register coordinator.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NO CHANGES TO THE JSX (return statement) ---
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register Project Coordinator</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
        <div className="form-group">
          <label htmlFor="name" style={styles.label}>Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
        </div>
        <div className="form-group">
          <label htmlFor="email" style={styles.label}>Email (User ID)</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
        </div>
        <div className="form-group">
          <label htmlFor="phone" style={styles.label}>Phone</label>
          <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required style={styles.input} />
        </div>
        <div className="form-group">
          <label htmlFor="role" style={styles.label}>Role</label>
          <input type="text" id="role" value="Project Coordinator" disabled style={{ ...styles.input, ...styles.disabledInput }} />
        </div>
        <div style={styles.buttonGroup}>
          <button type="submit" disabled={isLoading} style={styles.buttonPrimary}>
            {isLoading ? "Submitting..." : "Submit"}
          </button>
          <button type="button" onClick={handleCancel} style={styles.buttonSecondary}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCoordinatorPage;

// --- STYLES (no changes) ---
const styles = {
    container: {
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "40px auto",
    },
    title: {
        color: "#007bff",
        marginBottom: "24px",
        textAlign: "center",
    },
    label: {
        fontWeight: "bold",
        display: "block",
        marginBottom: "8px",
    },
    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "4px",
        border: "1px solid #ced4da",
        boxSizing: "border-box",
    },
    disabledInput: {
        backgroundColor: "#e9ecef",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        paddingTop: "20px",
    },
    buttonPrimary: {
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "4px",
        fontWeight: "bold",
        cursor: "pointer",
        minWidth: "100px",
    },
    buttonSecondary: {
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "4px",
        fontWeight: "bold",
        cursor: "pointer",
        minWidth: "100px",
    }
};