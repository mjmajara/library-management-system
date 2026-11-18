import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import TransactionHistory from '../components/TransactionHistory';
import AlertNotification from '../components/AlertNotification';
import { booksApi, usersApi, transactionsApi } from '../services/api';

export default function Transactions() {
  const location = useLocation();
  const initialBookId = location.state?.selectedBookId || '';

  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [booksRes, usersRes, txRes] = await Promise.all([
        booksApi.getAll(),
        usersApi.getAll(),
        transactionsApi.getAll(),
      ]);

      setBooks(booksRes.data || []);
      setUsers(usersRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to load transaction data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleTransactionComplete = (newTx) => {
    setToast({
      type: 'success',
      text: `Transaction recorded: ${newTx.type} ${newTx.quantity} copy(ies) of "${newTx.book_title}"`,
    });
    loadAll();
  };

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
          <h1 className="page-title">Stock and Borrowing Transactions</h1>
          <p className="page-subtitle">
            Record book checkouts, returns, and inventory restocks with automated stock level updates.
          </p>
        </div>
        <div>
          <button onClick={loadAll} className="btn btn-secondary btn-sm" title="Refresh records">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <TransactionForm
        books={books}
        users={users}
        selectedBookId={initialBookId}
        onTransactionComplete={handleTransactionComplete}
      />

      <TransactionHistory
        transactions={transactions}
        loading={loading}
      />
    </div>
  );
}
