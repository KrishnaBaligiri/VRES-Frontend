import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api'; // <-- 1. IMPORT our central 'api' instance

const ResetPasswordPage = () => { // <-- 2. REMOVED the 'apiBaseUrl' prop
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');
    
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        const toastId = toast.loading("Resetting your password...");
        
        try {
            // --- 3. UPDATED to use 'api' and a relative path ---
            const response = await api.post('/vres/auth/reset-password', { 
                email, 
                otp, 
                newPassword: password 
            });

            if (response.status === 200) {
                toast.update(toastId, { render: "Password has been reset successfully!", type: "success", isLoading: false, autoClose: 3000 });
                navigate('/login'); 
            } else {
                const errorText = response.data?.message || "Invalid or expired OTP.";
                toast.update(toastId, { render: errorText, type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            console.error("Reset password API error:", error);
            const errorMessage = error.response?.data || "An error occurred. Please try again.";
            toast.update(toastId, { render: errorMessage, type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    return (
        <div className="login-page"> 
            <div className="login-card"> 
                <h2 className="page-title">Create New Password</h2>
                <p className="page-subtitle">An OTP has been sent to <b>{email}</b>.</p>
                <form onSubmit={handleSubmit} className="form-grid">
                    
                    <div className="form-group full-width">
                        <label htmlFor="otp" className="form-label">OTP</label>
                        <input
                            type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter the 6-digit code" required />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="password" className="form-label">New Password</label>
                        <input
                            type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your new password" required />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                        <input
                            type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password" required />
                    </div>

                    <div className="button-group full-width">
                        <button type="submit" className="btn btn-primary">Reset Password</button>
                    </div>

                    <div className="form-footer" style={{ marginTop: "10px" }}>
                        <Link to="/login" className="link-forgot">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;