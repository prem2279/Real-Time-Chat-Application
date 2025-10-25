import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles/Signup.css";
import { FiUser, FiLock, FiMail } from 'react-icons/fi';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);
        try {
            const result = await authService.signup(username, password, email);
            if (result.success) {
                setMessage('Account Created Successfully! Please Login.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setMessage(error.message || 'Signup failed, please try again');
            console.error('Signup failed', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join the conversation today</p>
                </div>
                <form onSubmit={handleSignUp} className="auth-form">
                    <div className="input-group">
                        <FiUser className="input-icon" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={20}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={50} // Increased email length
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            maxLength={20}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit"
                            disabled={!username.trim() || !email.trim() || !password.trim() || isLoading}
                            className="auth-btn"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                    {message && (
                        <p className={`auth-message ${message.includes('Success') ? 'success' : 'error'}`}>
                            {message}
                        </p>
                    )}
                </form>
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Signup;