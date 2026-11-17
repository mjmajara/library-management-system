import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { useAuth, KEYS } from "../context/AuthContext";

export default function Transactions() {
  const { showToast } = useOutletContext();
  const { user } = useAuth();
  const [books, setBooks] = useLocalStorage(KEYS.books, []);
  const [txns, setTxns] = useLocalStorage(KEYS.txns, []);
  const [bookIndex, setBookIndex] = useState("");
  const [type, setType] = useState("ADD");
  const [qty, setQty] = useState("1");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookIndex === "") { showToast("Please select a book.", true); return; }

    const amount = Number(qty);
    if (!Number.isInteger(amount) || amount < 1) {
      showToast("Quantity must be a positive whole number.", true); return;
    }

    const i = Number(bookIndex);
    const book = books[i];

    if (type === "BORROW" && amount > book.qty) {
      showToast(`Only ${book.qty} copy/copies available. Cannot borrow ${amount}.`, true);
      return;
    }

    const newQty = type === "ADD" ? book.qty + amount : book.qty - amount;
    setBooks(books.map((b, idx) => (idx === i ? { ...b, qty: newQty } : b)));
    setTxns([{
      date: new Date().toLocaleString(), bookTitle: book.title, isbn: book.isbn,
      type, qty: amount, stockAfter: newQty, by: user?.name ?? "System", note: ""
    }, ...txns].slice(0, 100));

    showToast(
      type === "ADD"
        ? `Added ${amount} to "${book.title}". New stock: ${newQty}`
        : `${amount} copy/copies of "${book.title}" borrowed. Remaining: ${newQty}`
    );
    setBookIndex(""); setQty("1");
  };

  const clearHistory = () => {
    if (!window.confirm("Clear the entire transaction history?")) return;
    setTxns([]);
    showToast("Transaction history cleared.");
  };

  return (
    <main>
      <h2>Book Transaction</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="txnBook">Book</label>
            <select id="txnBook" required value={bookIndex} onChange={(e) => setBookIndex(e.target.value)}>
              <option value=""> Select a book </option>
              {books.map((b, i) => (
                <option key={b.isbn} value={i}>{b.title} ({b.qty} in stock)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="txnType">Action</label>
            <select id="txnType" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="ADD">Add books</option>
              <option value="BORROW">Deduct stock (book borrowed)</option>
            </select>
          </div>
          <div>
            <label htmlFor="txnQty">Quantity</label>
            <input id="txnQty" type="number" min="1" step="1" required
              value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Record Transaction</button>
      </form>

      <h2>Transaction History</h2>
      <button className="btn btn-danger btn-small" style={{ marginBottom: 10 }} onClick={clearHistory}>
        Clear History
      </button>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Book</th><th>Action</th>
              <th>Qty</th><th>Stock After</th><th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {txns.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", color: "#999" }}>
                No transactions recorded yet.
              </td></tr>
            ) : (
              txns.map((t, i) => (
                <tr key={i}>
                  <td>{t.date}</td>
                  <td>{t.bookTitle} (ISBN {t.isbn})</td>
                  <td>{t.type === "ADD" ? "Add stock" : "Borrowed"}</td>
                  <td>{t.type === "ADD" ? `+${t.qty}` : `-${t.qty}`}</td>
                  <td>{t.stockAfter}</td>
                  <td>{t.by}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
