import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LogIn, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  RefreshCw, 
  KeyRound, 
  User, 
  LogOut 
} from 'lucide-react';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import AlertNotification from '../components/AlertNotification';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';

export default function UserManagement() {
  const { currentUser, login, logout, demoLogin, isAuthenticated, isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [loginMembershipId, setLoginMembershipId] = useState('');
  const [loginRole, setLoginRole] = useState('all');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ search: searchTerm });
      setUsers(res.data || []);
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to fetch users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginMembershipId.trim()) {
      setLoginError('Please enter a Membership ID');
      return;
    }

    setIsLoggingIn(true);
    const result = await login(
      loginMembershipId.trim().toUpperCase(),
      loginRole === 'all' ? null : loginRole
    );
    setIsLoggingIn(false);

    if (result.success) {
      setToast({ type: 'success', text: `Welcome back, ${result.user.name}!` });
      setLoginMembershipId('');
    } else {
      setLoginError(result.message);
    }
  };

  const handleDemoLogin = (role) => {
    const user = demoLogin(role);
    setToast({ type: 'success', text: `Logged in as ${user.name} (${user.role})` });
  };

  const handleUserSaved = (user, message) => {
    setToast({ type: 'success', text: message });
    setEditingUser(null);
    setShowAddUserForm(false);
    fetchUsers();
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.name}" (${user.membership_id})?\nTransactions will be unlinked.`
    );
    if (!confirmed) return;

    try {
      await usersApi.delete(user.id);
      setToast({ type: 'success', text: `User "${user.name}" deleted successfully.` });
      fetchUsers();
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to delete user.' });
    }
  };

  return (
    <div>
      {toast && (
        <AlertNotification
          type={toast.type}
          message={toast.text}
          onClose={() => setToast(null)}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">User Management &amp; Access Control</h1>
          <p className="page-subtitle">
            User authentication portal and administrator control for managing library members and roles.
          </p>
        </div>
        <div>
          <button onClick={fetchUsers} className="btn btn-secondary btn-sm" title="Refresh user records">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span>User Log in Portal</span>
          </h2>
          {isAuthenticated && (
            <span className={`role-badge ${currentUser.role}`}>
             {currentUser.role.toUpperCase()}
            </span>
          )}
        </div>

        <div className="card-body">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isAdmin ? <ShieldCheck size={28} /> : <User size={28} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {currentUser.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Membership ID: <span className="isbn-code">{currentUser.membership_id}</span>Role:{' '}
                    <strong>{currentUser.role}</strong>  {currentUser.email || 'No email registered'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!isAdmin ? (
                  <button onClick={() => handleDemoLogin('admin')} className="btn btn-secondary btn-sm">
                    <ShieldCheck size={15} />
                    <span>Switch to Admin (MJ-77)</span>
                  </button>
                ) : (
                  <button onClick={() => handleDemoLogin('member')} className="btn btn-secondary btn-sm">
                    <User size={15} />
                    <span>Switch to Member (ACE-77)</span>
                  </button>
                )}
                <button onClick={logout} className="btn btn-danger btn-sm">
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {loginError && (
                <div className="alert-banner danger" style={{ marginBottom: '1.25rem' }}>
                  <div className="alert-banner-desc">{loginError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} style={{ maxWidth: '540px', margin: '0 auto' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-memid">
                    Enter Membership ID <span className="required">*</span>
                  </label>
                  <input
                    id="login-memid"
                    type="text"
                    placeholder="MJ-77"
                    className="form-control"
                    value={loginMembershipId}
                    onChange={(e) => setLoginMembershipId(e.target.value.toUpperCase())}
                    disabled={isLoggingIn}
                  />
                
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoggingIn}>
                    <LogIn size={16} />
                    <span>{isLoggingIn ? 'Verifying...' : 'Sign In'}</span>
                  </button>
                </div>
              </form>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-light)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Demo Credentials (Click to prefill):
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setLoginMembershipId('MJ-77')}
                    className="btn btn-secondary btn-sm"
                  >
                    <ShieldCheck size={14} />
                    <span>Admin: MJ-77 (MAPHIKE MAJARA)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMembershipId('ACE-77')}
                    className="btn btn-secondary btn-sm"
                  >
                    <User size={14} />
                    <span>Member: ACE-77 (RETSHEPILE RALETING)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span>Admin Management</span>

          </h2>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setEditingUser(null);
                setShowAddUserForm((prev) => !prev);
              }}
              className={`btn btn-sm ${showAddUserForm ? 'btn-secondary' : 'btn-primary'}`}
            >
              <UserPlus size={15} />
              <span>{showAddUserForm ? 'Close Form' : 'Add New User'}</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          {(showAddUserForm || editingUser) && (
            <div style={{ marginBottom: '2rem' }}>
              <UserForm
                initialUser={editingUser}
                onUserSaved={handleUserSaved}
                onCancel={() => {
                  setEditingUser(null);
                  setShowAddUserForm(false);
                }}
              />
            </div>
          )}

          <div className="controls-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search users by name, membership ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <UserList
            users={users}
            loading={loading}
            onEdit={(user) => {
              setEditingUser(user);
              setShowAddUserForm(false);
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            onDelete={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
}
