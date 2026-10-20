# Prompt maestro para Cursor: MVP Asistente de Compras Públicas

## 1. Rol y objetivo

Actúa como arquitecto de software y desarrollador frontend senior especializado en Vue 3.

Construye un MVP funcional de una SPA llamada **Asistente de Compras Públicas**, orientada a organismos estatales de Chile. La aplicación debe permitir iniciar una solicitud de compra, registrar sus datos generales, agregar múltiples ítems con documentos adjuntos y entregar una **recomendación preliminar y explicable** del mecanismo de compra aplicable.

> Importante: el MVP no adjudica, no reemplaza la revisión jurídica ni determina de forma definitiva un procedimiento. Debe hablar siempre de **mecanismo sugerido** o **recomendación preliminar**. Las reglas deben quedar parametrizadas y claramente separadas de la interfaz para que posteriormente puedan ser validadas y actualizadas por especialistas conforme a la normativa vigente.

## 2. Stack obligatorio

- Vue 3 con Composition API y `<script setup>`.
- Vite.
- TypeScript.
- Pinia para estado global.
- Vue Router.
- Tailwind CSS para estilos.
- Vitest para pruebas unitarias.
- Sin backend real en esta fase.
- Persistencia temporal mediante `localStorage`.
- Datos simulados de Convenio Marco en un archivo JSON local.
- No utilizar React, Nuxt ni un servicio externo.

## 3. Resultado esperado

Genera un proyecto completo, ejecutable con:

```bash
npm install
npm run dev
```

Incluye además:

```bash
npm run test
npm run build
```

No entregues pseudocódigo. Crea todos los archivos necesarios, con imports correctos, tipado coherente y una interfaz navegable.

## 4. Usuarios y alcance del MVP

### Usuario principal

Funcionario o funcionaria de una unidad requirente o de adquisiciones de un organismo estatal chileno.

### Incluido

- Crear y editar una solicitud de compra.
- Registrar datos generales.
- Agregar, editar, duplicar y eliminar ítems.
- Adjuntar varios documentos a cada ítem.
- Calcular el monto total estimado.
- Recomendar un mecanismo por ítem y uno general para la solicitud.
- Explicar por qué se recomienda el mecanismo.
- Consultar un catálogo mock de Convenio Marco al completar un ítem.
- Mostrar coincidencias con foto, precio, proveedor y enlace.
- Guardar borrador en el navegador.
- Revisar un resumen antes de finalizar.

### Fuera de alcance

- Autenticación real.
- Firma electrónica.
- Integración real con Mercado Público o ChileCompra.
- Carga física de documentos a servidor.
- Creación de procesos de compra reales.
- Adjudicación automática.
- Evaluación jurídica definitiva.

## 5. Flujo principal

1. El usuario ingresa a la pantalla de inicio.
2. Selecciona **Nueva compra**.
3. Completa los datos principales de la solicitud.
4. Agrega uno o más ítems.
5. En cada ítem registra descripción, cantidad, monto estimado, plazo y antecedentes complementarios.
6. Puede adjuntar diversos documentos por ítem.
7. Al guardar o completar un ítem, la aplicación:
   - valida los campos;
   - ejecuta el motor de recomendación local;
   - consulta el catálogo mock de Convenio Marco;
   - muestra el mecanismo sugerido, sus razones, alertas y coincidencias de catálogo.
8. El usuario puede seleccionar una coincidencia del catálogo o marcar que ninguna corresponde.
9. Al finalizar, revisa el resumen completo.
10. Guarda el borrador o marca la solicitud como lista para revisión.

## 6. Pantallas

### 6.1 Inicio

Debe incluir:

- Encabezado institucional neutro.
- Nombre de la aplicación.
- Botón principal **Nueva compra**.
- Listado de borradores guardados localmente.
- Estado del borrador, fecha de modificación, monto total y número de ítems.
- Acciones para continuar o eliminar borrador.

### 6.2 Formulario principal de compra

Datos generales:

