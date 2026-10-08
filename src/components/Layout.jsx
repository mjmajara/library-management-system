import { useState, useRef, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, isError });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="app-layout">
        <aside className="sidebar">
          <h1>vilage Library</h1>
          <nav className="side-nav">
            <NavLink to="/" end className="tab-btn">Dashboard</NavLink>
            <NavLink to="/books" className="tab-btn">Book Management</NavLink>
            <NavLink to="/transactions" className="tab-btn">Transactions</NavLink>
            {user.role === "admin" && (
              <NavLink to="/users" className="tab-btn">User Management</NavLink>
            )}
          </nav>
          <div className="sidebar-footer">
            <span>{user.name} ({user.role})</span>
            <button className="btn btn-danger btn-small" onClick={handleLogout}>Log out</button>
          </div>
        </aside>

        <div className="content-area">
          <Outlet context={{ showToast }} />
        </div>
      </div>

      {toast && (
        <div className="toast" style={toast.isError ? { background: "var(--danger)" } : undefined}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
