import { useEffect, useState } from "react";
const Dashboard = ({ contracts, account }) => {
  const [reputation, setReputation] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!contracts || !account) return;

    const loadData = async () => {
      try {
        const isReg = await contracts.orgRegistry.isRegistered(account);
        const isAct = await contracts.orgRegistry.isActive(account);
        const rep = await contracts.reputationEngine.reputationScore(account);

        setRegistered(isReg);
        setActive(isAct);
        setReputation(rep.toString());
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [contracts, account]);

  return (
  <div className="dashboard-container">

    <div className="dashboard-card">

      <h2>Network Status</h2>

      <div className="status-grid">
        <div className="status-item">
          <span>Registered</span>
          <strong>{registered ? "✅ Yes" : "❌ No"}</strong>
        </div>

        <div className="status-item">
          <span>Active</span>
          <strong>{active ? "✅ Yes" : "❌ No"}</strong>
        </div>

        <div className="status-item">
          <span>Reputation Score</span>
          <strong>⭐ {reputation}</strong>
        </div>
      </div>

      <div className="wallet-box">
        <span>Connected Wallet</span>
        <p>{account}</p>
      </div>

    </div>

  </div>
);
};

export default Dashboard;
