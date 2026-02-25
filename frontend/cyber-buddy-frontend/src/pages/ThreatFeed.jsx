import { useEffect, useMemo, useState } from "react";

const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

function toHttpPointer(pointer) {
  if (!pointer) return "";
  // If already a normal URL (gateway/http)
  if (pointer.startsWith("http://") || pointer.startsWith("https://")) return pointer;

  // If ipfs://CID or ipfs://CID/path
  if (pointer.startsWith("ipfs://")) {
    const rest = pointer.replace("ipfs://", "");
    return `${IPFS_GATEWAY}${rest}`;
  }

  // If user pasted CID directly
  if (/^[a-zA-Z0-9]{30,}$/.test(pointer)) {
    return `${IPFS_GATEWAY}${pointer}`;
  }

  return pointer;
}

function safeJSONParse(str) {
  try {
    return { ok: true, data: JSON.parse(str) };
  } catch {
    return { ok: false, data: null };
  }
}

function consensusConfidence(validVotes, invalidVotes) {
  const v = Number(validVotes || 0);
  const iv = Number(invalidVotes || 0);
  const total = v + iv;
  if (total === 0) return 0;
  return Math.round((v / total) * 100);
}

function finalConfidence(jsonConf, consensusConf) {
  // Weighted combo: JSON confidence 60%, on-chain consensus 40%
  const jc = Number.isFinite(Number(jsonConf)) ? Number(jsonConf) : null;
  const cc = Number(consensusConf);

  if (jc === null) return cc; // if no JSON confidence, fallback to consensus
  return Math.round(jc * 0.6 + cc * 0.4);
}

