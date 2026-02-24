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
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-4">Register Organization</h2>

      <input
        className="w-full border rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder="Organization Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
          {success}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={registerOrg}
          disabled={loading}
          className="flex-1 bg-black text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Register"}
        </button>

        <button
          onClick={deactivateOrg}
          disabled={loading}
          className="flex-1 border border-black py-3 rounded-xl hover:bg-black hover:text-white transition disabled:opacity-50"
        >
          Deactivate
        </button>
      </div>
    </div>
  );
}