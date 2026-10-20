import { describe, expect, it } from 'vitest';
import { recommendMechanism } from './recommendMechanism';
import { DEFAULT_RULESET } from './rules';
import type { ProcurementRuleInput } from './types';

const base: ProcurementRuleInput = {
  itemId: 'i1',
  description: 'Servicio de mantención de equipos de oficina',
  category: 'SERVICE',
  quantity: 1,
  estimatedTotalClp: 20_000_000,
  estimatedTotalUtm: 294,
  requiredTermValue: 30,
  requiredTermUnit: 'BUSINESS_DAYS',
  hasFrameworkAgreementMatch: false,
  urgencyDeclared: false,
};

describe('recommendMechanism', () => {
  it('deriva a revisión manual si faltan datos', () => {
    const r = recommendMechanism({ ...base, description: 'corto', estimatedTotalUtm: undefined });
    expect(r.primaryMechanism).toBe('REQUIERE_REVISION_MANUAL');
    expect(r.missingInformation.length).toBeGreaterThan(0);
  });

  it('deriva a revisión manual si la configuración es inválida', () => {
    const r = recommendMechanism(base, { ...DEFAULT_RULESET, rules: [] });
    expect(r.primaryMechanism).toBe('REQUIERE_REVISION_MANUAL');
  });

  it('recomienda Convenio Marco cuando hay coincidencia válida', () => {
    const r = recommendMechanism({ ...base, hasFrameworkAgreementMatch: true });
    expect(r.primaryMechanism).toBe('CONVENIO_MARCO');
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('bloquea Trato Directo y Licitación Privada sin causal, aun con urgencia', () => {
    const r = recommendMechanism({ ...base, urgencyDeclared: true });
    expect(r.primaryMechanism).not.toBe('TRATO_DIRECTO');
    expect(r.blockedAlternatives.map((b) => b.mechanism)).toEqual(
      expect.arrayContaining(['TRATO_DIRECTO', 'LICITACION_PRIVADA']),
    );
    expect(r.warnings.join(' ')).toMatch(/urgencia/i);
  });

  it('permite Trato Directo solo con causal seleccionada', () => {
    const r = recommendMechanism({ ...base, exceptionalGround: 'GENERIC_DIRECT' });
    expect(r.primaryMechanism).toBe('TRATO_DIRECTO');
  });

  it('agrega Bases Tipo como modalidad complementaria de una licitación', () => {
    const r = recommendMechanism({ ...base, hasStandardBiddingTerms: true });
    expect(r.primaryMechanism).toBe('LICITACION_PUBLICA');
    expect(r.complementaryModalities).toContain('LICITACION_BASES_TIPO');
  });

  it('sugiere Compra Ágil bajo el umbral y economía circular como previa', () => {
    const r = recommendMechanism({ ...base, estimatedTotalUtm: 10, circularEconomyCandidate: true });
    expect(r.primaryMechanism).toBe('COMPRA_AGIL');
    expect(r.complementaryModalities).toContain('ECONOMIA_CIRCULAR');
  });
});
