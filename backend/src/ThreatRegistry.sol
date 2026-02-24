// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OrgRegistry.sol";

contract ThreatRegistry {

    OrgRegistry public orgRegistry;

    constructor(address registryAddress) {
        orgRegistry = OrgRegistry(registryAddress);
    }

    struct Threat {
        uint256 id;
        address submitter;
        bytes32 payloadHash;
        string storagePointer;
        uint8 severity;
        uint8 category;
        uint256 submittedAt;
        bool active;
    }

    uint256 public threatCounter;

    mapping(uint256 => Threat) public threats;

    event ThreatSubmitted(
        uint256 indexed id,
        address indexed submitter,
        uint8 severity,
        uint8 category
    );

    error NotRegisteredOrganization();
    error OrganizationInactive();

    function submitThreat(
        bytes32 payloadHash,
        string calldata storagePointer,
        uint8 severity,
        uint8 category
    ) external {

        if (!orgRegistry.isRegistered(msg.sender))
            revert NotRegisteredOrganization();

        if (!orgRegistry.isActive(msg.sender))
            revert OrganizationInactive();

        threatCounter++;

        threats[threatCounter] = Threat({
            id: threatCounter,
            submitter: msg.sender,
            payloadHash: payloadHash,
            storagePointer: storagePointer,
            severity: severity,
            category: category,
            submittedAt: block.timestamp,
            active: true
        });

        emit ThreatSubmitted(threatCounter, msg.sender, severity, category);
    }
}
