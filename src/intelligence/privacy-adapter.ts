/**
 * Adaptive Privacy Adapter
 * 
 * AI adjusts privacy levels based on threat patterns,
 * network conditions, and user behavior
 */

export type PrivacyLevel = 'low' | 'medium' | 'high' | 'maximum';
export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type TransactionType = 'payment' | 'reputation' | 'compliance' | 'governance';

export interface PrivacyConfiguration {
  level: PrivacyLevel;
  proofSize: number; // bytes
  verifyTime: number; // milliseconds
  zkProofRequired: boolean;
  merkleDepth: number;
  polynomialDegree: number;
}

export interface PrivacyContext {
  userPseudonym: Uint8Array;
  transactionType: TransactionType;
  amount?: bigint;
  threatLevel?: ThreatLevel;
  networkConditions?: NetworkConditions;
}

export interface NetworkConditions {
  congestion: number; // 0-1
  avgGasPrice: bigint;
  networkHealth: number; // 0-1
}

export class PrivacyAdapter {
  private threatHistory: Map<string, ThreatLevel[]> = new Map();
  private privacyConfigs: Map<PrivacyLevel, PrivacyConfiguration> = new Map();

  constructor() {
    this.initializePrivacyConfigs();
  }

  /**
   * Adapt privacy level based on context
   */
  async adaptPrivacyLevel(context: PrivacyContext): Promise<PrivacyConfiguration> {
    // Assess threat level
    const threatLevel = context.threatLevel || await this.assessThreat(context);

    // Determine base privacy level from threat
    let baseLevel: PrivacyLevel = this.threatToPrivacyLevel(threatLevel);

    // Adjust based on transaction type
    baseLevel = this.adjustForTransactionType(baseLevel, context.transactionType);

    // Adjust based on amount (higher amounts = higher privacy)
    if (context.amount) {
      baseLevel = this.adjustForAmount(baseLevel, context.amount);
    }

    // Adjust based on network conditions
    if (context.networkConditions) {
      baseLevel = this.adjustForNetwork(baseLevel, context.networkConditions);
    }

    // Get privacy configuration
    const config = this.privacyConfigs.get(baseLevel) || this.privacyConfigs.get('medium')!;

    return {
      ...config,
      level: baseLevel
    };
  }

  /**
   * Assess threat level from context
   */
  private async assessThreat(context: PrivacyContext): Promise<ThreatLevel> {
    const pseudonymKey = this.bytesToHex(context.userPseudonym);
    const history = this.threatHistory.get(pseudonymKey) || [];

    // If no history, start with medium threat
    if (history.length === 0) {
      return 'medium';
    }

    // Analyze recent threats
    const recentThreats = history.slice(-10);
    const avgThreat = this.calculateAverageThreat(recentThreats);

    // Adjust based on transaction type
    if (context.transactionType === 'compliance') {
      return 'high'; // Compliance requires higher privacy
    }

    if (context.transactionType === 'governance') {
      return 'medium'; // Governance can be more transparent
    }

    return avgThreat;
  }

  /**
   * Convert threat level to privacy level
   */
  private threatToPrivacyLevel(threat: ThreatLevel): PrivacyLevel {
    const mapping: Record<ThreatLevel, PrivacyLevel> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'maximum'
    };
    return mapping[threat];
  }

  /**
   * Adjust privacy for transaction type
   */
  private adjustForTransactionType(
    currentLevel: PrivacyLevel,
    type: TransactionType
  ): PrivacyLevel {
    const adjustments: Record<TransactionType, number> = {
      payment: 0,
      reputation: -1, // Reputation can be slightly less private
      compliance: +1, // Compliance needs higher privacy
      governance: -1 // Governance can be more transparent
    };

    const adjustment = adjustments[type] || 0;
    return this.adjustLevel(currentLevel, adjustment);
  }

  /**
   * Adjust privacy for amount
   */
  private adjustForAmount(currentLevel: PrivacyLevel, amount: bigint): PrivacyLevel {
    // Higher amounts = higher privacy requirement
    if (amount > 10000000n) { // > 10 USDC
      return this.adjustLevel(currentLevel, +1);
    }
    if (amount > 1000000n) { // > 1 USDC
      return this.adjustLevel(currentLevel, 0);
    }
    return this.adjustLevel(currentLevel, -1);
  }

  /**
   * Adjust privacy for network conditions
   */
  private adjustForNetwork(
    currentLevel: PrivacyLevel,
    conditions: NetworkConditions
  ): PrivacyLevel {
    // High congestion = might want to reduce proof complexity
    if (conditions.congestion > 0.8) {
      return this.adjustLevel(currentLevel, -1);
    }

    // Poor network health = increase privacy
    if (conditions.networkHealth < 0.7) {
      return this.adjustLevel(currentLevel, +1);
    }

    return currentLevel;
  }

  /**
   * Adjust privacy level by steps
   */
  private adjustLevel(level: PrivacyLevel, steps: number): PrivacyLevel {
    const levels: PrivacyLevel[] = ['low', 'medium', 'high', 'maximum'];
    const currentIndex = levels.indexOf(level);
    const newIndex = Math.max(0, Math.min(levels.length - 1, currentIndex + steps));
    return levels[newIndex];
  }

  /**
   * Calculate average threat from history
   */
  private calculateAverageThreat(threats: ThreatLevel[]): ThreatLevel {
    const threatValues: Record<ThreatLevel, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const avg = threats.reduce((sum, t) => sum + threatValues[t], 0) / threats.length;

    if (avg >= 3.5) return 'critical';
    if (avg >= 2.5) return 'high';
    if (avg >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Initialize privacy configurations
   */
  private initializePrivacyConfigs(): void {
    this.privacyConfigs.set('low', {
      level: 'low',
      proofSize: 1024, // 1 KB
      verifyTime: 10,
      zkProofRequired: false,
      merkleDepth: 8,
      polynomialDegree: 4
    });

    this.privacyConfigs.set('medium', {
      level: 'medium',
      proofSize: 2048, // 2 KB
      verifyTime: 50,
      zkProofRequired: true,
      merkleDepth: 12,
      polynomialDegree: 8
    });

    this.privacyConfigs.set('high', {
      level: 'high',
      proofSize: 4096, // 4 KB
      verifyTime: 100,
      zkProofRequired: true,
      merkleDepth: 16,
      polynomialDegree: 16
    });

    this.privacyConfigs.set('maximum', {
      level: 'maximum',
      proofSize: 8192, // 8 KB
      verifyTime: 200,
      zkProofRequired: true,
      merkleDepth: 20,
      polynomialDegree: 32
    });
  }

  /**
   * Update threat history
   */
  updateThreatHistory(pseudonym: Uint8Array, threat: ThreatLevel): void {
    const key = this.bytesToHex(pseudonym);
    const history = this.threatHistory.get(key) || [];
    history.push(threat);

    // Keep only last 50 threats
    if (history.length > 50) {
      history.shift();
    }

    this.threatHistory.set(key, history);
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

