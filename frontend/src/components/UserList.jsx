import React from 'react';
import { Edit2, Trash2, Shield, User, BookOpen } from 'lucide-react';

export default function UserList({ users = [], loading = false, onEdit, onDelete }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
        Loading registered users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '10px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No users found matching criteria.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Email</th>
            <th>Borrows</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: u.role === 'admin' ? 'var(--primary-light)' : '#e0f2fe',
                      color: u.role === 'admin' ? 'var(--primary)' : '#0369a1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {u.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {u.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID #{u.id}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className="isbn-code">{u.membership_id}</span>
              </td>
              <td>
                <span className={`role-badge ${u.role}`}>{u.role}</span>
              </td>
              <td>
                {u.email ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
                )}
              </td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                  <BookOpen size={13} className="text-primary" />
                  <strong>{u.borrow_count || 0}</strong>
                </span>
              </td>
              <td>
                <span className="stock-badge in-stock" style={{ fontSize: '0.7rem' }}>
                  {u.status || 'active'}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(u)}
                      className="btn btn-secondary btn-sm"
                      title="Edit User Details"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(u)}
                      className="btn btn-danger btn-sm"
                      title="Delete User"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
