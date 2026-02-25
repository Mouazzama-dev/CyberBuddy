import { useEffect, useState } from "react";

const Dashboard = ({ contracts, account }) => {
  const [reputation, setReputation] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [active, setActive] = useState(false);

  const [networkName, setNetworkName] = useState("-");
  const [chainId, setChainId] = useState("-");
  const [blockNumber, setBlockNumber] = useState("-");

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

        /* 🔥 NETWORK INFO */

        const provider =
          contracts.orgRegistry.runner?.provider ||   // ethers v6
          contracts.orgRegistry.provider;             // ethers v5

        if (provider) {
          const network = await provider.getNetwork();
          const block = await provider.getBlockNumber();

          setNetworkName(network.name);
          setChainId(network.chainId.toString());
          setBlockNumber(block.toString());
        }

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

          {/* <div className="status-item">
            <span>Reputation Score</span>
            <strong>⭐ {reputation}</strong>
            <small>Based on validated threat contributions</small>
          </div> */}

        </div>

        <div className="wallet-box">
          <span>Connected Wallet</span>
          <p>{account}</p>
        </div>

        <div className="network-box">
          <span>Network Details</span>

          <div className="network-grid">
            <div>
              <label>Network</label>
              <p>{networkName}</p>
            </div>

            <div>
              <label>Chain ID</label>
              <p>{chainId}</p>
            </div>

            <div>
              <label>Block</label>
              <p>{blockNumber}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;