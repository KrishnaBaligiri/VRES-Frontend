import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api'; // Use central api instance

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Sending request...");

        try {
            // Use 'api' and a relative path
            const response = await api.post('/vres/auth/forgot-password', { // eslint-disable-line no-unused-vars
                email: email
            });

            // --- FIX: Log the response to satisfy ESLint ---
            console.log("Forgot password response:", response);
            // --- END FIX ---

            // Assuming your backend now only sends OTP if user exists,
            // a 200 OK means OTP was sent (or at least attempted).
            // We show a generic success message now as the backend won't throw an error for non-existent users.
            toast.update(toastId, { render: "OTP request sent! Check your email if the account exists.", type: "success", isLoading: false, autoClose: 3000 });

            // Navigate to reset page regardless, let reset page handle invalid OTP/email
            navigate(`/reset-password?email=${email}`);

        } catch (error) {
            console.error("Forgot password API error:", error); // Log the full error object

            // Updated error handling
            let displayMessage = "An error occurred. Please try again later."; // Default

            if (error.response && error.response.data && error.response.data.message) {
                 // Use the specific message from the backend (e.g., if backend *does* throw an error unexpectedly)
                displayMessage = error.response.data.message;
            }
            // Add specific check for 404 from GlobalExceptionHandler (if backend throws it)
             else if (error.response && error.response.status === 404) {
                 displayMessage = "User not found with that email address.";
             }
            else if (error.message) {
                // Network errors
                displayMessage = `Request failed: ${error.message}`;
            }

            toast.update(toastId, { render: displayMessage, type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="page-title">Forgot Password</h2>
                <p className="page-subtitle">Enter your email address to receive a verification code.</p>
                <form onSubmit={handleSubmit} className="form-grid">

                    <div className="form-group full-width">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            className="form-input"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="button-group full-width">
                        <button type="submit" className="btn btn-primary">Send OTP</button>
                    </div>

                    <div className="form-footer" style={{ marginTop: "10px" }}>
                        <Link to="/login" className="link-forgot">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;