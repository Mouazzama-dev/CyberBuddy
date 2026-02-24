import { ethers } from "ethers";
import {
  ORG_REGISTRY,
  THREAT_REGISTRY,
  ATTESTATION_ENGINE,
  REPUTATION_ENGINE,
} from "../config/contracts";

import OrgRegistryABI from "../abis/OrgRegistry.json";
import ThreatRegistryABI from "../abis/ThreatRegistry.json";
import AttestationABI from "../abis/AttestationEngine.json";
import ReputationABI from "../abis/ReputationEngine.json";

export const getContracts = (signer) => {
  return {
    orgRegistry: new ethers.Contract(ORG_REGISTRY, OrgRegistryABI, signer),
    threatRegistry: new ethers.Contract(THREAT_REGISTRY, ThreatRegistryABI, signer),
    attestationEngine: new ethers.Contract(ATTESTATION_ENGINE, AttestationABI, signer),
    reputationEngine: new ethers.Contract(REPUTATION_ENGINE, ReputationABI, signer),
  };
};
