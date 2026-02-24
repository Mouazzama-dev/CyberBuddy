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
    <div>
      <h2>Network Status</h2>

      <p>Registered: {registered ? "✅ Yes" : "❌ No"}</p>
      <p>Active: {active ? "✅ Yes" : "❌ No"}</p>
      <p>Reputation Score: ⭐ {reputation}</p>
    </div>
  );
};

export default Dashboard;
