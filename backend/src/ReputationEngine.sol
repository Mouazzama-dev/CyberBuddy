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

    event ReputationUpdated(address indexed org, uint256 newScore);

    error NotRegisteredOrganization();

    uint256 constant REWARD = 10;
    uint256 constant PENALTY = 5;

    function updateReputationFromThreat(uint256 threatId) external {

        (uint256 valid, uint256 invalid) =
            attestationEngine.getThreatStats(threatId);

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

        if (!orgRegistry.isRegistered(submitter))
            revert NotRegisteredOrganization();

        if (valid > invalid) {
            reputationScore[submitter] += REWARD;
        } else if (invalid > valid) {

            uint256 current = reputationScore[submitter];

            if (current > PENALTY)
                reputationScore[submitter] -= PENALTY;
            else
                reputationScore[submitter] = 0;
        }

        emit ReputationUpdated(
            submitter,
            reputationScore[submitter]
        );
    }
}
