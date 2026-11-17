import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

// Same keys as the original JS version so  that existing data carries over.
export const KEYS = {
  books: "library_books",
  users: "library_users",
  txns: "library_transactions",
  session: "library_session"
};

export const LOW_STOCK = 2;

// Default accounts.
export const SEED_USERS = [
  { name: "Majara", id: "majara", role: "admin", pass: "mj123" },
  { name: "librarien", id: "librarien", role: "librarien", pass: "lib123" }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useLocalStorage(KEYS.session, null);

  const value = {
    user: session,
    login: (u) => setSession({ id: u.id, name: u.name, role: u.role }),
    logout: () => setSession(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
