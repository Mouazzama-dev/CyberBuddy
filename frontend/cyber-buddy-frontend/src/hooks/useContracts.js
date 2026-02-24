import { useMemo } from "react";
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

export const useContracts = (signer) => {
  return useMemo(() => {
    if (!signer) return null;

    return {
      orgRegistry: new ethers.Contract(ORG_REGISTRY, OrgRegistryABI.abi, signer),

      threatRegistry: new ethers.Contract(
        THREAT_REGISTRY,
        ThreatRegistryABI.abi,
        signer
      ),

      attestationEngine: new ethers.Contract(
        ATTESTATION_ENGINE,
        AttestationABI.abi,
        signer
      ),

      reputationEngine: new ethers.Contract(
        REPUTATION_ENGINE,
        ReputationABI.abi,
        signer
      ),
    };
  }, [signer]);
};
