import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RegisterOrg from "./pages/RegisterOrg";
import SubmitThreat from "./pages/SubmitThreat";
import ThreatFeed from "./pages/ThreatFeed";

import { useWallet } from "./hooks/useWallet";
import { useContracts } from "./hooks/useContracts";

function App() {
  const { account, signer, connectWallet } = useWallet();
  const contracts = useContracts(signer);

  if (!account) {
    return (
      <div style={{ padding: 40 }}>
        <h1>🛡 Cyber Buddy Network</h1>
        <button onClick={connectWallet}>Connect Wallet</button>
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
          element={<RegisterOrg contracts={contracts} />}
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
