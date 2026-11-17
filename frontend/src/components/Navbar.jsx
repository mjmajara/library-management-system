import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  BookMarked, 
  ArrowLeftRight, 
  Users, 
  Database, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { systemApi } from '../services/api';

export default function Navbar() {
  const { currentUser, logout, isAuthenticated, isAdmin } = useAuth();
  const [dbInfo, setDbInfo] = useState({ engine: 'connecting...', host: '' });
  const navigate = useNavigate();

  useEffect(() => {
    systemApi.getHealth()
      .then((res) => {
        if (res && res.database) {
          setDbInfo(res.database);
        }
      })
      .catch(() => {
        setDbInfo({ engine: 'Offline', host: '' });
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/users');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <div className="nav-logo-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="nav-brand-title">LibriTrack</div>
            <div className="nav-brand-subtitle">Library & Inventory System</div>
          </div>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/books" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <BookMarked size={18} />
                <span>Book Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/transactions" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <ArrowLeftRight size={18} />
                <span>Transactions</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Users size={18} />
                <span>User Management</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="nav-actions">
          <div className="db-badge" title={`Connected to ${dbInfo.engine.toUpperCase()} database`}>
            <span className="db-indicator-dot" />
            <Database size={12} />
            <span>DB: {dbInfo.engine.toUpperCase()}</span>
          </div>

          {isAuthenticated ? (
            <div className="user-profile-pill">
              <div className="user-avatar-circle">
                {isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', display: 'block', lineHeight: 1.2 }}>
                  {currentUser.name}
                </strong>
                <span className={`role-badge ${currentUser.role}`}>
                  {currentUser.role} • {currentUser.membership_id}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-icon-only"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '0.25rem' }}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/users" className="btn btn-secondary btn-sm">
              <LogIn size={15} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
