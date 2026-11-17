import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
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

export default function AddBookForm({ onBookAdded, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Computer Science',
    isbn: '',
    initial_quantity: 3,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);

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
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters';
    }

    if (!formData.author.trim()) {
      errs.author = 'Author name is required';
    }

    if (!formData.genre.trim()) {
      errs.genre = 'Genre is required';
    }

    if (!formData.isbn.trim()) {
      errs.isbn = 'ISBN is required';
    } else if (formData.isbn.trim().replace(/[-\s]/g, '').length < 10) {
      errs.isbn = 'Enter a valid ISBN (at least 10 digits)';
    }

    const qty = parseInt(formData.initial_quantity, 10);
    if (isNaN(qty) || qty < 1) {
      errs.initial_quantity = 'Quantity must be at least 1';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage(null);

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
      };

      const response = await booksApi.create(payload);

      setFormData({
        title: '',
        author: '',
        genre: 'Computer Science',
        isbn: '',
        initial_quantity: 3,
      });

      if (onBookAdded) {
        onBookAdded(response.data, response.message || 'Book successfully added to library!');
      }
    } catch (err) {
      setServerMessage({
        type: 'error',
        text: err.message || 'Failed to add book. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>Add New Book </span>
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
            Cancel
          </button>
        )}
      </div>

      <div className="card-body">
        {serverMessage && (
          <div className={`alert-banner ${serverMessage.type}`} style={{ marginBottom: '1.25rem' }}>
            <div className="alert-banner-desc">{serverMessage.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="title">
                Book Title <span className="required"></span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="lejoe la mantlha"
                className={`form-control ${errors.title ? 'error' : ''}`}
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.title && <div className="form-error-msg">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="author">
                Author <span className="required"></span>
              </label>
              <input
                id="author"
                name="author"
                type="text"
                placeholder="tapeiti M Carpet"
                className={`form-control ${errors.author ? 'error' : ''}`}
                value={formData.author}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.author && <div className="form-error-msg">{errors.author}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="genre">
                Genre <span className="required"></span>
              </label>
              <select
                id="genre"
                name="genre"
                className={`form-control ${errors.genre ? 'error' : ''}`}
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
              {errors.genre && <div className="form-error-msg">{errors.genre}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="isbn">
                ISBN Code <span className="required"></span>
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                placeholder="123456789"
                className={`form-control ${errors.isbn ? 'error' : ''}`}
                value={formData.isbn}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.isbn ? (
                <div className="form-error-msg">{errors.isbn}</div>
              ) : (
                <div className="form-help-text">Standard ISBN-10 or ISBN-13 format</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="initial_quantity">
                Initial Stock Quantity <span className="required"></span>
              </label>
              <input
                id="initial_quantity"
                name="initial_quantity"
                type="number"
                min="1"
                max="500"
                className={`form-control ${errors.initial_quantity ? 'error' : ''}`}
                value={formData.initial_quantity}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.initial_quantity && (
                <div className="form-error-msg">{errors.initial_quantity}</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                <>
                  <span>Register and Add Book</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