- Nombre o título de la compra.
- Organismo comprador.
- Unidad requirente.
- Nombre del solicitante.
- Correo del solicitante.
- Centro de coste o código presupuestario, opcional.
- Justificación de la necesidad.
- Fecha requerida.
- Moneda, inicialmente CLP.
- Observaciones generales.
- Casilla: compra recurrente.
- Casilla: urgencia o situación excepcional.

Debe mostrar:

- Indicador de progreso.
- Monto total estimado.
- Número de ítems.
- Recomendación general provisional.
- Botones Guardar borrador, Revisar compra y Cancelar.

### 6.3 Editor de ítems

Cada ítem debe contener:

- Número correlativo.
- Descripción detallada del producto o servicio.
- Categoría: producto, servicio u obra.
- Cantidad.
- Unidad de medida.
- Monto unitario aproximado.
- Monto total calculado.
- Plazo requerido expresado como valor y unidad: días hábiles, días corridos, semanas o meses.
- Fecha límite opcional.
- Comuna o región de entrega, opcional.
- Campo para palabras clave.
- Requisitos técnicos u observaciones.
- Indicador de si admite alternativas o equivalentes.
- Documentos adjuntos.

Acciones:

- Guardar ítem.
- Duplicar.
- Eliminar.
- Buscar nuevamente en Convenio Marco.
- Ver explicación del mecanismo sugerido.

### 6.4 Revisión final

Debe mostrar:

- Datos generales.
- Tabla completa de ítems.
- Documentos asociados a cada ítem.
- Total estimado de la compra.
- Recomendación por ítem.
- Recomendación general.
- Alertas o antecedentes faltantes.
- Coincidencias de Convenio Marco seleccionadas.
- Casilla obligatoria: “Comprendo que la recomendación es referencial y debe ser validada por la unidad de adquisiciones y/o asesoría jurídica”.
- Botón **Marcar como lista para revisión**.

## 7. Documentos por ítem

Implementa un componente reutilizable `ItemAttachments.vue`.

Requisitos:

- Permitir selección múltiple.
- Tipos aceptados: PDF, DOC, DOCX, XLS, XLSX, PNG y JPG.
- Tamaño máximo configurable, inicialmente 10 MB por archivo.
- Mostrar nombre, extensión y tamaño.
- Permitir eliminar antes de guardar.
- En el MVP no subir archivos a un servidor ni guardar su contenido completo en `localStorage`.
- Mantener solo metadatos serializables: nombre, tamaño, tipo y fecha de última modificación.
- Mostrar claramente que los archivos deberán volver a adjuntarse después de recargar la página.

## 8. Mecanismos considerados

El catálogo inicial debe incluir:

- Convenio Marco.
- Compra Ágil.
- Licitación Pública.
- Licitación Privada.
- Trato Directo.
- Licitación con Bases Tipo.
- Adquisición por economía circular.
- Subasta Inversa Electrónica.
- Revisión manual requerida.

Usar la denominación **Subasta Inversa Electrónica** en la interfaz. Evitar “Subasta Interna”, salvo que aparezca como alias en datos de prueba.

## 9. Motor de recomendación

Crear los siguientes archivos:

```text
src/domain/procurement/mechanisms.ts
src/domain/procurement/rules.ts
src/domain/procurement/recommendMechanism.ts
src/domain/procurement/types.ts
```

### Condiciones de diseño

- No incrustar reglas en componentes Vue.
- Las reglas deben ser datos configurables.
- Los umbrales monetarios no deben quedar presentados como verdad jurídica definitiva.
- Incluir una constante `RULESET_VERSION`.
- Incluir campos `validFrom`, `sourceLabel`, `sourceUrl`, `requiresLegalValidation` y `enabled`.
- Expresar montos normativos en UTM cuando corresponda y mantener el monto ingresado por el usuario en CLP.
- Crear un servicio mock de conversión CLP/UTM con valor configurable y fecha de referencia visible.
- Si falta información necesaria, devolver `REQUIERE_REVISION_MANUAL`.
- Una excepción nunca debe inferirse solo desde el monto.
- Trato Directo y Licitación Privada requieren causal o antecedente justificativo explícito.
- Economía circular debe tratarse como alternativa previa o complementaria, no como compra adjudicada.
- Bases Tipo puede modificar la forma de una licitación, por lo que el modelo debe permitir mecanismo principal y modalidad complementaria.

