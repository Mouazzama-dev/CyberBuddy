import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RegisterOrg from "./pages/RegisterOrg";
import SubmitThreat from "./pages/SubmitThreat";
import ThreatFeed from "./pages/ThreatFeed";

import { useWallet } from "./hooks/useWallet";
import { useContracts } from "./hooks/useContracts";
import "./index.css";

function App() {
  const { account, signer, connectWallet } = useWallet();
  const contracts = useContracts(signer);

if (!account) {
  return (
    <div className="connect-container">
      <div className="connect-card">
        <h1>🛡 Cyber Buddy Network</h1>

        <p>
          A decentralized threat intelligence sharing platform enabling
          organizations to securely collaborate, validate, and respond to
          emerging cyber threats using blockchain technology.
        </p>

        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

  if (!contracts) {
    return (
      <Layout>
        <h1>Loading Blockchain...</h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={<Dashboard contracts={contracts} account={account} />}
        />

        <Route
  path="/register"
  element={<RegisterOrg contracts={contracts} account={account} />}
/>

        <Route
          path="/submit"
          element={<SubmitThreat contracts={contracts} />}
        />

        <Route
          path="/feed"
          element={<ThreatFeed contracts={contracts} />}
        />
      </Routes>
    </Layout>
  );
}

export default App;
