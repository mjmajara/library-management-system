import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('libritrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('libritrack_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('libritrack_user');
    }
  }, [currentUser]);

  const login = async (membershipId, requestedRole = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.login({ membership_id: membershipId, role: requestedRole });
      setCurrentUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role = 'admin') => {
    if (role === 'admin') {
      const adminUser = {
        id: 1,
        name: 'MAPHIKE MAJARA (Admin)',
        membership_id: 'MJ-77',
        role: 'admin',
        email: 'MJ.admin@library.COM',
        status: 'active',
      };
      setCurrentUser(adminUser);
      return adminUser;
    } else {
      const memberUser = {
        id: 2,
        name: 'RETSHEPILE RALETING (Member)',
        membership_id: 'ACE-77',
        role: 'member',
        email: 'ACE.MEM@LIB.COM',
        status: 'active',
      };
      setCurrentUser(memberUser);
      return memberUser;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('libritrack_user');
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        login,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
