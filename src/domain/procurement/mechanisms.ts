import type { MechanismInfo, ProcurementMechanism } from './types';

export const MECHANISMS: Record<ProcurementMechanism, MechanismInfo> = {
  CONVENIO_MARCO: {
    id: 'CONVENIO_MARCO',
    label: 'Convenio Marco',
    shortDescription: 'Compra a través de un catálogo de productos y servicios previamente licitados.',
  },
  COMPRA_AGIL: {
    id: 'COMPRA_AGIL',
    label: 'Compra Ágil',
    shortDescription: 'Mecanismo simplificado para compras de bajo monto.',
  },
  LICITACION_PUBLICA: {
    id: 'LICITACION_PUBLICA',
    label: 'Licitación Pública',
    shortDescription: 'Procedimiento concursal abierto; regla general de contratación.',
  },
  LICITACION_PRIVADA: {
    id: 'LICITACION_PRIVADA',
    label: 'Licitación Privada',
    shortDescription: 'Procedimiento por invitación; requiere causal justificada.',
  },
  TRATO_DIRECTO: {
    id: 'TRATO_DIRECTO',
    label: 'Trato Directo',
    shortDescription: 'Contratación sin concurso; requiere causal justificada.',
  },
  LICITACION_BASES_TIPO: {
    id: 'LICITACION_BASES_TIPO',
    label: 'Licitación con Bases Tipo',
    shortDescription: 'Modalidad que usa bases estandarizadas dentro de una licitación.',
  },
  ECONOMIA_CIRCULAR: {
    id: 'ECONOMIA_CIRCULAR',
    label: 'Adquisición por economía circular',
    shortDescription: 'Alternativa previa: reutilización, reasignación o bienes reacondicionados.',
  },
  SUBASTA_INVERSA: {
    id: 'SUBASTA_INVERSA',
    label: 'Subasta Inversa Electrónica',
    shortDescription: 'Competencia por precio entre proveedores para bienes estandarizados.',
  },
  REQUIERE_REVISION_MANUAL: {
    id: 'REQUIERE_REVISION_MANUAL',
    label: 'Revisión manual requerida',
    shortDescription: 'Los antecedentes no permiten sugerir un mecanismo; debe revisarlo una persona.',
  },
};

export const mechanismLabel = (m: ProcurementMechanism): string => MECHANISMS[m].label;
