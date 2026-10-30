
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Ledger from "./pages/Ledger";
import Budget from "./pages/Budget";
import Insights from "./pages/Insights";
import Shared from "./pages/Shared";

import "./App.css";
import "./style.css";

function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [page, setPage] = useState("dashboard");

  // Login and registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = isRegister ? "register" : "login";

    try {
      const response = await fetch(
        `http://localhost:5001/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isRegister) {
        setMessage("Account created! Please login.");
        setIsRegister(false);
        setPassword("");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setLoggedIn(true);
        setPage("dashboard");
      }
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setPage("dashboard");
    setPassword("");
  };

  // Navigation between application pages
  if (loggedIn) {
    if (page === "dashboard") {
      return (
        <Dashboard
          onNavigate={setPage}
          onLogout={handleLogout}
        />
      );
    }

    if (page === "add") {
      return <AddExpense onNavigate={setPage} />;
    }

    if (page === "ledger") {
      return <Ledger onNavigate={setPage} />;
    }

    if (page === "budget") {
      return <Budget onNavigate={setPage} />;
    }

    if (page === "insights") {
      return <Insights onNavigate={setPage} />;
    }

    if (page === "shared") {
      return <Shared onNavigate={setPage} />;
    }

    return <Dashboard onNavigate={setPage} onLogout={handleLogout} />;
  }

  // Login and registration screen
  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-logo">BILLBOOK</h1>

        <p className="auth-subtitle">
          Your money, thoughtfully managed.
        </p>

        <h2>
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        {isRegister && (
          <div className="auth-field">
            <label>YOUR NAME</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="auth-field">
          <label>EMAIL ADDRESS</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label>PASSWORD</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "PLEASE WAIT..."
            : isRegister
            ? "CREATE ACCOUNT"
            : "LOGIN"}
        </button>

        {message && (
          <p className="auth-message">{message}</p>
        )}

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default App;
