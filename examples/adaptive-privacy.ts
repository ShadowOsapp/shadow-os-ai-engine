/**
 * Example: Adaptive Privacy Levels
 * 
 * Demonstrates how AI adapts privacy levels based on context
 */

import { PrivacyAdapter, PrivacyContext, ThreatLevel } from '../src/intelligence/privacy-adapter';

async function main() {
  console.log('=== ShadowOS Adaptive Privacy Example ===\n');

  // Initialize privacy adapter
  const adapter = new PrivacyAdapter();

  // Example 1: Low threat payment
  console.log('Example 1: Low Threat Payment');
  const lowThreatContext: PrivacyContext = {
    userPseudonym: new Uint8Array(32).fill(1),
    transactionType: 'payment',
    amount: 1000000n, // 1 USDC
    threatLevel: 'low'
  };

  const lowThreatPrivacy = await adapter.adaptPrivacyLevel(lowThreatContext);
  console.log(`✓ Privacy configuration:`);
  console.log(`  - Level: ${lowThreatPrivacy.level}`);
  console.log(`  - Proof size: ${lowThreatPrivacy.proofSize} bytes`);
  console.log(`  - Verify time: ${lowThreatPrivacy.verifyTime}ms`);
  console.log(`  - ZK proof required: ${lowThreatPrivacy.zkProofRequired}`);
  console.log(`  - Merkle depth: ${lowThreatPrivacy.merkleDepth}\n`);

  // Example 2: High threat payment
  console.log('Example 2: High Threat Payment');
  const highThreatContext: PrivacyContext = {
    userPseudonym: new Uint8Array(32).fill(2),
    transactionType: 'payment',
    amount: 10000000n, // 10 USDC
    threatLevel: 'high'
  };

  const highThreatPrivacy = await adapter.adaptPrivacyLevel(highThreatContext);
  console.log(`✓ Privacy configuration:`);
  console.log(`  - Level: ${highThreatPrivacy.level}`);
  console.log(`  - Proof size: ${highThreatPrivacy.proofSize} bytes`);
  console.log(`  - Verify time: ${highThreatPrivacy.verifyTime}ms`);
  console.log(`  - ZK proof required: ${highThreatPrivacy.zkProofRequired}`);
  console.log(`  - Merkle depth: ${highThreatPrivacy.merkleDepth}\n`);

  // Example 3: Compliance transaction
  console.log('Example 3: Compliance Transaction');
  const complianceContext: PrivacyContext = {
    userPseudonym: new Uint8Array(32).fill(3),
    transactionType: 'compliance',
    threatLevel: 'medium'
  };

  const compliancePrivacy = await adapter.adaptPrivacyLevel(complianceContext);
  console.log(`✓ Privacy configuration:`);
  console.log(`  - Level: ${compliancePrivacy.level}`);
  console.log(`  - Proof size: ${compliancePrivacy.proofSize} bytes`);
  console.log(`  - Verify time: ${compliancePrivacy.verifyTime}ms\n`);

  // Example 4: Network-aware privacy
  console.log('Example 4: Network-Aware Privacy');
  const networkContext: PrivacyContext = {
    userPseudonym: new Uint8Array(32).fill(4),
    transactionType: 'payment',
    amount: 5000000n,
    threatLevel: 'medium',
    networkConditions: {
      congestion: 0.9, // High congestion
      avgGasPrice: 100n, // gwei
      networkHealth: 0.8
    }
  };

  const networkPrivacy = await adapter.adaptPrivacyLevel(networkContext);
  console.log(`✓ Privacy configuration:`);
  console.log(`  - Level: ${networkPrivacy.level}`);
  console.log(`  - Proof size: ${networkPrivacy.proofSize} bytes`);
  console.log(`  - Verify time: ${networkPrivacy.verifyTime}ms\n`);

  // Update threat history
  adapter.updateThreatHistory(new Uint8Array(32).fill(1), 'low');
  adapter.updateThreatHistory(new Uint8Array(32).fill(2), 'high');
  console.log('✓ Updated threat history\n');

  console.log('=== Example Complete ===');
}

main().catch(console.error);

