import React, { useState, useEffect } from "react";
import api from "../api"; // Use central api instance
import { FaInfoCircle } from "react-icons/fa";
import { toast } from 'react-toastify'; // Import toast

const ApproveBeneficiaryListPage = ({ role, projectId }) => {
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [selected, setSelected] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const departmentId = localStorage.getItem("departmentId");

    // --- FETCH BENEFICIARIES ---
    useEffect(() => {
        const fetchBeneficiaries = async () => {
            if (!projectId) {
                setError("No project has been selected.");
                setBeneficiaries([]);
                return;
            }
             if (!departmentId) {
                setError("Department ID not found. Please re-select project.");
                setBeneficiaries([]);
                return;
            }


            setIsLoading(true);
            setError("");
            setMessage(""); // Clear message on fetch
            try {
                const response = await api.get(
                    `/vres/projects/${projectId}/departments/${departmentId}/beneficiaries?status=pending_approval`
                );
                setBeneficiaries(response.data || []); // Ensure it defaults to an empty array
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to fetch beneficiaries.";
                if (err.response?.status === 403) {
                    setError("You are not authorized to view this page. Please log in again.");
                } else {
                    setError(errorMessage);
                }
                setBeneficiaries([]); // Clear beneficiaries on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchBeneficiaries();
    }, [projectId, departmentId]);

    const handleCheckboxChange = (beneficiaryId) => {
        setSelected((prev) =>
            prev.includes(beneficiaryId)
                ? prev.filter((id) => id !== beneficiaryId)
                : [...prev, beneficiaryId]
        );
    };

    // --- UPDATE STATUS ---
    const handleStatusUpdate = async (newStatus) => {
        if (selected.length === 0) {
            const selectErrorMsg = `No beneficiaries selected to ${newStatus}.`;
            setError(selectErrorMsg);
            toast.error(selectErrorMsg); // Add toast for better visibility
            return;
        }

        setIsLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await api.put(
                "/vres/beneficiaries/status", // This endpoint seems correct based on your code
                {
                    beneficiaryIds: selected,
                    status: newStatus,
                }
            );

            const successMsg = response.data.message || `Successfully updated status for ${selected.length} beneficiaries.`;
            setMessage(successMsg);
            toast.success(successMsg); // Show success toast

            // Remove updated beneficiaries from the list
            setBeneficiaries(
                beneficiaries.filter((b) => !selected.includes(b.beneficiaryId))
            );
            setSelected([]); // Clear selection
        } catch (err) {
            console.error("Status update error:", err); // Log the full error

            // --- UPDATED ERROR HANDLING ---
            let displayMessage = `Failed to ${newStatus} beneficiaries. Please try again.`; // Default

            if (err.response && err.response.data) {
                const backendData = err.response.data;
                let backendMessage = "";

                 // Handle different response data types (string vs. object with message)
                 if (backendData && typeof backendData === 'object' && backendData.message) {
                    backendMessage = backendData.message;
                } else if (typeof backendData === 'string') {
                    backendMessage = backendData;
                }


                // Check if the message indicates the registration period hasn't ended
                if (backendMessage.includes("registration period ends on")) {
                    displayMessage = "Cannot approve beneficiaries yet. The registration period has not ended.";
                } else if (backendMessage) {
                    // Use the backend message if it's not the specific date error
                    displayMessage = `Update failed: ${backendMessage}`;
                } else if (err.response.status === 403) {
                     displayMessage = "Update failed: You do not have permission.";
                } else {
                    displayMessage = `Update failed: Request failed with status code ${err.response.status}.`;
                }
            } else if (err.message) {
                // Network errors or other issues
                displayMessage = `Update failed: ${err.message}`;
            }

            setError(displayMessage); // Set the local error state
            toast.error(displayMessage); // Also show as a toast notification
            // --- END OF UPDATED ERROR HANDLING ---

        } finally {
            setIsLoading(false);
        }
    };

    // Determine if the approve/reject buttons should be shown
    const canApproveReject = role === "checker"; // Assuming 'checker' is the role name

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Approve Beneficiary List</h2>
            <p
                className="page-subtitle"
                style={{ textAlign: "center", marginTop: "-10px" }}
            >
                Approve Beneficiary List{" "}
                <span
                    className="info-icon"
                    title={`Rules:
1. Only CHECKER role can approve beneficiaries.
2. Approval can only happen after the project registration end date.`}
                >
                    <FaInfoCircle />
                </span>
            </p>

            {/* Display Error and Success Messages */}
            {error && (
                <div style={{ color: "red", marginBottom: "15px", textAlign: 'center', fontWeight: 'bold' }}>{error}</div>
            )}
            {message && (
                <div style={{ color: "green", marginBottom: "15px", textAlign: 'center', fontWeight: 'bold' }}>{message}</div>
            )}

            {isLoading && <p>Loading beneficiaries...</p>}

            {!isLoading && beneficiaries.length === 0 && !error && (
                <p>
                    No beneficiaries are currently awaiting approval for this project department.
                </p>
            )}

            {!isLoading && beneficiaries.length > 0 && (
                <form>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Select</th>
                                <th style={styles.tableHeader}>Name</th>
                                <th style={styles.tableHeader}>Phone</th>
                                <th style={styles.tableHeader}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {beneficiaries.map((b) => (
                                <tr key={b.beneficiaryId}>
                                    <td style={styles.tableCell}>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(b.beneficiaryId)}
                                            // Disable checkbox if user cannot approve/reject
                                            disabled={!canApproveReject || isLoading}
                                            onChange={() => handleCheckboxChange(b.beneficiaryId)}
                                        />
                                    </td>
                                    <td style={styles.tableCell}>{b.name}</td>
                                    <td style={styles.tableCell}>{b.phone}</td>
                                    <td style={styles.tableCell}>{b.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Only show buttons if the user has the correct role */}
                    {canApproveReject && (
                        <div style={styles.buttonGroup}>
                            <button
                                type="button"
                                style={styles.primaryBtn}
                                onClick={() => handleStatusUpdate("active")} // 'active' corresponds to is_approved = true
                                disabled={isLoading || selected.length === 0}
                            >
                                {isLoading ? "Processing..." : "Approve Selected"}
                            </button>
                            {/* You might want a Reject button too */}
                            {/*
                            <button
                                type="button"
                                style={styles.secondaryBtn} // Use secondary style for reject
                                onClick={() => handleStatusUpdate("rejected")} // Assuming 'rejected' or similar status
                                disabled={isLoading || selected.length === 0}
                            >
                                {isLoading ? "Processing..." : "Reject Selected"}
                            </button>
                            */}
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default ApproveBeneficiaryListPage;

// Inline styles (minor adjustments for consistency)
const styles = {
    container: {
        backgroundColor: "#ffffff",
        padding: "30px",
        maxWidth: "900px", // Slightly wider for table
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
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
        textAlign: "left",
    },
     tableHeader: { // Added style for table header
        borderBottom: "2px solid #dee2e6",
        padding: "12px",
        backgroundColor: '#f8f9fa'
    },
     tableCell: { // Added style for table cell
        borderBottom: "1px solid #dee2e6",
        padding: "12px",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "20px",
    },
    primaryBtn: {
        padding: "10px 20px",
        backgroundColor: "#28a745", // Green for Approve
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
    },
    secondaryBtn: {
        padding: "10px 20px",
        backgroundColor: "#dc3545", // Red for Reject
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
    },
};