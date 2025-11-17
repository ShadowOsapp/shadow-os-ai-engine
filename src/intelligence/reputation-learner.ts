/**
 * ML-Based Reputation Learner
 * 
 * Learns from payment patterns to predict and improve reputation scores
 * without revealing personal information
 */

import { sha256 } from '@noble/hashes/sha256';

export interface PaymentPattern {
  pseudonym: Uint8Array;
  amount: bigint;
  timestamp: bigint;
  chain: string;
  success: boolean;
}

export interface ReputationPrediction {
  score: number;
  confidence: number;
  factors: string[];
}

export interface TrainingData {
  payments: PaymentPattern[];
  labels: number[]; // Reputation scores
}

export class AIReputationLearner {
  private model: ReputationModel;
  private trainingData: TrainingData[] = [];
  private isTrained: boolean = false;

  constructor() {
    this.model = new ReputationModel();
  }

  /**
   * Train model on payment history
   */
  async train(data: TrainingData): Promise<void> {
    this.trainingData.push(data);
    
    // Extract features from payments
    const features = this.extractFeatures(data.payments);
    
    // Train simple model (in production, use proper ML library)
    this.model.train(features, data.labels);
    
    this.isTrained = true;
  }

  /**
   * Predict reputation for pseudonym
   */
  async predict(pseudonym: Uint8Array, paymentHistory?: PaymentPattern[]): Promise<ReputationPrediction> {
    if (!this.isTrained && !paymentHistory) {
      // Return default prediction
      return {
        score: 50,
        confidence: 0.5,
        factors: ['insufficient_data']
      };
    }

    // Extract features from payment history
    const features = paymentHistory 
      ? this.extractFeatures(paymentHistory)
      : this.extractFeaturesFromPseudonym(pseudonym);

    // Predict reputation
    const prediction = this.model.predict(features);

    return {
      score: prediction.score,
      confidence: prediction.confidence,
      factors: this.identifyFactors(features)
    };
  }

  /**
   * Learn from new payment patterns
   */
  async learnFromPayments(payments: PaymentPattern[]): Promise<void> {
    // Extract patterns
    const patterns = this.identifyPatterns(payments);
    
    // Update model with new patterns
    this.model.update(patterns);
  }

  /**
   * Extract features from payments
   */
  private extractFeatures(payments: PaymentPattern[]): FeatureVector {
    if (payments.length === 0) {
      return this.createEmptyFeatures();
    }

    const amounts = payments.map(p => Number(p.amount));
    const timestamps = payments.map(p => Number(p.timestamp));
    const successCount = payments.filter(p => p.success).length;

    // Calculate statistics
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const totalAmount = amounts.reduce((a, b) => a + b, 0);
    const paymentCount = payments.length;
    const successRate = successCount / paymentCount;
    
    // Calculate time patterns
    const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
    const avgInterval = timeSpan > 0 ? timeSpan / paymentCount : 0;

    // Chain diversity
    const uniqueChains = new Set(payments.map(p => p.chain)).size;
    const chainDiversity = uniqueChains / 7; // Normalize by max chains

    return {
      paymentCount,
      totalAmount,
      avgAmount,
      successRate,
      avgInterval,
      chainDiversity,
      recentActivity: this.calculateRecentActivity(payments)
    };
  }

  /**
   * Extract features from pseudonym (privacy-preserving)
   */
  private extractFeaturesFromPseudonym(pseudonym: Uint8Array): FeatureVector {
    // Hash-based feature extraction (privacy-preserving)
    const hash = sha256(pseudonym);
    
    // Extract features from hash (deterministic but private)
    return {
      paymentCount: this.hashToNumber(hash, 0, 100),
      totalAmount: this.hashToNumber(hash, 1, 1000000),
      avgAmount: this.hashToNumber(hash, 2, 10000),
      successRate: this.hashToNumber(hash, 3, 100) / 100,
      avgInterval: this.hashToNumber(hash, 4, 86400),
      chainDiversity: this.hashToNumber(hash, 5, 100) / 100,
      recentActivity: this.hashToNumber(hash, 6, 100) / 100
    };
  }

  /**
   * Convert hash bytes to number
   */
  private hashToNumber(hash: Uint8Array, offset: number, max: number): number {
    const index = offset % hash.length;
    return (hash[index] / 255) * max;
  }

