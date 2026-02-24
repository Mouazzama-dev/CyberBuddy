import { NavLink } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">

      <aside className="sidebar">
        <h2 className="logo">🛡 Cyber Buddy</h2>

        <nav className="nav">
          <NavLink to="/" className="nav-link">Dashboard</NavLink>
          <NavLink to="/register" className="nav-link">Register Org</NavLink>
          <NavLink to="/submit" className="nav-link">Submit Threat</NavLink>
          <NavLink to="/feed" className="nav-link">Threat Feed</NavLink>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>

    </div>
  );
};

export default Layout;