import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { usersApi } from '../services/api';

export default function UserForm({ initialUser = null, onUserSaved, onCancel }) {
  const isEditing = !!initialUser;

  const [formData, setFormData] = useState({
    name: '',
    membership_id: '',
    role: 'member',
    email: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name || '',
        membership_id: initialUser.membership_id || '',
        role: initialUser.role || 'member',
        email: initialUser.email || '',
        status: initialUser.status || 'active',
      });
      setErrors({});
      setServerError(null);
    } else {
      setFormData({
        name: '',
        membership_id: '',
        role: 'member',
        email: '',
        status: 'active',
      });
    }
  }, [initialUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'membership_id' ? value.toUpperCase() : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.membership_id.trim()) {
      errs.membership_id = 'Membership ID is required';
    } else if (formData.membership_id.trim().length < 4) {
      errs.membership_id = 'Membership ID must be at least 4 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
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
      let res;
      if (isEditing) {
        res = await usersApi.update(initialUser.id, formData);
      } else {
        res = await usersApi.create(formData);
      }

      if (onUserSaved) {
        onUserSaved(res.data, isEditing ? 'User updated successfully!' : 'User registered successfully!');
      }

      if (!isEditing) {
        setFormData({
          name: '',
          membership_id: '',
          role: 'member',
          email: '',
          status: 'active',
        });
      }
    } catch (err) {
      setServerError(err.message || 'Failed to save user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {isEditing ? <UserCheck size={20} className="text-primary" /> : <UserPlus size={20} className="text-primary" />}
          <span>{isEditing ? `Edit User: ${initialUser.name}` : 'Register New User'}</span>
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
            Cancel
          </button>
        )}
      </div>

      <div className="card-body">
        {serverError && (
          <div className="alert-banner danger" style={{ marginBottom: '1.25rem' }}>
            <div className="alert-banner-desc">{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="user-name"
                name="name"
                type="text"
                placeholder="e.g., Jonathan Sterling"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && <div className="form-error-msg">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-memid">
                Membership ID <span className="required">*</span>
              </label>
              <input
                id="user-memid"
                name="membership_id"
                type="text"
                placeholder="e.g., MEM-3001 or ADM-1002"
                className={`form-control ${errors.membership_id ? 'error' : ''}`}
                value={formData.membership_id}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.membership_id ? (
                <div className="form-error-msg">{errors.membership_id}</div>
              ) : (
                <div className="form-help-text">Unique identification code</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-role">
                User Role <span className="required">*</span>
              </label>
              <select
                id="user-role"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="member">Library Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-email">
                Email Address
              </label>
              <input
                id="user-email"
                name="email"
                type="email"
                placeholder="e.g., user@institution.edu"
                className={`form-control ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && <div className="form-error-msg">{errors.email}</div>}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  {isEditing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  <span>{isEditing ? 'Update User' : 'Add User'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