### Entrada sugerida

```ts
export interface ProcurementRuleInput {
  itemId: string;
  description: string;
  category: 'PRODUCT' | 'SERVICE' | 'WORK';
  quantity: number;
  estimatedTotalClp: number;
  estimatedTotalUtm?: number;
  requiredTermValue: number;
  requiredTermUnit: 'BUSINESS_DAYS' | 'CALENDAR_DAYS' | 'WEEKS' | 'MONTHS';
  hasFrameworkAgreementMatch: boolean;
  frameworkAgreementMandatory?: boolean;
  circularEconomyCandidate?: boolean;
  hasStandardBiddingTerms?: boolean;
  exceptionalGround?: string;
  urgencyDeclared: boolean;
}
```

### Salida sugerida

```ts
export interface MechanismRecommendation {
  primaryMechanism: ProcurementMechanism;
  complementaryModalities: ProcurementMechanism[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
  warnings: string[];
  missingInformation: string[];
  alternatives: ProcurementMechanism[];
  rulesetVersion: string;
  requiresHumanValidation: true;
}
```

### Reglas iniciales del prototipo

Implementa reglas demostrativas, editables y claramente marcadas como mock:

1. Si el ítem puede satisfacerse mediante reutilización, reasignación o economía circular, mostrar esta alternativa antes de recomendar una compra.
2. Si existe coincidencia válida en el catálogo de Convenio Marco, recomendar revisar Convenio Marco antes de otro mecanismo.
3. Si existen Bases Tipo aplicables, agregarlas como modalidad complementaria a una licitación.
4. Compra Ágil solo puede sugerirse si el monto en UTM está bajo el umbral configurado y no hay una alternativa preferente aplicable.
5. Licitación Pública debe quedar disponible como regla general y utilizarse en los casos definidos por la configuración.
6. Licitación Privada y Trato Directo solo deben aparecer como recomendación si existe una causal seleccionada; en caso contrario, mostrarlos únicamente como alternativas bloqueadas.
7. La urgencia declarada por el usuario no basta por sí sola para recomendar Trato Directo.
8. Si hay reglas contradictorias, datos insuficientes o baja confianza, recomendar revisión manual.

No inventar causales legales. Utilizar un selector mock con opciones genéricas y la opción “Otra causal por validar”.

## 10. Recomendación general de la solicitud

La recomendación global no debe basarse siempre en el mecanismo del ítem de mayor monto.

Aplicar:

- Detectar si los ítems son homogéneos o corresponden a necesidades distintas.
- Advertir sobre posible fragmentación si se crean ítems similares con mecanismos distintos o montos cercanos al umbral configurado.
- Si existen varios mecanismos posibles, mostrar “Compra con revisión por grupos de ítems”.
- Permitir agrupar visualmente ítems por mecanismo sugerido.
- Nunca concluir que dividir una compra para cambiar el procedimiento es válido.

## 11. Mock de Convenio Marco

Crear:

```text
src/mocks/framework-agreements.json
src/services/frameworkAgreementService.ts
```

Incluir al menos 12 productos ficticios distribuidos en categorías como:

- computadores portátiles;
- monitores;
- sillas de oficina;
- papel tamaño carta;
- impresoras;
- servicios de nube;
- mobiliario;
- artículos de aseo.

Estructura:

```ts
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
```

### Búsqueda mock

- Normalizar texto a minúsculas y sin tildes.
- Comparar descripción y palabras clave.
- Asignar un puntaje simple por coincidencia.
- Devolver como máximo cinco resultados ordenados por puntaje.
- Simular latencia de 500 a 900 ms.
- Mostrar estado cargando, sin resultados y error.
- Ejecutar la consulta al guardar el ítem y permitir repetirla manualmente.
- No consultar en cada pulsación de teclado.

### Tarjeta de resultado

Debe mostrar:

- Imagen.
- Nombre.
- Descripción resumida.
- Convenio.
- Proveedor.
- Marca y modelo, si existen.
- Precio referencial.
- Estado de stock.
- Porcentaje de coincidencia.
- Botón **Ver en Convenio Marco**, abierto en pestaña nueva con `rel="noopener noreferrer"`.
- Botón **Seleccionar coincidencia**.

