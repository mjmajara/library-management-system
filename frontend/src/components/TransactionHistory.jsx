import React, { useState } from 'react';
import { History, Search, ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react';

export default function TransactionHistory({ transactions = [], loading = false }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (t.book_title && t.book_title.toLowerCase().includes(term)) ||
      (t.book_isbn && t.book_isbn.toLowerCase().includes(term)) ||
      (t.user_name && t.user_name.toLowerCase().includes(term)) ||
      (t.user_membership_id && t.user_membership_id.toLowerCase().includes(term)) ||
      (t.notes && t.notes.toLowerCase().includes(term));

    return matchesType && matchesSearch;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BORROW':
        return (
          <span className="stock-badge low-stock" style={{ background: '#fef3c7', color: '#92400e' }}>
            BORROW
          </span>
        );
      case 'RESTOCK':
        return (
          <span className="stock-badge in-stock" style={{ background: '#d1fae5', color: '#065f46' }}>
            RESTOCK
          </span>
        );
      case 'RETURN':
        return (
          <span className="stock-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <RotateCcw size={13} />
            RETURN
          </span>
        );
      default:
        return <span className="genre-pill">{type}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>Transaction and Borrowing History Log</span>
        </h3>
      </div>

      <div className="card-body">
        <div className="controls-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search book."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button
              onClick={() => setFilterType('ALL')}
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Types ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('BORROW')}
              className={`btn btn-sm ${filterType === 'BORROW' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Borrows
            </button>
            <button
              onClick={() => setFilterType('RESTOCK')}
              className={`btn btn-sm ${filterType === 'RESTOCK' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Restocks
            </button>
            <button
              onClick={() => setFilterType('RETURN')}
              className={`btn btn-sm ${filterType === 'RETURN' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Returns
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            Loading transactions
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '10px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No transaction records matching the current criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Action</th>
                  <th>Book Title</th>
                  <th>User / Member</th>
                  <th>Quantity</th>
                  <th>Stock Change</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td>{getTypeBadge(tx.type)}</td>
                    <td>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {tx.book_title}
                      </strong>
                      <span className="isbn-code" style={{ fontSize: '0.72rem' }}>
                        {tx.book_isbn}
                      </span>
                    </td>
                    <td>
                      {tx.user_name ? (
                        <div>
                          <span style={{ fontWeight: 600 }}>{tx.user_name}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {tx.user_membership_id}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>System / Admin</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>
                        {tx.type === 'BORROW' ? `-${tx.quantity}` : `+${tx.quantity}`}
                      </strong>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tx.previous_quantity}</span>
                      <span style={{ margin: '0 0.35rem', color: 'var(--primary)' }}>&rarr;</span>
                      <strong>{tx.new_quantity}</strong>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                      {tx.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
