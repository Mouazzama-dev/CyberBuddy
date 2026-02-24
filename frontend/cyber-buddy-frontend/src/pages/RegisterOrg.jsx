import { useState } from "react";
import { ethers } from "ethers";


const RegisterOrg = ({ contracts }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const registerOrg = async () => {
    if (!contracts) return;

    try {
      setLoading(true);

      const tx = await contracts.orgRegistry.registerOrganization(
        name,
        ethers.keccak256(ethers.toUtf8Bytes("metadata"))
      );

      await tx.wait();

      alert("✅ Organization Registered");
    } catch (err) {
      console.error(err);

      if (err.reason) {
        alert(err.reason);
      } else {
        alert("❌ Registration Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Register Organization</h2>

      <input
        placeholder="Organization Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={registerOrg}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
};

export default RegisterOrg;
