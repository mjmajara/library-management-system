import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { useAuth, KEYS, LOW_STOCK } from "../context/AuthContext";

const GENRES = ["Fiction", "Non-Fiction", "Science", "History", "Children", "Reference", "Other"];
const EMPTY = { title: "", author: "", genre: "", isbn: "", qty: "1" };

export default function Books() {
  const { showToast } = useOutletContext();
  const { user } = useAuth();
  const [books, setBooks] = useLocalStorage(KEYS.books, []);
  const [txns, setTxns] = useLocalStorage(KEYS.txns, []);
  const [form, setForm] = useState(EMPTY);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(EMPTY); setEditIndex(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isbn = form.isbn.trim();
    const qty = Number(form.qty);

    if (!Number.isInteger(qty) || qty < 0) {
      showToast("Quantity in numbers 0 >> 1000", true); return;
    }
    const dup = books.findIndex((b) => b.isbn === isbn);
    if (dup !== -1 && dup !== editIndex) {
      showToast("A book with this ISBN already exists.", true); return;
    }

    const book = {
      title: form.title.trim(), author: form.author.trim(),
      genre: form.genre, isbn, qty
    };

    if (editIndex === null) {
      setBooks([...books, book]);
      setTxns([{
        date: new Date().toLocaleString(), bookTitle: book.title, isbn: book.isbn,
        type: "ADD", qty: book.qty, stockAfter: book.qty,
        by: user?.name ?? "System", note: "how many books added"
      }, ...txns].slice(0, 100));
      showToast(`"${book.title}" added.`);
    } else {
      setBooks(books.map((b, i) => (i === editIndex ? book : b)));
      showToast(`"${book.title}" updated.`);
    }
    reset();
  };

  const startEdit = (i) => {
    setForm({ ...books[i], qty: String(books[i].qty) });
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    const book = books[i];
    if (!window.confirm(`Delete "${book.title}" permanently?`)) return;
    setBooks(books.filter((_, idx) => idx !== i));
    if (editIndex === i) reset();
    else if (editIndex !== null && i < editIndex) setEditIndex(editIndex - 1);
    showToast(`"${book.title}" deleted.`);
  };

  return (
    <main>
      <h2>{editIndex === null ? "Add New Book" : "Edit Book"}</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="bookTitle">Title</label>
            <input id="bookTitle" name="title" required value={form.title} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="bookAuthor">Author</label>
            <input id="bookAuthor" name="author" required value={form.author} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="bookGenre">Genre</label>
            <select id="bookGenre" name="genre" required value={form.genre} onChange={handleChange}>
              <option value="">Select genre</option>
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bookISBN">ISBN</label>
            <input id="bookISBN" name="isbn" required value={form.isbn} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="bookQty">{editIndex === null ? "Initial Quantity" : "Quantity"}</label>
            <input id="bookQty" name="qty" type="number" min="0" step="1" required
              value={form.qty} onChange={handleChange} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editIndex === null ? "Add Book" : "Update Book"}
          </button>
          {editIndex !== null && (
            <button type="button" className="btn" onClick={reset}>Cancel Edit</button>
          )}
        </div>
      </form>

      <h2>Book List</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th>
              <th>Qty</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b, i) => (
              <tr key={b.isbn} className={b.qty < LOW_STOCK ? "low-stock" : "2"}>
                <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td>
                <td>{b.isbn}</td><td>{b.qty}</td>
                <td>
                  <button className="btn btn-primary btn-small" onClick={() => startEdit(i)}>Update</button>
                  <button className="btn btn-danger btn-small" style={{ marginLeft: 6 }}
                    onClick={() => handleDelete(i)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
