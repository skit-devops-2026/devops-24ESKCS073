
import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";

function Dashboard({ onNavigate, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [expenseRes, budgetRes] = await Promise.all([
          fetch("http://localhost:5001/api/expenses", { headers }),
          fetch("http://localhost:5001/api/budgets", { headers }),
        ]);

        if (!expenseRes.ok || !budgetRes.ok) {
          throw new Error("Unable to load dashboard");
        }

        const expenseData = await expenseRes.json();
        const budgetData = await budgetRes.json();

        setExpenses(expenseData);
        setBudgets(budgetData);
      } catch (error) {
        console.log(error.message);
      }

      setLoading(false);
    };

    fetchData();
  }, [token]);

  const now = new Date();

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const monthlyBudgets = budgets.filter(
    (budget) =>
      budget.month === now.getMonth() + 1 &&
      budget.year === now.getFullYear()
  );

  const spent = monthlyExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const budget = monthlyBudgets.reduce(
    (total, item) => total + item.amount,
    0
  );

  const available = budget - spent;
  const progress = budget > 0
    ? Math.min((spent / budget) * 100, 100)
    : 0;

  const money = (amount) =>
    "₹" + amount.toLocaleString("en-IN");

  if (loading) return <p>Loading your dashboard...</p>;

  return (
    <>
      <header className="topbar">
        <button className="menu-btn">☰</button>
        <div className="logo">BILLBOOK</div>
        <button className="profile-btn" onClick={onLogout}>
          ↪
        </button>
      </header>

      <main className="dashboard">
        <section className="balance-section">
          <p className="balance-title">YOU CAN SPEND</p>
          <h1>{money(available)}</h1>
          <p className="spending-message">
            {available >= 0
              ? "Keep your spending balanced."
              : "You have exceeded your budget."}
          </p>
        </section>

        <section className="monthly-section">
          <div className="monthly-info">
            <span>{money(spent)} spent</span>
            <span>of {money(budget)}</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </section>

        <section className="recent-section">
          <h2>Recent</h2>

          {expenses.length === 0 ? (
            <p>No expenses yet. Start adding your expenses!</p>
          ) : (
            [...expenses]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((expense) => (
                <div className="transaction" key={expense._id}>
                  <div>
                    <div className="transaction-name">
                      {expense.title}
                    </div>
                    <div className="transaction-info">
                      {expense.category} ·{" "}
                      {new Date(expense.date).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  <div className="expense-amount">
                    {money(expense.amount)}
                  </div>
                </div>
              ))
          )}

          <button
            className="ledger-button"
            onClick={() => onNavigate("ledger")}
          >
            VIEW LEDGER
          </button>
        </section>
      </main>

        <BottomNav onNavigate={onNavigate} />
    </>
  );
}
export default Dashboard;
