import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

function Ledger({ onNavigate }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);

  const token = localStorage.getItem("token");

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/expenses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load expenses");
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete expense");
      }

      setExpenses(expenses.filter((expense) => expense._id !== id));
      setMessage("Expense deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const startEditing = (expense) => {
    setEditing({
      ...expense,
      date: new Date(expense.date).toISOString().split("T")[0],
    });
    setMessage("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5001/api/expenses/${editing._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editing.title,
            amount: Number(editing.amount),
            category: editing.category,
            date: editing.date,
            paymentMethod: editing.paymentMethod,
            note: editing.note,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update expense");
      }

      setMessage("Expense updated successfully!");
      setEditing(null);
      fetchExpenses();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const money = (amount) =>
    "₹" + Number(amount).toLocaleString("en-IN");

  if (loading) {
    return <p>Loading your ledger...</p>;
  }

  return (
    <main className="ledger-page">
      <PageHeader onNavigate={onNavigate} />

      <section className="ledger-container">
        <h1>Expense Ledger</h1>
        <p>All your expenses, in one place.</p>

        {message && <p className="ledger-message">{message}</p>}

        {editing && (
          <form className="ledger-edit-form" onSubmit={handleUpdate}>
            <h2>Edit Expense</h2>

            <label>EXPENSE NAME</label>
            <input
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              required
            />

            <label>AMOUNT (₹)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={editing.amount}
              onChange={(e) =>
                setEditing({ ...editing, amount: e.target.value })
              }
              required
            />

            <label>CATEGORY</label>
            <select
              value={editing.category}
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value })
              }
            >
              {["Food", "Travel", "Shopping", "Entertainment", "Education", "Bills", "Health", "Other"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label>DATE</label>
            <input
              type="date"
              value={editing.date}
              onChange={(e) =>
                setEditing({ ...editing, date: e.target.value })
              }
              required
            />

            <label>PAYMENT METHOD</label>
            <select
              value={editing.paymentMethod}
              onChange={(e) =>
                setEditing({ ...editing, paymentMethod: e.target.value })
              }
            >
              {["UPI", "Cash", "Card", "Net Banking", "Other"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label>NOTE</label>
            <textarea
              value={editing.note || ""}
              onChange={(e) =>
                setEditing({ ...editing, note: e.target.value })
              }
            />

            <button type="submit">SAVE CHANGES</button>
            <button type="button" onClick={() => setEditing(null)}>
              CANCEL
            </button>
          </form>
        )}

        {expenses.length === 0 ? (
          <p>No expenses recorded yet.</p>
        ) : (
          <div className="ledger-list">
            {[...expenses]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((expense) => (
                <article className="ledger-item" key={expense._id}>
                  <div className="ledger-item-info">
                    <h3>{expense.title}</h3>
                    <p>
                      {expense.category} · {expense.paymentMethod}
                    </p>
                    <p>
                      {new Date(expense.date).toLocaleDateString("en-IN")}
                    </p>
                    {expense.note && <p>{expense.note}</p>}
                  </div>

                  <div className="ledger-item-actions">
                    <strong>{money(expense.amount)}</strong>
                    <button onClick={() => startEditing(expense)}>
                      Edit
                    </button>
                    <button onClick={() => deleteExpense(expense._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
      <BottomNav
  activePage="ledger"
  onNavigate={onNavigate}
/>
    </main>
  );
}

export default Ledger;