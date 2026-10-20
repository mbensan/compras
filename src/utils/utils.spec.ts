import { describe, expect, it } from 'vitest';
import { calcItemTotal, calcRequestTotal } from './calc';
import { normalizeText } from './text';

describe('cálculos', () => {
  it('calcula el total del ítem', () => {
    expect(calcItemTotal(3, 1500)).toBe(4500);
    expect(calcItemTotal(NaN, 1500)).toBe(0);
    expect(calcItemTotal(-2, 1500)).toBe(0);
  });

  it('calcula el total de la solicitud', () => {
    expect(calcRequestTotal([{ estimatedTotalClp: 1000 }, { estimatedTotalClp: 2500 }])).toBe(3500);
    expect(calcRequestTotal([])).toBe(0);
  });
});

describe('normalizeText', () => {
  it('pasa a minúsculas y quita tildes', () => {
    expect(normalizeText('  Cómputo ÁGIL, Papel!  ')).toBe('computo agil papel');
  });
});
