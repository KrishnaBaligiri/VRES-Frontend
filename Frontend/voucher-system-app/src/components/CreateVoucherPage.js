import React, { useState, useEffect, useCallback } from "react";
import api from "../api"; // Use the central api instance
import { toast } from "react-toastify";

const CreateVoucherPage = () => {
    const [projectId, setProjectId] = useState(null);
    const [voucherPoints, setVoucherPoints] = useState("");
    const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
    const [allBeneficiaries, setAllBeneficiaries] = useState([]);
    const [validityStart, setValidityStart] = useState("");
    const [validityEnd, setValidityEnd] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(""); // State to show error below the form
    const [showBeneficiaryPopup, setShowBeneficiaryPopup] = useState(false);
    const [selectedVendorIds, setSelectedVendorIds] = useState([]);
    const [allVendors, setAllVendors] = useState([]);

    const fetchAllVendors = useCallback(async (projId) => {
        try {
            const response = await api.get(`/vres/projects/${projId}/vendors`);
            setAllVendors(response.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch vendors.");
        }
    }, []);

    const fetchBeneficiaries = useCallback(async (projId) => {
        try {
            const response = await api.get(`/vres/projects/${projId}/approved-beneficiaries`);
            setAllBeneficiaries(response.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch beneficiaries.");
        }
    }, []);

    useEffect(() => {
        const savedProjectId = localStorage.getItem("selectedProjectId");
        if (savedProjectId) {
            setProjectId(savedProjectId);
            fetchBeneficiaries(savedProjectId);
            fetchAllVendors(savedProjectId);
        } else {
            const noProjectMsg = "No project selected. Please select a project first.";
            toast.error(noProjectMsg);
            setError(noProjectMsg);
        }
    }, [fetchBeneficiaries, fetchAllVendors]);

    const handleVendorChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => Number(option.value));
        setSelectedVendorIds(selectedOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear previous error message
        setError("");

        // --- OPTIONAL: Add frontend date validation ---
        if (validityStart && validityEnd && validityEnd < validityStart) {
            const dateErrorMsg = "Voucher validity end date cannot be before the start date.";
            setError(dateErrorMsg);
            toast.error(dateErrorMsg);
            return; // Stop submission
        }
        // --- END OPTIONAL VALIDATION ---

        if (!projectId || !voucherPoints || selectedBeneficiaries.length === 0 || !validityStart || !validityEnd) {
            toast.error("Please fill all required fields.");
            // Optionally set local error too: setError("Please fill all required fields.");
            return;
        }
        setIsLoading(true);

        const payload = {
            voucherPoints: Number(voucherPoints),
            beneficiaryIds: selectedBeneficiaries.map((b) => b.beneficiaryId),
            validityStart,
            validityEnd,
            vendors: selectedVendorIds,
        };

        try {
            const response = await api.post(`/vres/projects/${projectId}/vouchers`, payload);
            toast.success(response.data.message || "Vouchers issued successfully!");
            handleCancel(); // Reset form on success
        } catch (err) {
            console.error("Voucher creation error:", err); // Log the full error

            // --- UPDATED ERROR HANDLING ---
            let displayMessage = "Failed to issue vouchers. Please try again."; // Default

            if (err.response && err.response.data) {
                const backendData = err.response.data;
                let backendMessage = "";

                // Handle different response data types (string vs. object with message)
                if (backendData && typeof backendData === 'object' && backendData.message) {
                    backendMessage = backendData.message;
                } else if (typeof backendData === 'string') {
                    backendMessage = backendData;
                }

                // Check for the specific validity date error message
                if (backendMessage.includes("validity end date cannot be before the validity start date")) {
                    displayMessage = "Voucher creation failed: The validity end date cannot be before the start date.";
                }
                // Check for the registration period error message
                else if (backendMessage.includes("registration period ends on")) {
                    displayMessage = "Voucher creation failed: The beneficiary registration period has not ended yet.";
                }
                else if (backendMessage) {
                    // Use other backend messages
                    displayMessage = `Voucher creation failed: ${backendMessage}`;
                } else if (err.response.status === 403) {
                     displayMessage = "Voucher creation failed: You do not have permission.";
                } else {
                    // Fallback using status code
                    displayMessage = `Voucher creation failed: Request failed with status code ${err.response.status}.`;
                }
            } else if (err.message) {
                // Network errors or other issues
                displayMessage = `Voucher creation failed: ${err.message}`;
            }

            setError(displayMessage); // Set the local error state to display below the form
            toast.error(displayMessage); // Also show as a toast notification
            // --- END OF UPDATED ERROR HANDLING ---

        } finally {
            setIsLoading(false);
        }
    };


    const handleCancel = () => {
        setVoucherPoints("");
        setSelectedBeneficiaries([]);
        setValidityStart("");
        setValidityEnd("");
        setSelectedVendorIds([]);
        setError(""); // Clear error on cancel
    };

    const toggleBeneficiarySelection = (beneficiary) => {
        setSelectedBeneficiaries((prev) => {
            const exists = prev.some((b) => b.beneficiaryId === beneficiary.beneficiaryId);
            return exists
                ? prev.filter((b) => b.beneficiaryId !== beneficiary.beneficiaryId)
                : [...prev, beneficiary];
        });
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Create Voucher</h2>
            {/* Display the error message locally */}
            {error && <div style={{ color: "red", marginBottom: 15, textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="voucherPoints" style={styles.label}>Voucher Points</label>
                    <input type="number" id="voucherPoints" value={voucherPoints} onChange={(e) => setVoucherPoints(e.target.value)} required min="1" /* Points should likely be > 0 */ style={styles.input}/>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Beneficiaries</label>
                    <button type="button" onClick={() => setShowBeneficiaryPopup(true)} style={styles.btnSelect}>Select Beneficiaries ({selectedBeneficiaries.length})</button>
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="validityStart" style={styles.label}>Validity Start Date</label>
                    <input type="date" id="validityStart" value={validityStart} onChange={(e) => setValidityStart(e.target.value)} required style={styles.input}/>
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="validityEnd" style={styles.label}>Validity End Date</label>
                    <input type="date" id="validityEnd" value={validityEnd} onChange={(e) => setValidityEnd(e.target.value)} required min={validityStart} /* Basic HTML5 validation */ style={styles.input}/>
                </div>

                {/* Vendor Select */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Vendors (Hold Ctrl or Cmd to select multiple)</label>
                    <select multiple={true} value={selectedVendorIds} onChange={handleVendorChange} style={styles.multiSelect}>
                        {allVendors.map((vendor) => (
                            <option key={vendor.userId} value={vendor.userId}>{vendor.name}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.buttonGroup}>
                    <button type="submit" disabled={isLoading} style={styles.btnPrimary}>
                        {isLoading ? "Submitting..." : "Issue Voucher"}
                    </button>
                    <button type="button" onClick={handleCancel} style={styles.btnSecondary}>Cancel</button>
                </div>
            </form>

            {/* Beneficiary Popup Modal */}
            {showBeneficiaryPopup && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3>Select Beneficiaries</h3>
                        {allBeneficiaries.length > 0 ? (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>Select</th>
                                        <th style={styles.tableHeader}>Name</th>
                                        <th style={styles.tableHeader}>Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allBeneficiaries.map((b) => (
                                        <tr key={b.beneficiaryId}>
                                            <td style={styles.tableCell}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBeneficiaries.some((sel) => sel.beneficiaryId === b.beneficiaryId)}
                                                    onChange={() => toggleBeneficiarySelection(b)}
                                                />
                                            </td>
                                            <td style={styles.tableCell}>{b.name}</td>
                                            <td style={styles.tableCell}>{b.phone}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                             <p>No approved beneficiaries found for this project.</p>
                        )}
                        <div style={{display: "flex", justifyContent: "flex-end", marginTop: 20}}>
                            <button onClick={() => setShowBeneficiaryPopup(false)} style={styles.btnPrimary}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateVoucherPage;

// --- STYLES (no changes) ---
const styles = {
    container: { maxWidth: 700, margin: "auto", padding: 30, backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
    heading: { textAlign: "center", color: "#007bff", marginBottom: 24 },
    form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    formGroup: { gridColumn: "span 2" }, // Make all form groups span 2 columns by default
    label: { fontWeight: "bold", marginBottom: 8, display: "block" },
    input: { width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ced4da", boxSizing: "border-box" },
    btnSelect: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
    buttonGroup: { gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 },
    btnPrimary: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
    btnSecondary: { padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
    modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { background: "white", padding: 30, borderRadius: 8, width: "90%", maxWidth: "600px", maxHeight: "80%", overflowY: "auto" },
    tableHeader: { borderBottom: "2px solid #dee2e6", padding: "12px", textAlign: "left" },
    tableCell: { borderBottom: "1px solid #dee2e6", padding: "12px" },
    multiSelect: { width: '100%', height: '150px', padding: '5px', borderRadius: '4px', border: '1px solid #ced4da' }
};