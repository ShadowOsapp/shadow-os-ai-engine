/**
 * ShadowOS Intelligence Layer
 * 
 * Main integration layer that combines all AI components
 * with ShadowOS core functionality
 */

import { AIPaymentRouter } from '../intelligence/payment-optimizer';
import { AIReputationLearner, PaymentPattern, ReputationPrediction } from '../intelligence/reputation-learner';
import { PrivacyAdapter, PrivacyConfiguration, PrivacyContext } from '../intelligence/privacy-adapter';
import { FraudDetector, PaymentData, FraudAssessment } from '../intelligence/fraud-detector';
import { X402AIBridge, OptimizedX402Payment, X402PaymentRequest } from './x402-ai-bridge';

export interface IntelligenceConfig {
  enablePaymentRouting: boolean;
  enableReputationLearning: boolean;
  enablePrivacyAdaptation: boolean;
  enableFraudDetection: boolean;
}

export class ShadowOSIntelligence {
  private router: AIPaymentRouter;
  private reputationLearner: AIReputationLearner;
  private privacyAdapter: PrivacyAdapter;
  private fraudDetector: FraudDetector;
  private x402Bridge: X402AIBridge;
  private config: IntelligenceConfig;

  constructor(config?: Partial<IntelligenceConfig>) {
    this.config = {
      enablePaymentRouting: true,
      enableReputationLearning: true,
      enablePrivacyAdaptation: true,
      enableFraudDetection: true,
      ...config
    };

    this.router = new AIPaymentRouter();
    this.reputationLearner = new AIReputationLearner();
    this.privacyAdapter = new PrivacyAdapter();
    this.fraudDetector = new FraudDetector();
    this.x402Bridge = new X402AIBridge();
  }

  /**
   * Optimize X402 payment with full AI intelligence
   */
  async optimizePayment(request: X402PaymentRequest): Promise<OptimizedX402Payment> {
    return this.x402Bridge.optimizePayment(request);
  }

  /**
   * Predict reputation for pseudonym
   */
  async predictReputation(
    pseudonym: Uint8Array,
    paymentHistory?: PaymentPattern[]
  ): Promise<ReputationPrediction> {
    if (!this.config.enableReputationLearning) {
      return {
        score: 50,
        confidence: 0.5,
        factors: ['ai_disabled']
      };
    }

    return this.reputationLearner.predict(pseudonym, paymentHistory);
  }

  /**
   * Adapt privacy level for transaction
   */
  async adaptPrivacy(context: PrivacyContext): Promise<PrivacyConfiguration> {
    if (!this.config.enablePrivacyAdaptation) {
      return {
        level: 'medium',
        proofSize: 2048,
        verifyTime: 50,
        zkProofRequired: true,
        merkleDepth: 12,
        polynomialDegree: 8
      };
    }

    return this.privacyAdapter.adaptPrivacyLevel(context);
  }

  /**
   * Assess fraud risk
   */
  async assessFraud(payment: PaymentData): Promise<FraudAssessment> {
    if (!this.config.enableFraudDetection) {
      return {
        riskScore: 0.5,
        riskLevel: 'medium',
        anomalies: [],
        confidence: 0.5
      };
    }

    return this.fraudDetector.assessRisk(payment, {
      preservePrivacy: true,
      sensitivity: 0.5
    });
  }

  /**
   * Learn from payment patterns
   */
  async learnFromPayments(payments: PaymentPattern[]): Promise<void> {
    if (this.config.enableReputationLearning) {
      await this.reputationLearner.learnFromPayments(payments);
    }

    // Update fraud patterns
    if (this.config.enableFraudDetection) {
      for (const payment of payments) {
        const paymentData: PaymentData = {
          pseudonym: payment.pseudonym,
          amount: payment.amount,
          timestamp: payment.timestamp,
          chain: payment.chain,
          commitment: new Uint8Array(32)
        };
        this.fraudDetector.updatePattern(paymentData);
      }
    }
  }

  /**
   * Get intelligence summary
   */
  async getIntelligenceSummary(pseudonym: Uint8Array): Promise<IntelligenceSummary> {
    const reputation = await this.predictReputation(pseudonym);
    
    return {
      reputationScore: reputation.score,
      reputationConfidence: reputation.confidence,
      reputationFactors: reputation.factors,
      aiEnabled: {
        paymentRouting: this.config.enablePaymentRouting,
        reputationLearning: this.config.enableReputationLearning,
        privacyAdaptation: this.config.enablePrivacyAdaptation,
        fraudDetection: this.config.enableFraudDetection
      }
    };
  }
}

export interface IntelligenceSummary {
  reputationScore: number;
  reputationConfidence: number;
  reputationFactors: string[];
  aiEnabled: {
    paymentRouting: boolean;
    reputationLearning: boolean;
    privacyAdaptation: boolean;
    fraudDetection: boolean;
  };
}

