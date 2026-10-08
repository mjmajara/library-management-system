import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { useAuth, KEYS, SEED_USERS } from "../context/AuthContext";

const EMPTY = { name: "", id: "", role: "librarian", pass: "" };

export default function Users() {
  const { showToast } = useOutletContext();
  const { user: me, login } = useAuth();
  const [users, setUsers] = useLocalStorage(KEYS.users, SEED_USERS);
  const [form, setForm] = useState(EMPTY);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(EMPTY); setEditIndex(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = form.id.trim().toUpperCase();

    const dup = users.findIndex((u) => u.id.toUpperCase() === id);
    if (dup !== -1 && dup !== editIndex) {
      showToast("Membership ID already exists.", true); return;
    }
    if (editIndex === null && !form.pass) {
      showToast("Password is required.", true); return;
    }
    if (editIndex !== null && users[editIndex].role === "admin" && form.role !== "admin"
        && users.filter((u) => u.role === "admin").length <= 1) {
      showToast("There must be at least one admin.", true); return;
    }

    const newUser = {
      name: form.name.trim(), id, role: form.role,
      // When editing, a blank password field keeps the current password.
      pass: form.pass || (editIndex !== null ? users[editIndex].pass : "")
    };

    if (editIndex === null) {
      setUsers([...users, newUser]);
      showToast(`User "${newUser.name}" added.`);
    } else {
      // Keep the active session in sync when editing your own account.
      if (users[editIndex].id === me.id) login(newUser);
      setUsers(users.map((u, i) => (i === editIndex ? newUser : u)));
      showToast(`User "${newUser.name}" updated.`);
    }
    reset();
  };

  const startEdit = (i) => {
    setForm({ ...users[i], pass: "" });
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    const u = users[i];
    if (u.id === me.id) {
      showToast("You cannot delete the account you are logged in with.", true); return;
    }
    if (!window.confirm(`Delete user "${u.name}"?`)) return;
    setUsers(users.filter((_, idx) => idx !== i));
    if (editIndex === i) reset();
    else if (editIndex !== null && i < editIndex) setEditIndex(editIndex - 1);
    showToast(`User "${u.name}" deleted.`);
  };

  return (
    <main>
      <h2>{editIndex === null ? "Add New User" : "Edit User"}</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="userName">Full Name</label>
            <input id="userName" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="userId">Membership ID</label>
            <input id="userId" name="id" required value={form.id} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="userRole">Role</label>
            <select id="userRole" name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>
          <div>
            <label htmlFor="userPass">
              {editIndex === null ? "Password" : "New Password (blank = keep)"}
            </label>
            <input id="userPass" name="pass" type="password"
              required={editIndex === null} value={form.pass} onChange={handleChange} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editIndex === null ? "Add User" : "Update User"}
          </button>
          {editIndex !== null && (
            <button type="button" className="btn" onClick={reset}>Cancel Edit</button>
          )}
        </div>
      </form>

      <h2>User List</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.id}</td><td>{u.role}</td>
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
