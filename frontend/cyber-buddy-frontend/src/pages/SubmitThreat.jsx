import { useState } from "react";
import { ethers } from "ethers";

const SubmitThreat = ({ contracts }) => {
  const [payload, setPayload] = useState("");
  const [pointer, setPointer] = useState("");
  const [severity, setSeverity] = useState(3);
  const [category, setCategory] = useState(1);
  const [loading, setLoading] = useState(false);

  const [jsonInput, setJsonInput] = useState("");
  const [uploading, setUploading] = useState(false);

  // ✅ BLOCKCHAIN SUBMISSION
  const submitThreat = async () => {
    if (!contracts) return;

    try {
      setLoading(true);

      const payloadHash = ethers.keccak256(
        ethers.toUtf8Bytes(payload)
      );

      const tx = await contracts.threatRegistry.submitThreat(
        payloadHash,
        pointer,
        severity,
        category
      );

      await tx.wait();

      alert("✅ Threat Submitted Successfully");

      setPayload("");
      setPointer("");

    } catch (err) {
      console.error(err);

      if (err.reason) {
        alert(err.reason);
      } else {
        alert("❌ Transaction Failed");
      }

    } finally {
      setLoading(false);
    }
  };

  // ✅ RAW JSON → BACKEND → IPFS
  const uploadJSON = async () => {
    if (!jsonInput) return;

    try {
      setUploading(true);

      const parsedJSON = JSON.parse(jsonInput);

      const res = await fetch("http://localhost:4000/upload-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: parsedJSON,
        }),
      });

      const result = await res.json();

      if (result.success) {
        const cidURL = result.url;

        setPointer(cidURL);

        alert("🔥 JSON Uploaded to IPFS");
      } else {
        alert("❌ Upload Failed");
      }

    } catch (err) {
      console.error(err);

      alert("❌ Invalid JSON");

    } finally {
      setUploading(false);
    }
  };

  // ✅ FILE → BACKEND → IPFS
  const uploadFile = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      const text = await file.text();
      const parsedJSON = JSON.parse(text);

      const res = await fetch("http://localhost:4000/upload-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: parsedJSON,
        }),
      });

      const result = await res.json();

      if (result.success) {
        const cidURL = result.url;

        setPointer(cidURL);

        alert("🔥 File Uploaded to IPFS");
      } else {
        alert("❌ Upload Failed");
      }

    } catch (err) {
      console.error(err);

      alert("❌ Invalid JSON File");

    } finally {
      setUploading(false);
    }
  };

  return (
  <div className="page-container">
    <div className="card wide-card">

      <div className="header-row">
        <h2>Submit Threat Intelligence</h2>
      </div>

      {/* 📦 IPFS PANEL */}
      <div className="ipfs-panel">

        <h3>📦 Upload Threat Artifact (IPFS)</h3>

        <textarea
          placeholder="Paste Raw JSON Here"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />

        <button
          className="secondary"
          onClick={uploadJSON}
        >
          {uploading ? "Uploading..." : "Upload JSON"}
        </button>

        <div className="divider">OR</div>

        <input
          type="file"
          accept=".json"
          onChange={(e) => uploadFile(e.target.files[0])}
        />
      </div>

      {/* 🧱 BLOCKCHAIN FORM */}
      <div className="form-group">

        <input
          placeholder="Threat Payload (IP / URL / IOC)"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />

        <input
          placeholder="Storage Pointer (Auto-filled from IPFS)"
          value={pointer}
          onChange={(e) => setPointer(e.target.value)}
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
        >
          <option value={0}>Low Severity</option>
          <option value={1}>Medium Severity</option>
          <option value={2}>High Severity</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(Number(e.target.value))}
        >
          <option value={0}>Malware</option>
          <option value={1}>Phishing</option>
          <option value={2}>Botnet</option>
        </select>

        <button
          onClick={submitThreat}
          disabled={!payload || !pointer}
        >
          {loading ? "Submitting..." : "Submit Threat"}
        </button>

      </div>

    </div>
  </div>
);
};

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "420px",
    marginTop: "40px",
  },

  ipfsPanel: {
    background: "#020617",
    border: "1px solid #1e293b",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "600px",
  },

  textarea: {
    width: "100%",
    height: "120px",
    marginBottom: "10px",
    background: "#020617",
    color: "white",
    border: "1px solid #334155",
    padding: "10px",
    borderRadius: "8px",
  },

  divider: {
    margin: "10px 0",
    textAlign: "center",
    opacity: 0.6,
  },
};

export default SubmitThreat;