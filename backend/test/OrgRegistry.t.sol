// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/OrgRegistry.sol"; // Adjust path to your actual src folder

contract OrgRegistryTest is Test {
    OrgRegistry public registry;
    
    // Test users
    address admin = address(1);
    address org1 = address(2);
    address org2 = address(3);

    function setUp() public {
        // Label addresses for clearer trace logs
        vm.label(admin, "Admin");
        vm.label(org1, "Organization_1");
        
        // Deploy as admin
        vm.prank(admin);
        registry = new OrgRegistry();
    }

    function test_RegisterOrganization() public {
        vm.prank(org1);
        registry.registerOrganization("CyberDyne", bytes32(uint256(0x123)));
        
        assertTrue(registry.isRegistered(org1));
        assertEq(registry.organizationCount(), 1);
    }

    function test_DeactivateAndReactivate() public {
        // Setup: Register first
        vm.prank(org1);
        registry.registerOrganization("CyberDyne", bytes32(uint256(0x123)));

        // Deactivate
        vm.prank(org1);
        registry.deactivateOrganization();
        assertFalse(registry.isActive(org1));

        // Reactivate
        vm.prank(org1);
        registry.reactivateOrganization();
        assertTrue(registry.isActive(org1));
    }

    function test_AdminActions() public {
        // Register an org
        vm.prank(org1);
        registry.registerOrganization("CyberDyne", bytes32(uint256(0x123)));

        // Admin deactivates
        vm.prank(admin);
        registry.adminDeactivate(org1);
        assertFalse(registry.isActive(org1));
    }
}