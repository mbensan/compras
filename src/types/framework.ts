export interface FrameworkAgreementProduct {
  id: string;
  agreementId: string;
  agreementName: string;
  sku: string;
  name: string;
  description: string;
  keywords: string[];
  category: string;
  supplierName: string;
  brand?: string;
  model?: string;
  priceClp: number;
  stockStatus: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  imageUrl: string;
  productUrl: string;
  validUntil: string;
}

export interface FrameworkAgreementMatch {
  product: FrameworkAgreementProduct;
  /** Porcentaje de coincidencia, 0-100. */
  score: number;
}
