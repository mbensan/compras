import { clpToUtm } from '../services/utmService';
import type { ProcurementRuleInput } from '../domain/procurement/types';
import type { PurchaseItem, PurchaseRequest } from '../types/purchase';

const safe = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

/** Total de ítem = cantidad × monto unitario (redondeado a peso entero). */
export function calcItemTotal(quantity: number, unitAmount: number): number {
  return Math.round(safe(quantity) * safe(unitAmount));
}

export function calcRequestTotal(items: Pick<PurchaseItem, 'estimatedTotalClp'>[]): number {
  return items.reduce((sum, i) => sum + safe(i.estimatedTotalClp), 0);
}

export function buildRuleInput(
  item: PurchaseItem,
  request: Pick<PurchaseRequest, 'urgencyDeclared'>,
): ProcurementRuleInput {
  return {
    itemId: item.id,
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    estimatedTotalClp: item.estimatedTotalClp,
    estimatedTotalUtm: clpToUtm(item.estimatedTotalClp),
    requiredTermValue: item.termValue,
    requiredTermUnit: item.termUnit,
    hasFrameworkAgreementMatch: item.frameworkMatches.length > 0 && !item.frameworkNoneApplies,
    frameworkAgreementMandatory: item.frameworkMandatory,
    circularEconomyCandidate: item.circularEconomyCandidate,
    hasStandardBiddingTerms: item.hasStandardBiddingTerms,
    exceptionalGround: item.exceptionalGround || undefined,
    urgencyDeclared: request.urgencyDeclared,
  };
}
