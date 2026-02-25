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
    error InvalidVerdict();
    error ThreatNotActive();
    error SelfVoteNotAllowed();

    function attestThreat(uint256 threatId, Verdict verdict) external {

        // ✅ Block garbage input
        if (verdict == Verdict.NONE)
            revert InvalidVerdict();

        if (!orgRegistry.isRegistered(msg.sender))
            revert NotRegisteredOrganization();

        if (!orgRegistry.isActive(msg.sender))
            revert OrganizationInactive();

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

        // ✅ Voting only while active
        if (!active)
            revert ThreatNotActive();

        // ✅ Prevent governance exploit
        if (msg.sender == submitter)
            revert SelfVoteNotAllowed();

        if (votes[threatId][msg.sender] != Verdict.NONE)
            revert AlreadyVoted();

        votes[threatId][msg.sender] = verdict;

        // ✅ Gas-optimized stats update
        AttestationStats storage stats = threatStats[threatId];

        if (verdict == Verdict.VALID) {
            stats.validCount++;
        } else {
            stats.invalidCount++;
        }

        emit ThreatAttested(threatId, msg.sender, verdict);
    }

    function getThreatStats(uint256 threatId)
        external
        view
        returns (uint256 valid, uint256 invalid)
    {
        AttestationStats storage stats = threatStats[threatId];
        valid = stats.validCount;
        invalid = stats.invalidCount;
    }
}