
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

function Insights({ onNavigate }) {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

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
          throw new Error("Unable to load insights");
        }

        const expenseData = await expenseRes.json();
        const budgetData = await budgetRes.json();

        setExpenses(expenseData);
        setBudgets(budgetData);
      } catch (error) {
        setMessage(error.message);
      }

      setLoading(false);
    };

    fetchData();
  }, [token]);

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);

    return (
      date.getMonth() === month &&
      date.getFullYear() === year
    );
  });

  const monthlyBudgets = budgets.filter(
    (budget) =>
      budget.month === month + 1 &&
      budget.year === year
  );

  const totalSpent = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const totalBudget = monthlyBudgets.reduce(
    (total, budget) => total + Number(budget.amount),
    0
  );

  const remaining = totalBudget - totalSpent;

  const categoryTotals = {};

  monthlyExpenses.forEach((expense) => {
    const category = expense.category || "Other";

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      Number(expense.amount);
  });

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0
        ? (amount / totalSpent) * 100
        : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const money = (amount) =>
    "₹" + Number(amount).toLocaleString("en-IN");

  if (loading) {
    return <p>Loading your insights...</p>;
  }

  return (
    <main className="insights-page">
      <PageHeader onNavigate={onNavigate} />

      <section className="insights-container">
        <h1>Spending Insights</h1>
        <p>
          Your financial overview for{" "}
          {now.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </p>

        {message && (
          <p className="insights-message">{message}</p>
        )}

        <div className="insights-cards">
          <div className="insight-card">
            <span>TOTAL SPENT</span>
            <h2>{money(totalSpent)}</h2>
          </div>

          <div className="insight-card">
            <span>TOTAL BUDGET</span>
            <h2>{money(totalBudget)}</h2>
          </div>

          <div className="insight-card">
            <span>REMAINING</span>
            <h2>{money(remaining)}</h2>
          </div>
        </div>

        <section className="category-insights">
          <h2>Spending by Category</h2>

          {categoryData.length === 0 ? (
            <p>No expenses recorded this month yet.</p>
          ) : (
            categoryData.map((item) => (
              <div className="category-row" key={item.category}>
                <div className="category-info">
                  <strong>{item.category}</strong>
                  <span>{money(item.amount)}</span>
                </div>

                <div className="category-bar">
                  <div
                    className="category-progress"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <small>
                  {item.percentage.toFixed(1)}% of monthly spending
                </small>
              </div>
            ))
          )}
        </section>

        <section className="insight-summary">
          <h2>Monthly Summary</h2>

          <p>
            You made <strong>{monthlyExpenses.length}</strong>{" "}
            transactions this month.
          </p>

          {categoryData.length > 0 && (
            <p>
              Your highest spending category is{" "}
              <strong>{categoryData[0].category}</strong>, at{" "}
              <strong>{money(categoryData[0].amount)}</strong>.
            </p>
          )}

          {totalBudget > 0 ? (
            <p>
              {remaining >= 0
                ? `You have ${money(remaining)} remaining in your budget.`
                : `You have exceeded your budget by ${money(Math.abs(remaining))}.`}
            </p>
          ) : (
            <p>You haven't set a budget for this month yet.</p>
          )}
        </section>
      </section>
      <BottomNav
  activePage="insights"
  onNavigate={onNavigate}
/>
    </main>
  );
}

export default Insights;
