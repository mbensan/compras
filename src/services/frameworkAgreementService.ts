import { normalizeText } from '../utils/text';
import type { FrameworkAgreementMatch, FrameworkAgreementProduct } from '../types/framework';

export const MAX_RESULTS = 5;
const MIN_SCORE_PERCENT = 15;
const STOPWORDS = new Set(['para', 'con', 'sin', 'los', 'las', 'del', 'por', 'una', 'uno', 'que', 'sus', 'como', 'mas']);

export interface SearchQuery {
  description: string;
  keywords?: string[];
}

export interface SearchOptions {
  /** Productos a usar en lugar del JSON mock (pruebas). */
  products?: FrameworkAgreementProduct[];
  /** Latencia simulada en ms. Por defecto aleatoria entre 500 y 900. */
  latencyMs?: number;
}

export const queryTokens = (text: string): string[] =>
  [...new Set(normalizeText(text).split(' ').filter((t) => t.length >= 3 && !STOPWORDS.has(t)))];

const tokenMatch = (a: string, b: string): boolean =>
  a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)));

const hasToken = (tokens: string[], t: string): boolean => tokens.some((x) => tokenMatch(x, t));

/** Puntaje 0-100: palabra clave = 2 puntos, nombre/descripción/categoría = 1 punto. */
export function scoreProduct(query: SearchQuery, product: FrameworkAgreementProduct): number {
  const qTokens = queryTokens([query.description, ...(query.keywords ?? [])].join(' '));
  if (!qTokens.length) return 0;
  const kw = product.keywords.flatMap((k) => queryTokens(k));
  const text = queryTokens(`${product.name} ${product.description} ${product.category}`);
  let raw = 0;
  for (const t of qTokens) {
    if (hasToken(kw, t)) raw += 2;
    else if (hasToken(text, t)) raw += 1;
  }
  const max = 2 * Math.min(qTokens.length, 5);
  return Math.min(100, Math.round((raw / max) * 100));
}

export function rankProducts(query: SearchQuery, products: FrameworkAgreementProduct[]): FrameworkAgreementMatch[] {
  return products
    .map((product) => ({ product, score: scoreProduct(query, product) }))
    .filter((m) => m.score >= MIN_SCORE_PERCENT)
    .sort((a, b) => b.score - a.score || a.product.priceClp - b.product.priceClp)
    .slice(0, MAX_RESULTS);
}

export class FrameworkServiceError extends Error {}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function loadProducts(): Promise<FrameworkAgreementProduct[]> {
  try {
    const mod = await import('../mocks/framework-agreements.json');
    const data = (mod as { default: unknown }).default;
    if (!Array.isArray(data)) throw new Error('Formato inválido');
    return data as FrameworkAgreementProduct[];
  } catch (e) {
    console.error('Error al leer el catálogo mock de Convenio Marco', e);
    throw new FrameworkServiceError('No fue posible leer el catálogo de Convenio Marco.');
  }
}

export async function searchFrameworkAgreements(
  query: SearchQuery,
  options: SearchOptions = {},
): Promise<FrameworkAgreementMatch[]> {
  const latency = options.latencyMs ?? 500 + Math.random() * 400;
  const [products] = await Promise.all([options.products ?? loadProducts(), sleep(latency)]);
  return rankProducts(query, products);
}
