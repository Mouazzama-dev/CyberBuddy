// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ThreatRegistry.sol";

contract DeployThreatRegistry is Script {

    function run() external {

        uint256 deployerKey = vm.parseUint(vm.envString("PRIVATE_KEY"));

        vm.startBroadcast(deployerKey);

        ThreatRegistry registry = new ThreatRegistry(
            0x1De0BFF1A4c7Bac3fB68e3B2F59de7E6f53d3c88  // OrgRegistry
        );

        console2.log("ThreatRegistry deployed at:", address(registry));

        vm.stopBroadcast();
    }
}
