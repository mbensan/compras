import { describe, expect, it } from 'vitest';
import { rankProducts, searchFrameworkAgreements } from './frameworkAgreementService';
import type { FrameworkAgreementProduct } from '../types/framework';
import catalog from '../mocks/framework-agreements.json';

const products = catalog as FrameworkAgreementProduct[];

describe('catálogo de Convenio Marco', () => {
  it('contiene al menos 12 productos', () => {
    expect(products.length).toBeGreaterThanOrEqual(12);
  });

  it('ordena por puntaje y devuelve como máximo 5', () => {
    const r = rankProducts({ description: 'Silla ergonómica de oficina', keywords: ['silla'] }, products);
    expect(r.length).toBeGreaterThan(0);
    expect(r.length).toBeLessThanOrEqual(5);
    expect(r[0].product.id).toBe('fa-005');
    for (let i = 1; i < r.length; i++) expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score);
  });

  it('ignora tildes y mayúsculas', () => {
    const a = rankProducts({ description: 'COMPUTADOR PORTÁTIL' }, products);
    const b = rankProducts({ description: 'computador portatil' }, products);
    expect(a.map((m) => m.product.id)).toEqual(b.map((m) => m.product.id));
  });

  it('devuelve vacío sin coincidencias', () => {
    expect(rankProducts({ description: 'helicóptero blindado' }, products)).toEqual([]);
  });

  it('la búsqueda asíncrona usa los productos entregados', async () => {
    const r = await searchFrameworkAgreements({ description: 'monitor 24 pulgadas' }, { products, latencyMs: 0 });
    expect(r[0].product.category).toBe('Monitores');
  });
});
