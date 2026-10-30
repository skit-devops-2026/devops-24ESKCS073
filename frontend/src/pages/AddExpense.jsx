
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

function AddExpense({ onNavigate }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title,
            amount: Number(amount),
            category,
            date,
            paymentMethod,
            note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save expense");
      }

      setMessage("Expense added successfully!");

      setTitle("");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("UPI");
      setNote("");

    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <main className="add-expense-page">
      <PageHeader onNavigate={onNavigate} />

      <section className="expense-form-container">
        <h1>Add Expense</h1>
        <p>Keep track of where your money goes.</p>

        <form onSubmit={handleSubmit}>
          <label>EXPENSE NAME</label>
          <input
            type="text"
            placeholder="e.g. Lunch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>AMOUNT (₹)</label>
          <input
            type="number"
            placeholder="Enter amount"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label>CATEGORY</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Education</option>
            <option>Bills</option>
            <option>Health</option>
            <option>Other</option>
          </select>

          <label>DATE</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>PAYMENT METHOD</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option>UPI</option>
            <option>Cash</option>
            <option>Card</option>
            <option>Net Banking</option>
            <option>Other</option>
          </select>

          <label>NOTE (OPTIONAL)</label>
          <textarea
            placeholder="Add a small note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "SAVING..." : "SAVE EXPENSE"}
          </button>

          {message && <p>{message}</p>}
        </form>
      </section>
      <BottomNav
  activePage="add"
  onNavigate={onNavigate}
/>
    </main>
  );
}

export default AddExpense;
