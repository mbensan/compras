import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { STORAGE_KEY, parsePurchases, serializePurchases, usePurchaseStore } from './purchaseStore';

describe('purchaseStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('siembra el borrador de demostración en la primera carga', () => {
    const store = usePurchaseStore();
    store.load();
    expect(store.purchases).toHaveLength(1);
    expect(store.purchases[0].items).toHaveLength(3);
  });

  it('recalcula totales al modificar, duplicar y eliminar ítems', () => {
    const store = usePurchaseStore();
    store.load();
    const req = store.createRequest();
    const item = store.addItem(req.id);
    store.updateItem(req.id, item.id, { quantity: 4, estimatedUnitAmountClp: 2500 });
    expect(store.totalOf(req.id)).toBe(10_000);
    store.duplicateItem(req.id, item.id);
    expect(store.totalOf(req.id)).toBe(20_000);
    store.removeItem(req.id, item.id);
    expect(store.getById(req.id)?.items.map((i) => i.lineNumber)).toEqual([1]);
  });

  it('serializa y recupera sin perder datos ni adjuntos (solo metadatos)', () => {
    const store = usePurchaseStore();
    store.load();
    const raw = serializePurchases(store.purchases);
    const back = parsePurchases(raw);
    expect(back).toEqual(JSON.parse(JSON.stringify(store.purchases)));
    expect(back[0].items[0].attachments[0]).toEqual(
      expect.objectContaining({ name: expect.any(String), size: expect.any(Number) }),
    );
  });

  it('guarda y recarga un borrador desde localStorage', () => {
    const store = usePurchaseStore();
    store.load();
    const req = store.createRequest();
    store.updateGeneral(req.id, { title: 'Mi compra' });
    expect(store.saveDraft(req.id)).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Mi compra');

    setActivePinia(createPinia());
    const other = usePurchaseStore();
    other.load();
    expect(other.getById(req.id)?.title).toBe('Mi compra');
  });

  it('informa error si el almacenamiento está dañado', () => {
    localStorage.setItem(STORAGE_KEY, '{no-es-json');
    const store = usePurchaseStore();
    store.load();
    expect(store.storageError).toBeTruthy();
  });
});
