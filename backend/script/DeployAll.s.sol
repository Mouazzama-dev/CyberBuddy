// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import "../src/OrgRegistry.sol";
import "../src/ThreatRegistry.sol";
import "../src/AttestationEngine.sol";
import "../src/ReputationEngine.sol";

contract DeployAll is Script {

    function run() external {

        uint256 key = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(key);

        OrgRegistry org = new OrgRegistry();
        console2.log("OrgRegistry:", address(org));

        ThreatRegistry threat = new ThreatRegistry(address(org));
        console2.log("ThreatRegistry:", address(threat));

        AttestationEngine attest =
            new AttestationEngine(address(threat), address(org));
        console2.log("AttestationEngine:", address(attest));

        ReputationEngine rep =
            new ReputationEngine(address(attest), address(threat), address(org));
        console2.log("ReputationEngine:", address(rep));

        vm.stopBroadcast();
    }
}