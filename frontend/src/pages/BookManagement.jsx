import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import AddBookForm from '../components/AddBookForm';
import BookList from '../components/BookList';
import EditBookModal from '../components/EditBookModal';
import AlertNotification from '../components/AlertNotification';
import { booksApi } from '../services/api';

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [editingBook, setEditingBook] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [showAddForm, setShowAddForm] = useState(true);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await booksApi.getAll({ search: searchTerm, genre: selectedGenre });
      setBooks(res.data || []);
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to fetch books.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, selectedGenre]);

  const handleBookAdded = (newBook, message) => {
    setToast({ type: 'success', text: message });
    fetchBooks();
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  const handleBookUpdated = (updatedBook, message) => {
    setToast({ type: 'success', text: message });
    fetchBooks();
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${book.title}"?\nAll associated transaction history for this book will also be removed.`
    );
    if (!confirmed) return;

    try {
      await booksApi.delete(book.id);
      setToast({ type: 'success', text: `"${book.title}" has been deleted.` });
      fetchBooks();
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to delete book.' });
    }
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
          <h1 className="page-title">Book Management</h1>
          <p className="page-subtitle">
            Register new titles, update existing records, and manage library inventory.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchBooks} className="btn btn-secondary btn-sm" title="Refresh book list">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className={`btn btn-sm ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            <Plus size={15} />
            <span>{showAddForm ? 'Hide Add Form' : 'Add New Book'}</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddBookForm
          onBookAdded={handleBookAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <BookMarked size={20} className="text-primary" />
            <span>Book Inventory Records</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              ({books.length} titles in catalog)
            </span>
          </h2>
        </div>

        <div className="card-body">
          <div className="controls-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search catalog by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>
          </div>

          <BookList
            books={books}
            loading={loading}
            viewMode="table"
            onEdit={handleEdit}
            onDelete={handleDelete}
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
