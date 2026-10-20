import { mechanismLabel } from './mechanisms';
import { DEFAULT_RULESET, SHORT_TERM_DAYS, findRule, isRulesetValid } from './rules';
import type {
  BlockedAlternative,
  MechanismRecommendation,
  ProcurementMechanism,
  ProcurementRuleInput,
  RulesetConfig,
  TermUnit,
} from './types';

const TERM_TO_DAYS: Record<TermUnit, number> = {
  BUSINESS_DAYS: 1.4,
  CALENDAR_DAYS: 1,
  WEEKS: 7,
  MONTHS: 30,
};

export const termInCalendarDays = (value: number, unit: TermUnit): number => value * TERM_TO_DAYS[unit];

const manual = (
  config: RulesetConfig,
  missingInformation: string[],
  reasons: string[],
  warnings: string[] = [],
  extra: Partial<MechanismRecommendation> = {},
): MechanismRecommendation => ({
  primaryMechanism: 'REQUIERE_REVISION_MANUAL',
  complementaryModalities: [],
  confidence: 'LOW',
  reasons,
  warnings,
  missingInformation,
  alternatives: [],
  blockedAlternatives: [],
  rulesetVersion: config.version,
  requiresHumanValidation: true,
  ...extra,
});

export function recommendMechanism(
  input: ProcurementRuleInput,
  config: RulesetConfig = DEFAULT_RULESET,
): MechanismRecommendation {
  if (!isRulesetValid(config)) {
    return manual(
      config,
      [],
      ['La configuración de reglas no es válida o está incompleta.'],
      ['Sin reglas válidas no es posible sugerir un mecanismo.'],
    );
  }

  const missing: string[] = [];
  if (!input.description || input.description.trim().length < 10) missing.push('Descripción detallada del ítem');
  if (!(input.quantity > 0)) missing.push('Cantidad');
  if (!(input.estimatedTotalClp > 0) || !Number.isFinite(input.estimatedTotalClp)) missing.push('Monto estimado');
  if (!(input.requiredTermValue > 0)) missing.push('Plazo requerido');
  if (input.estimatedTotalUtm === undefined || !Number.isFinite(input.estimatedTotalUtm)) {
    missing.push('Equivalente en UTM (valor de conversión)');
  }
  if (missing.length) {
    return manual(config, missing, ['Faltan antecedentes para evaluar las reglas.']);
  }

  const utm = input.estimatedTotalUtm as number;
  const reasons: string[] = [];
  const warnings: string[] = [];
  const alternatives: ProcurementMechanism[] = [];
  const blocked: BlockedAlternative[] = [];
  const complementary: ProcurementMechanism[] = [];

  // Contradicción: Convenio Marco obligatorio sin coincidencia.
  if (input.frameworkAgreementMandatory && !input.hasFrameworkAgreementMatch) {
    return manual(
      config,
      [],
      ['Se indicó que Convenio Marco es obligatorio, pero no hay coincidencias en el catálogo.'],
      ['Reglas contradictorias: la revisión debe hacerla la unidad de adquisiciones.'],
    );
  }

  // Regla 1: economía circular como alternativa previa.
  if (input.circularEconomyCandidate && findRule(config, 'circular-economy-first')) {
    complementary.push('ECONOMIA_CIRCULAR');
    reasons.push(
      'Antes de comprar, evalúe si la necesidad puede cubrirse por reutilización, reasignación o economía circular.',
    );
  }

  // Causal explícita.
  const ground = input.exceptionalGround
    ? config.grounds.find((g) => g.id === input.exceptionalGround)
    : undefined;
  if (input.exceptionalGround && !ground) {
    return manual(config, ['Causal seleccionada no reconocida'], ['La causal indicada no existe en la configuración.']);
  }

  let primary: ProcurementMechanism;
  let confidence: MechanismRecommendation['confidence'] = 'MEDIUM';

  const threshold = findRule(config, 'compra-agil-threshold')!.params!.maxUtm;

  if (input.hasFrameworkAgreementMatch && findRule(config, 'framework-agreement-first')) {
    // Regla 2
    primary = 'CONVENIO_MARCO';
    confidence = input.frameworkAgreementMandatory ? 'HIGH' : 'MEDIUM';
    reasons.push('Existe al menos una coincidencia en el catálogo de Convenio Marco; revíselo antes que otros mecanismos.');
    alternatives.push(utm < threshold ? 'COMPRA_AGIL' : 'LICITACION_PUBLICA');
    if (ground) warnings.push('Hay una causal excepcional seleccionada, pero existe una alternativa preferente en Convenio Marco.');
  } else if (ground && ground.enables === 'REQUIERE_REVISION_MANUAL') {
    return manual(config, [], ['La causal seleccionada ("' + ground.label + '") debe ser validada por una persona.'], [
      'No se sugiere un mecanismo excepcional sin causal validada.',
    ]);
  } else if (ground && findRule(config, 'excepcional-grounds')) {
    // Regla 6: solo con causal
    primary = ground.enables;
    reasons.push(`Se seleccionó la causal «${ground.label}», que habilitaría ${mechanismLabel(primary)}.`);
    warnings.push('La causal debe ser acreditada y validada por la unidad de adquisiciones y/o asesoría jurídica.');
    alternatives.push('LICITACION_PUBLICA');
  } else if (utm < threshold && findRule(config, 'compra-agil-threshold')) {
    // Regla 4
    primary = 'COMPRA_AGIL';
    reasons.push(
      `El monto estimado (${utm.toFixed(1)} UTM) está bajo el umbral configurado de ${threshold} UTM (valor mock) y no hay alternativa preferente.`,
    );
    alternatives.push('LICITACION_PUBLICA');
  } else {
    // Regla 5
    primary = 'LICITACION_PUBLICA';
    reasons.push(
      `El monto estimado (${utm.toFixed(1)} UTM) no está bajo el umbral de Compra Ágil (${threshold} UTM, valor mock); se aplica la regla general.`,
    );
    if (input.category === 'PRODUCT' && findRule(config, 'subasta-inversa-alt')) alternatives.push('SUBASTA_INVERSA');
  }

  // Regla 3: Bases Tipo complementarias a una licitación.
  const isTender = primary === 'LICITACION_PUBLICA' || primary === 'LICITACION_PRIVADA';
  if (input.hasStandardBiddingTerms) {
    if (isTender && findRule(config, 'bases-tipo-complement')) {
      complementary.push('LICITACION_BASES_TIPO');
      reasons.push('Existen Bases Tipo aplicables; se sugieren como modalidad complementaria de la licitación.');
    } else {
      warnings.push('Se indicaron Bases Tipo, pero solo se consideran complementarias a una licitación.');
    }
  }

  // Reglas 6 y 7: alternativas bloqueadas.
  if (!ground) {
    const why = 'Requiere una causal justificada seleccionada explícitamente.';
    blocked.push({ mechanism: 'TRATO_DIRECTO', reason: why }, { mechanism: 'LICITACION_PRIVADA', reason: why });
    if (input.urgencyDeclared) {
      warnings.push('La urgencia declarada no basta por sí sola para recomendar Trato Directo.');
    }
  }

  if (termInCalendarDays(input.requiredTermValue, input.requiredTermUnit) < SHORT_TERM_DAYS) {
    warnings.push('El plazo requerido es muy breve; verifique que sea compatible con el mecanismo sugerido.');
  }

  if (primary === 'CONVENIO_MARCO' && !input.frameworkAgreementMandatory) {
    warnings.push('El carácter obligatorio del Convenio Marco para este organismo debe ser verificado.');
  }

  return {
    primaryMechanism: primary,
    complementaryModalities: complementary,
    confidence,
    reasons,
    warnings,
    missingInformation: [],
    alternatives: [...new Set(alternatives)].filter((a) => a !== primary),
    blockedAlternatives: blocked,
    rulesetVersion: config.version,
    requiresHumanValidation: true,
  };
}
