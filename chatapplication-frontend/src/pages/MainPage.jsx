import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css";
import { FiMessageSquare, FiUsers, FiLock, FiArrowRight } from 'react-icons/fi';

const MainPage = () => {
    const navigate = useNavigate();
    const handleGettingStarted = () => {
        navigate('/signup');
    }
    const handleLearnMore = () => {
        window.open('https://www.linkedin.com/in/prem-g-5083391a6/', '_blank');
    }

    return (
        <div className="mainpage-wrapper">
            {/* --- Hero Section --- */}
            <div className="mainpage-container">
                <h1 className="mainpage-title">
                    Connect Instantly. <br /> Chat Seamlessly.
                </h1>
                <p className="mainpage-subtitle">
                    Welcome to a real-time chat application built for speed, security, and connection.
                    Join the conversation today.
                </p>
                <div className="mainpage-buttons">
                    <button className="btn primary-btn" onClick={handleGettingStarted}>
                        Get Started <FiArrowRight className="btn-icon" />
                    </button>
                    <button className="btn secondary-btn" onClick={handleLearnMore}>
                        Learn More
                    </button>
                </div>
            </div>

            {/* --- Features Section --- */}
            <div className="features-container">
                <h2>Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <FiMessageSquare className="feature-icon" />
                        <h3>Real-Time Chat</h3>
                        <p>Engage in public group conversations that are instant, fast, and reliable. See who's typing and get messages immediately.</p>
                    </div>
                    <div className="feature-card">
                        <FiLock className="feature-icon" />
                        <h3>Private Messaging</h3>
                        <p>Click on any user to open a secure, one-on-one chat window. All your private conversations, all in one place.</p>
                    </div>
                    <div className="feature-card">
                        <FiUsers className="feature-icon" />
                        <h3>Online Presence</h3>
                        <p>Instantly see who's online and who's offline with a clear status indicator. Know who's available to chat right now.</p>
                    </div>
                </div>
            </div>

            {/* --- Footer --- */}
            <footer className="mainpage-footer">
                <p>© 2025 | Developed by Prem</p>
            </footer>
        </div>
    );
};

export default MainPage;