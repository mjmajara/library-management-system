import React from 'react';
import { Edit2, Trash2, ArrowLeftRight } from 'lucide-react';
import LowStockBadge from './LowStockBadge';
import BookCard from './BookCard';

export default function BookList({
  books = [],
  loading = false,
  onEdit,
  onDelete,
  onQuickTransact,
  viewMode = 'table',
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
        <p>Loading books from library database...</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No books found</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Try adjusting your search criteria or add a new book to the inventory.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="books-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onEdit={onEdit}
            onDelete={onDelete}
            onQuickTransact={onQuickTransact}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title &amp; Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Availability</th>
            <th>Total Stock</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => {
            const isLow = book.available_quantity < 2;
            return (
              <tr key={book.id} className={isLow ? 'highlight-low-stock' : ''}>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{book.id}</span>
                </td>
                <td>
                  <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    {book.title}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    by {book.author}
                  </span>
                </td>
                <td>
                  <span className="genre-pill">{book.genre}</span>
                </td>
                <td>
                  <span className="isbn-code">{book.isbn}</span>
                </td>
                <td>
                  <LowStockBadge availableQuantity={book.available_quantity} />
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{book.available_quantity}</span>
                  <span style={{ color: 'var(--text-muted)' }}> / {book.initial_quantity}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    {onQuickTransact && (
                      <button
                        onClick={() => onQuickTransact(book)}
                        className="btn btn-secondary btn-sm"
                        title="Stock Transaction"
                      >
                        <ArrowLeftRight size={13} />
                        <span>Transact</span>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(book)}
                        className="btn btn-secondary btn-sm"
                        title="Update Book"
                      >
                        <Edit2 size={13} />
                        <span>Update</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(book)}
                        className="btn btn-danger btn-sm"
                        title="Delete Book"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
