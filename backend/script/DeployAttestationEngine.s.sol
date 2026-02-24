// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AttestationEngine.sol";

contract DeployAttestationEngine is Script {

    function run() external {

        uint256 deployerKey = vm.parseUint(vm.envString("PRIVATE_KEY"));

        vm.startBroadcast(deployerKey);

        AttestationEngine engine = new AttestationEngine(
            0x61B47c014eb9B17d11A42dD3bdf46771ae877A1f, // ThreatRegistry
            0x39da6E2425Ae0208B93435E093c6d141D1301a71  // OrgRegistry
        );

        console2.log("AttestationEngine deployed at:", address(engine));

        vm.stopBroadcast();
    }
}
