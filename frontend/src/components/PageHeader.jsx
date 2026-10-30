
function PageHeader({ onNavigate, onLogout }) {
  return (
    <header className="page-header">
      <button
        className="page-back-button"
        onClick={() => onNavigate("dashboard")}
      >
        <span>←</span>
        Back to Dashboard
      </button>

      <div className="logo">BILLBOOK</div>

      {onLogout ? (
        <button
          className="page-logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      ) : (
        <div className="header-space"></div>
      )}
    </header>
  );
}

export default PageHeader;
