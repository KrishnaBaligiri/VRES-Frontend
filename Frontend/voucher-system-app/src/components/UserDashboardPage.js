import React, { useState, useEffect, useCallback } from 'react'; 
import api from '../api'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = '/vres/users';

/**
 * UserDashboardPage component displays all system users and includes
 * functionality to view and edit user details in a modal.
 */
const UserDashboardPage = () => {
    const navigate = useNavigate(); 
    
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- 1. Fetch All Users for Dashboard (Wrapped in useCallback) ---
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`${API_BASE_URL}/dashboard`);
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching user dashboard data:", err);
            setError("Failed to load user data. Ensure the backend is running and the /dashboard endpoint is correct.");
            toast.error("Failed to load user data.");
            
            // Optional: If auth fails, redirect to login
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]); 

    useEffect(() => {
        fetchDashboardData(); 
    }, [fetchDashboardData]); 

    // --- Filtering Logic (Kept) ---
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    // --- Helper Function to Render Assignments (Enhanced Styles) ---
    const renderAssignments = (assignments) => {
        if (!assignments || assignments.length === 0) {
            return <span className="badge bg-secondary-subtle text-secondary fw-normal">None</span>;
        }
        
        return (
            <div style={{ fontSize: '0.85rem' }}>
                {assignments.map((assignment, index) => (
                    <div key={index} className="mb-1">
                        <span className="badge bg-primary me-2 fw-normal">{assignment.roleName}</span>
                        <span className="text-muted small">({assignment.projectName})</span>
                    </div>
                ))}
            </div>
        );
    };

    // --- Helper Function to Get Primary Role (Enhanced Styles) ---
    const getPrimaryRole = (assignments) => {
        if (!assignments || assignments.length === 0) {
            return <span className="text-muted fst-italic small">No Role</span>;
        }
        // Use a distinct badge style for the primary role
        return <span className="badge bg-info text-dark fw-bold p-2">{assignments[0].roleName}</span>;
    };

    // --- Render States (Kept) ---
    if (isLoading) {
        return <div className="container mt-5"><div className="alert alert-info">Loading user data...</div></div>;
    }

    if (error) {
        return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4 text-primary">👥 VRES User Dashboard <span className="text-muted fs-5">| System Users</span></h2>
            <p className="text-muted">
                <i className="bi bi-info-circle me-1"></i> 
                Overview of all registered users and their project/role assignments. <span className="fw-bold">Total Users:</span> {users.length}
            </p>

            {/* Search/Filter Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="Search by Name, Email, or Phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* User Table wrapped in a Card for visual grouping */}
            <div className="card shadow-lg mb-4 border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            {/* UPDATED: Applying bg-primary and text-white to the header */}
                            <thead className="bg-primary text-white">
                                <tr>
                                    <th style={{ width: '5%' }} className="text-center border-0">ID</th>
                                    <th style={{ width: '15%' }} className="border-0"><i className="bi bi-person-fill me-1"></i> Name</th>
                                    <th style={{ width: '15%' }} className="border-0"><i className="bi bi-at me-1"></i> Email</th>
                                    <th style={{ width: '10%' }} className="border-0"><i className="bi bi-telephone-fill me-1"></i> Phone</th>
                                    <th style={{ width: '10%' }} className="border-0"><i className="bi bi-briefcase-fill me-1"></i> Role</th> 
                                    <th style={{ width: '25%' }} className="border-0"><i className="bi bi-link-45deg me-1"></i> Assignments</th>
                                    <th style={{ width: '20%' }} className="border-0"><i className="bi bi-building-fill me-1"></i> Vendor Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="text-center text-muted small">{user.id}</td>
                                        <td className="fw-semibold">{user.name}</td>
                                        <td>{user.email}</td>
                                        
                                        <td>{user.phone || <span className="text-muted fst-italic">N/A</span>}</td> 
                                        
                                        <td> 
                                            {getPrimaryRole(user.assignments)}
                                        </td>

                                        <td className="small">
                                            {renderAssignments(user.assignments)}
                                        </td>
                                        <td className="small">
                                            <div><span className="fw-bold text-dark">GST:</span> {user.vendorGst || 'N/A'}</div>
                                            <div className="text-wrap"><span className="fw-bold text-dark">Address:</span> {user.vendorAddress || 'N/A'}</div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        {/* Colspan is 7 */}
                                        <td colSpan="7" className="text-center text-muted py-3">
                                            <i className="bi bi-search me-2"></i> No users match your criteria.
                                        </td> 
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;