/* eslint-disable eqeqeq */
import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const selectedProjectId = localStorage.getItem("selectedProjectId");

  // State management
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [maker, setMaker] = useState("");
  const [checker, setChecker] = useState("");
  const [approverPairs, setApproverPairs] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [selectedIssuerId, setSelectedIssuerId] = useState("");

  useEffect(() => {
    if (!selectedProjectId) {
      toast.error("No project selected. Please select a project first.");
      navigate("/dashboard");
      return;
    }
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const usersRes = await api.get(
          `/vres/projects/${selectedProjectId}/unassigned-users`
        );
        setAllUsers(usersRes.data || []);

        const projectRes = await api.get(`/vres/projects/${selectedProjectId}`);

        const projectData = projectRes.data;
        if (projectData) {
          setProjectName(projectData.title || "");
          setDescription(projectData.description || "");
          setStartDate(
            projectData.start_date
              ? new Date(projectData.start_date).toISOString().split("T")[0]
              : ""
          );
          setRegistrationEndDate(
            projectData.end_date
              ? new Date(projectData.end_date).toISOString().split("T")[0]
              : ""
          );
        }
      } catch (err) {
        toast.error("Failed to load project data. Please try again.");
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [selectedProjectId, navigate]);

  const availableUsers = useMemo(() => {
    const assignedUserIds = new Set([
      ...approverPairs.flatMap((p) => [p.makerId, p.checkerId]),
      selectedIssuerId,
      ...assignedVendors.map((v) => v.userId),
    ]);
    return allUsers.filter((user) => !assignedUserIds.has(user.userId));
  }, [allUsers, approverPairs, selectedIssuerId, assignedVendors]);

  const handleIssuerChange = (e) => {
    setSelectedIssuerId(e.target.value);
  };

  const handleAddApproverPair = () => {
    if (!maker || !checker)
      return toast.warn("Please select both a Maker and a Checker.");
    if (maker === checker)
      return toast.warn("Maker and Checker cannot be the same person.");
    const makerObj = allUsers.find((u) => u.userId == maker);
    const checkerObj = allUsers.find((u) => u.userId == checker);
    setApproverPairs((prev) => [
      ...prev,
      {
        makerId: makerObj.userId,
        makerName: makerObj.name,
        checkerId: checkerObj.userId,
        checkerName: checkerObj.name,
      },
    ]);
    setMaker("");
    setChecker("");
  };
  const handleRemoveApprover = (index) =>
    setApproverPairs((prev) => prev.filter((_, i) => i !== index));

  const handleAddVendor = () => {
    if (!selectedVendor) return toast.warn("Please select a vendor to add.");
    const vendorObj = allUsers.find((u) => u.userId == selectedVendor);
    setAssignedVendors((prev) => [
      ...prev,
      { userId: vendorObj.userId, name: vendorObj.name, gst: "", address: "" },
    ]);
    setSelectedVendor("");
  };
  const handleVendorDetailChange = (index, field, value) =>
    setAssignedVendors((prev) =>
      prev.map((vendor, i) =>
        i === index ? { ...vendor, [field]: value } : vendor
      )
    );
  const handleRemoveVendor = (index) =>
    setAssignedVendors((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (maker || checker) {
      toast.warn(
        "You have a selected Maker or Checker that has not been combined. Please click 'Combine' or clear the selection before saving."
      );
      setLoading(false);
      return;
    }

    if (!projectName || !description || !startDate || !registrationEndDate) {
      toast.error("Please fill out all project detail fields.");
      setLoading(false);
      return;
    }

    const payload = {
      projectName,
      projectDescription: description,
      startDate,
      registrationEndDate,
      approvers: approverPairs.map((p) => ({
        makerId: p.makerId,
        checkerId: p.checkerId,
      })),
      issuerIds: selectedIssuerId ? [Number(selectedIssuerId)] : [],
      vendors: assignedVendors.map((v) => ({
        userId: v.userId,
        gst: v.gst,
        address: v.address,
      })),
    };

    try {
      await api.put(`/vres/projects/${selectedProjectId}/details`, payload);
      toast.success("Project details and roles assigned successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error submitting project details:", err);
      toast.error(
        err.response?.data?.message || "Failed to save project details."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px", fontSize: "1.2em" }}>
        Loading project details...
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Define Project Details & Assign Roles</h2>
        <form onSubmit={handleSubmit}>
          {/* Project Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>1. Project Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.fullWidth}>
                <label style={styles.label}>Project Name</label>
                <input
                  style={styles.input}
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              <div style={styles.fullWidth}>
                <label style={styles.label}>Project Description</label>
                <textarea
                  style={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Project Start Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Registration End Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={registrationEndDate}
                  onChange={(e) => setRegistrationEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Departments Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              2. Departments (Maker & Checker)
            </h3>
            <div style={styles.dropdownGroup}>
              <select
                style={styles.select}
                value={maker}
                onChange={(e) => setMaker(e.target.value)}
              >
                <option value="">-- Select Maker --</option>
                {availableUsers
                  .filter((u) => u.userId != checker)
                  .map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.name}
                    </option>
                  ))}
              </select>
              <select
                style={styles.select}
                value={checker}
                onChange={(e) => setChecker(e.target.value)}
              >
                <option value="">-- Select Checker --</option>
                {availableUsers
                  .filter((u) => u.userId != maker)
                  .map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={handleAddApproverPair}
              >
                Combine
              </button>
            </div>
            <div style={styles.tagContainer}>
              {approverPairs.map((pair, index) => (
                <div style={styles.tag} key={index}>
                  {pair.makerName} & {pair.checkerName}
                  <span
                    style={styles.removeBtn}
                    onClick={() => handleRemoveApprover(index)}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Issuers Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>3. Issuer</h3>
            {/* --- THIS IS THE ONLY LINE THAT CHANGED --- */}
            <select
              value={selectedIssuerId}
              onChange={handleIssuerChange}
              style={styles.input}
            >
              <option value="">-- Select an Issuer --</option>
              {availableUsers.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Vendors Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>4. Vendors</h3>
            <div style={styles.dropdownGroup}>
              <select
                style={styles.select}
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
              >
                <option value="">-- Select a Vendor to Add --</option>
                {availableUsers.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={handleAddVendor}
              >
                Add Vendor
              </button>
            </div>
            <div>
              {assignedVendors.map((vendor, index) => (
                <div key={vendor.userId} style={styles.vendorRow}>
                  <strong style={{ minWidth: "150px" }}>{vendor.name}</strong>
                  <input
                    style={styles.input}
                    placeholder="GST Number"
                    value={vendor.gst}
                    onChange={(e) =>
                      handleVendorDetailChange(index, "gst", e.target.value)
                    }
                    required
                  />
                  <input
                    style={styles.input}
                    placeholder="Address"
                    value={vendor.address}
                    onChange={(e) =>
                      handleVendorDetailChange(index, "address", e.target.value)
                    }
                    required
                  />
                  <span
                    style={{ ...styles.removeBtn, fontSize: "20px" }}
                    onClick={() => handleRemoveVendor(index)}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Saving..." : "Save Project & Assign Roles"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    padding: "20px",
  },
  container: {
    width: "90%",
    maxWidth: "800px",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
  },
  title: { textAlign: "center", color: "#007bff", marginBottom: "24px" },
  section: {
    marginBottom: "25px",
    paddingBottom: "25px",
    borderBottom: "1px solid #e9ecef",
  },
  sectionTitle: { color: "#495057", marginBottom: "15px" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  fullWidth: { gridColumn: "1 / -1" },
  label: { display: "block", marginBottom: "8px", fontWeight: "bold" },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    minHeight: "80px",
    resize: "vertical",
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
  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "15px",
  },
  tag: {
    backgroundColor: "#e9ecef",
    borderRadius: "16px",
    padding: "6px 12px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.9em",
  },
  removeBtn: {
    marginLeft: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#dc3545",
  },
  dropdownGroup: { display: "flex", gap: "10px", alignItems: "center" },
  select: {
    flex: 1,
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    backgroundColor: "white",
  },
  vendorRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  multiSelect: {
    width: "100%",
    height: "150px",
    padding: "5px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
  },
};

export default CreateProjectPage;
