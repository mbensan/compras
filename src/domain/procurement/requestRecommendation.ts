import { mechanismLabel } from './mechanisms';
import { DEFAULT_RULESET, FRAGMENTATION_MARGIN, findRule } from './rules';
import { normalizeText } from '../../utils/text';
import type { ItemCategory, MechanismRecommendation, ProcurementMechanism, RulesetConfig } from './types';

export interface RequestItemSummary {
  itemId: string;
  lineNumber: number;
  description: string;
  category: ItemCategory;
  keywords: string[];
  totalUtm?: number;
  recommendation?: MechanismRecommendation;
}

export interface MechanismGroup {
  mechanism: ProcurementMechanism;
  itemIds: string[];
}

export interface RequestRecommendation {
  mode: 'EMPTY' | 'PENDING' | 'SINGLE' | 'GROUPED';
  label: string;
  mechanism?: ProcurementMechanism;
  homogeneous: boolean;
  groups: MechanismGroup[];
  reasons: string[];
  warnings: string[];
}

const tokens = (s: string): Set<string> =>
  new Set(normalizeText(s).split(' ').filter((t) => t.length > 3));

export function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  ta.forEach((t) => tb.has(t) && common++);
  return common / (ta.size + tb.size - common);
}

export function recommendRequest(
  items: RequestItemSummary[],
  config: RulesetConfig = DEFAULT_RULESET,
): RequestRecommendation {
  const base = { homogeneous: true, groups: [] as MechanismGroup[], reasons: [] as string[], warnings: [] as string[] };
  if (!items.length) {
    return { ...base, mode: 'EMPTY', label: 'Sin ítems: agregue al menos uno para obtener una recomendación.' };
  }
  const evaluated = items.filter((i) => i.recommendation);
  if (!evaluated.length) {
    return { ...base, mode: 'PENDING', label: 'Guarde un ítem para obtener una recomendación provisional.' };
  }

  const map = new Map<ProcurementMechanism, string[]>();
  evaluated.forEach((i) => {
    const m = i.recommendation!.primaryMechanism;
    map.set(m, [...(map.get(m) ?? []), i.itemId]);
  });
  const groups = [...map.entries()].map(([mechanism, itemIds]) => ({ mechanism, itemIds }));
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (evaluated.length < items.length) {
    warnings.push(`${items.length - evaluated.length} ítem(s) aún no tienen recomendación.`);
  }

  // Homogeneidad: ítems similares entre sí (misma categoría y descripciones parecidas).
  let homogeneous = true;
  for (let i = 0; i < items.length && homogeneous; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].category !== items[j].category) homogeneous = false;
    }
  }
  reasons.push(
    homogeneous
      ? 'Los ítems son de la misma categoría.'
      : 'Los ítems corresponden a categorías o necesidades distintas.',
  );

  // Fragmentación: ítems similares con mecanismos distintos o montos cercanos al umbral.
  for (let i = 0; i < evaluated.length; i++) {
    for (let j = i + 1; j < evaluated.length; j++) {
      const a = evaluated[i];
      const b = evaluated[j];
      if (
        a.category === b.category &&
        similarity(a.description, b.description) >= 0.4 &&
        a.recommendation!.primaryMechanism !== b.recommendation!.primaryMechanism
      ) {
        warnings.push(
          `Los ítems ${a.lineNumber} y ${b.lineNumber} son similares pero tienen mecanismos distintos: revise posible fragmentación.`,
        );
      }
    }
  }
  const threshold = findRule(config, 'compra-agil-threshold')?.params?.maxUtm;
  if (threshold) {
    items.forEach((i) => {
      if (i.totalUtm !== undefined && i.totalUtm < threshold && i.totalUtm >= threshold * (1 - FRAGMENTATION_MARGIN)) {
        warnings.push(`El ítem ${i.lineNumber} está cerca del umbral configurado (${threshold} UTM): verifique que no exista fragmentación.`);
      }
    });
  }
  warnings.push('Dividir una compra para cambiar el procedimiento no es una práctica válida.');

  if (groups.length === 1) {
    const m = groups[0].mechanism;
    return {
      mode: 'SINGLE',
      label: mechanismLabel(m),
      mechanism: m,
      homogeneous,
      groups,
      reasons: [...reasons, 'Todos los ítems evaluados apuntan al mismo mecanismo sugerido.'],
      warnings,
    };
  }
  return {
    mode: 'GROUPED',
    label: 'Compra con revisión por grupos de ítems',
    homogeneous,
    groups,
    reasons: [...reasons, 'Existen varios mecanismos posibles; revise los grupos de ítems.'],
    warnings,
  };
}
