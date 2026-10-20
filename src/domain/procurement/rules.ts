import type { ExceptionalGround, RuleMeta, RulesetConfig } from './types';

/**
 * REGLAS DEMOSTRATIVAS (MOCK). Los valores y umbrales no constituyen criterio jurídico.
 * Deben ser validados y actualizados por especialistas conforme a la normativa vigente.
 */
export const RULESET_VERSION = 'MOCK-2026.10-v1';

const MOCK_SOURCE = {
  sourceLabel: 'Regla demostrativa (mock) – pendiente de validación jurídica',
  sourceUrl: 'https://example.invalid/normativa-pendiente',
  validFrom: '2026-01-01',
  requiresLegalValidation: true,
} as const;

export const RULES: RuleMeta[] = [
  {
    id: 'circular-economy-first',
    mechanism: 'ECONOMIA_CIRCULAR',
    title: 'Economía circular como alternativa previa',
    description: 'Si el ítem puede satisfacerse por reutilización o reasignación, mostrarlo antes de comprar.',
    enabled: true,
    ...MOCK_SOURCE,
  },
  {
    id: 'framework-agreement-first',
    mechanism: 'CONVENIO_MARCO',
    title: 'Convenio Marco con coincidencia válida',
    description: 'Si existe coincidencia en el catálogo, revisar Convenio Marco antes que otros mecanismos.',
    enabled: true,
    ...MOCK_SOURCE,
  },
  {
    id: 'compra-agil-threshold',
    mechanism: 'COMPRA_AGIL',
    title: 'Compra Ágil bajo umbral',
    description: 'Sugerible solo bajo el umbral configurado y sin alternativa preferente.',
    enabled: true,
    params: { maxUtm: 100 },
    ...MOCK_SOURCE,
  },
  {
    id: 'licitacion-publica-general',
    mechanism: 'LICITACION_PUBLICA',
    title: 'Licitación Pública como regla general',
    description: 'Disponible como regla general; se usa sobre el umbral de Compra Ágil.',
    enabled: true,
    ...MOCK_SOURCE,
  },
  {
    id: 'bases-tipo-complement',
    mechanism: 'LICITACION_BASES_TIPO',
    title: 'Bases Tipo como modalidad complementaria',
    description: 'Si hay bases tipo aplicables, se agregan como modalidad de una licitación.',
    enabled: true,
    ...MOCK_SOURCE,
  },
  {
    id: 'excepcional-grounds',
    mechanism: 'TRATO_DIRECTO',
    title: 'Trato Directo / Licitación Privada con causal',
    description: 'Solo se recomiendan si el usuario seleccionó una causal explícita.',
    enabled: true,
    ...MOCK_SOURCE,
  },
  {
    id: 'subasta-inversa-alt',
    mechanism: 'SUBASTA_INVERSA',
    title: 'Subasta Inversa Electrónica como alternativa',
    description: 'Se muestra como alternativa para productos sobre el umbral de Compra Ágil.',
    enabled: true,
    ...MOCK_SOURCE,
  },
];

/** Causales genéricas de prueba. No son causales legales. */
export const EXCEPTIONAL_GROUNDS: ExceptionalGround[] = [
  { id: 'GENERIC_DIRECT', label: 'Causal genérica de trato directo (mock)', enables: 'TRATO_DIRECTO' },
  { id: 'GENERIC_PRIVATE', label: 'Causal genérica de licitación privada (mock)', enables: 'LICITACION_PRIVADA' },
  { id: 'OTHER', label: 'Otra causal por validar', enables: 'REQUIERE_REVISION_MANUAL' },
];

export const DEFAULT_RULESET: RulesetConfig = {
  version: RULESET_VERSION,
  rules: RULES,
  grounds: EXCEPTIONAL_GROUNDS,
};

/** Margen (porcentaje bajo el umbral) para alertar sobre posible fragmentación. */
export const FRAGMENTATION_MARGIN = 0.1;
/** Plazo (en días corridos aprox.) bajo el cual se advierte sobre plazos muy ajustados. */
export const SHORT_TERM_DAYS = 5;

export const findRule = (config: RulesetConfig, id: string): RuleMeta | undefined =>
  config.rules.find((r) => r.id === id && r.enabled);

export const isRulesetValid = (config: RulesetConfig): boolean =>
  !!config.version &&
  config.rules.length > 0 &&
  config.rules.some((r) => r.enabled) &&
  !!findRule(config, 'licitacion-publica-general') &&
  typeof findRule(config, 'compra-agil-threshold')?.params?.maxUtm === 'number';
