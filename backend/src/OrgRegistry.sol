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

    address[] public organizationList;

    uint256 public organizationCount;
    address public admin;

    event OrganizationRegistered(address indexed wallet, string name);
    event OrganizationDeactivated(address indexed wallet);
    event OrganizationReactivated(address indexed wallet);

    error AlreadyRegistered();
    error NotRegistered();
    error AlreadyInactive();
    error AlreadyActive();
    error InvalidName();
    error InvalidMetadata();
    error AdminCannotRegister();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerOrganization(
        string calldata name,
        bytes32 metadataHash
    ) external {

        if (msg.sender == admin) revert AdminCannotRegister();
        if (isRegistered[msg.sender]) revert AlreadyRegistered();
        if (bytes(name).length == 0) revert InvalidName();
        if (metadataHash == bytes32(0)) revert InvalidMetadata();

        organizations[msg.sender] = Organization({
            wallet: msg.sender,
            name: name,
            metadataHash: metadataHash,
            registeredAt: block.timestamp,
            active: true
        });

        isRegistered[msg.sender] = true;

        organizationList.push(msg.sender);
        organizationCount++;

        emit OrganizationRegistered(msg.sender, name);
    }

    function deactivateOrganization() external {

        if (!isRegistered[msg.sender]) revert NotRegistered();
        if (!organizations[msg.sender].active) revert AlreadyInactive();

        organizations[msg.sender].active = false;

        emit OrganizationDeactivated(msg.sender);
    }

    function reactivateOrganization() external {

        if (!isRegistered[msg.sender]) revert NotRegistered();
        if (organizations[msg.sender].active) revert AlreadyActive();

        organizations[msg.sender].active = true;

        emit OrganizationReactivated(msg.sender);
    }

    function adminDeactivate(address org) external onlyAdmin {

        if (!isRegistered[org]) revert NotRegistered();
        if (!organizations[org].active) revert AlreadyInactive();

        organizations[org].active = false;

        emit OrganizationDeactivated(org);
    }

    function adminReactivate(address org) external onlyAdmin {

        if (!isRegistered[org]) revert NotRegistered();
        if (organizations[org].active) revert AlreadyActive();

        organizations[org].active = true;

        emit OrganizationReactivated(org);
    }

    function isActive(address wallet) external view returns (bool) {

        if (!isRegistered[wallet]) revert NotRegistered();

        return organizations[wallet].active;
    }

    function getOrganizations() external view returns (address[] memory) {
        return organizationList;
    }

    function getOrganization(address wallet)
        external
        view
        returns (Organization memory)
    {
        if (!isRegistered[wallet]) revert NotRegistered();
        return organizations[wallet];
    }
}