const ThreatFeed = ({ contracts, account }) => {
  const [threatCount, setThreatCount] = useState(0);
  const [threats, setThreats] = useState([]);
  const [loadingVote, setLoadingVote] = useState(null);

  // IPFS JSON cache by threatId
  const [artifactMap, setArtifactMap] = useState({}); 
  // artifactMap[id] = { status: "idle"|"loading"|"ok"|"error", data?, error?, url? }

  const loadThreats = async () => {
    if (!contracts) return;

    try {
      const countBN = await contracts.threatRegistry.threatCounter();
      const count = Number(countBN);
      setThreatCount(count);

      const loaded = [];

      for (let i = 1; i <= count; i++) {
        const threat = await contracts.threatRegistry.threats(i);
        const stats = await contracts.attestationEngine.getThreatStats(i);
        const reputation = await contracts.reputationEngine.reputationScore(threat.submitter);

        const valid = stats.valid?.toString?.() ?? String(stats[0] ?? 0);
        const invalid = stats.invalid?.toString?.() ?? String(stats[1] ?? 0);

        const pointer = threat.storagePointer;
        const pointerUrl = toHttpPointer(pointer);

        const cc = consensusConfidence(valid, invalid);

        loaded.push({
          id: i,
          submitter: threat.submitter,
          payloadHash: threat.payloadHash,
          pointer,
          pointerUrl,
          severity: Number(threat.severity),
          category: Number(threat.category),
          validVotes: valid,
          invalidVotes: invalid,
          reputation: reputation.toString(),
          consensusConfidence: cc,
        });
      }

      setThreats(loaded);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!contracts) return;
    loadThreats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts]);

  const fetchArtifact = async (threat) => {
    const id = threat.id;
    const url = threat.pointerUrl;

    if (!url) {
      setArtifactMap((prev) => ({
        ...prev,
        [id]: { status: "error", error: "No pointer URL found." },
      }));
      return;
    }

    setArtifactMap((prev) => ({
      ...prev,
      [id]: { status: "loading", url },
    }));

    try {
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();

      // Some gateways return JSON correctly, some return as text
      const parsed = safeJSONParse(text);
      if (!parsed.ok) {
        throw new Error("Artifact is not valid JSON (or gateway blocked it).");
      }

      setArtifactMap((prev) => ({
        ...prev,
        [id]: { status: "ok", data: parsed.data, url },
      }));
    } catch (e) {
      setArtifactMap((prev) => ({
        ...prev,
        [id]: { status: "error", error: e?.message || "Failed to fetch artifact.", url },
      }));
    }
  };

  const attestThreat = async (id, verdict, submitter) => {
    if (!contracts) return;
    console.log(account);
    console.log(submitter);
      // 🚫 Prevent self-voting
  if (account?.toLowerCase() === submitter?.toLowerCase()) {
    alert("❌ Submitter cannot vote on their own threat");
    return;
  }

    try {
      setLoadingVote(id);

      const tx = await contracts.attestationEngine.attestThreat(id, verdict);
      await tx.wait();

      alert("✅ Vote Submitted");
      await loadThreats(); // refresh without page reload
    } catch (err) {
      console.error(err);

      // nicer errors (works with many ethers/metamask shapes)
      const name =
        err?.data?.errorName ||
        err?.errorName ||
        err?.reason ||
        err?.shortMessage ||
        err?.message;

      alert(`❌ ${name || "Transaction Reverted"}`);
    } finally {
      setLoadingVote(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Threat Intelligence Feed</h1>

      <div style={styles.counter}>
        🚨 Total Threats: <strong>{threatCount}</strong>
      </div>

      <div style={styles.grid}>
        {threats.map((t) => {
          const artifact = artifactMap[t.id];
          const artifactData = artifact?.status === "ok" ? artifact.data : null;

          const jsonConfidence = artifactData?.confidence ?? artifactData?.score ?? null;
          const fc = finalConfidence(jsonConfidence, t.consensusConfidence);

          return (
            <div key={t.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Threat #{t.id}</h3>

                <div style={styles.badges}>
                  <span style={styles.badge}>
                    Consensus: <b>{t.consensusConfidence}%</b>
                  </span>
                  <span style={styles.badge}>
                    Final: <b>{fc}%</b>
                  </span>
                </div>
              </div>

              <Info label="Submitter" value={t.submitter} />
              <Info label="Payload Hash" value={t.payloadHash} hash />
              <Info label="Pointer" value={t.pointer} mono />

              <div style={styles.metaRow}>
                <span>{getSeverity(t.severity)}</span>
                <span>{getCategory(t.category)}</span>
              </div>

              <div style={styles.stats}>
                <Stat label="Valid Votes" value={t.validVotes} />
                <Stat label="Invalid Votes" value={t.invalidVotes} />
              </div>

              <div style={styles.reputation}>
                ⭐ Submitter Reputation: {t.reputation}
              </div>

              {/* JSON Visualizer Panel */}
              <div style={styles.artifactBox}>
                <div style={styles.artifactTopRow}>
                  <div style={{ fontWeight: 700 }}>Artifact (IPFS JSON)</div>

                  <button
                    style={styles.smallBtn}
                    onClick={() => fetchArtifact(t)}
                    disabled={artifact?.status === "loading"}
                  >
                    {artifact?.status === "loading" ? "Loading..." : "Load JSON"}
                  </button>
                </div>

                <div style={styles.artifactUrl}>
                  {t.pointerUrl ? (
                    <a href={t.pointerUrl} target="_blank" rel="noreferrer" style={styles.link}>
                      Open via Gateway
                    </a>
                  ) : (
                    <span style={{ opacity: 0.6 }}>No gateway URL</span>
                  )}
                </div>

                {artifact?.status === "error" && (
                  <div style={styles.errorText}>❌ {artifact.error}</div>
                )}

                {artifact?.status === "ok" && artifactData && (
                  <div style={styles.jsonPanel}>
                    {/* Pretty high-signal fields */}
                    <Field label="type" value={artifactData.type} />
                    <Field label="confidence" value={artifactData.confidence} />
                    <Field label="description" value={artifactData.description} />
                    <Field label="recommended_action" value={artifactData.recommended_action} />

                    {/* IOC block if present */}
                    {artifactData.ioc && (
                      <div style={styles.iocBox}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>IOC</div>
                        {Object.entries(artifactData.ioc).map(([k, v]) => (
                          <Field key={k} label={k} value={String(v)} mono />
                        ))}
                      </div>
                    )}

                    {/* Raw JSON fallback */}
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ cursor: "pointer", opacity: 0.85 }}>
                        View Raw JSON
                      </summary>
                      <pre style={styles.pre}>{JSON.stringify(artifactData, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>

              {/* Attestation buttons */}
              <div style={styles.buttons}>
                <button
                  disabled={loadingVote === t.id}
                  onClick={() => attestThreat(t.id, 1, t.submitter)}
                >
                  {loadingVote === t.id ? "Voting..." : "✅ VALID"}
                </button>

                <button
                  disabled={loadingVote === t.id}
                  onClick={() => attestThreat(t.id, 2, t.submitter)}
                >
                  {loadingVote === t.id ? "Voting..." : "❌ INVALID"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Info = ({ label, value, hash, mono }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ opacity: 0.6, fontSize: 12 }}>{label}</div>
    <div
      style={{
        ...(hash ? styles.hash : {}),
        ...(mono ? styles.mono : {}),
      }}
    >
      {value}
    </div>
  </div>
);

const Field = ({ label, value, mono }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={styles.fieldRow}>
      <div style={styles.fieldKey}>{label}</div>
      <div style={{ ...styles.fieldVal, ...(mono ? styles.mono : {}) }}>
        {String(value)}
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div style={styles.statBox}>
    <div style={{ opacity: 0.6, fontSize: 12 }}>{label}</div>
    <strong style={{ fontSize: 16 }}>{value}</strong>
  </div>
);

const getSeverity = (level) => {
  if (level === 1) return "🟢 Low";
  if (level === 2) return "🟡 Medium";
  return "🔴 High";
};

const getCategory = (cat) => {
  if (cat === 1) return "Malware";
  if (cat === 2) return "Phishing";
  return "Botnet";
};

const styles = {
  container: { padding: "10px 20px" },
  title: { marginBottom: 8 },
  counter: { marginBottom: 18, fontSize: 16, opacity: 0.9 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: 18,
  },

  card: {
    background: "linear-gradient(145deg, #020617, #020617)",
    padding: 18,
    borderRadius: 14,
    border: "1px solid #1e293b",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    minWidth: 0, // important for long strings
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  cardTitle: { margin: 0 },

  badges: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  badge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #334155",
    background: "#0b1220",
    whiteSpace: "nowrap",
  },

  hash: { wordBreak: "break-all", fontSize: 12, color: "#38bdf8" },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", wordBreak: "break-all" },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 12,
    opacity: 0.85,
  },

  stats: { display: "flex", gap: 10, marginBottom: 12 },
  statBox: { flex: 1, background: "#0f172a", padding: 10, borderRadius: 10 },

  reputation: {
    marginBottom: 12,
    color: "#facc15",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#050b18",
  },

  artifactBox: {
    border: "1px solid #1e293b",
    background: "#050b18",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  artifactTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  artifactUrl: { fontSize: 12, opacity: 0.85, marginBottom: 10 },

  link: { color: "#38bdf8", textDecoration: "none" },

  smallBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "white",
    cursor: "pointer",
  },

  errorText: { color: "#fb7185", fontSize: 13 },

  jsonPanel: {
    borderTop: "1px solid #1e293b",
    paddingTop: 10,
  },

  iocBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    background: "#0b1220",
    border: "1px solid #1e293b",
  },

  fieldRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 10,
    padding: "6px 0",
    borderBottom: "1px dashed rgba(148,163,184,0.15)",
  },

  fieldKey: { opacity: 0.75, fontSize: 12 },
  fieldVal: { fontSize: 13, minWidth: 0 },

  pre: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    background: "#020617",
    border: "1px solid #1e293b",
    overflowX: "auto",
    fontSize: 12,
  },

  buttons: { display: "flex", gap: 10 },
};

export default ThreatFeed;
