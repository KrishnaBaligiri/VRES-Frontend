import React, { useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api"; // <-- ADD THIS: Import the centralized api instance
// import axios from "axios"; // <-- REMOVE THIS: We no longer use the default axios

const InitiateProjectPage = () => {
    // REMOVED: API_BASE_URL is now handled by the 'api' instance
    const [formData, setFormData] = useState({
        title: "",
        email: "",
    });
    const [coordinators, setCoordinators] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCoordinators = async () => {
            try {
                // UPDATED: Use 'api' and a relative path. 'withCredentials' is now automatic.
                const response = await api.get("/vres/users/coordinators");
                setCoordinators(response.data);
            } catch (err) {
                console.error("Failed to fetch coordinators:", err);
                toast.error("Could not load project coordinators.");
            }
        };
        fetchCoordinators();
    }, []); // UPDATED: Dependency array is now empty

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // UPDATED: Use 'api' to make the POST request
            await api.post("/vres/projects/initiate", formData);
            toast.success("Project initiated successfully!");
            setFormData({ title: "", email: "" }); // Clear form
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to initiate project.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ title: "", email: "" });
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Initiate Project</h2>
            <div style={styles.infoHeading}>
                <p>
                    Initiate Project{" "}
                    <span title={`Note: Select a pre-registered Project Coordinator.`}>
                        <FaInfoCircle />
                    </span>
                </p>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label htmlFor="title">Project Title</label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        required
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="email">Project Coordinator</label>
                    <select
                        id="email"
                        value={formData.email}
                        required
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={styles.input}
                    >
                        <option value="" disabled>-- Select a Coordinator --</option>
                        {coordinators.map((coordinator) => (
                            <option key={coordinator.email} value={coordinator.email}>
                                {coordinator.name} ({coordinator.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div style={styles.buttonGroup}>
                    <button type="submit" style={styles.btnPrimary} disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit"}
                    </button>
                    <button type="button" style={styles.btnSecondary} onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InitiateProjectPage;

// --- STYLES (No changes needed here) ---
const styles = {
    container: {
        width: "90%",
        maxWidth: "600px",
        padding: "30px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
    },
    title: {
        textAlign: "center",
        color: "#007bff",
        marginBottom: "24px",
    },
    infoHeading: {
        backgroundColor: "#e7f7e2",
        borderLeft: "5px solid #28a745",
        padding: "15px",
        marginBottom: "20px",
        borderRadius: "4px",
        fontSize: "0.9em",
        textAlign: "center",
    },
    formGroup: {
        marginBottom: "20px",
    },
    input: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ced4da",
        borderRadius: "4px",
        boxSizing: "border-box",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "24px",
    },
    btnPrimary: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        backgroundColor: "#007bff",
        color: "#fff",
    },
    btnSecondary: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        backgroundColor: "#6c757d",
        color: "#fff",
    },
};