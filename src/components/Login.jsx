import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, KEYS, SEED_USERS } from "../context/AuthContext";
import useLocalStorage from "../hooks/useLocalStorage";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useLocalStorage(KEYS.users, SEED_USERS);
  const [mode, setMode] = useState("login"); // "login" and  "signup"
  const [loginForm, setLoginForm] = useState({ id: "", pass: "" });
  const [signup, setSignup] = useState({ name: "", id: "", pass: "", confirm: "" });
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const switchMode = (m) => { setMode(m); setError(""); };

  const handleLogin = (e) => {
    e.preventDefault();
    const id = loginForm.id.trim().toUpperCase();
    const found = users.find((u) => u.id.toUpperCase() === id && u.pass === loginForm.pass);
    if (!found) { setError("Invalid membership ID or password."); return; }
    login(found);
    navigate("/", { replace: true });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const id = signup.id.trim().toUpperCase();
    if (signup.pass !== signup.confirm) { setError("Passwords do not match."); return; }
    if (users.some((u) => u.id.toUpperCase() === id)) {
      setError("That membership ID is already taken."); return;
    }
    const newUser = { name: signup.name.trim(), id, role: "librarian", pass: signup.pass };
    setUsers([...users, newUser]);
    login(newUser);
    navigate("/", { replace: true });
  };

  return (
    <section className="view auth-view">
      <div className="login-card">
        <h1>Library</h1>

        {mode === "login" ? (
          <>
            <p className="subtitle">VILAGE LIBRARY</p>
            <form onSubmit={handleLogin}>
              <label htmlFor="loginId">Membership Name</label>
              <input id="loginId" required placeholder="name (Majara)"
                value={loginForm.id}
                onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })} />

              <label htmlFor="loginPass" style={{ marginTop: 12 }}>Password</label>
              <input id="loginPass" type="password" required placeholder="Pas***rd (mj123)"
                value={loginForm.pass}
                onChange={(e) => setLoginForm({ ...loginForm, pass: e.target.value })} />

              <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>Login</button>
              {error && <p className="error-msg">{error}</p>}
            </form>
            <p className="switch-msg">
              New here?
              <button type="button" className="link-btn" onClick={() => switchMode("signup")}>
                Create an account
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="subtitle">Create account</p>
            <form onSubmit={handleSignup}>
              <label htmlFor="signupName">Full Name</label>
              <input id="signupName" required placeholder="Full name"
                value={signup.name}
                onChange={(e) => setSignup({ ...signup, name: e.target.value })} />

              <label htmlFor="signupId" style={{ marginTop: 12 }}>Membership name</label>
              <input id="signupId" required placeholder="majara"
                value={signup.id}
                onChange={(e) => setSignup({ ...signup, id: e.target.value })} />

              <label htmlFor="signupPass" style={{ marginTop: 12 }}>Password</label>
              <input id="signupPass" type="password" required placeholder="Password"
                value={signup.pass}
                onChange={(e) => setSignup({ ...signup, pass: e.target.value })} />

              <label htmlFor="signupConfirm" style={{ marginTop: 12 }}>Confirm Password</label>
              <input id="signupConfirm" type="password" required placeholder="Confirm Password"
                value={signup.confirm}
                onChange={(e) => setSignup({ ...signup, confirm: e.target.value })} />

              <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
                Create Account
              </button>
              {error && <p className="error-msg">{error}</p>}
            </form>
            <p className="switch-msg">
              Already have an account?
              <button type="button" className="link-btn" onClick={() => switchMode("login")}>
                Back to login
              </button>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
