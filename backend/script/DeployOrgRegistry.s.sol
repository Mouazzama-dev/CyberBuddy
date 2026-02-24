// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/OrgRegistry.sol";

contract DeployOrgRegistry is Script {

    function run() external {

        uint256 deployerKey = vm.parseUint(vm.envString("PRIVATE_KEY"));

        vm.startBroadcast(deployerKey);

        OrgRegistry registry = new OrgRegistry();

        console2.log("OrgRegistry deployed at:", address(registry));

        vm.stopBroadcast();
    }
}
