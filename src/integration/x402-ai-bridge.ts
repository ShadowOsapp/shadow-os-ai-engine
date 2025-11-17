/**
 * X402 AI Bridge
 * 
 * Integrates AI intelligence with X402 stealth payments
 */

import { AIPaymentRouter, PaymentRoute, RoutingOptions } from '../intelligence/payment-optimizer';
import { PrivacyAdapter, PrivacyConfiguration, PrivacyContext } from '../intelligence/privacy-adapter';
import { FraudDetector, PaymentData, FraudAssessment } from '../intelligence/fraud-detector';

export interface X402PaymentRequest {
  stealthAddress: Uint8Array;
  amount: bigint;
  targetChain?: string;
  privacyLevel?: 'low' | 'medium' | 'high' | 'maximum';
  userPseudonym: Uint8Array;
}

export interface OptimizedX402Payment {
  route: PaymentRoute;
  privacyConfig: PrivacyConfiguration;
  fraudAssessment: FraudAssessment;
  recommendedChain: string;
  estimatedCost: bigint;
}

export class X402AIBridge {
  private router: AIPaymentRouter;
  private privacyAdapter: PrivacyAdapter;
  private fraudDetector: FraudDetector;

  constructor() {
    this.router = new AIPaymentRouter();
    this.privacyAdapter = new PrivacyAdapter();
    this.fraudDetector = new FraudDetector();
  }

  /**
   * Optimize X402 payment with AI
   */
  async optimizePayment(request: X402PaymentRequest): Promise<OptimizedX402Payment> {
    // Find optimal route
    const route = await this.router.findOptimalRoute({
      amount: request.amount,
      targetChain: request.targetChain,
      privacyLevel: request.privacyLevel || 'high'
    });

    // Assess fraud risk
    const paymentData: PaymentData = {
      pseudonym: request.userPseudonym,
      amount: request.amount,
      timestamp: BigInt(Date.now()),
      chain: route.chain,
      commitment: new Uint8Array(32) // Will be set by X402
    };

    const fraudAssessment = await this.fraudDetector.assessRisk(paymentData, {
      preservePrivacy: true,
      sensitivity: 0.5
    });

    // Adapt privacy level based on risk
    const privacyContext: PrivacyContext = {
      userPseudonym: request.userPseudonym,
      transactionType: 'payment',
      amount: request.amount,
      threatLevel: this.fraudToThreat(fraudAssessment.riskLevel)
    };

    const privacyConfig = await this.privacyAdapter.adaptPrivacyLevel(privacyContext);

    // Calculate estimated cost
    const estimatedCost = this.calculateCost(route, privacyConfig);

    return {
      route,
      privacyConfig,
      fraudAssessment,
      recommendedChain: route.chain,
      estimatedCost
    };
  }

  /**
   * Convert fraud risk to threat level
   */
  private fraudToThreat(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    const mapping: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical'
    };
    return mapping[riskLevel] || 'medium';
  }

  /**
   * Calculate estimated cost
   */
  private calculateCost(route: PaymentRoute, privacy: PrivacyConfiguration): bigint {
    // Base gas cost
    const gasCost = route.estimatedGas;

    // Privacy overhead (more privacy = more gas)
    const privacyMultiplier = privacy.proofSize / 1024; // Normalize by 1KB

    return gasCost * BigInt(Math.ceil(privacyMultiplier));
  }

  /**
   * Update learning from successful payment
   */
  async learnFromPayment(
    payment: X402PaymentRequest,
    success: boolean,
    actualGas: bigint
  ): Promise<void> {
    // Update router history
    const route = await this.router.findOptimalRoute({
      amount: payment.amount,
      targetChain: payment.targetChain,
      privacyLevel: payment.privacyLevel || 'high'
    });

    if (success) {
      this.router.updateHistory(route.chain, route);
    }

    // Update fraud detector pattern
    const paymentData: PaymentData = {
      pseudonym: payment.userPseudonym,
      amount: payment.amount,
      timestamp: BigInt(Date.now()),
      chain: route.chain,
      commitment: new Uint8Array(32)
    };

    this.fraudDetector.updatePattern(paymentData);
  }
}

