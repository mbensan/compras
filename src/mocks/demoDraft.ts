import { recommendMechanism } from '../domain/procurement/recommendMechanism';
import { rankProducts } from '../services/frameworkAgreementService';
import { buildRuleInput, calcItemTotal } from '../utils/calc';
import type { FrameworkAgreementProduct } from '../types/framework';
import type { PurchaseItem, PurchaseRequest } from '../types/purchase';
import catalog from './framework-agreements.json';

type ItemSeed = Pick<PurchaseItem, 'description' | 'category' | 'quantity' | 'unit' | 'estimatedUnitAmountClp' | 'termValue' | 'termUnit' | 'keywords'> &
  Partial<PurchaseItem>;

function buildItem(n: number, seed: ItemSeed, request: PurchaseRequest): PurchaseItem {
  const item: PurchaseItem = {
    id: `demo-item-${n}`,
    lineNumber: n,
    acceptsEquivalent: true,
    attachments: [],
    frameworkMatches: [],
    saved: true,
    estimatedTotalClp: 0,
    ...seed,
  };
  item.estimatedTotalClp = calcItemTotal(item.quantity, item.estimatedUnitAmountClp);
  item.frameworkMatches = rankProducts(
    { description: item.description, keywords: item.keywords },
    catalog as FrameworkAgreementProduct[],
  );
  item.recommendation = recommendMechanism(buildRuleInput(item, request));
  return item;
}

/** Borrador de ejemplo: equipos y mobiliario. Los adjuntos son solo metadatos. */
export function createDemoRequest(): PurchaseRequest {
  const now = new Date().toISOString();
  const request: PurchaseRequest = {
    id: 'demo-request-1',
    title: 'Equipamiento y mobiliario para nueva unidad (demo)',
    buyerOrganization: 'Organismo de Ejemplo',
    requestingUnit: 'Unidad de Gestión Interna',
    requesterName: 'Persona de Ejemplo',
    requesterEmail: 'ejemplo@organismo.invalid',
    costCenter: 'CC-0000',
    justification: 'Equipar una nueva unidad de trabajo con computadores y mobiliario.',
    requiredDate: '',
    currency: 'CLP',
    notes: 'Borrador de demostración con datos ficticios.',
    recurring: false,
    urgencyDeclared: false,
    status: 'DRAFT',
    items: [],
    createdAt: now,
    updatedAt: now,
  };
  const lastModified = Date.now();
  request.items = [
    buildItem(
      1,
      {
        description: 'Notebook 15 pulgadas con 16 GB de RAM para funcionarios',
        category: 'PRODUCT',
        quantity: 10,
        unit: 'unidad',
        estimatedUnitAmountClp: 650000,
        termValue: 15,
        termUnit: 'BUSINESS_DAYS',
        keywords: ['notebook', 'computador', 'portatil'],
        attachments: [
          { name: 'especificaciones-tecnicas.pdf', size: 245000, type: 'application/pdf', lastModified },
        ],
      },
      request,
    ),
    buildItem(
      2,
      {
        description: 'Escritorios y sillas ergonómicas para el equipo; podrían reasignarse existentes',
        category: 'PRODUCT',
        quantity: 8,
        unit: 'unidad',
        estimatedUnitAmountClp: 120000,
        termValue: 4,
        termUnit: 'WEEKS',
        keywords: ['silla', 'escritorio'],
        circularEconomyCandidate: true,
        attachments: [
          { name: 'inventario-bodega.xlsx', size: 58000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', lastModified },
          { name: 'fotos-muebles.png', size: 1200000, type: 'image/png', lastModified },
        ],
      },
      request,
    ),
    buildItem(
      3,
      {
        description: 'Asesoría especializada para el rediseño de espacios de trabajo',
        category: 'SERVICE',
        quantity: 1,
        unit: 'servicio',
        estimatedUnitAmountClp: 9500000,
        termValue: 3,
        termUnit: 'MONTHS',
        keywords: ['asesoria', 'diseno'],
        exceptionalGround: 'OTHER',
        attachments: [],
      },
      request,
    ),
  ];
  return request;
}
