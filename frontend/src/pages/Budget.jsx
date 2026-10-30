
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

function Budget({ onNavigate }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Entertainment",
    "Education",
    "Bills",
    "Health",
    "Other",
  ];

  const money = (value) =>
    "₹" + Number(value).toLocaleString("en-IN");

  const fetchBudgets = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/budgets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load budgets");
      }

      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const currentBudgets = budgets.filter(
    (item) => item.month === month && item.year === year
  );

  const totalBudget = currentBudgets.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const addBudget = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/budgets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category,
            amount: Number(amount),
            month,
            year,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save budget");
      }

      setMessage("Budget added successfully!");
      setAmount("");
      fetchBudgets();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm("Delete this budget?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/budgets/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete budget");
      }

      setBudgets(budgets.filter((item) => item._id !== id));
      setMessage("Budget deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return <p>Loading your budgets...</p>;
  }

  return (
    <main className="budget-page">
     <PageHeader onNavigate={onNavigate} />

      <section className="budget-container">
        <h1>Monthly Budgets</h1>
        <p>Plan your spending, one category at a time.</p>

        <div className="budget-summary">
          <span>TOTAL MONTHLY BUDGET</span>
          <h2>{money(totalBudget)}</h2>
          <p>
            {now.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <form className="budget-form" onSubmit={addBudget}>
          <h2>Set a Budget</h2>

          <label>CATEGORY</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label>MONTHLY LIMIT (₹)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter budget amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <button type="submit">SAVE BUDGET</button>
        </form>

        {message && <p className="budget-message">{message}</p>}

        <section className="budget-list">
          <h2>Your Category Budgets</h2>

          {currentBudgets.length === 0 ? (
            <p>No budgets set for this month yet.</p>
          ) : (
            currentBudgets.map((item) => (
              <div className="budget-item" key={item._id}>
                <div>
                  <h3>{item.category}</h3>
                  <p>Monthly spending limit</p>
                </div>

                <div className="budget-item-right">
                  <strong>{money(item.amount)}</strong>
                  <button onClick={() => deleteBudget(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </section>
      <BottomNav
  activePage="budget"
  onNavigate={onNavigate}
/>
    </main>
  );
}

export default Budget;
