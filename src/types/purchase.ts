import type { FrameworkAgreementMatch } from './framework';
import type { ItemCategory, MechanismRecommendation, TermUnit } from '../domain/procurement/types';

export interface AttachmentMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface PurchaseItem {
  id: string;
  lineNumber: number;
  description: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  estimatedUnitAmountClp: number;
  estimatedTotalClp: number;
  termValue: number;
  termUnit: TermUnit;
  requiredDate?: string;
  deliveryLocation?: string;
  keywords: string[];
  technicalRequirements?: string;
  acceptsEquivalent: boolean;
  attachments: AttachmentMetadata[];
  recommendation?: MechanismRecommendation;
  frameworkMatches: FrameworkAgreementMatch[];
  selectedFrameworkProductId?: string;
  // Antecedentes adicionales para el motor de reglas
  frameworkNoneApplies?: boolean;
  frameworkMandatory?: boolean;
  circularEconomyCandidate?: boolean;
  hasStandardBiddingTerms?: boolean;
  exceptionalGround?: string;
  /** Verdadero cuando el ítem fue guardado (validado) al menos una vez. */
  saved?: boolean;
}

export type PurchaseStatus = 'DRAFT' | 'READY_FOR_REVIEW';

export interface PurchaseRequest {
  id: string;
  title: string;
  buyerOrganization: string;
  requestingUnit: string;
  requesterName: string;
  requesterEmail: string;
  costCenter?: string;
  justification: string;
  requiredDate: string;
  currency: 'CLP';
  notes?: string;
  recurring: boolean;
  urgencyDeclared: boolean;
  status: PurchaseStatus;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}
