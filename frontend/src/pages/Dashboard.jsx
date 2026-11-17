import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  Users, 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Filter,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import BookList from '../components/BookList';
import EditBookModal from '../components/EditBookModal';
import AlertNotification from '../components/AlertNotification';
import { booksApi, transactionsApi } from '../services/api';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalCopiesAvailable: 0,
    lowStockCount: 0,
    totalUsers: 0,
    totalBorrowedCopies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [editingBook, setEditingBook] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, statsRes] = await Promise.all([
        booksApi.getAll({ search, genre: selectedGenre, lowStock: onlyLowStock }),
        transactionsApi.getStats(),
      ]);

      setBooks(booksRes.data || []);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedGenre, onlyLowStock]);

  const handleEdit = (book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  const handleBookUpdated = (updatedBook, message) => {
    setToast({ type: 'success', text: message });
    loadData();
  };

  const handleDelete = async (book) => {
    if (window.confirm(`Are you sure you want to remove "${book.title}" from library inventory?`)) {
      try {
        await booksApi.delete(book.id);
        setToast({ type: 'success', text: `"${book.title}" successfully deleted.` });
        loadData();
      } catch (err) {
        setToast({ type: 'danger', text: err.message || 'Failed to delete book.' });
      }
    }
  };

  const handleQuickTransact = (book) => {
    navigate('/transactions', { state: { selectedBookId: book.id } });
  };

  const genres = ['All', ...new Set(books.map((b) => b.genre).filter(Boolean))];

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
          <h1 className="page-title">Library Overview &amp; Stock Availability</h1>
          <p className="page-subtitle">
            Real-time book inventory tracking, availability status, and borrowing metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm" title="Refresh dashboard data">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <Link to="/books" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>Add New Book</span>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Book Titles"
          value={stats.totalTitles}
          subtext="Catalogued in library"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          label="Available Copies"
          value={stats.totalCopiesAvailable}
          subtext="Ready for borrowing"
          icon={Layers}
          color="emerald"
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats.lowStockCount}
          subtext="Fewer than 2 copies left"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          label="Registered Members"
          value={stats.totalUsers}
          subtext="Active library accounts"
          icon={Users}
          color="cyan"
        />
      </div>

      {stats.lowStockCount > 0 && (
        <div className="alert-banner warning">
          <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
          <div className="alert-banner-content">
            <div className="alert-banner-title">
              Attention: {stats.lowStockCount} Book(s) have Low Stock (&lt; 2 copies)!
            </div>
            <div className="alert-banner-desc">
              These titles are either out of stock or close to depletion. Consider restocking from suppliers or following up on returns.
            </div>
          </div>
          <button
            onClick={() => setOnlyLowStock((prev) => !prev)}
            className="btn btn-warning btn-sm"
            style={{ flexShrink: 0 }}
          >
            {onlyLowStock ? 'Show All Books' : 'Filter Low Stock Only'}
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <BookOpen size={20} className="text-primary" />
            <span>Current Book Availability</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              ({books.length} {books.length === 1 ? 'title' : 'titles'} listed)
            </span>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View:</span>
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              title="Table Layout"
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              title="Card Grid Layout"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="controls-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, author, or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Filter size={15} color="var(--text-muted)" />
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.45rem 0.8rem' }}
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g === 'All' ? 'All Genres' : g}
                    </option>
                  ))}
                </select>
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: onlyLowStock ? '#b45309' : 'var(--text-secondary)',
                  background: onlyLowStock ? '#fef3c7' : 'var(--bg-subtle)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${onlyLowStock ? '#fde68a' : 'var(--border-light)'}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyLowStock}
                  onChange={(e) => setOnlyLowStock(e.target.checked)}
                />
                <span>Low Stock (&lt; 2)</span>
              </label>
            </div>
          </div>

          <BookList
            books={books}
            loading={loading}
            viewMode={viewMode}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onQuickTransact={handleQuickTransact}
          />
        </div>
      </div>

      <EditBookModal
        book={editingBook}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onBookUpdated={handleBookUpdated}
      />
    </div>
  );
}
