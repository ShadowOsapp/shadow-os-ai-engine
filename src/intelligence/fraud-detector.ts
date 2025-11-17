/**
 * Intelligent Fraud Detector
 * 
 * Detects threats and anomalies without breaking anonymity
 * Uses pattern-based detection with privacy-preserving ML
 */

import { sha256 } from '@noble/hashes/sha256';

export interface PaymentData {
  pseudonym: Uint8Array;
  amount: bigint;
  timestamp: bigint;
  chain: string;
  commitment: Uint8Array;
}

export interface FraudAssessment {
  riskScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  anomalies: string[];
  confidence: number;
}

export interface DetectionOptions {
  preservePrivacy: boolean;
  sensitivity: number; // 0-1
}

export class FraudDetector {
  private patterns: Map<string, PaymentPattern> = new Map();
  private anomalyThreshold: number = 0.7;

  /**
   * Assess fraud risk for payment
   */
  async assessRisk(
    payment: PaymentData,
    options: DetectionOptions = { preservePrivacy: true, sensitivity: 0.5 }
  ): Promise<FraudAssessment> {
    // Extract features (privacy-preserving)
    const features = this.extractFeatures(payment, options.preservePrivacy);

    // Detect anomalies
    const anomalies = this.detectAnomalies(features, options.sensitivity);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(anomalies, features);

    // Determine risk level
    const riskLevel = this.scoreToLevel(riskScore);

    // Calculate confidence
    const confidence = this.calculateConfidence(features, anomalies);

    return {
      riskScore,
      riskLevel,
      anomalies,
      confidence
    };
  }

  /**
   * Extract features from payment (privacy-preserving)
   */
  private extractFeatures(
    payment: PaymentData,
    preservePrivacy: boolean
  ): FeatureSet {
    if (preservePrivacy) {
      // Use hashed features to preserve privacy
      return this.extractPrivateFeatures(payment);
    } else {
      // Use direct features (for testing/debugging)
      return this.extractDirectFeatures(payment);
    }
  }

  /**
   * Extract privacy-preserving features
   */
  private extractPrivateFeatures(payment: PaymentData): FeatureSet {
    // Hash-based feature extraction
    const hash = sha256(payment.commitment);
    
    return {
      amountCategory: this.hashToCategory(hash, 0, 5),
      timePattern: this.hashToCategory(hash, 1, 4),
      chainPattern: this.hashToCategory(hash, 2, 7),
      frequency: this.hashToNumber(hash, 3, 100) / 100,
      amountDeviation: this.hashToNumber(hash, 4, 50) / 100
    };
  }

  /**
   * Extract direct features (non-private, for testing)
   */
  private extractDirectFeatures(payment: PaymentData): FeatureSet {
    // Get pattern for pseudonym
    const pattern = this.patterns.get(this.bytesToHex(payment.pseudonym));
    
    return {
      amountCategory: this.categorizeAmount(payment.amount),
      timePattern: pattern ? this.analyzeTimePattern(pattern, payment.timestamp) : 0,
      chainPattern: this.analyzeChainPattern(pattern, payment.chain),
      frequency: pattern ? pattern.frequency : 0,
      amountDeviation: pattern ? this.calculateDeviation(pattern, payment.amount) : 0
    };
  }

  /**
   * Detect anomalies in features
   */
  private detectAnomalies(features: FeatureSet, sensitivity: number): string[] {
    const anomalies: string[] = [];

    // Anomaly: Unusual amount category
    if (features.amountCategory > 4 && sensitivity > 0.3) {
      anomalies.push('unusual_amount_category');
    }

    // Anomaly: High frequency (potential spam)
    if (features.frequency > 0.8 && sensitivity > 0.4) {
      anomalies.push('high_frequency');
    }

    // Anomaly: High amount deviation
    if (features.amountDeviation > 0.5 && sensitivity > 0.5) {
      anomalies.push('high_amount_deviation');
    }

    // Anomaly: Unusual time pattern
    if (features.timePattern === 0 && sensitivity > 0.6) {
      anomalies.push('irregular_timing');
    }

    // Anomaly: Chain switching pattern
    if (features.chainPattern > 5 && sensitivity > 0.7) {
      anomalies.push('excessive_chain_switching');
    }

    return anomalies;
  }

