import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div style={styles.layout}>
      
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🛡 Cyber Buddy</h2>

        <nav style={styles.nav}>
          <Link style={styles.link} to="/">Dashboard</Link>
          <Link style={styles.link} to="/register">Register Org</Link>
          <Link style={styles.link} to="/submit">Submit Threat</Link>
          <Link style={styles.link} to="/feed">Threat Feed</Link>
        </nav>
      </aside>

      <main style={styles.content}>
        {children}
      </main>

    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",            // 🔥 CRITICAL FIX
    background: "#020617",
    color: "white",
  },

  sidebar: {
    width: "240px",
    background: "#020617",
    borderRight: "1px solid #1e293b",
    padding: "25px 20px",
  },

  logo: {
    marginBottom: "10px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "25px",
  },

  link: {
    color: "#cbd5f5",
    textDecoration: "none",
    fontSize: "15px",
    transition: "0.2s ease",
  },

  content: {
    flex: 1,                       // 🔥 CRITICAL FIX
    padding: "30px 40px",
    background: "linear-gradient(145deg, #020617, #020617)",
  },
};

export default Layout;
