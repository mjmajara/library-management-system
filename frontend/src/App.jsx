import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import BookManagement from './pages/BookManagement';
import Transactions from './pages/Transactions';
import UserManagement from './pages/UserManagement';
import { AuthProvider } from './context/AuthContext';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>404 - Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        The page you requested does not exist in the library management system.
      </p>
      <a href="/" className="btn btn-primary">
        Return to Dashboard
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/books" element={<BookManagement />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
