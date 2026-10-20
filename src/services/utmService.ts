/** Conversión CLP/UTM MOCK. Reemplazar por una fuente oficial en una integración real. */
export interface UtmConfig {
  valueClp: number;
  referenceDate: string;
}

export const UTM_CONFIG: UtmConfig = {
  valueClp: Number(import.meta.env?.VITE_UTM_VALUE_CLP) || 68000,
  referenceDate: '2026-10-01',
};

export function clpToUtm(clp: number, config: UtmConfig = UTM_CONFIG): number | undefined {
  if (!Number.isFinite(clp) || !(config.valueClp > 0)) return undefined;
  return clp / config.valueClp;
}
