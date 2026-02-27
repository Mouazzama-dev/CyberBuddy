// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AttestationEngine.sol";
import "../src/ThreatRegistry.sol";
import "../src/OrgRegistry.sol";

contract AttestationEngineTest is Test {
    AttestationEngine attestationEngine;
    ThreatRegistry threatRegistry;
    OrgRegistry orgRegistry;

    address admin = address(1);
    address org1 = address(2); // Submitter
    address org2 = address(3); // Attestor

    function setUp() public {
        // Deploy dependencies
        vm.startPrank(admin);
        orgRegistry = new OrgRegistry();
        threatRegistry = new ThreatRegistry(address(orgRegistry));
        attestationEngine = new AttestationEngine(address(threatRegistry), address(orgRegistry));
        vm.stopPrank();

        // Register both orgs
        vm.prank(org1);
        orgRegistry.registerOrganization("CyberUnit_1", bytes32(uint256(0xabc)));
        vm.prank(org2);
        orgRegistry.registerOrganization("CyberUnit_2", bytes32(uint256(0xdef)));

        // Submit a threat to attest
        vm.prank(org1);
        threatRegistry.submitThreat(bytes32(uint256(0x111)), "ipfs://link", 1, 1);
    }

    function test_AttestThreatGas() public {
        vm.prank(org2);
        attestationEngine.attestThreat(1, AttestationEngine.Verdict.VALID);

        (uint256 valid, uint256 invalid) = attestationEngine.getThreatStats(1);
        assertEq(valid, 1);
    }
}