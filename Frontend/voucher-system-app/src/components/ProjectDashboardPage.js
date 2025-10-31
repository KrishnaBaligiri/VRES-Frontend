import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api"; 

// =============================================================================
// 1. Constants and Colors
// =============================================================================

const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#E0BBE4", "#957DAD"]; 
// API endpoints (from your VRES context)
const DASHBOARD_API_BASE = "/vres/dashboard/project/"; 
const PROJECT_LIST_API = "/vres/projects";

// =============================================================================
// 2. Sortable Table Logic & Component (Unchanged)
// =============================================================================

/**
 * Custom hook for sorting data in a table.
 */
const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Helper to safely get nested values or 'N/A'
        const getValue = (obj, key) => key.split('.').reduce((o, i) => (o && o[i] !== undefined ? o[i] : 'N/A'), obj);

        const aValue = getValue(a, sortConfig.key);
        const bValue = getValue(b, sortConfig.key);

        // Simple string comparison for sorting
        if (String(aValue).toLowerCase() < String(bValue).toLowerCase()) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (String(aValue).toLowerCase() > String(bValue).toLowerCase()) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};


/**
 * Reusable table component with filtering and sorting capabilities.
 */
const SortableTable = ({ title, data, columns }) => {
  const { items, requestSort, sortConfig } = useSortableData(data);
  const [filterText, setFilterText] = useState('');

  if (!data || data.length === 0) return (
    <div style={styles.tableContainer}>
      <h3 style={styles.tableTitle}>{title} (0 of 0)</h3>
      <p style={{textAlign: 'center', color: '#999'}}>No data available for this table.</p>
    </div>
  );

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  // Filtering logic: checks filter text against all visible column values
  const filteredItems = items.filter(item => 
    columns.some(col => {
      const key = col.key;
      let val = col.render ? col.render(item) : (key.includes('.') 
        ? key.split('.').reduce((o, i) => (o ? o[i] : null), item) 
        : item[key]);

      // Normalize value for string comparison, handling React elements via .props.children
      if (typeof val !== 'string' && val !== null && val !== undefined) {
        // If 'val' is a React element, try to get its string content
        val = String(val.props?.children?.props?.children || val.props?.children || val); 
      }
      
      return val && String(val).toLowerCase().includes(filterText.toLowerCase());
    })
  );

  return (
    <div style={styles.tableContainer}>
      <h3 style={styles.tableTitle}>{title} ({filteredItems.length} of {data.length})</h3>
      <input
        type="text"
        placeholder={`Filter ${title}...`}
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={styles.filterInput}
      />
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeaderGroup}>
            <tr style={styles.tableHeaderRow}>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  onClick={() => requestSort(col.key)}
                  style={{...styles.tableHeaderCell, cursor: 'pointer'}}
                >
                  {col.label}
                  <span style={{ marginLeft: '5px' }}>
                    {getClassNamesFor(col.key) === 'ascending' ? ' ▲' : 
                      getClassNamesFor(col.key) === 'descending' ? ' ▼' : ''}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, i) => (
              <tr key={item.id || item.beneficiaryId || item.userId || i} style={i % 2 === 0 ? styles.tableEvenRow : styles.tableOddRow}>
                {columns.map(col => (
                  <td key={col.key} style={styles.tableDataCell}>
                    {col.render ? col.render(item) : col.key.includes('.') 
                      ? col.key.split('.').reduce((o, i) => (o ? o[i] : 'N/A'), item) || 'N/A'
                      : item[col.key] || 'N/A'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// =============================================================================
// 3. Helper Components (MetricCard, ChartBox, ProjectDetailsCard)
// =============================================================================

const ChartBox = ({ title, data, colors }) => (
  <div style={styles.chartBox}>
    <h3 style={styles.tableTitle}>{title}</h3>
    {data && data.some(d => d.value > 0) ? (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Count']} />
          <Legend layout="horizontal" align="center" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
      ) : (
        <p style={{textAlign: 'center', color: '#999'}}>No data available for this chart.</p>
      )}
  </div>
);

/**
 * Card component for displaying project voucher details.
 */
const ProjectDetailsCard = ({ title, value, unit }) => (
  <div style={styles.detailBox}>
    <p style={styles.detailTitle}>{title}</p>
    <p style={styles.detailValue}>{value} {unit}</p>
  </div>
);


// =============================================================================
// 4. Main Dashboard Component (ProjectDashboardPage)
// =============================================================================

// Helper to style the voucher status
const getVoucherStatusDisplay = (status) => {
  switch (status) {
    case 'REDEEMED':
      return { text: 'Redeemed', color: '#dc3545' }; // Red
    case 'ISSUED':
      return { text: 'Issued', color: '#007bff' }; // Blue
    case 'EXPIRED':
      return { text: 'Expired', color: '#6c757d' }; // Gray
    case 'ACTIVE': // Assuming an 'ACTIVE' status for unredeemed
      return { text: 'Active', color: '#28a745' }; // Green
    case 'NOT_ISSUED': // Custom status for Beneficiaries without vouchers
      return { text: 'Not Issued', color: '#ffc107' }; // Yellow
    default:
      return { text: status || 'N/A', color: '#ffc107' }; // Yellow for other/N/A
  }
};

// ⭐ ProjectDashboardPage now receives currentUser via props
const ProjectDashboardPage = ({ currentUser }) => {
  // Access user data from props
  const userAssignedProjects = currentUser?.projects || [];
  const role = currentUser?.role;

  // State to hold the full list of projects from the API before filtering
  const [allProjectsFromAPI, setAllProjectsFromAPI] = useState([]); 

  const [projects, setProjects] = useState([]);
  // ⭐ Initial state uses the currently selected project ID from the user state
  const [selectedProject, setSelectedProject] = useState(currentUser?.selectedProjectId || "");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch ALL project list from the API once
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetches ALL projects (API should ideally handle security/filtering)
        const res = await api.get(PROJECT_LIST_API);
        setAllProjectsFromAPI(res.data);
      } catch (err) {
        setError("Failed to load project list: " + err.message);
      }
    };
    fetchProjects();
  }, []); 

  // 1b. Apply RBAC filtering whenever API data loads or user role changes
  useEffect(() => {
    // If we haven't loaded API projects, wait.
    if (allProjectsFromAPI.length === 0) return;

    let projectsToDisplay = allProjectsFromAPI;

    // ⭐ RBAC Logic: Filter if the user is a Project Coordinator
    if (role === 'PROJECT COORDINATOR') {
      // Map the project IDs from the user's assigned projects (login response)
      const assignedProjectIds = userAssignedProjects.map(p => p.projectId);
      
      // Filter the full list (allProjectsFromAPI) down to assigned projects
      projectsToDisplay = allProjectsFromAPI.filter(project => 
        assignedProjectIds.includes(project.projectId)
      );
    } 
    // If role is ADMIN, projectsToDisplay remains the full list (allProjectsFromAPI).

    setProjects(projectsToDisplay);

    // If the selected project is no longer in the valid list, clear selection
    if (selectedProject && !projectsToDisplay.find(p => p.projectId.toString() === selectedProject.toString())) {
      setSelectedProject("");
    }

  // Dependencies: Re-run when API data loads, or the user's role/assigned list changes
  }, [allProjectsFromAPI, userAssignedProjects, role, selectedProject]); // Added selectedProject dependency to prevent endless loop if selectedProject is cleared.


  // 2. Fetch project dashboard data when a project is selected (Unchanged logic)
  useEffect(() => {
    if (!selectedProject) {
      setDashboardData(null); 
      return;
    }

    const fetchDashboardDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await api.get(`${DASHBOARD_API_BASE}${selectedProject}`);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError(`Failed to load dashboard details for Project ID ${selectedProject}.`); 
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardDetails();
  }, [selectedProject]);


  // --- Data Preparation (Unchanged) ---
  const voucherChartData = useMemo(() => dashboardData ? [
    { name: "Available Vouchers", value: (dashboardData.totalVouchers || 0) - (dashboardData.totalRedemptions || 0) },
    { name: "Redeemed Vouchers", value: dashboardData.totalRedemptions || 0 },
  ] : [], [dashboardData]);

  const beneficiaryChartData = useMemo(() => dashboardData ? [
    { name: "Approved Beneficiaries", value: dashboardData.approvedBeneficiaries || 0 },
    // Calculate pending beneficiaries
    { name: "Pending Beneficiaries", value: (dashboardData.totalBeneficiaries || 0) - (dashboardData.approvedBeneficiaries || 0) },
  ] : [], [dashboardData]);

  // Extract Project-wide Voucher Details
  const projectVoucherDetails = useMemo(() => {
    // We try to pull the project details from any voucher in the list, 
    // but the backend API should ideally return project details directly.
    const firstVoucher = dashboardData?.vouchersList?.[0];
    const project = firstVoucher?.project;

    return {
      points: project?.voucher_points || 'N/A',
      validFrom: project?.voucher_valid_from ? new Date(project.voucher_valid_from).toLocaleDateString() : 'N/A',
      validTill: project?.voucher_valid_till ? new Date(project.voucher_valid_till).toLocaleDateString() : 'N/A',
    };
  }, [dashboardData]);


  // --- Table Column Definitions (Unchanged) ---

  const beneficiaryColumns = useMemo(() => {
    
    // Helper function to find the voucher status and object for a given beneficiary ID
    const getVoucherDetailsForBeneficiary = (beneficiaryId, vouchersList) => {
      if (!vouchersList || vouchersList.length === 0) return { status: 'NOT_ISSUED', voucher: null };
      
      // Find the voucher associated with this beneficiary
      const voucher = vouchersList.find(v => v.beneficiary && String(v.beneficiary.id) === String(beneficiaryId));

      if (voucher) {
        return { status: voucher.status || 'ISSUED', voucher: voucher }; // Include the full voucher object
      }
      return { status: 'NOT_ISSUED', voucher: null }; // Default status if no voucher found
    };
    
    return [
      { label: 'Name', key: 'name' },
      { label: 'Contact', key: 'phone' },  
      { 
        label: 'Voucher Status', 
        key: 'voucherStatus', // dummy key for sorting/filtering
        render: (item) => {
          // Use item.beneficiaryId which is the Beneficiary ID in the new structure
          const { status } = getVoucherDetailsForBeneficiary(item.beneficiaryId, dashboardData?.vouchersList);
          const { text, color } = getVoucherStatusDisplay(status);
          return (
            <span style={{ color: color, fontWeight: 'bold' }}>
              {text}
            </span>
          );
        }
      },
      // ✅ Role-Based Access Names
      { 
        label: 'Maker', 
        key: 'makerName', 
        render: (item) => item.makerName || 'N/A'
      },
      { 
        label: 'Checker', 
        key: 'checkerName',
        render: (item) => item.checkerName || 'N/A'
      },
      // ✅ Redeeming Vendor Name (Conditional)
      { 
        label: 'Redeeming Vendor', 
        key: 'vendorName',
        render: (item) => {
          const { status } = getVoucherDetailsForBeneficiary(item.beneficiaryId, dashboardData?.vouchersList);
          if (status === 'REDEEMED') {
            return item.vendorName || 'N/A';
          }
          return 'N/A'; 
        }
      },
      // ✅ Redemption Date (FIXED to use redemptionsList)
      { 
          label: 'Redeemed On', 
          key: 'redeemed_date', // dummy key for sorting/filtering
          render: (item) => {
            // 1. Find the voucher (to get the VOUCHER ID)
            const { status, voucher } = getVoucherDetailsForBeneficiary(item.beneficiaryId, dashboardData?.vouchersList);
            
            if (status !== 'REDEEMED' || !voucher) {
              return "N/A";
            }

            // 2. Find the corresponding redemption record using the VOUCHER ID
            const redemptionRecord = dashboardData?.redemptionsList.find(
                r => r.voucher && String(r.voucher.id) === String(voucher.id)
            );
            
            const redeemedDate = redemptionRecord?.redeemed_date;
            
            // 3. Display the date if found in the redemption record
            if (redeemedDate) {
              return new Date(redeemedDate).toLocaleDateString(); 
            }
            
            return "N/A";
          }
      },
    ];
  }, [dashboardData]); 

  // --- Helper Renders (Unchanged) ---
  if (loading)
    return <p style={{ textAlign: "center", marginTop: "50px", fontSize: "1.2em" }}>Loading dashboard data...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red", marginTop: "50px" }}>{error}</p>;

  return (
    <div style={styles.pageContent}>
      
      {/* Project Selection & Title Area */}
      <div style={styles.headerArea}>
        <div style={styles.projectSelector}>
          <h3>Select Project</h3>
          <select
            style={styles.select}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">-- Choose a Project --</option>
            {/* Display list of projects filtered by RBAC */}
            {projects.map((proj) => (
              <option key={proj.projectId} value={proj.projectId}>
                {/* Use 'title' or 'projectName' depending on API field name, using 'title' first as per initial code */}
                {proj.title || proj.projectName} 
              </option>
            ))}
          </select>
        </div>
      </div>

      {!dashboardData ? (
        <p style={{ fontSize: "18px", color: "#888", marginTop: "50px" }}>
          Please select a project to view its dashboard.
        </p>
      ) : (
        <div style={styles.contentWrapper}>
          
          {/* Project Voucher Details Section (NEW) */}
          <div style={styles.projectDetailsContainer}>
            <ProjectDetailsCard 
              title="Voucher Points Value" 
              value={projectVoucherDetails.points} 
              unit="Points"
            />
            <ProjectDetailsCard 
              title="Voucher Valid From" 
              value={projectVoucherDetails.validFrom} 
              unit=""
            />
            <ProjectDetailsCard 
              title="Voucher Valid Till" 
              value={projectVoucherDetails.validTill} 
              unit=""
            />
          </div>
          <hr style={styles.divider} /> {/* Added a divider for separation */}

          {/* Metrics Section (Empty in the provided snippet) */}
          <div style={styles.metricsContainer}>
          </div>


          {/* Charts Section */}
          <div style={styles.chartsContainer}>
            <ChartBox title="Voucher Status (Redeemed vs Available)" data={voucherChartData} colors={[COLORS[2], COLORS[1]]}/>
            <ChartBox title="Beneficiary Approval Status (Appr vs Pending)" data={beneficiaryChartData} colors={[COLORS[0], COLORS[3]]}/>
          </div>

          {/* Tables Section - Beneficiaries (Full Width) */}
          <div style={styles.tablesFlexContainer}>
            <SortableTable 
              title="Beneficiary Details" 
              data={dashboardData.beneficiaryList || []} 
              columns={beneficiaryColumns}
            />
          </div>
          
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 5. Inline Styles 
// =============================================================================

const styles = {
  pageContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 20px 50px",
    backgroundColor: "#f4f7fa",
    width: '100%', 
    minHeight: '100vh',
  },
  headerArea: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '0 20px',
    textAlign: 'center',
  },
  projectSelector: {
    width: "100%",
    maxWidth: "300px",
    margin: "10px 0",
  },
  select: {
    width: "100%",
    padding: "10px 15px",
    borderRadius: "6px",
    fontSize: "16px",
    border: "1px solid #ced4da",
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "1200px", 
    padding: '0 20px',
  },
  // NEW STYLES for Project Details Card
  projectDetailsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
    gap: "20px",
    width: "100%",
    marginBottom: "20px",
    padding: '10px 0',
  },
  detailBox: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    border: '1px solid #e0e0e0',
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    textAlign: "center", 
  },
  detailTitle: {
    margin: 0,
    fontSize: "0.9em",
    color: "#6c757d", // Light Gray
    fontWeight: "600",
  },
  detailValue: {
    margin: '5px 0 0 0',
    fontSize: "1.6em",
    fontWeight: "bold",
    color: "#343a40", // Dark Gray
  },
  divider: {
    width: '100%',
    border: '0',
    borderTop: '1px solid #e0e0e0',
    marginBottom: '30px',
  },
  // END NEW STYLES
  metricsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
    gap: "20px",
    width: "100%",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "15px 10px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center", 
    minHeight: "80px",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  chartsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: "30px",
    width: "100%",
    marginBottom: "30px",
  },
  chartBox: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "550px",
    minWidth: "300px",
    margin: "10px 0",
  },
  tablesFlexContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    width: '100%',
    marginBottom: '30px',
  },
  tablesFullRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: '20px',
    marginBottom: '30px',
  },
  tableContainer: {
    width: "100%",
    marginTop: "0px", 
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    flexGrow: 1,
    minWidth: '45%', 
  },
  tableWrapper: {
    overflowX: "auto", 
    maxHeight: '500px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  tableTitle: { 
    color: "#333", 
    borderBottom: "1px solid #eee",
    paddingBottom: "10px", 
    marginBottom: "15px",
    fontSize: '1.4em',
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    textAlign: "left",
  },
  tableHeaderGroup: { 
    position: 'sticky', 
    top: 0, 
    zIndex: 10,
  },
  tableHeaderRow: { 
    backgroundColor: '#007bff',
    color: "white",
  },
  tableHeaderCell: {
    padding: "12px 15px",
    fontWeight: "600",
    whiteSpace: 'nowrap',
  },
  tableEvenRow: {
    backgroundColor: "#f9f9f9",
  },
  tableOddRow: {
    backgroundColor: "white",
  },
  tableDataCell: {
    padding: "12px 15px",
    borderBottom: '1px solid #eee',
    borderRight: '1px solid #eee',
  },
  filterInput: {
    width: "100%",
    padding: "10px 15px",
    marginBottom: "20px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    boxSizing: "border-box",
    fontSize: '16px',
  }
};
export default ProjectDashboardPage;