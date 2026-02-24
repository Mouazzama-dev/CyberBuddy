// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ThreatRegistry.sol";

contract DeployThreatRegistry is Script {

    function run() external {

        uint256 deployerKey = vm.parseUint(vm.envString("PRIVATE_KEY"));

        vm.startBroadcast(deployerKey);

        ThreatRegistry registry = new ThreatRegistry(
            0x39da6E2425Ae0208B93435E093c6d141D1301a71
        );

        console2.log("ThreatRegistry deployed at:", address(registry));

        vm.stopBroadcast();
    }
}
