//Header superior

import "../styles/Header.css";

function Header({ onToggleSidebar }) {
  return (
    <header className="header">
      <button className="header__menu-btn" onClick={onToggleSidebar}>
        ☰
      </button>
      <h1 className="header__title">Control Servicios Taller</h1>
      <div className="header__user">
        <span>Admin</span>
      </div>
    </header>
  );
}

export default Header;

