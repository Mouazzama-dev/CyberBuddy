// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrgRegistry {

    struct Organization {
        address wallet;
        string name;
        bytes32 metadataHash;
        uint256 registeredAt;
        bool active;
    }

    mapping(address => Organization) public organizations;
    mapping(address => bool) public isRegistered;

    event OrganizationRegistered(address indexed wallet, string name);
    event OrganizationDeactivated(address indexed wallet);

    error AlreadyRegistered();
    error NotRegistered();

    function registerOrganization(string calldata name, bytes32 metadataHash) external {

        if (isRegistered[msg.sender]) revert AlreadyRegistered();

        organizations[msg.sender] = Organization({
            wallet: msg.sender,
            name: name,
            metadataHash: metadataHash,
            registeredAt: block.timestamp,
            active: true
        });

        isRegistered[msg.sender] = true;

        emit OrganizationRegistered(msg.sender, name);
    }

    function deactivateOrganization() external {

        if (!isRegistered[msg.sender]) revert NotRegistered();

        organizations[msg.sender].active = false;

        emit OrganizationDeactivated(msg.sender);
    }

    function isActive(address wallet) external view returns (bool) {
        return organizations[wallet].active;
    }
}
