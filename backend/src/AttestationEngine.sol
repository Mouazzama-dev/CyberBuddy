// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ThreatRegistry.sol";
import "./OrgRegistry.sol";

contract AttestationEngine {

    ThreatRegistry public threatRegistry;
    OrgRegistry public orgRegistry;

    constructor(address threatAddress, address orgAddress) {
        threatRegistry = ThreatRegistry(threatAddress);
        orgRegistry = OrgRegistry(orgAddress);
    }

    enum Verdict { NONE, VALID, INVALID }

    struct AttestationStats {
        uint256 validCount;
        uint256 invalidCount;
    }

    mapping(uint256 => AttestationStats) public threatStats;

    mapping(uint256 => mapping(address => Verdict)) public votes;

    event ThreatAttested(
        uint256 indexed threatId,
        address indexed validator,
        Verdict verdict
    );

    error NotRegisteredOrganization();
    error AlreadyVoted();
    error OrganizationInactive();

    function attestThreat(uint256 threatId, Verdict verdict) external {

        if (!orgRegistry.isRegistered(msg.sender))
            revert NotRegisteredOrganization();

        if (!orgRegistry.isActive(msg.sender))
            revert OrganizationInactive();

        if (votes[threatId][msg.sender] != Verdict.NONE)
            revert AlreadyVoted();

        votes[threatId][msg.sender] = verdict;

        if (verdict == Verdict.VALID) {
            threatStats[threatId].validCount++;
        } else if (verdict == Verdict.INVALID) {
            threatStats[threatId].invalidCount++;
        }

        emit ThreatAttested(threatId, msg.sender, verdict);
    }

    function getThreatStats(uint256 threatId)
        external
        view
        returns (uint256 valid, uint256 invalid)
    {
        valid = threatStats[threatId].validCount;
        invalid = threatStats[threatId].invalidCount;
    }
}
