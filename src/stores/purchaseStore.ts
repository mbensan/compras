import { defineStore } from 'pinia';
import { ref } from 'vue';
import { recommendMechanism } from '../domain/procurement/recommendMechanism';
import { buildRuleInput, calcItemTotal, calcRequestTotal } from '../utils/calc';
import { newId } from '../utils/text';
import { createDemoRequest } from '../mocks/demoDraft';
import type { FrameworkAgreementMatch } from '../types/framework';
import type { PurchaseItem, PurchaseRequest } from '../types/purchase';

export const STORAGE_KEY = 'easy-compras:purchases:v1';

export function serializePurchases(purchases: PurchaseRequest[]): string {
  return JSON.stringify({ version: 1, purchases });
}

/** Lanza si el contenido no es válido. */
export function parsePurchases(raw: string): PurchaseRequest[] {
  const data = JSON.parse(raw) as { version?: number; purchases?: unknown };
  if (!data || !Array.isArray(data.purchases)) throw new Error('Formato de almacenamiento inválido');
  return (data.purchases as PurchaseRequest[]).filter(
    (p) => p && typeof p.id === 'string' && Array.isArray(p.items),
  );
}

export function blankItem(lineNumber: number): PurchaseItem {
  return {
    id: newId(),
    lineNumber,
    description: '',
    category: 'PRODUCT',
    quantity: 1,
    unit: 'unidad',
    estimatedUnitAmountClp: 0,
    estimatedTotalClp: 0,
    termValue: 10,
    termUnit: 'BUSINESS_DAYS',
    keywords: [],
    acceptsEquivalent: false,
    attachments: [],
    frameworkMatches: [],
    saved: false,
  };
}

export function blankRequest(): PurchaseRequest {
  const now = new Date().toISOString();
  return {
    id: newId(),
    title: '',
    buyerOrganization: '',
    requestingUnit: '',
    requesterName: '',
    requesterEmail: '',
    costCenter: '',
    justification: '',
    requiredDate: '',
    currency: 'CLP',
    notes: '',
    recurring: false,
    urgencyDeclared: false,
    status: 'DRAFT',
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

const renumber = (items: PurchaseItem[]): PurchaseItem[] => items.map((i, idx) => ({ ...i, lineNumber: idx + 1 }));

export const usePurchaseStore = defineStore('purchases', () => {
  const purchases = ref<PurchaseRequest[]>([]);
  const storageError = ref<string | null>(null);

  const getById = (id: string): PurchaseRequest | undefined => purchases.value.find((p) => p.id === id);

  function replace(id: string, fn: (p: PurchaseRequest) => PurchaseRequest): void {
    purchases.value = purchases.value.map((p) => (p.id === id ? fn(p) : p));
  }

  function touch(p: PurchaseRequest): PurchaseRequest {
    return { ...p, updatedAt: new Date().toISOString() };
  }

  function persist(): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, serializePurchases(purchases.value));
      storageError.value = null;
      return true;
    } catch (e) {
      console.error('Error al guardar en localStorage', e);
      storageError.value = 'No fue posible guardar el borrador en el navegador. Revise el espacio disponible o los permisos.';
      return false;
    }
  }

  /** Carga desde localStorage; en la primera ejecución siembra el borrador de demostración. */
  function load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        purchases.value = [createDemoRequest()];
        persist();
      } else {
        purchases.value = parsePurchases(raw);
        storageError.value = null;
      }
    } catch (e) {
      console.error('Error al leer localStorage', e);
      purchases.value = [];
      storageError.value = 'No fue posible leer los borradores guardados; es posible que los datos estén dañados.';
    }
  }

  function createRequest(): PurchaseRequest {
    const r = blankRequest();
    purchases.value = [...purchases.value, r];
    return r;
  }

  function saveDraft(id: string): boolean {
    replace(id, (p) => touch(p));
    return persist();
  }

  function updateGeneral(id: string, patch: Partial<Omit<PurchaseRequest, 'id' | 'items'>>): void {
    replace(id, (p) => touch({ ...p, ...patch, status: 'DRAFT' }));
  }

  function addItem(id: string): PurchaseItem {
    const req = getById(id);
    const item = blankItem((req?.items.length ?? 0) + 1);
    replace(id, (p) => touch({ ...p, items: [...p.items, item] }));
    return item;
  }

  /** Aplica cambios al ítem y recalcula el total del ítem. */
  function updateItem(id: string, itemId: string, patch: Partial<PurchaseItem>): void {
    replace(id, (p) =>
      touch({
        ...p,
        status: 'DRAFT',
        items: p.items.map((i) => {
          if (i.id !== itemId) return i;
          const next = { ...i, ...patch };
          next.estimatedTotalClp = calcItemTotal(next.quantity, next.estimatedUnitAmountClp);
          return next;
        }),
      }),
    );
  }

  function duplicateItem(id: string, itemId: string): PurchaseItem | undefined {
    const src = getById(id)?.items.find((i) => i.id === itemId);
    if (!src) return undefined;
    const copy: PurchaseItem = {
      ...JSON.parse(JSON.stringify(src)),
      id: newId(),
      saved: false,
      recommendation: undefined,
      frameworkMatches: [],
      selectedFrameworkProductId: undefined,
      frameworkNoneApplies: false,
    };
    replace(id, (p) => touch({ ...p, status: 'DRAFT', items: renumber([...p.items, copy]) }));
    return getById(id)?.items.find((i) => i.id === copy.id);
  }

  function removeItem(id: string, itemId: string): void {
    replace(id, (p) => touch({ ...p, status: 'DRAFT', items: renumber(p.items.filter((i) => i.id !== itemId)) }));
  }

  function setMatches(id: string, itemId: string, matches: FrameworkAgreementMatch[]): void {
    updateItem(id, itemId, {
      frameworkMatches: matches,
      selectedFrameworkProductId: undefined,
      frameworkNoneApplies: false,
    });
  }

  function selectMatch(id: string, itemId: string, productId: string | undefined, none = false): void {
    updateItem(id, itemId, { selectedFrameworkProductId: productId, frameworkNoneApplies: none });
    recompute(id, itemId);
  }

  /** Ejecuta el motor local y almacena la recomendación. */
  function recompute(id: string, itemId: string): void {
    const req = getById(id);
    const item = req?.items.find((i) => i.id === itemId);
    if (!req || !item) return;
    const recommendation = recommendMechanism(buildRuleInput(item, req));
    updateItem(id, itemId, { recommendation });
  }

  function markReady(id: string): boolean {
    replace(id, (p) => touch({ ...p, status: 'READY_FOR_REVIEW' }));
    return persist();
  }

  function removeRequest(id: string): void {
    purchases.value = purchases.value.filter((p) => p.id !== id);
    persist();
  }

  const totalOf = (id: string): number => calcRequestTotal(getById(id)?.items ?? []);

  return {
    purchases,
    storageError,
    getById,
    load,
    persist,
    createRequest,
    saveDraft,
    updateGeneral,
    addItem,
    updateItem,
    duplicateItem,
    removeItem,
    setMatches,
    selectMatch,
    recompute,
    markReady,
    removeRequest,
    totalOf,
  };
});
