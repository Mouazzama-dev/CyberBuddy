// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ReputationEngine.sol";

// We create simple Mock contracts to simulate the external calls
contract MockThreatRegistry {
    struct Threat {
        uint256 id; address submitter; bytes32 payloadHash; string storagePointer;
        uint8 severity; uint8 category; uint256 submittedAt; bool active;
    }
    mapping(uint256 => Threat) public threats;
    function setThreat(uint256 id, address sub, uint8 sev, bool active) external {
        threats[id] = Threat(id, sub, "", "", sev, 0, block.timestamp, active);
    }
}

contract MockOrgRegistry {
    mapping(address => bool) public isRegistered;
    function setRegistered(address org, bool status) external { isRegistered[org] = status; }
}

contract MockAttestationEngine {
    mapping(uint256 => uint256[2]) stats;
    function setStats(uint256 id, uint256 v, uint256 i) external { stats[id] = [v, i]; }
    function getThreatStats(uint256 id) external view returns (uint256, uint256) {
        return (stats[id][0], stats[id][1]);
    }
}

contract ReputationEngineTest is Test {
    ReputationEngine engine;
    MockThreatRegistry threatReg;
    MockOrgRegistry orgReg;
    MockAttestationEngine attestEng;

    address user = address(0xABC);

    function setUp() public {
        threatReg = new MockThreatRegistry();
        orgReg = new MockOrgRegistry();
        attestEng = new MockAttestationEngine();
        
        engine = new ReputationEngine(
            address(attestEng), 
            address(threatReg), 
            address(orgReg)
        );
    }

    function test_UpdateReputationGas() public {
        // Setup mock data
        uint256 threatId = 1;
        threatReg.setThreat(threatId, user, 3, false); // Severity 3, resolved
        orgReg.setRegistered(user, true);
        attestEng.setStats(threatId, 10, 2); // 10 valid, 2 invalid

        // Execute function to measure gas
        engine.updateReputationFromThreat(threatId);
        
        assertEq(engine.reputationScore(user), 30); // BASE_REWARD (10) * 3
    }
}