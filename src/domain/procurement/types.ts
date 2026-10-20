export type ProcurementMechanism =
  | 'CONVENIO_MARCO'
  | 'COMPRA_AGIL'
  | 'LICITACION_PUBLICA'
  | 'LICITACION_PRIVADA'
  | 'TRATO_DIRECTO'
  | 'LICITACION_BASES_TIPO'
  | 'ECONOMIA_CIRCULAR'
  | 'SUBASTA_INVERSA'
  | 'REQUIERE_REVISION_MANUAL';

export type ItemCategory = 'PRODUCT' | 'SERVICE' | 'WORK';
export type TermUnit = 'BUSINESS_DAYS' | 'CALENDAR_DAYS' | 'WEEKS' | 'MONTHS';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MechanismInfo {
  id: ProcurementMechanism;
  label: string;
  shortDescription: string;
}

export interface ProcurementRuleInput {
  itemId: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  estimatedTotalClp: number;
  estimatedTotalUtm?: number;
  requiredTermValue: number;
  requiredTermUnit: TermUnit;
  hasFrameworkAgreementMatch: boolean;
  frameworkAgreementMandatory?: boolean;
  circularEconomyCandidate?: boolean;
  hasStandardBiddingTerms?: boolean;
  /** Id de una causal de `EXCEPTIONAL_GROUNDS`. Nunca se infiere desde el monto. */
  exceptionalGround?: string;
  urgencyDeclared: boolean;
}

export interface BlockedAlternative {
  mechanism: ProcurementMechanism;
  reason: string;
}

export interface MechanismRecommendation {
  primaryMechanism: ProcurementMechanism;
  complementaryModalities: ProcurementMechanism[];
  confidence: Confidence;
  reasons: string[];
  warnings: string[];
  missingInformation: string[];
  alternatives: ProcurementMechanism[];
  blockedAlternatives: BlockedAlternative[];
  rulesetVersion: string;
  requiresHumanValidation: true;
}

/** Metadatos comunes a toda regla configurable. */
export interface RuleMeta {
  id: string;
  mechanism: ProcurementMechanism;
  title: string;
  description: string;
  validFrom: string;
  sourceLabel: string;
  sourceUrl: string;
  requiresLegalValidation: boolean;
  enabled: boolean;
  /** Parámetros numéricos configurables (p. ej. umbrales en UTM). */
  params?: Record<string, number>;
}

export interface ExceptionalGround {
  id: string;
  label: string;
  /** Mecanismo que habilita la causal. `REQUIERE_REVISION_MANUAL` si debe validarse. */
  enables: ProcurementMechanism;
}

export interface RulesetConfig {
  version: string;
  rules: RuleMeta[];
  grounds: ExceptionalGround[];
}
