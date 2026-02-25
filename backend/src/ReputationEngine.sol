// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AttestationEngine.sol";
import "./ThreatRegistry.sol";
import "./OrgRegistry.sol";

contract ReputationEngine {

    AttestationEngine public attestationEngine;
    ThreatRegistry public threatRegistry;
    OrgRegistry public orgRegistry;

    constructor(address attestAddr, address threatAddr, address orgAddr) {
        attestationEngine = AttestationEngine(attestAddr);
        threatRegistry = ThreatRegistry(threatAddr);
        orgRegistry = OrgRegistry(orgAddr);
    }

    mapping(address => uint256) public reputationScore;
    mapping(uint256 => bool) public reputationProcessed;

    event ReputationUpdated(address indexed org, uint256 newScore);

    error NotRegisteredOrganization();
    error ThreatNotResolved();
    error ReputationAlreadyProcessed();

    uint256 constant BASE_REWARD = 10;
    uint256 constant BASE_PENALTY = 5;

    function updateReputationFromThreat(uint256 threatId) external {

        if (reputationProcessed[threatId])
            revert ReputationAlreadyProcessed();

        (
            uint256 id,
            address submitter,
            bytes32 payloadHash,
            string memory storagePointer,
            uint8 severity,
            uint8 category,
            uint256 submittedAt,
            bool active
        ) = threatRegistry.threats(threatId);

        // ✅ Only after resolution
        if (active)
            revert ThreatNotResolved();

        if (!orgRegistry.isRegistered(submitter))
            revert NotRegisteredOrganization();

        (uint256 valid, uint256 invalid) =
            attestationEngine.getThreatStats(threatId);

        // ✅ Optional severity weighting 😏🔥
        uint256 reward = BASE_REWARD;
        uint256 penalty = BASE_PENALTY;

        if (severity == 2) {
            reward *= 2;
            penalty *= 2;
        } else if (severity >= 3) {
            reward *= 3;
            penalty *= 3;
        }

        if (valid > invalid) {

            reputationScore[submitter] += reward;

        } else if (invalid > valid) {

            uint256 current = reputationScore[submitter];

            if (current > penalty)
                reputationScore[submitter] -= penalty;
            else
                reputationScore[submitter] = 0;
        }

        reputationProcessed[threatId] = true;

        emit ReputationUpdated(
            submitter,
            reputationScore[submitter]
        );
    }
}