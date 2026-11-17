import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { booksApi } from '../services/api';

const GENRE_OPTIONS = [
  'Computer Science',
  'Software Engineering',
  'Data Science & AI',
  'Information Technology',
  'Mathematics',
  'Classic Fiction',
  'Science Fiction & Fantasy',
  'Self-Help & Productivity',
  'Business & Economics',
  'History & Philosophy',
];

export default function EditBookModal({ book, isOpen, onClose, onBookUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    initial_quantity: 0,
    available_quantity: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || 'Computer Science',
        isbn: book.isbn || '',
        initial_quantity: book.initial_quantity || 0,
        available_quantity: book.available_quantity || 0,
      });
      setErrors({});
      setServerError(null);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.author.trim()) errs.author = 'Author is required';
    if (!formData.genre.trim()) errs.genre = 'Genre is required';
    if (!formData.isbn.trim()) errs.isbn = 'ISBN is required';

    const initQty = parseInt(formData.initial_quantity, 10);
    const availQty = parseInt(formData.available_quantity, 10);

    if (isNaN(initQty) || initQty < 0) {
      errs.initial_quantity = 'Must be non-negative';
    }
    if (isNaN(availQty) || availQty < 0) {
      errs.available_quantity = 'Must be non-negative';
    } else if (availQty > initQty) {
      errs.available_quantity = 'Available copies cannot exceed total initial quantity';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre.trim(),
        isbn: formData.isbn.trim(),
        initial_quantity: parseInt(formData.initial_quantity, 10),
        available_quantity: parseInt(formData.available_quantity, 10),
      };

      const response = await booksApi.update(book.id, payload);
      if (onBookUpdated) {
        onBookUpdated(response.data, `Book "${response.data.title}" updated successfully!`);
      }
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to update book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Edit Book Details</h3>
          <button onClick={onClose} className="modal-close-btn" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
              <div className="alert-banner danger" style={{ marginBottom: '1rem' }}>
                <div className="alert-banner-desc">{serverError}</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">
                Book Title <span className="required">*</span>
              </label>
              <input
                id="edit-title"
                name="title"
                type="text"
                className={`form-control ${errors.title ? 'error' : ''}`}
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.title && <div className="form-error-msg">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-author">
                Author <span className="required">*</span>
              </label>
              <input
                id="edit-author"
                name="author"
                type="text"
                className={`form-control ${errors.author ? 'error' : ''}`}
                value={formData.author}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.author && <div className="form-error-msg">{errors.author}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-genre">
                Genre <span className="required">*</span>
              </label>
              <select
                id="edit-genre"
                name="genre"
                className="form-control"
                value={formData.genre}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-isbn">
                ISBN <span className="required">*</span>
              </label>
              <input
                id="edit-isbn"
                name="isbn"
                type="text"
                className={`form-control ${errors.isbn ? 'error' : ''}`}
                value={formData.isbn}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.isbn && <div className="form-error-msg">{errors.isbn}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-init-qty">
                  Total Initial Stock
                </label>
                <input
                  id="edit-init-qty"
                  name="initial_quantity"
                  type="number"
                  min="0"
                  className={`form-control ${errors.initial_quantity ? 'error' : ''}`}
                  value={formData.initial_quantity}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.initial_quantity && (
                  <div className="form-error-msg">{errors.initial_quantity}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-avail-qty">
                  Available in Stock
                </label>
                <input
                  id="edit-avail-qty"
                  name="available_quantity"
                  type="number"
                  min="0"
                  className={`form-control ${errors.available_quantity ? 'error' : ''}`}
                  value={formData.available_quantity}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.available_quantity && (
                  <div className="form-error-msg">{errors.available_quantity}</div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
