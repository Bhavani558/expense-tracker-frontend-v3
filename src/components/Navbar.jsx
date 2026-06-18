import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/reports', label: 'Reports' },
  { to: '/budget', label: 'Budget Goals' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>Expense Tracker</Link>
      <div style={styles.links}>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...styles.link, ...(location.pathname === l.to ? styles.active : {}) }}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <button onClick={handleLogout} style={styles.logout}>Logout</button>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    background: '#2563eb',
    padding: '0 24px',
    height: 56,
    gap: 8,
  },
  brand: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 18,
    textDecoration: 'none',
    marginRight: 24,
    whiteSpace: 'nowrap',
  },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
  },
  active: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
  logout: {
    background: '#fff',
    color: '#2563eb',
    border: 'none',
    borderRadius: 6,
    padding: '6px 16px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
};
