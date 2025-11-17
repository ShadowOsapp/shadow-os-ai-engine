/**
 * ShadowOS AI Engine
 * 
 * The Intelligence Layer for Privacy
 */

// Intelligence Components
export { AIPaymentRouter, PaymentRoute, RoutingOptions } from './intelligence/payment-optimizer';
export { AIReputationLearner, PaymentPattern, ReputationPrediction, TrainingData } from './intelligence/reputation-learner';
export { PrivacyAdapter, PrivacyConfiguration, PrivacyContext, PrivacyLevel, ThreatLevel } from './intelligence/privacy-adapter';
export { FraudDetector, PaymentData, FraudAssessment, DetectionOptions } from './intelligence/fraud-detector';

// Integration Components
export { X402AIBridge, X402PaymentRequest, OptimizedX402Payment } from './integration/x402-ai-bridge';
export { ShadowOSIntelligence, IntelligenceConfig, IntelligenceSummary } from './integration/shadowos-intelligence';

// Main export
export { ShadowOSIntelligence as default } from './integration/shadowos-intelligence';

