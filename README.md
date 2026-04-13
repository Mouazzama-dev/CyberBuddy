# 🛡️ Secure Cyber-Buddy Network
### A Decentralized Threat Intelligence & Collective Defense Ecosystem

[![Blockchain: Ethereum](https://img.shields.io/badge/Blockchain-Ethereum-blueviolet)](https://ethereum.org/)
[![Smart Contracts: Solidity](https://img.shields.io/badge/Smart%20Contracts-Solidity-gray)](https://soliditylang.org/)
[![Scale: Zero-Trust](https://img.shields.io/badge/Architecture-Zero--Trust-green)](https://en.wikipedia.org/wiki/Zero_trust_security)

---

## 🌍 The "Why"
Traditional cybersecurity is failing because it is **isolated**. When a major attack hits—like the **2025 European Aviation Shutdown** or the **JLR Supply-Chain Breach**—information moves too slowly. Centralized databases become targets, and organizations are hesitant to share data due to a "Trust Gap."

**Secure Cyber-Buddy Network** transforms threat intelligence from a solitary struggle into a **Blockchain-powered Collective Defense**. It ensures that "truth" is determined by the community, not a central authority, creating a tamper-proof early warning system for the modern age.

---

## ✨ Key Features
* **Decentralized Identity (OrgRegistry):** Vetted participation via admin control and self-governance.
* **Immutable Ledger (ThreatRegistry):** Cryptographic proof of threats using `payloadHash` to prevent data tampering.
* **Peer-to-Peer Consensus (AttestationEngine):** Community-driven validation (VALID/INVALID) to filter out noise and false positives.
* **Incentivized Trust (ReputationEngine):** A weighted scoring system that rewards accurate reporting of critical (Severity 3+) threats and penalizes misinformation.

---

## 🛠️ System Architecture

The platform is powered by four interconnected Smart Contracts that manage the lifecycle of an organization and a threat report:

1.  **Identity Layer (`OrgRegistry`):** The gatekeeper. Manages registration, vetting, and activation status of participating entities.
2.  **Data Layer (`ThreatRegistry`):** The core ledger. Stores threat metadata and storage pointers (IPFS) while keeping the blockchain lightweight.
3.  **Consensus Layer (`AttestationEngine`):** The peer-review system. Facilitates voting logic and prevents "self-voting" to ensure unbiased validation.
4.  **Incentive Layer (`ReputationEngine`):** The brain. Calculates trust scores based on community consensus and threat severity.

---

## 🚀 Technical Implementation

### Workflow
1.  **Submission:** A registered organization submits threat metadata to the `ThreatRegistry`.
2.  **Attestation:** Peer organizations review the data off-chain and submit their verdict (Valid/Invalid).
3.  **Resolution:** After the `RESOLUTION_TIME` expires, the threat is marked as inactive to finalize results.
4.  **Reputation Update:** The `ReputationEngine` processes rewards/penalties based on the community's consensus.

### Deployed Addresses (Ethereum Testnet)
| Contract | Address |
| :--- | :--- |
| **OrgRegistry** | `0xcB65a98296E1820dCF56E16127792b3B26A1b158` |
| **ThreatRegistry** | `0xDD28DD164505B959b747cA8af3Ec26A3C3b291c2` |
| **AttestationEngine** | `0xb8093f5ed3473418fC7e844bAC85E6C1B1A03ba8` |
| **ReputationEngine** | `0x4C77060112c0bf9927C82AbAe885D6B1669D9215` |

---

## 📊 Evaluation: Traditional vs. Cyber-Buddy

| Feature | Traditional Systems | Cyber-Buddy Network |
| :--- | :--- | :--- |
| **Trust Model** | Centralized / Third-party | Decentralized / Cryptographic |
| **Data Integrity** | Vulnerable to DB edits | Immutable Blockchain Ledger |
| **Incentives** | Altruistic (None) | Reputation-based Rewards |
| **Speed** | Manual / High Latency | Instantaneous Broadcast |

---

## 👥 Prepared By
* **Mouazzama Binte Umer** 
* **Umm e Farwa Syeda** 

---

## ⚖️ License
This project is licensed under the MIT License.