  /**
   * Calculate recent activity score
   */
  private calculateRecentActivity(payments: PaymentPattern[]): number {
    if (payments.length === 0) return 0;

    const now = Date.now();
    const recentPayments = payments.filter(
      p => now - Number(p.timestamp) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    return Math.min(1.0, recentPayments.length / 10); // Normalize to 0-1
  }

  /**
   * Identify patterns in payments
   */
  private identifyPatterns(payments: PaymentPattern[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Pattern: Regular payments
    if (this.isRegularPattern(payments)) {
      patterns.push({ type: 'regular', weight: 0.3 });
    }

    // Pattern: High-value transactions
    const avgAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length;
    if (avgAmount > 1000000) {
      patterns.push({ type: 'high_value', weight: 0.2 });
    }

    // Pattern: Multi-chain usage
    const chains = new Set(payments.map(p => p.chain));
    if (chains.size > 2) {
      patterns.push({ type: 'multi_chain', weight: 0.2 });
    }

    return patterns;
  }

  /**
   * Check if payments follow regular pattern
   */
  private isRegularPattern(payments: PaymentPattern[]): boolean {
    if (payments.length < 3) return false;

    const intervals: number[] = [];
    for (let i = 1; i < payments.length; i++) {
      intervals.push(Number(payments[i].timestamp) - Number(payments[i - 1].timestamp));
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    // Low variance = regular pattern
    return variance < Math.pow(avgInterval * 0.3, 2);
  }

  /**
   * Identify factors affecting reputation
   */
  private identifyFactors(features: FeatureVector): string[] {
    const factors: string[] = [];

    if (features.paymentCount > 10) factors.push('high_activity');
    if (features.successRate > 0.95) factors.push('reliable');
    if (features.chainDiversity > 0.5) factors.push('multi_chain');
    if (features.recentActivity > 0.7) factors.push('recent_activity');
    if (features.avgAmount > 100000) factors.push('high_value');

    return factors.length > 0 ? factors : ['new_user'];
  }

  /**
   * Create empty feature vector
   */
  private createEmptyFeatures(): FeatureVector {
    return {
      paymentCount: 0,
      totalAmount: 0,
      avgAmount: 0,
      successRate: 0,
      avgInterval: 0,
      chainDiversity: 0,
      recentActivity: 0
    };
  }
}

/**
 * Simple reputation model (replace with proper ML in production)
 */
class ReputationModel {
  private weights: Map<string, number> = new Map();

  train(features: FeatureVector, labels: number[]): void {
    // Simple linear model training
    // In production, use TensorFlow.js, ML.js, or similar
    
    const factors = [
      'paymentCount',
      'successRate',
      'chainDiversity',
      'recentActivity'
    ];

    for (const factor of factors) {
      const value = features[factor as keyof FeatureVector] as number;
      const avgLabel = labels.reduce((a, b) => a + b, 0) / labels.length;
      
      // Simple weight calculation
      this.weights.set(factor, value > 0 ? avgLabel / value : 0);
    }
  }

  predict(features: FeatureVector): { score: number; confidence: number } {
    let score = 50; // Base score
    let confidence = 0.5;

    // Calculate weighted score
    for (const [factor, weight] of this.weights.entries()) {
      const value = features[factor as keyof FeatureVector] as number;
      score += value * weight * 10;
    }

    // Normalize to 0-100
    score = Math.max(0, Math.min(100, score));

    // Calculate confidence based on data quality
    const dataQuality = features.paymentCount > 0 ? Math.min(1.0, features.paymentCount / 10) : 0;
    confidence = 0.5 + dataQuality * 0.5;

    return { score, confidence };
  }

  update(patterns: Pattern[]): void {
    // Update model weights based on new patterns
    for (const pattern of patterns) {
      const currentWeight = this.weights.get(pattern.type) || 0;
      this.weights.set(pattern.type, currentWeight + pattern.weight);
    }
  }
}

interface FeatureVector {
  paymentCount: number;
  totalAmount: number;
  avgAmount: number;
  successRate: number;
  avgInterval: number;
  chainDiversity: number;
  recentActivity: number;
}

interface Pattern {
  type: string;
  weight: number;
}

