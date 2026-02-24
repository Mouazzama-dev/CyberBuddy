import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function RegisterOrg({ contracts, account }) {

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [organizations, setOrganizations] = useState([]);

  const ADMIN_ADDRESS =
    "0x5d1a7e1b7dC23d2E1f677E1Ed919fb501D36205e";
  console.log("Account:", account);

  useEffect(() => {
    if (!contracts || !account) return;

    refreshUI();
    checkAdmin();

  }, [contracts, account]);

  /* ---------------- ADMIN CHECK ---------------- */

  const checkAdmin = async () => {
    try {
      const adminAddress = await contracts.orgRegistry.admin();

      setIsAdmin(
        ethers.getAddress(account) === ethers.getAddress(adminAddress)
      );

    } catch (err) {
      console.log("Admin check failed");
    }
  };

  /* ---------------- ORG STATE ---------------- */

  const checkOrgState = async () => {
    try {
      const registered = await contracts.orgRegistry.isRegistered(account);
      setIsRegistered(registered);

      if (registered) {
        const active = await contracts.orgRegistry.isActive(account);
        setIsActive(active);
      } else {
        setIsActive(false);
      }

    } catch (err) {
      console.log("State check failed");
    }
  };

  /* ---------------- LOAD ORGS ---------------- */

  const loadOrganizations = async () => {
    try {
      const addresses = await contracts.orgRegistry.getOrganizations();

      const orgData = await Promise.all(
        addresses.map(addr =>
          contracts.orgRegistry.getOrganization(addr)
        )
      );

      setOrganizations(orgData);

    } catch (err) {
      console.log("Org loading failed");
    }
  };

  /* ---------------- REFRESH UI ---------------- */

  const refreshUI = async () => {
    await checkOrgState();
    await loadOrganizations();
  };

  /* ---------------- ERROR HANDLING ---------------- */

  const handleError = (err) => {
    console.error(err);

    let message = "Transaction failed";

    if (err.data) {
      try {
        const decodedError =
          contracts.orgRegistry.interface.parseError(err.data);

        switch (decodedError?.name) {

          case "AlreadyRegistered":
            message = "Organization already registered";
            break;

          case "NotRegistered":
            message = "Organization not registered";
            break;

          case "AlreadyInactive":
            message = "Organization already inactive";
            break;

          case "AlreadyActive":
            message = "Organization already active";
            break;

          case "InvalidName":
            message = "Invalid organization name";
            break;

          case "InvalidMetadata":
            message = "Invalid metadata";
            break;

          case "AdminCannotRegister":
            message = "Admin cannot register as organization";
            break;

          default:
            message = "Execution reverted";
        }

      } catch {
        message = "Execution reverted";
      }
    }

    setError(message);
  };

  /* ---------------- ACTIONS ---------------- */

  const registerOrg = async () => {
    console.log("Account:", account);
    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const tx = await contracts.orgRegistry.registerOrganization(
        name,
        ethers.keccak256(ethers.toUtf8Bytes("metadata"))
      );

      await tx.wait();
      await refreshUI();

      setSuccess("Organization successfully registered ✅");
      setName("");

    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const deactivateOrg = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const tx = await contracts.orgRegistry.deactivateOrganization();
      await tx.wait();
      await refreshUI();

      setSuccess("Organization deactivated ⚠️");

    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const reactivateOrg = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const tx = await contracts.orgRegistry.reactivateOrganization();
      await tx.wait();
      await refreshUI();

      setSuccess("Organization reactivated ✅");

    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const adminDeactivate = async (wallet) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const tx = await contracts.orgRegistry.adminDeactivate(wallet);
      await tx.wait();
      await refreshUI();

      setSuccess("Organization suspended ⚠️");

    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const adminReactivate = async (wallet) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const tx = await contracts.orgRegistry.adminReactivate(wallet);
      await tx.wait();
      await refreshUI();

      setSuccess("Organization restored ✅");

    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="page-container">
      <div className="card">

        <div className="header-row">
          <h2>Register Organization</h2>
          {isAdmin && <div className="admin-badge">Admin Mode 👑</div>}
        </div>

        <div className="wallet-box">
          Connected Wallet
          <span>{account || "Not Connected"}</span>
        </div>

        {!isAdmin && (
          <input
            placeholder="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || isRegistered}
          />
        )}

        {isAdmin && (
          <div className="error-box">
            Admin cannot register as organization
          </div>
        )}

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {!isAdmin && (
          <div className="button-group">

            {!isRegistered && (
              <button onClick={registerOrg} disabled={loading}>
                {loading ? "Processing..." : "Register"}
              </button>
            )}

            {isRegistered && (
              <>
                <button className="secondary" onClick={deactivateOrg} disabled={loading}>
                  Deactivate
                </button>

                <button className="secondary" onClick={reactivateOrg} disabled={loading}>
                  Reactivate
                </button>
              </>
            )}

          </div>
        )}

        <div className="org-list">
          <h3>Registered Organizations</h3>

          {organizations.map((org, index) => (
            <div key={index} className="org-card">

              <div className="org-info">
                <div className="org-name">{org.name}</div>
                <div className="org-wallet">{org.wallet}</div>
              </div>

              <div className="org-actions">

                <div className={`status-badge ${org.active ? "active" : "inactive"}`}>
                  {org.active ? "Active" : "Inactive"}
                </div>

                {isAdmin && (
                  org.active ? (
                    <button className="mini danger" onClick={() => adminDeactivate(org.wallet)}>
                      Suspend
                    </button>
                  ) : (
                    <button className="mini" onClick={() => adminReactivate(org.wallet)}>
                      Restore
                    </button>
                  )
                )}

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}