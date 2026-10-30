
function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
        onClick={() => onNavigate("dashboard")}
      >
        <span className="nav-icon">▦</span>
        Dashboard
      </button>

      <button
        className={`nav-item ${activePage === "ledger" ? "active" : ""}`}
        onClick={() => onNavigate("ledger")}
      >
        <span className="nav-icon">▤</span>
        Ledger
      </button>

      <button
        className={`nav-add ${activePage === "add" ? "active" : ""}`}
        onClick={() => onNavigate("add")}
      >
        <span>+</span>
        <small>Add</small>
      </button>

      <button
        className={`nav-item ${activePage === "budget" ? "active" : ""}`}
        onClick={() => onNavigate("budget")}
      >
        <span className="nav-icon">♧</span>
        Budget
      </button>

      <button
        className={`nav-item ${activePage === "insights" ? "active" : ""}`}
        onClick={() => onNavigate("insights")}
      >
        <span className="nav-icon">▥</span>
        Insights
      </button>
      <button
            className={`nav-item ${activePage === "shared" ? "active" : ""}`}
            onClick={() => onNavigate("shared")}
>
            <span className="nav-icon">⇄</span>
            Shared
</button>
    </nav>
  );
}

export default BottomNav;
