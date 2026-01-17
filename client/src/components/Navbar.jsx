import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">📚 ConferenceHub</Link>

            <div className="navbar-nav">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                    Dashboard
                </Link>
                <Link to="/conferences" className={`nav-link ${isActive('/conferences') ? 'active' : ''}`}>
                    Conferences
                </Link>

                {user?.role === 'AUTHOR' && (
                    <Link to="/papers" className={`nav-link ${isActive('/papers') ? 'active' : ''}`}>
                        My Papers
                    </Link>
                )}

                {user?.role === 'REVIEWER' && (
                    <Link to="/reviews" className={`nav-link ${isActive('/reviews') ? 'active' : ''}`}>
                        My Reviews
                    </Link>
                )}

                {user?.role === 'ORGANIZER' && (
                    <Link to="/papers" className={`nav-link ${isActive('/papers') ? 'active' : ''}`}>
                        All Papers
                    </Link>
                )}

                <div className="user-info">
                    <span className="user-badge">{user?.role}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>
                    <button onClick={logout} className="btn btn-secondary btn-sm">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
