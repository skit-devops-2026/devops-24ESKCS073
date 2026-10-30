
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

function Shared({ onNavigate }) {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [people, setPeople] = useState("");
  const [payer, setPayer] = useState("");
  const [splitType, setSplitType] = useState("Equal");
  const [shareValues, setShareValues] = useState({});

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myName = user.name || "Me";

  const money = (value) =>
    "₹" +
    Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });


  // Calculate net balances across all shared expenses
  const settlements = (() => {
    const balances = {};

    expenses.forEach((expense) => {
      expense.paidBy?.forEach((person) => {
        const name = person.name;
        balances[name] = (balances[name] || 0) +
          Math.round(Number(person.amount) * 100);
      });

      expense.participants?.forEach((person) => {
        const name = person.name;
        balances[name] = (balances[name] || 0) -
          Math.round(Number(person.share) * 100);
      });
    });

    const debtors = Object.entries(balances)
      .filter(([, balance]) => balance < 0)
      .map(([name, balance]) => ({
        name,
        amount: -balance,
      }));

    const creditors = Object.entries(balances)
      .filter(([, balance]) => balance > 0)
      .map(([name, balance]) => ({
        name,
        amount: balance,
      }));

    const result = [];

    while (debtors.length && creditors.length) {
      const debtor = debtors[0];
      const creditor = creditors[0];

      const amount = Math.min(
        debtor.amount,
        creditor.amount
      );

      result.push({
        from: debtor.name,
        to: creditor.name,
        amount: amount / 100,
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) debtors.shift();
      if (creditor.amount === 0) creditors.shift();
    }

    return result;
  })();


  // Get all participants, including the logged-in user
  const participantNames = [
    ...new Set([
      myName,
      ...people
        .split(",")
        .map((person) => person.trim())
        .filter(Boolean),
    ]),
  ];

  // Automatically select the first participant as payer
  const selectedPayer = participantNames.includes(payer)
    ? payer
    : myName;

  // Fetch saved shared expenses
  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/shared",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load shared expenses");
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
  }, [token]);

  // Update an individual participant's split value
  const updateShare = (name, value) => {
    setShareValues((old) => ({
      ...old,
      [name]: value,
    }));
  };

  // Calculate each person's share
  const calculateShares = () => {
    const total = Number(amount);

    if (!total || total <= 0 || participantNames.length === 0) {
      return { shares: [], error: "Enter a valid total amount." };
    }

    let values = [];

    if (splitType === "Equal") {
      const totalPaise = Math.round(total * 100);
      const base = Math.floor(totalPaise / participantNames.length);
      let remainder = totalPaise - base * participantNames.length;

      values = participantNames.map((name) => {
        const extra = remainder > 0 ? 1 : 0;
        remainder -= extra;

        return {
          name,
          share: (base + extra) / 100,
        };
      });
    } else {
      const entered = participantNames.map((name) => ({
        name,
        value: Number(shareValues[name]),
      }));

      if (
        entered.some(
          (item) =>
            shareValues[item.name] === undefined ||
            shareValues[item.name] === "" ||
            !Number.isFinite(item.value) ||
            item.value < 0
        )
      ) {
        return {
          shares: [],
          error: "Enter a valid value for every participant.",
        };
      }

      const sum = entered.reduce(
        (total, item) => total + item.value,
        0
      );

      if (splitType === "Exact") {
        if (Math.abs(sum - total) > 0.01) {
          return {
            shares: [],
            error: `Your amounts must add up to ${money(total)}.`,
          };
        }

        values = entered.map((item) => ({
          name: item.name,
          share: item.value,
        }));
      }

      if (splitType === "Percentage") {
        if (Math.abs(sum - 100) > 0.01) {
          return {
            shares: [],
            error: "Your percentages must add up to 100%.",
          };
        }

        values = entered.map((item) => ({
          name: item.name,
          share: (total * item.value) / 100,
        }));
      }

      if (splitType === "Shares") {
        if (sum <= 0) {
          return {
            shares: [],
            error: "The total number of shares must be greater than zero.",
          };
        }

        values = entered.map((item) => ({
          name: item.name,
          share: (total * item.value) / sum,
        }));
      }

      // Round to paise and adjust the final participant
      // to ensure the split matches the total exactly.
      if (splitType !== "Exact" && values.length > 0) {
        let assigned = 0;

        values = values.map((item, index) => {
          if (index === values.length - 1) {
            return {
              ...item,
              share: Number((total - assigned).toFixed(2)),
            };
          }

          const rounded = Math.round(item.share * 100) / 100;
          assigned += rounded;

          return {
            ...item,
            share: rounded,
          };
        });
      }
    }

    return { shares: values, error: "" };
  };

  const preview = calculateShares();

  // Save shared expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const result = calculateShares();

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/shared",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            amount: Number(amount),
            date,
            paidBy: [
              {
                name: selectedPayer,
                amount: Number(amount),
              },
            ],
            participants: result.shares,
            splitType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save shared expense"
        );
      }

      setMessage("Shared expense added successfully!");
      setTitle("");
      setAmount("");
      setPeople("");
      setPayer("");
      setShareValues({});
      setSplitType("Equal");
      setDate(new Date().toISOString().split("T")[0]);

      await fetchExpenses();
    } catch (error) {
      setMessage(error.message);
    }

    setSaving(false);
  };

  // Delete shared expense
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this shared expense?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/shared/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete shared expense");
      }

      setExpenses((old) =>
        old.filter((expense) => expense._id !== id)
      );

      setMessage("Shared expense deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return <p>Loading shared expenses...</p>;
  }

  return (
    <main className="shared-page">
      <PageHeader onNavigate={onNavigate} />

      <section className="shared-container">
        <h1>Shared Expenses</h1>
        <p>Split expenses fairly with friends.</p>

        <form className="shared-form" onSubmit={handleSubmit}>
          <h2>Add a shared expense</h2>

          <label>EXPENSE NAME</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dinner, Trip, BBQ"
            required
          />

          <label>TOTAL BILL AMOUNT (₹)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter total amount"
            required
          />

          <label>DATE</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>WHO WAS INVOLVED?</label>
          <input
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="Rahul, Rohan, Priya"
          />
          <small>
            Separate names with commas. You are included automatically.
          </small>

          <label>WHO PAID THE BILL?</label>
          <select
            value={selectedPayer}
            onChange={(e) => setPayer(e.target.value)}
          >
            {participantNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div className="split-heading">
            <h2>How should we split it?</h2>
            <p>Choose a method that works for everyone.</p>
          </div>

          <div className="split-options">
            {[
              { value: "Equal", label: "Equally", icon: "users" },
              { value: "Exact", label: "Exact amounts", icon: "rupee" },
              { value: "Percentage", label: "Percentages", icon: "percent" },
              { value: "Shares", label: "Shares / Ratio", icon: "ratio" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`split-option ${
                  splitType === option.value ? "selected" : ""
                }`}
                onClick={() => setSplitType(option.value)}
              >
                <strong>{option.label}</strong>
                {splitType === option.value && <span>✓</span>}
              </button>
            ))}
          </div>

          {splitType !== "Equal" && (
            <div className="split-entry">
              <h3>
                {splitType === "Exact" && "Enter each person's amount"}
                {splitType === "Percentage" && "Enter each person's percentage"}
                {splitType === "Shares" && "Enter each person's share ratio"}
              </h3>

              {participantNames.map((name) => (
                <div className="split-person-row" key={name}>
                  <div className="split-person-name">
                    <span className="person-avatar">
                      {name.charAt(0).toUpperCase()}
                    </span>
                    <strong>{name}</strong>
                  </div>

                  <div className="split-value-input">
                    <input
                      type="number"
                      min="0"
                      step={splitType === "Percentage" ? "0.01" : "0.01"}
                      placeholder="0"
                      value={shareValues[name] ?? ""}
                      onChange={(e) =>
                        updateShare(name, e.target.value)
                      }
                      required
                    />

                    <span>
                      {splitType === "Exact"
                        ? "₹"
                        : splitType === "Percentage"
                        ? "%"
                        : "shares"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="split-preview">
            <h3>Split preview</h3>

            {preview.error ? (
              <p className="split-error">{preview.error}</p>
            ) : (
              <>
                {preview.shares.map((person) => (
                  <div className="preview-row" key={person.name}>
                    <span>{person.name}</span>
                    <strong>{money(person.share)}</strong>
                  </div>
                ))}

                <div className="preview-total">
                  <span>Total</span>
                  <strong>{money(Number(amount) || 0)}</strong>
                </div>
              </>
            )}
          </div>

          <button
            className="shared-submit"
            type="submit"
            disabled={saving || Boolean(preview.error)}
          >
            {saving ? "SAVING..." : "SAVE SHARED EXPENSE"}
          </button>
        </form>

        {message && (
          <p className="shared-message">{message}</p>
        )}

        <section className="shared-list">
          <h2>Previous Shared Expenses</h2>

          {expenses.length === 0 ? (
            <p>No shared expenses recorded yet.</p>
          ) : (
            expenses
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date) - new Date(a.date)
              )
              .map((expense) => (
                <article className="shared-item" key={expense._id}>
                  <div>
                    <h3>{expense.title}</h3>
                    <p>
                      {new Date(expense.date).toLocaleDateString("en-IN")}
                      {" · "}
                      {expense.splitType} split
                    </p>

                    <p>
                      Paid by:{" "}
                      {expense.paidBy
                        ?.map((person) => person.name)
                        .join(", ")}
                    </p>

                    <div className="shared-participants">
                      {expense.participants?.map((person, index) => (
                        <p key={index}>
                          {person.name}: {money(person.share)}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="shared-item-actions">
                    <strong>{money(expense.amount)}</strong>
                    <button
                      onClick={() => deleteExpense(expense._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
          )}
        </section>
        
        <section className="settlement-section">
          <h2>Who Owes Whom?</h2>
          <p>Your group's outstanding balances.</p>

          {settlements.length === 0 ? (
            <div className="settlement-empty">
              <span>✓</span>
              <strong>Everyone is settled up!</strong>
              <p>No outstanding payments.</p>
            </div>
          ) : (
            settlements.map((item, index) => (
              <div className="settlement-item" key={index}>
                <div>
                  <strong>{item.from}</strong>
                  <span className="settlement-arrow"> → </span>
                  <strong>{item.to}</strong>
                </div>

                <strong className="settlement-amount">
                  {money(item.amount)}
                </strong>
              </div>
            ))
          )}
        </section>

      </section>

      <BottomNav
        activePage="shared"
        onNavigate={onNavigate}
      />
    </main>
  );
}

export default Shared;
