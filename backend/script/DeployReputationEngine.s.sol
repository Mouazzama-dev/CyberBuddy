// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ReputationEngine.sol";

contract DeployReputationEngine is Script {

    function run() external {

        uint256 deployerKey = vm.parseUint(vm.envString("PRIVATE_KEY"));

        vm.startBroadcast(deployerKey);

        ReputationEngine engine = new ReputationEngine(
            0x00F0d74417DCFcd544351E271df6da7BFb2261C2, // AttestationEngine
            0x61B47c014eb9B17d11A42dD3bdf46771ae877A1f, // ThreatRegistry
            0x39da6E2425Ae0208B93435E093c6d141D1301a71  // OrgRegistry
        );

        console2.log("ReputationEngine deployed at:", address(engine));

        vm.stopBroadcast();
    }
}
