/**
 * Example: ML-Based Reputation Learning
 * 
 * Demonstrates how AI learns from payment patterns to predict reputation
 */

import { AIReputationLearner, PaymentPattern, TrainingData } from '../src/intelligence/reputation-learner';

async function main() {
  console.log('=== ShadowOS ML Reputation Learning Example ===\n');

  // Initialize reputation learner
  const learner = new AIReputationLearner();

  // Create sample payment patterns
  const paymentHistory: PaymentPattern[] = [
    {
      pseudonym: new Uint8Array(32).fill(1),
      amount: 1000000n,
      timestamp: BigInt(Date.now() - 86400000 * 7), // 7 days ago
      chain: 'ethereum',
      success: true
    },
    {
      pseudonym: new Uint8Array(32).fill(1),
      amount: 2000000n,
      timestamp: BigInt(Date.now() - 86400000 * 5), // 5 days ago
      chain: 'polygon',
      success: true
    },
    {
      pseudonym: new Uint8Array(32).fill(1),
      amount: 1500000n,
      timestamp: BigInt(Date.now() - 86400000 * 3), // 3 days ago
      chain: 'arbitrum',
      success: true
    },
    {
      pseudonym: new Uint8Array(32).fill(1),
      amount: 3000000n,
      timestamp: BigInt(Date.now() - 86400000 * 1), // 1 day ago
      chain: 'ethereum',
      success: true
    }
  ];

  // Train model
  console.log('Training reputation model...');
  const trainingData: TrainingData = {
    payments: paymentHistory,
    labels: [60, 65, 70, 75] // Reputation scores
  };

  await learner.train(trainingData);
  console.log('✓ Model trained\n');

  // Predict reputation for existing user
  console.log('Predicting reputation for existing user...');
  const prediction1 = await learner.predict(
    new Uint8Array(32).fill(1),
    paymentHistory
  );

  console.log(`✓ Reputation prediction:`);
  console.log(`  - Score: ${prediction1.score.toFixed(1)}/100`);
  console.log(`  - Confidence: ${(prediction1.confidence * 100).toFixed(1)}%`);
  console.log(`  - Factors: ${prediction1.factors.join(', ')}\n`);

  // Predict reputation for new user (no history)
  console.log('Predicting reputation for new user...');
  const newUserPseudonym = new Uint8Array(32).fill(2);
  const prediction2 = await learner.predict(newUserPseudonym);

  console.log(`✓ Reputation prediction:`);
  console.log(`  - Score: ${prediction2.score.toFixed(1)}/100`);
  console.log(`  - Confidence: ${(prediction2.confidence * 100).toFixed(1)}%`);
  console.log(`  - Factors: ${prediction2.factors.join(', ')}\n`);

  // Learn from new payments
  console.log('Learning from new payment patterns...');
  const newPayments: PaymentPattern[] = [
    {
      pseudonym: new Uint8Array(32).fill(1),
      amount: 5000000n,
      timestamp: BigInt(Date.now()),
      chain: 'polygon',
      success: true
    }
  ];

  await learner.learnFromPayments(newPayments);
  console.log('✓ Learned from new patterns\n');

  // Predict again after learning
  const updatedPrediction = await learner.predict(
    new Uint8Array(32).fill(1),
    [...paymentHistory, ...newPayments]
  );

  console.log(`✓ Updated reputation prediction:`);
  console.log(`  - Score: ${updatedPrediction.score.toFixed(1)}/100`);
  console.log(`  - Confidence: ${(updatedPrediction.confidence * 100).toFixed(1)}%\n`);

  console.log('=== Example Complete ===');
}

main().catch(console.error);

