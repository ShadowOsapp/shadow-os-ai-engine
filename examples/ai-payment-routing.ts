/**
 * Example: AI-Optimized Payment Routing
 * 
 * Demonstrates how AI finds optimal routes for X402 stealth payments
 */

import { AIPaymentRouter, RoutingOptions } from '../src/intelligence/payment-optimizer';

async function main() {
  console.log('=== ShadowOS AI Payment Routing Example ===\n');

  // Initialize AI payment router
  const router = new AIPaymentRouter();

  // Example 1: High privacy payment
  console.log('Example 1: High Privacy Payment');
  const highPrivacyRoute = await router.findOptimalRoute({
    amount: 5000000n, // 5 USDC
    privacyLevel: 'high',
    maxGasPrice: 50n // gwei
  });

  console.log(`✓ Optimal route: ${highPrivacyRoute.chain}`);
  console.log(`  - Estimated gas: ${highPrivacyRoute.estimatedGas}`);
  console.log(`  - Privacy score: ${highPrivacyRoute.privacyScore.toFixed(2)}`);
  console.log(`  - Success rate: ${(highPrivacyRoute.successRate * 100).toFixed(1)}%`);
  console.log(`  - Estimated time: ${highPrivacyRoute.estimatedTime}ms\n`);

  // Example 2: Maximum privacy payment
  console.log('Example 2: Maximum Privacy Payment');
  const maxPrivacyRoute = await router.findOptimalRoute({
    amount: 10000000n, // 10 USDC
    privacyLevel: 'maximum',
    preferredChains: ['ethereum', 'polygon', 'arbitrum']
  });

  console.log(`✓ Optimal route: ${maxPrivacyRoute.chain}`);
  console.log(`  - Estimated gas: ${maxPrivacyRoute.estimatedGas}`);
  console.log(`  - Privacy score: ${maxPrivacyRoute.privacyScore.toFixed(2)}`);
  console.log(`  - Success rate: ${(maxPrivacyRoute.successRate * 100).toFixed(1)}%\n`);

  // Example 3: Cost-optimized payment
  console.log('Example 3: Cost-Optimized Payment');
  const costOptimizedRoute = await router.findOptimalRoute({
    amount: 1000000n, // 1 USDC
    privacyLevel: 'medium',
    maxGasPrice: 20n // gwei
  });

  console.log(`✓ Optimal route: ${costOptimizedRoute.chain}`);
  console.log(`  - Estimated gas: ${costOptimizedRoute.estimatedGas}`);
  console.log(`  - Privacy score: ${costOptimizedRoute.privacyScore.toFixed(2)}`);
  console.log(`  - Success rate: ${(costOptimizedRoute.successRate * 100).toFixed(1)}%\n`);

  // Update history after successful payment
  router.updateHistory(highPrivacyRoute.chain, highPrivacyRoute);
  console.log('✓ Updated routing history\n');

  console.log('=== Example Complete ===');
}

main().catch(console.error);

