import React, { useState, useEffect } from "react";
import api from "../api"; // Import our central api instance
import { FaInfoCircle } from "react-icons/fa";
import { toast } from 'react-toastify'; // Keep toast for top-right notifications

const UploadBeneficiaryListPage = () => {
    const projectId = localStorage.getItem("selectedProjectId");
    const departmentId = localStorage.getItem("departmentId");

    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(""); // Re-added for local success message
    const [error, setError] = useState("");     // Re-added for local error message

    useEffect(() => {
        if (!projectId || !departmentId) {
            const missingInfoMessage = "Project or Department information is missing. Please log out and select a project again.";
            setError(missingInfoMessage); // Set local error
            toast.error(missingInfoMessage); // Also show as toast
        }
    }, [projectId, departmentId]);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        setMessage(""); // Clear messages on new file selection
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");   // Clear previous errors
        setMessage(""); // Clear previous messages

        if (!projectId || !departmentId) {
            const missingInfoMessage = "Cannot submit. Project or Department information is missing.";
            setError(missingInfoMessage);
            toast.error(missingInfoMessage);
            return;
        }

        if (files.length === 0) {
            const noFileMessage = "Please select at least one Excel file.";
            setError(noFileMessage);
            toast.error(noFileMessage);
            return;
        }

        const allowedTypes = [".xls", ".xlsx"];
        const invalidFiles = files.filter(
            (file) => !allowedTypes.some((ext) => file.name.endsWith(ext))
        );

        if (invalidFiles.length > 0) {
            const invalidFileMessage = "Only Excel files (.xls, .xlsx) are allowed.";
            setError(invalidFileMessage);
            toast.error(invalidFileMessage);
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("department_id", departmentId);

        files.forEach((file) => {
            formData.append("beneficiary_files", file);
        });

        try {
            const response = await api.post(
                `/vres/projects/${projectId}/beneficiaries/upload`,
                formData
            );

            const successMsg = response.data.message || `Successfully submitted ${files.length} file(s) for processing.`;
            setMessage(successMsg); // Set local success message
            toast.success(successMsg); // Also show as toast

            setFiles([]); // Clear file input state
            const fileInput = document.getElementById("beneficiary_files");
            if(fileInput) fileInput.value = "";

        } catch (err) {
            console.error("Upload error:", err); // Log the full error for debugging

            let displayMessage = "An unexpected error occurred during the upload. Please try again.";

            if (err.response) {
                // Get the message from the backend response
                const backendData = err.response.data;
                let backendMessage = "";

                // Handle different response data types (string vs. object)
                if (backendData && typeof backendData === 'object' && backendData.message) {
                    backendMessage = backendData.message;
                } else if (typeof backendData === 'string') {
                    backendMessage = backendData;
                }

                // Check for the specific registration period message
                if (backendMessage.includes("registration period for this project ended")) {
                    displayMessage = "Upload failed: The registration period for this project has ended.";
                } else if (backendMessage) {
                    // Use the backend message if it's not the specific date error
                    displayMessage = `Upload failed: ${backendMessage}`;
                } else if (err.response.status === 403) {
                    displayMessage = "Upload failed: You do not have permission.";
                } else {
                    displayMessage = `Upload failed: Request failed with status code ${err.response.status}.`;
                }
            } else if (err.message) {
                // Network errors or other issues
                displayMessage = `Upload failed: ${err.message}`;
            }
            
            setError(displayMessage); // Set local error message
            toast.error(displayMessage); // Also show as toast

        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFiles([]);
        setMessage(""); // Clear messages on cancel
        setError("");
        const fileInput = document.getElementById("beneficiary_files");
        if(fileInput) fileInput.value = "";
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>
                Upload Beneficiary List for Project {projectId}
            </h2>

            <div style={styles.infoBox}>
                <p
                    className="page-subtitle"
                    style={{ textAlign: "center", marginTop: "-10px" }}
                >
                    Upload Beneficiary List{" "}
                    <span
                        className="info-icon"
                        title={`Rules:
1. Only Excel files (.xls, .xlsx) are allowed.
2. You can upload beneficiary list.`}
                    >
                        <FaInfoCircle />
                    </span>
                </p>
            </div>

            <form
                className="form-grid"
                onSubmit={handleSubmit}
                onReset={handleCancel}
            >
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="beneficiary_files">
                        Select Beneficiary List File(s)
                    </label>
                    <input
                        type="file"
                        id="beneficiary_files"
                        accept=".xls,.xlsx"
                        multiple
                        required
                        onChange={handleFileChange}
                        disabled={isLoading || !projectId || !departmentId}
                    />
                </div>

                {isLoading && (
                    <p style={{ color: "#007bff", marginTop: "15px" }}>
                        Uploading, please wait...
                    </p>
                )}
                {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
                {message && (
                    <p style={{ color: "#28a745", marginTop: "15px" }}>{message}</p>
                )}

                <div style={styles.buttonGroup}>
                    <button
                        type="submit"
                        style={styles.btnPrimary}
                        disabled={isLoading || !projectId || !departmentId}
                    >
                        {isLoading ? "Uploading..." : "Submit"}
                    </button>
                    <button type="reset" style={styles.btnSecondary} disabled={isLoading}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadBeneficiaryListPage;

// --- Inline styles (unchanged) ---
const styles = {
    container: {
        backgroundColor: "#ffffff",
        padding: "30px",
        maxWidth: "750px",
        margin: "40px auto",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
        color: "#343a40",
    },
    heading: {
        textAlign: "center",
        color: "#007bff",
        marginBottom: "24px",
    },
    infoBox: {
        backgroundColor: "#e7f7e2",
        borderLeft: "5px solid #28a745",
        padding: "15px",
        marginBottom: "20px",
        borderRadius: "4px",
        fontSize: "0.9em",
        color: "#155724",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "24px",
    },
    btnPrimary: {
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
    },
    btnSecondary: {
        padding: "10px 20px",
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
    },
};