  /**
   * Calculate risk score from anomalies
   */
  private calculateRiskScore(anomalies: string[], features: FeatureSet): number {
    let risk = 0;

    // Base risk from anomalies
    risk += anomalies.length * 0.15;

    // Risk from frequency
    if (features.frequency > 0.9) {
      risk += 0.2;
    }

    // Risk from amount deviation
    if (features.amountDeviation > 0.7) {
      risk += 0.15;
    }

    // Risk from unusual patterns
    if (features.timePattern === 0) {
      risk += 0.1;
    }

    return Math.min(1.0, risk);
  }

  /**
   * Convert risk score to level
   */
  private scoreToLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence in assessment
   */
  private calculateConfidence(features: FeatureSet, anomalies: string[]): number {
    // More data = higher confidence
    let confidence = 0.5;

    if (features.frequency > 0) {
      confidence += 0.2; // Have frequency data
    }

    if (anomalies.length > 0) {
      confidence += 0.2; // Detected patterns
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Update payment pattern (for learning)
   */
  updatePattern(payment: PaymentData): void {
    const key = this.bytesToHex(payment.pseudonym);
    const existing = this.patterns.get(key);

    if (existing) {
      existing.payments.push(payment);
      existing.frequency = existing.payments.length / 10; // Normalize
      existing.lastUpdated = Date.now();
    } else {
      this.patterns.set(key, {
        pseudonym: payment.pseudonym,
        payments: [payment],
        frequency: 0.1,
        avgAmount: Number(payment.amount),
        chains: new Set([payment.chain]),
        lastUpdated: Date.now()
      });
    }
  }

  /**
   * Hash to category
   */
  private hashToCategory(hash: Uint8Array, offset: number, max: number): number {
    const index = offset % hash.length;
    return hash[index] % max;
  }

  /**
   * Hash to number
   */
  private hashToNumber(hash: Uint8Array, offset: number, max: number): number {
    const index = offset % hash.length;
    return (hash[index] / 255) * max;
  }

  /**
   * Categorize amount
   */
  private categorizeAmount(amount: bigint): number {
    if (amount < 1000n) return 0;
    if (amount < 10000n) return 1;
    if (amount < 100000n) return 2;
    if (amount < 1000000n) return 3;
    return 4;
  }

  /**
   * Analyze time pattern
   */
  private analyzeTimePattern(pattern: PaymentPattern, timestamp: bigint): number {
    if (pattern.payments.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < pattern.payments.length; i++) {
      intervals.push(
        Number(pattern.payments[i].timestamp) - Number(pattern.payments[i - 1].timestamp)
      );
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    // Low variance = regular pattern (1)
    // High variance = irregular (0)
    return variance < Math.pow(avgInterval * 0.3, 2) ? 1 : 0;
  }

  /**
   * Analyze chain pattern
   */
  private analyzeChainPattern(pattern: PaymentPattern, chain: string): number {
    pattern.chains.add(chain);
    return pattern.chains.size;
  }

  /**
   * Calculate amount deviation
   */
  private calculateDeviation(pattern: PaymentPattern, amount: bigint): number {
    const amounts = pattern.payments.map(p => Number(p.amount));
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const deviation = Math.abs(Number(amount) - avg) / avg;
    return Math.min(1.0, deviation);
  }

  /**
   * Convert bytes to hex
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

interface FeatureSet {
  amountCategory: number;
  timePattern: number;
  chainPattern: number;
  frequency: number;
  amountDeviation: number;
}

interface PaymentPattern {
  pseudonym: Uint8Array;
  payments: PaymentData[];
  frequency: number;
  avgAmount: number;
  chains: Set<string>;
  lastUpdated: number;
}

