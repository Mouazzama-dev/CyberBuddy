import { useEffect, useState } from "react";

const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

const RESOLUTION_TIME = 5 * 60;

function consensusConfidence(validVotes, invalidVotes) {
  const v = Number(validVotes || 0);
  const iv = Number(invalidVotes || 0);
  const total = v + iv;
  if (total === 0) return 0;
  return Math.round((v / total) * 100);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getConfidenceColor(score) {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#facc15";
  return "#fb7185";
}

function computeRepImpact(severity) {
  let reward = 10;
  let penalty = 5;

  if (severity === 2) {
    reward *= 2;
    penalty *= 2;
  } else if (severity >= 3) {
    reward *= 3;
    penalty *= 3;
  }

  return { reward, penalty };
}

const ThreatFeed = ({ contracts, account }) => {
  const [threats, setThreats] = useState([]);
  const [loadingVote, setLoadingVote] = useState(null);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadThreats = async () => {
    if (!contracts) return;

    try {
      const countBN = await contracts.threatRegistry.threatCounter();
      const count = Number(countBN);

      const loaded = [];

      for (let i = 1; i <= count; i++) {
        const threat = await contracts.threatRegistry.threats(i);
        const stats = await contracts.attestationEngine.getThreatStats(i);
        const reputation = await contracts.reputationEngine.reputationScore(
          threat.submitter
        );

        const valid = stats[0].toString();
        const invalid = stats[1].toString();

        const submittedAt = Number(threat.submittedAt);
        const expiry = submittedAt + RESOLUTION_TIME;

        const expired = now >= expiry;
        const timeLeft = Math.max(0, expiry - now);

        const cc = consensusConfidence(valid, invalid);
        const repImpact = computeRepImpact(Number(threat.severity));

        loaded.push({
          id: i,
          submitter: threat.submitter,
          severity: Number(threat.severity),
          validVotes: valid,
          invalidVotes: invalid,
          reputation: reputation.toString(),
          consensusConfidence: cc,
          expired,
          timeLeft,
          repImpact,
        });
      }

      setThreats(loaded);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadThreats();
  }, [contracts, now]);

  const attestThreat = async (id, verdict, submitter, expired) => {
    if (!contracts) return;

    if (expired) {
      alert("❌ Threat already resolved");
      return;
    }

    if (account?.toLowerCase() === submitter?.toLowerCase()) {
      alert("❌ Submitter cannot vote on their own threat");
      return;
    }

    try {
      setLoadingVote(id);

      const tx = await contracts.attestationEngine.attestThreat(id, verdict);
      await tx.wait();

      alert("✅ Vote Submitted");
      await loadThreats();
    } catch (err) {
      console.error(err);

      let message = "Transaction Reverted";

      try {
        const decoded =
          contracts.attestationEngine.interface.parseError(err.data);

        if (decoded?.name === "AlreadyVoted")
          message = "You already voted on this threat";
        else if (decoded?.name)
          message = decoded.name;
      } catch {}

      alert(`❌ ${message}`);
    } finally {
      setLoadingVote(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Threat Intelligence Feed</h1>

      <div style={styles.grid}>
        {threats.map((t) => (
          <div key={t.id} style={styles.card}>
            
            <div style={styles.headerRow}>
              <h3 style={{ margin: 0 }}>Threat #{t.id}</h3>

              <div
                style={{
                  ...styles.confidenceBadge,
                  color: getConfidenceColor(t.consensusConfidence),
                }}
              >
                Confidence: <b>{t.consensusConfidence}%</b>
              </div>
            </div>

            <div style={styles.timer}>
              {t.expired
                ? "⏱ Threat Resolved"
                : `⏱ Resolves in ${formatTime(t.timeLeft)}`}
            </div>

            <div style={styles.statsRow}>
              <span>✅ Valid: {t.validVotes}</span>
              <span>❌ Invalid: {t.invalidVotes}</span>
            </div>

            <div style={styles.reputationBox}>
              ⭐ Reputation: {t.reputation}

              {!t.expired && (
                <div style={styles.repImpact}>
                  🏆 Reward: +{t.repImpact.reward}  
                  💀 Penalty: -{t.repImpact.penalty}
                </div>
              )}
            </div>

            <div style={styles.buttons}>
              <button
                disabled={loadingVote === t.id || t.expired}
                onClick={() =>
                  attestThreat(t.id, 1, t.submitter, t.expired)
                }
              >
                {t.expired ? "RESOLVED" :
                 loadingVote === t.id ? "Voting..." : "✅ VALID"}
              </button>

              <button
                disabled={loadingVote === t.id || t.expired}
                onClick={() =>
                  attestThreat(t.id, 2, t.submitter, t.expired)
                }
              >
                {t.expired ? "RESOLVED" :
                 loadingVote === t.id ? "Voting..." : "❌ INVALID"}
              </button>
            </div>

            {/* ✅ ONLY NEW ADDITION */}
            {t.expired && (
              <button
                style={styles.repButton}
                onClick={async () => {
  try {
    // ✅ 1) Resolve on-chain first (only works after time passed)
    try {
      const rtx = await contracts.threatRegistry.resolveThreat(t.id);
      await rtx.wait();
    } catch (e) {
      // already resolved / or not resolvable yet → ignore
    }

    // ✅ 2) Now update reputation
    const tx = await contracts.reputationEngine.updateReputationFromThreat(t.id);
    await tx.wait();

    alert("✅ Reputation Updated");
    loadThreats();
  } catch (e) {
    console.log(e);

    // nicer message (optional)
    let msg = "Failed to update reputation";
    try {
      const decoded = contracts.reputationEngine.interface.parseError(e.data);
      if (decoded?.name === "ThreatNotResolved") msg = "Threat not resolved on-chain yet";
      else if (decoded?.name === "ReputationAlreadyProcessed") msg = "Reputation already processed";
      else if (decoded?.name) msg = decoded.name;
    } catch {}

    alert(`❌ ${msg}`);
  }
}}
              >
                ⭐ Update Reputation
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "10px 20px" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: 18,
  },

  card: {
    background: "#020617",
    padding: 18,
    borderRadius: 14,
    border: "1px solid #1e293b",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  confidenceBadge: {
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #334155",
    background: "#0b1220",
  },

  timer: {
    marginTop: 6,
    marginBottom: 10,
    fontWeight: 700,
    color: "#38bdf8",
  },

  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  reputationBox: {
    marginBottom: 12,
    color: "#facc15",
  },

  repImpact: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },

  buttons: { display: "flex", gap: 10 },

  /* ✅ NEW STYLE ONLY */
  repButton: {
    marginTop: 10,
    width: "100%",
    background: "#0b1220",
    border: "1px solid #334155",
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
    color: "#38bdf8",
  },
};

export default ThreatFeed;