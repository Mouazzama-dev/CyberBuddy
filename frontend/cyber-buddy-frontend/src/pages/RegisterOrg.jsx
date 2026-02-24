import { useState } from "react";
import { ethers } from "ethers";

export default function RegisterOrg({ contracts, account }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleError = (err) => {
    console.error(err);

    let message = "Transaction failed";

    if (err.data) {
      try {
        const decodedError =
          contracts.orgRegistry.interface.parseError(err.data);

        if (decodedError?.name === "AlreadyRegistered") {
          message = "Organization already registered";
        } else if (decodedError?.name === "NotRegistered") {
          message = "Organization not registered";
        }
      } catch {
        message = "Execution reverted";
      }
    } else if (err.reason) {
      message = err.reason;
    }

    setError(message);
  };

  const registerOrg = async () => {
    if (!contracts) return;
    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (contracts.orgRegistry.isRegistered && account) {
        const exists = await contracts.orgRegistry.isRegistered(account);
        if (exists) {
          setError("Organization already registered");
          setLoading(false);
          return;
        }
      }

      const tx = await contracts.orgRegistry.registerOrganization(
        name,
        ethers.keccak256(ethers.toUtf8Bytes("metadata"))
      );

      await tx.wait();
      setSuccess("Organization successfully registered ✅");
      setName("");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const deactivateOrg = async () => {
    if (!contracts) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const tx = await contracts.orgRegistry.deactivateOrganization();
      await tx.wait();

      setSuccess("Organization deactivated ⚠️");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="page-container">
    <div className="card">
      <h2>Register Organization</h2>

      <input
        placeholder="Organization Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <div className="button-group">
        <button onClick={registerOrg} disabled={loading}>
          {loading ? "Processing..." : "Register"}
        </button>

        <button
          className="secondary"
          onClick={deactivateOrg}
          disabled={loading}
        >
          Deactivate
        </button>
      </div>
    </div>
  </div>
);
}