Usar imágenes placeholder locales o URLs estables de prueba. Los enlaces deben identificarse visualmente como ficticios en el MVP.

## 12. Modelo de datos

```ts
export interface PurchaseRequest {
  id: string;
  title: string;
  buyerOrganization: string;
  requestingUnit: string;
  requesterName: string;
  requesterEmail: string;
  costCenter?: string;
  justification: string;
  requiredDate: string;
  currency: 'CLP';
  notes?: string;
  recurring: boolean;
  urgencyDeclared: boolean;
  status: 'DRAFT' | 'READY_FOR_REVIEW';
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  lineNumber: number;
  description: string;
  category: 'PRODUCT' | 'SERVICE' | 'WORK';
  quantity: number;
  unit: string;
  estimatedUnitAmountClp: number;
  estimatedTotalClp: number;
  termValue: number;
  termUnit: 'BUSINESS_DAYS' | 'CALENDAR_DAYS' | 'WEEKS' | 'MONTHS';
  requiredDate?: string;
  deliveryLocation?: string;
  keywords: string[];
  technicalRequirements?: string;
  acceptsEquivalent: boolean;
  attachments: AttachmentMetadata[];
  recommendation?: MechanismRecommendation;
  frameworkMatches: FrameworkAgreementMatch[];
  selectedFrameworkProductId?: string;
}
```

Usar UUID mediante `crypto.randomUUID()` con un fallback sencillo para entornos sin soporte.

## 13. Componentes mínimos

```text
src/components/layout/AppHeader.vue
src/components/purchase/PurchaseGeneralForm.vue
src/components/purchase/PurchaseItemList.vue
src/components/purchase/PurchaseItemEditor.vue
src/components/purchase/ItemAttachments.vue
src/components/purchase/PurchaseSummary.vue
src/components/recommendation/MechanismBadge.vue
src/components/recommendation/RecommendationPanel.vue
src/components/framework/FrameworkMatchList.vue
src/components/framework/FrameworkProductCard.vue
src/components/common/ConfirmDialog.vue
src/components/common/EmptyState.vue
src/components/common/ToastMessage.vue
```

## 14. Rutas

```text
/                     Inicio y borradores
/purchases/new        Nueva compra
/purchases/:id/edit   Editar borrador
/purchases/:id/review Revisión final
```

## 15. Store

Crear `src/stores/purchaseStore.ts` con acciones para:

- crear solicitud;
- cargar desde `localStorage`;
- guardar borrador;
- actualizar datos generales;
- agregar, modificar, duplicar y eliminar ítems;
- recalcular totales;
- almacenar recomendación;
- almacenar coincidencias de Convenio Marco;
- seleccionar coincidencia;
- marcar solicitud lista para revisión;
- eliminar borrador.

Evitar mutaciones accidentales y mantener tipado estricto.

## 16. Validaciones

- Título obligatorio.
- Organismo, unidad, solicitante y correo obligatorios.
- Correo válido.
- Justificación obligatoria.
- Al menos un ítem.
- Descripción de ítem de al menos 10 caracteres.
- Cantidad mayor que cero.
- Monto unitario mayor que cero.
- Plazo mayor que cero.
- Fecha requerida no anterior a la fecha actual.
- No permitir `NaN`, negativos ni desbordes visuales.
- Confirmar antes de eliminar un ítem o borrador.
- Mostrar errores junto al campo y un resumen de errores al intentar avanzar.

## 17. UX/UI

Diseño sobrio, moderno, accesible y adecuado para una aplicación estatal chilena.

- Interfaz en español.
- Escritorio primero, pero responsive desde 360 px.
- Colores principales azules; verde para correcto; ámbar para advertencias; rojo para errores.
- No usar el color como único indicador.
- Formularios con etiquetas visibles.
- Foco de teclado claro.
- Contraste WCAG AA.
- Botones con texto, no solo iconos.
- Importes con `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })`.
- Fechas visibles en formato chileno.
- Recomendaciones en paneles explicables, no solo badges.
- Mostrar un banner persistente: “Prototipo: recomendaciones referenciales sujetas a validación”.

