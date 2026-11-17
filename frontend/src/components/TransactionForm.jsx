import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, PlusCircle, MinusCircle, RotateCcw, Loader2 } from 'lucide-react';
import { transactionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TransactionForm({
  books = [],
  users = [],
  selectedBookId = '',
  onTransactionComplete,
}) {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    book_id: selectedBookId || '',
    user_id: currentUser ? currentUser.id : '',
    type: 'BORROW',
    quantity: 1,
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (selectedBookId) {
      setFormData((prev) => ({ ...prev, book_id: selectedBookId }));
    } else if (books.length > 0 && !formData.book_id) {
      setFormData((prev) => ({ ...prev, book_id: books[0].id }));
    }
  }, [selectedBookId, books]);

  useEffect(() => {
    if (currentUser && !formData.user_id) {
      setFormData((prev) => ({ ...prev, user_id: currentUser.id }));
    } else if (users.length > 0 && !formData.user_id) {
      setFormData((prev) => ({ ...prev, user_id: users[0].id }));
    }
  }, [currentUser, users]);

  const activeBook = books.find((b) => String(b.id) === String(formData.book_id));
  const availableStock = activeBook ? activeBook.available_quantity : 0;
  const qty = parseInt(formData.quantity, 10) || 0;

  let projectedStock = availableStock;
  if (formData.type === 'BORROW') {
    projectedStock = availableStock - qty;
  } else if (formData.type === 'RESTOCK' || formData.type === 'RETURN') {
    projectedStock = availableStock + qty;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type }));
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.book_id) {
      errs.book_id = 'Please select a book';
    }

    if (formData.type === 'BORROW' && !formData.user_id) {
      errs.user_id = 'Select the user borrowing the book';
    }

    if (!qty || qty <= 0) {
      errs.quantity = 'Quantity must be at least 1';
    } else if (formData.type === 'BORROW' && qty > availableStock) {
      errs.quantity = `Cannot borrow ${qty} copy(ies). Only ${availableStock} in stock!`;
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        book_id: parseInt(formData.book_id, 10),
        user_id: formData.user_id ? parseInt(formData.user_id, 10) : null,
        type: formData.type,
        quantity: qty,
        notes: formData.notes.trim(),
      };

      const res = await transactionsApi.create(payload);

      setStatusMessage({
        type: 'success',
        text: res.message || 'Transaction successfully recorded!',
      });

      setFormData((prev) => ({
        ...prev,
        quantity: 1,
        notes: '',
      }));

      if (onTransactionComplete) {
        onTransactionComplete(res.data);
      }
    } catch (err) {
      setStatusMessage({
        type: 'danger',
        text: err.message || 'Failed to process transaction',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>Record Stock Transaction (Add / Deduct)</span>
        </h3>
      </div>

      <div className="card-body">
        {statusMessage && (
          <div className={`alert-banner ${statusMessage.type}`} style={{ marginBottom: '1.25rem' }}>
            <div className="alert-banner-desc">{statusMessage.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Transaction Action <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleTypeSelect('BORROW')}
                className={`btn ${formData.type === 'BORROW' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
              >
                <span>Borrow (Deduct)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('RESTOCK')}
                className={`btn ${formData.type === 'RESTOCK' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
              >
                <span>Restock (Add)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('RETURN')}
                className={`btn ${formData.type === 'RETURN' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
              >
                <span>Return Book</span>
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="tx-book">
                Select Book <span className="required">*</span>
              </label>
              <select
                id="tx-book"
                name="book_id"
                className={`form-control ${errors.book_id ? 'error' : ''}`}
                value={formData.book_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">-- Choose a book from inventory --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} (Available: {b.available_quantity}/{b.initial_quantity}) — ISBN: {b.isbn}
                  </option>
                ))}
              </select>
              {errors.book_id && <div className="form-error-msg">{errors.book_id}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-user">
                Library User / Member {formData.type === 'BORROW' && <span className="required">*</span>}
              </label>
              <select
                id="tx-user"
                name="user_id"
                className={`form-control ${errors.user_id ? 'error' : ''}`}
                value={formData.user_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">-- Select Member / Staff --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.membership_id}) - {u.role}
                  </option>
                ))}
              </select>
              {errors.user_id && <div className="form-error-msg">{errors.user_id}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-quantity">
                Number of Copies <span className="required">*</span>
              </label>
              <input
                id="tx-quantity"
                name="quantity"
                type="number"
                min="1"
                max="50"
                className={`form-control ${errors.quantity ? 'error' : ''}`}
                value={formData.quantity}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.quantity && <div className="form-error-msg">{errors.quantity}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="tx-notes">
                Transaction Notes / Remarks
              </label>
              <input
                id="tx-notes"
                name="notes"
                type="text"
                placeholder={
                  formData.type === 'BORROW'
                    ? 'e.g., Course textbook checkout for spring semester'
                    : formData.type === 'RESTOCK'
                    ? 'e.g., New delivery from academic distributor'
                    : 'e.g., Returned in good condition'
                }
                className="form-control"
                value={formData.notes}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {activeBook && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1.1rem',
                background: projectedStock < 0 ? '#fee2e2' : '#f8fafc',
                border: `1px solid ${projectedStock < 0 ? '#fca5a5' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>Selected:</strong> {activeBook.title}
                </span>
                <span>
                  Current Stock: <strong>{availableStock}</strong>
                </span>
              </div>
              <div style={{ marginTop: '0.35rem', color: projectedStock < 0 ? '#991b1b' : 'var(--text-secondary)' }}>
                {projectedStock < 0 ? (
                  <span style={{ fontWeight: 600 }}>
                    ⚠️ Warning: Stock will drop below zero! Operation cannot proceed.
                  </span>
                ) : (
                  <span>
                    Forecast after transaction: <strong>{projectedStock}</strong> available copy(ies)
                    {projectedStock < 2 && (
                      <span style={{ color: '#d97706', marginLeft: '0.5rem', fontWeight: 600 }}>
                        (Will trigger Low Stock Alert)
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className={`btn ${
                formData.type === 'BORROW'
                  ? 'btn-warning'
                  : formData.type === 'RESTOCK'
                  ? 'btn-success'
                  : 'btn-primary'
              }`}
              disabled={isSubmitting || projectedStock < 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight size={16} />
                  <span>
                    Confirm {formData.type === 'BORROW' ? 'Stock Deduction' : formData.type === 'RESTOCK' ? 'Stock Addition' : 'Return'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
