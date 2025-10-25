import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import '../styles/Navbar.css';
import { FiMessageSquare, FiLogIn, FiUserPlus, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = isAuthenticated ? authService.getCurrentUser() : null;

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate("/login");
        }
        catch (error) {
            console.error("Logout failed", error);
            localStorage.clear();
            navigate("/login");
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <FiMessageSquare className="navbar-logo" />
                    ChatApp
                </Link>

                <div className="navbar-menu">
                    {isAuthenticated && currentUser ? (
                        <>
                            <Link to="/chatarea" className="navbar-link">
                                Chat
                            </Link>
                            <div className="navbar-user">
                                <span className="user-info">
                                    Welcome, {currentUser.username}
                                </span>
                                <button className="logout-btn" onClick={handleLogout} title="Logout">
                                    <FiLogOut />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link icon-link">
                                <FiLogIn />
                                <span>Login</span>
                            </Link>
                            <Link to="/signup" className="navbar-link icon-link primary-link">
                                <FiUserPlus />
                                <span>Sign Up</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;