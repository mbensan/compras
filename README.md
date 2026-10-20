# Asistente de Compras Públicas (MVP)

SPA para organismos estatales de Chile que permite registrar una solicitud de compra, agregar ítems con documentos
adjuntos y obtener una **recomendación preliminar y explicable** del mecanismo de compra aplicable.

> **Advertencia jurídica.** Este prototipo no adjudica, no reemplaza la revisión jurídica ni determina de forma
> definitiva un procedimiento. Las reglas y umbrales son **demostrativos (mock)** y deben ser validados por
> especialistas conforme a la normativa vigente. Siempre se habla de «mecanismo sugerido».

## Requisitos

- Node.js 18 o superior y npm.

## Instalación y ejecución

```bash
npm install
npm run dev
```

## Comandos

| Comando         | Descripción                                   |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo (Vite)                 |
| `npm run test`  | Pruebas unitarias (Vitest)                    |
| `npm run build` | Verificación de tipos (`vue-tsc`) y build     |
| `npm run preview` | Sirve el build generado                     |

## Arquitectura

Vue 3 (`<script setup>`) + Vite + TypeScript + Pinia + Vue Router (modo hash) + Tailwind CSS 3 + Vitest.

```text
src/
  domain/procurement/   Motor de recomendación (TypeScript puro, sin Vue)
  services/             Catálogo mock de Convenio Marco y conversión CLP/UTM
  stores/purchaseStore  Estado global + persistencia en localStorage
  mocks/                JSON del catálogo y borrador de demostración
  components/ views/    Interfaz
  utils/ types/         Utilidades, validaciones y tipos del modelo
```

## Reglas configurables

Todo está en `src/domain/procurement/`:

- `rules.ts`: `RULESET_VERSION`, las reglas (`RULES`, con `validFrom`, `sourceLabel`, `sourceUrl`,
  `requiresLegalValidation`, `enabled` y `params`), las causales de prueba y el margen de alerta de fragmentación.
  El umbral de Compra Ágil (en UTM) está en `params.maxUtm` de la regla `compra-agil-threshold`.
- `mechanisms.ts`: catálogo de mecanismos (Subasta Inversa Electrónica incluida).
- `recommendMechanism.ts`: recomendación por ítem.
- `requestRecommendation.ts`: recomendación general (agrupación y alertas de fragmentación).

El valor de la UTM (mock) y su fecha de referencia están en `src/services/utmService.ts`.

## Catálogo mock

`src/mocks/framework-agreements.json` (13 productos ficticios) y `src/services/frameworkAgreementService.ts`
(normalización sin tildes, puntaje por coincidencia, máximo 5 resultados, latencia simulada de 500–900 ms).
Los enlaces son ficticios y la imagen es un placeholder local (`public/placeholders/product.svg`).

## Decisiones tomadas

- Rutas en modo hash (`/#/purchases/...`) para funcionar sin configuración de servidor.
- «Nueva compra» crea la solicitud en memoria; se persiste al guardar borrador, al guardar un ítem o al revisar.
  «Cancelar» revierte a lo último guardado.
- En la primera ejecución se siembra un borrador de demostración (3 ítems: Convenio Marco, economía circular y
  revisión manual).
- Economía circular se trata como modalidad complementaria/previa, nunca como mecanismo adjudicado.
- La urgencia declarada nunca habilita Trato Directo; se requiere una causal seleccionada, y «Otra causal por
  validar» deriva a revisión manual.
- Umbral de Compra Ágil de 100 UTM y UTM de 68.000 CLP: valores ilustrativos.

## Limitaciones del MVP

Sin backend ni autenticación; sin firma electrónica; sin integración con Mercado Público/ChileCompra; los adjuntos
se guardan solo como metadatos (hay que volver a adjuntarlos tras recargar); persistencia únicamente en
`localStorage` del navegador; reglas no validadas jurídicamente.

## Reemplazar el mock por una API real

1. Implementar en `frameworkAgreementService.ts` la función `searchFrameworkAgreements` con una llamada HTTP que
   devuelva `FrameworkAgreementMatch[]` (mantener la firma y el manejo de `FrameworkServiceError`).
2. Reemplazar `utmService.ts` por una fuente oficial de la UTM.
3. Reemplazar la persistencia de `purchaseStore.ts` (`load`/`persist`) por llamadas a un backend.
4. Cargar la configuración de reglas (`RulesetConfig`) desde un origen administrable.

## Variables de entorno propuestas

```text
VITE_FRAMEWORK_API_URL=   URL base de la API de catálogo de Convenio Marco
VITE_UTM_VALUE_CLP=       Valor de la UTM en CLP (ya es leído por utmService.ts)
VITE_RULESET_API_URL=     Origen de la configuración de reglas
VITE_PURCHASES_API_URL=   API de solicitudes de compra
```