## 18. Accesibilidad

- HTML semántico.
- `aria-live` para resultados de búsqueda y mensajes de guardado.
- `aria-describedby` para ayudas y errores.
- Navegación completa por teclado.
- Diálogos con manejo de foco.
- Texto alternativo en imágenes.
- Encabezados jerárquicos.

## 19. Tratamiento de errores

- Error de lectura del JSON mock.
- Error al guardar o leer `localStorage`.
- Archivo inválido o demasiado grande.
- Ningún resultado en Convenio Marco.
- URL de imagen rota: usar placeholder.
- Reglas sin configuración válida: exigir revisión manual.
- No ocultar errores en consola; mostrar un mensaje entendible al usuario.

## 20. Pruebas mínimas

Crear pruebas con Vitest para:

- cálculo de total de ítem;
- total de solicitud;
- normalización de texto sin tildes;
- ranking de coincidencias de Convenio Marco;
- falta de datos que deriva en revisión manual;
- Convenio Marco cuando existe coincidencia válida;
- bloqueo de Trato Directo sin causal;
- modalidad Bases Tipo complementaria;
- serialización y recuperación del store.

## 21. Estructura orientativa

```text
src/
  assets/
  components/
  domain/procurement/
  mocks/
  router/
  services/
  stores/
  types/
  utils/
  views/
  App.vue
  main.ts
```

## 22. Datos de demostración

Incluir un borrador de ejemplo con:

- compra de equipos y mobiliario;
- tres ítems;
- al menos un match de Convenio Marco;
- un ítem candidato a economía circular;
- un ítem que requiera revisión manual;
- adjuntos representados solo mediante metadatos.

## 23. README

Crear un `README.md` con:

- objetivo del proyecto;
- requisitos;
- instalación y ejecución;
- comandos disponibles;
- arquitectura;
- ubicación de las reglas configurables;
- ubicación del catálogo mock;
- limitaciones del MVP;
- advertencia jurídica;
- cómo sustituir el mock por una API real;
- variables de entorno propuestas para una futura integración.

## 24. Criterios de aceptación

El MVP se considera completo cuando:

1. Se instala y ejecuta sin errores.
2. El usuario puede crear y recuperar un borrador.
3. Puede agregar varios ítems.
4. Cada ítem acepta metadatos de múltiples adjuntos.
5. El total se calcula correctamente.
6. Al guardar un ítem se consulta el JSON mock.
7. Las coincidencias muestran imagen, datos y enlace.
8. Cada recomendación explica razones, advertencias y datos faltantes.
9. Las reglas están desacopladas de Vue.
10. Trato Directo y Licitación Privada no se recomiendan sin causal.
11. La revisión final exige aceptar la advertencia referencial.
12. Las pruebas unitarias pasan.
13. `npm run build` finaliza correctamente.

## 25. Orden de implementación para Cursor

1. Inicializa Vue 3 + Vite + TypeScript.
2. Configura Tailwind, Router, Pinia y Vitest.
3. Crea tipos y modelos.
4. Implementa reglas y pruebas del dominio.
5. Implementa catálogo mock y servicio de búsqueda.
6. Implementa store con persistencia.
7. Construye vistas y componentes.
8. Añade validaciones y accesibilidad.
9. Añade datos de demostración.
10. Ejecuta pruebas y build.
11. Corrige todos los errores de TypeScript, ESLint si se configura, pruebas y compilación.
12. Entrega un resumen final de archivos creados, decisiones tomadas y comandos para iniciar.

## 26. Restricciones finales

- No inventar una API pública real ni credenciales.
- No afirmar que el motor cumple jurídicamente la normativa vigente.
- No codificar umbrales regulatorios dentro de componentes.
- No usar datos reales de proveedores en el JSON mock.
- No almacenar el contenido binario de adjuntos en `localStorage`.
- No realizar una adjudicación automática.
- No dejar botones principales sin comportamiento.
- No omitir estados de carga, vacío y error.
- No detenerse a pedir confirmación durante la generación: tomar decisiones razonables y documentarlas en el README.
