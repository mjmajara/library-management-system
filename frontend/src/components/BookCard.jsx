import React from 'react';
import { BookOpen, Edit2, Trash2, ArrowLeftRight } from 'lucide-react';
import LowStockBadge from './LowStockBadge';

export default function BookCard({ book, onEdit, onDelete, onQuickTransact }) {
  const isLowStock = book.available_quantity < 2 && book.available_quantity > 0;
  const isOutOfStock = book.available_quantity <= 0;

  let cardModifier = '';
  if (isOutOfStock) cardModifier = 'out-of-stock-card';
  else if (isLowStock) cardModifier = 'low-stock-card';

  return (
    <div className={`book-card ${cardModifier}`}>
      <div>
        <div className="book-card-top">
          <span className="genre-pill">{book.genre}</span>
          <LowStockBadge availableQuantity={book.available_quantity} />
        </div>

        <h4 className="book-card-title">{book.title}</h4>
        <div className="book-card-author">by {book.author}</div>

        <div className="book-card-meta">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>ISBN: </span>
            <span className="isbn-code">{book.isbn}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Stock Status: </span>
            <strong>{book.available_quantity}</strong> of {book.initial_quantity} available
          </div>
        </div>
      </div>

      <div className="book-card-actions">
        {onQuickTransact && (
          <button
            onClick={() => onQuickTransact(book)}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            title="Perform stock borrow or restock"
          >
            <ArrowLeftRight size={14} />
            <span>Transact</span>
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(book)}
            className="btn btn-secondary btn-sm"
            title="Edit book details"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(book)}
            className="btn btn-danger btn-sm"
            title="Delete this book"
          >
          </button>
        )}
      </div>
    </div>
  );
}
