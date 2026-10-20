import { todayIso } from './format';
import type { PurchaseItem, PurchaseRequest } from '../types/purchase';

export type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_AMOUNT = 1_000_000_000_000;

const bad = (n: number) => !Number.isFinite(n);

export function validateGeneral(r: PurchaseRequest, requireItems = false): Errors {
  const e: Errors = {};
  if (!r.title.trim()) e.title = 'El título es obligatorio.';
  if (!r.buyerOrganization.trim()) e.buyerOrganization = 'El organismo comprador es obligatorio.';
  if (!r.requestingUnit.trim()) e.requestingUnit = 'La unidad requirente es obligatoria.';
  if (!r.requesterName.trim()) e.requesterName = 'El nombre del solicitante es obligatorio.';
  if (!r.requesterEmail.trim()) e.requesterEmail = 'El correo es obligatorio.';
  else if (!EMAIL_RE.test(r.requesterEmail.trim())) e.requesterEmail = 'Ingrese un correo válido.';
  if (!r.justification.trim()) e.justification = 'La justificación es obligatoria.';
  if (r.requiredDate && r.requiredDate < todayIso()) e.requiredDate = 'La fecha requerida no puede ser anterior a hoy.';
  if (requireItems && r.items.length === 0) e.items = 'Debe agregar al menos un ítem.';
  return e;
}

export function validateItem(i: PurchaseItem): Errors {
  const e: Errors = {};
  if (i.description.trim().length < 10) e.description = 'La descripción debe tener al menos 10 caracteres.';
  if (bad(i.quantity) || !(i.quantity > 0)) e.quantity = 'La cantidad debe ser mayor que cero.';
  if (bad(i.estimatedUnitAmountClp) || !(i.estimatedUnitAmountClp > 0)) {
    e.estimatedUnitAmountClp = 'El monto unitario debe ser mayor que cero.';
  } else if (i.estimatedUnitAmountClp > MAX_AMOUNT) e.estimatedUnitAmountClp = 'El monto unitario es demasiado alto.';
  if (bad(i.termValue) || !(i.termValue > 0)) e.termValue = 'El plazo debe ser mayor que cero.';
  if (!i.unit.trim()) e.unit = 'La unidad de medida es obligatoria.';
  if (i.requiredDate && i.requiredDate < todayIso()) e.requiredDate = 'La fecha límite no puede ser anterior a hoy.';
  return e;
}

/** Errores para la revisión: datos generales + todos los ítems. */
export function validateForReview(r: PurchaseRequest): string[] {
  const msgs = Object.values(validateGeneral(r, true));
  r.items.forEach((i) => {
    const errs = validateItem(i);
    Object.values(errs).forEach((m) => msgs.push(`Ítem ${i.lineNumber}: ${m}`));
    if (!i.saved && !Object.keys(errs).length) msgs.push(`Ítem ${i.lineNumber}: debe guardarse para obtener su recomendación.`);
  });
  return msgs;
}
