// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ThreatRegistry.sol";
import "../src/OrgRegistry.sol";

contract ThreatRegistryTest is Test {
    ThreatRegistry public threatRegistry;
    OrgRegistry public orgRegistry;

    address admin = address(1);
    address org1 = address(2);

    function setUp() public {
        // 1. Deploy OrgRegistry first
        vm.prank(admin);
        orgRegistry = new OrgRegistry();

        // 2. Deploy ThreatRegistry with OrgRegistry address
        threatRegistry = new ThreatRegistry(address(orgRegistry));

        // 3. Register and activate the org so we can submit threats
        vm.prank(org1);
        orgRegistry.registerOrganization("CyberUnit", bytes32(uint256(0xabc)));
    }

    function test_SubmitThreat() public {
        vm.prank(org1);
        threatRegistry.submitThreat(
            bytes32(uint256(0x111)), 
            "ipfs://hash", 
            2, 
            1
        );
        
        assertEq(threatRegistry.threatCounter(), 1);
    }

    function test_ResolveThreat() public {
        // Setup: Submit a threat
        vm.prank(org1);
        threatRegistry.submitThreat(
            bytes32(uint256(0x111)), 
            "ipfs://hash", 
            2, 
            1
        );

        // Fast forward time to bypass RESOLUTION_TIME (5 mins)
        skip(6 minutes);

        // Resolve
        threatRegistry.resolveThreat(1);
        
        (,,,,,,,bool active) = threatRegistry.threats(1);
        assertFalse(active);
    }
}