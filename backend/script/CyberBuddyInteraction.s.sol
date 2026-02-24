// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

interface IOrgRegistry {
    function registerOrganization(string calldata name, bytes32 metadataHash) external;
    function reputationScore(address) external view returns (uint256);
}

interface IThreatRegistry {
    function submitThreat(
        bytes32 payloadHash,
        string calldata storagePointer,
        uint8 severity,
        uint8 category
    ) external;
}

interface IAttestationEngine {
    enum Verdict { NONE, VALID, INVALID }

    function attestThreat(uint256 threatId, Verdict verdict) external;
    function getThreatStats(uint256 threatId) external view returns (uint256 valid, uint256 invalid);
}

interface IReputationEngine {
    function updateReputationFromThreat(uint256 threatId) external;
    function reputationScore(address) external view returns (uint256);
}

contract CyberBuddyInteraction is Script {

    address constant ORG_REGISTRY =
        0x39da6E2425Ae0208B93435E093c6d141D1301a71;

    address constant THREAT_REGISTRY =
        0x61B47c014eb9B17d11A42dD3bdf46771ae877A1f;

    address constant ATTESTATION_ENGINE =
        0x00F0d74417DCFcd544351E271df6da7BFb2261C2;

    address constant REPUTATION_ENGINE =
        0x83F314cf53d0aeCB26DB7cE5e4091b8bE12bA4Db;

    function run() external {

        uint256 orgAKey = vm.envUint("PRIVATE_KEY");
        uint256 orgBKey = vm.envUint("SECOND_PRIVATE_KEY");

        address orgA = vm.addr(orgAKey);
        address orgB = vm.addr(orgBKey);

        console.log("\n=== Cyber Buddy Interaction ===");
        console.log("Org A:", orgA);
        console.log("Org B:", orgB);

        IOrgRegistry org = IOrgRegistry(ORG_REGISTRY);
        IThreatRegistry threat = IThreatRegistry(THREAT_REGISTRY);
        IAttestationEngine attest = IAttestationEngine(ATTESTATION_ENGINE);
        IReputationEngine rep = IReputationEngine(REPUTATION_ENGINE);

        bytes32 meta = keccak256("metadata");

        // -----------------------------
        // 1️⃣ Register Org A (Safe)
        // -----------------------------
        vm.startBroadcast(orgAKey);

        try org.registerOrganization("Org Alpha", meta) {
            console.log("Org A Registered");
        } catch {
            console.log(" Org A Already Registered");
        }

        vm.stopBroadcast();

        // -----------------------------
        // 2️⃣ Register Org B (Safe)
        // -----------------------------
        vm.startBroadcast(orgBKey);

        try org.registerOrganization("Org Beta", meta) {
            console.log("Org B Registered");
        } catch {
            console.log(" Org B Already Registered");
        }

        vm.stopBroadcast();

        // -----------------------------
        // 3️⃣ Submit Threat (Org A)
        // -----------------------------
        vm.startBroadcast(orgAKey);

        try threat.submitThreat(
            keccak256("malicious-ip-123"),
            "ipfs://threat-data",
            3,
            1
        ) {
            console.log(" Threat Submitted");
        } catch {
            console.log("Threat Submission Failed");
        }

        vm.stopBroadcast();

        // -----------------------------
        // 4️⃣ Attest Threat (Org B)
        // -----------------------------
        vm.startBroadcast(orgBKey);

        try attest.attestThreat(
            1,
            IAttestationEngine.Verdict.VALID
        ) {
            console.log(" Threat Attested");
        } catch {
            console.log("Attestation Failed");
        }

        vm.stopBroadcast();

        // -----------------------------
        // 5️⃣ Update Reputation
        // -----------------------------
        vm.startBroadcast(orgAKey);

        try rep.updateReputationFromThreat(1) {
            console.log("Reputation Updated");
        } catch {
            console.log("Reputation Update Failed");
        }

        vm.stopBroadcast();

        // -----------------------------
        // 6️⃣ Read Stats
        // -----------------------------
        (uint256 valid, uint256 invalid) =
            attest.getThreatStats(1);

        console.log("\n=== Threat Stats ===");
        console.log("Valid Votes:", valid);
        console.log("Invalid Votes:", invalid);

        uint256 repScore = rep.reputationScore(orgA);

        console.log("\n=== Reputation ===");
        console.log("Org A Reputation:", repScore);
        console.log("===============================\n");
    }
}
