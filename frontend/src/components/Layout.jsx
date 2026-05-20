import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Team<span>Tasks</span>
        </Link>
        <nav>
          <Link to="/">Projects</Link>
        </nav>
        <div className="user-menu">
          <span>{user?.name}</span>
          <button type="button" onClick={handleLogout} className="btn btn-ghost">
            Logout
          </button>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
