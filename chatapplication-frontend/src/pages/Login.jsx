import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles/Login.css";
import { FiUser, FiLock } from 'react-icons/fi';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);
        try {
            const result = await authService.login(username, password);
            if (result.success) {
                setMessage('Login Successful');
                setTimeout(() => {
                    navigate('/chatarea');
                }, 1500); // Shorter wait
            }
        } catch (error) {
            setMessage(error.message || 'Login Failed, Please try again');
            console.error('Login Failed', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1>Welcome Back!</h1>
                    <p>Login to continue the conversation</p>
                </div>
                <form className="auth-form" onSubmit={handleLogin}>
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
                    <button className="auth-btn" type="submit" disabled={!username || !password || isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    {message && (
                        <p className={`auth-message ${message.includes('Successful') ? 'success' : 'error'}`}>
                            {message}
                        </p>
                    )}
                </form>
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;