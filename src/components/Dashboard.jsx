import useLocalStorage from "../hooks/useLocalStorage";
import { KEYS, LOW_STOCK, SEED_USERS } from "../context/AuthContext";

export function StockBadge({ qty }) {
  if (qty === 0) return <span className="badge badge-out">Out of stock</span>;
  if (qty < LOW_STOCK) return <span className="badge badge-low">Low stock ({qty})</span>;
  return <span className="badge badge-ok">Available ({qty})</span>;
}

export default function Dashboard() {
  const [books] = useLocalStorage(KEYS.books, []);
  const [users] = useLocalStorage(KEYS.users, SEED_USERS);

  const stats = [
    { label: "Book Titles", num: books.length },
    { label: "Total Copies", num: books.reduce((sum, b) => sum + b.qty, 0) },
    { label: "Low Stock", num: books.filter((b) => b.qty < LOW_STOCK).length },
    { label: "Registered Users", num: users.length }
  ];

  return (
    <main>
      <div className="stats-row">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="num">{s.num}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      <h2>Current Book Availability</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Author</th><th>Genre</th>
              <th>ISBN</th><th>In Stock</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", color: "#999" }}>
                No books in the catalogue yet.
              </td></tr>
            ) : (
              books.map((b) => (
                <tr key={b.isbn} className={b.qty < LOW_STOCK ? "low-stock" : ""}>
                  <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td>
                  <td>{b.isbn}</td><td>{b.qty}</td>
                  <td><StockBadge qty={b.qty} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
