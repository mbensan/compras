<script setup lang="ts">
import { computed } from 'vue';
import type { RequestRecommendation } from '../../domain/procurement/requestRecommendation';
import { calcRequestTotal } from '../../utils/calc';
import { formatBytes, formatClp, formatDate } from '../../utils/format';
import MechanismBadge from '../recommendation/MechanismBadge.vue';
import RequestRecommendationPanel from '../recommendation/RequestRecommendationPanel.vue';
import type { PurchaseRequest } from '../../types/purchase';

const props = defineProps<{ request: PurchaseRequest; recommendation: RequestRecommendation }>();
const total = computed(() => calcRequestTotal(props.request.items));
const lineNumbers = computed(() => Object.fromEntries(props.request.items.map((i) => [i.id, i.lineNumber])));
const alerts = computed(() =>
  props.request.items.flatMap((i) => [
    ...(i.recommendation?.missingInformation ?? []).map((m) => `Ítem ${i.lineNumber}: falta ${m.toLowerCase()}.`),
    ...(i.recommendation?.warnings ?? []).map((w) => `Ítem ${i.lineNumber}: ${w}`),
    ...(!i.recommendation ? [`Ítem ${i.lineNumber}: sin recomendación (guarde el ítem).`] : []),
  ]),
);
const selected = (r: PurchaseRequest) =>
  r.items.map((i) => ({
    item: i,
    product: i.frameworkMatches.find((m) => m.product.id === i.selectedFrameworkProductId)?.product,
  }));
const yn = (b: boolean) => (b ? 'Sí' : 'No');
</script>

<template>
  <div class="space-y-6">
    <section class="card" aria-labelledby="sum-general">
      <h2 id="sum-general" class="mb-3 text-lg font-semibold">Datos generales</h2>
      <dl class="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div><dt class="font-medium">Título</dt><dd class="break-words">{{ request.title }}</dd></div>
        <div><dt class="font-medium">Organismo comprador</dt><dd>{{ request.buyerOrganization }}</dd></div>
        <div><dt class="font-medium">Unidad requirente</dt><dd>{{ request.requestingUnit }}</dd></div>
        <div><dt class="font-medium">Solicitante</dt><dd>{{ request.requesterName }} ({{ request.requesterEmail }})</dd></div>
        <div><dt class="font-medium">Centro de coste</dt><dd>{{ request.costCenter || '—' }}</dd></div>
        <div><dt class="font-medium">Fecha requerida</dt><dd>{{ formatDate(request.requiredDate) }}</dd></div>
        <div><dt class="font-medium">Moneda</dt><dd>{{ request.currency }}</dd></div>
        <div><dt class="font-medium">Recurrente / Urgencia declarada</dt><dd>{{ yn(request.recurring) }} / {{ yn(request.urgencyDeclared) }}</dd></div>
        <div class="sm:col-span-2"><dt class="font-medium">Justificación</dt><dd class="break-words">{{ request.justification }}</dd></div>
        <div v-if="request.notes" class="sm:col-span-2"><dt class="font-medium">Observaciones</dt><dd class="break-words">{{ request.notes }}</dd></div>
      </dl>
    </section>

    <section class="card" aria-labelledby="sum-items">
      <h2 id="sum-items" class="mb-3 text-lg font-semibold">Ítems</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <caption class="sr-only">Detalle de ítems de la compra</caption>
          <thead class="border-b border-slate-300 bg-slate-100">
            <tr>
              <th scope="col" class="p-2">N°</th><th scope="col" class="p-2">Descripción</th>
              <th scope="col" class="p-2">Cantidad</th><th scope="col" class="p-2 text-right">Total</th>
              <th scope="col" class="p-2">Mecanismo sugerido</th><th scope="col" class="p-2">Documentos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in request.items" :key="i.id" class="border-b border-slate-200 align-top">
              <td class="p-2">{{ i.lineNumber }}</td>
              <td class="break-words p-2">{{ i.description }}</td>
              <td class="p-2">{{ i.quantity }} {{ i.unit }}</td>
              <td class="whitespace-nowrap p-2 text-right">{{ formatClp(i.estimatedTotalClp) }}</td>
              <td class="space-y-1 p-2">
                <MechanismBadge v-if="i.recommendation" :mechanism="i.recommendation.primaryMechanism" />
                <span v-else>—</span>
                <div v-for="c in i.recommendation?.complementaryModalities ?? []" :key="c"><MechanismBadge :mechanism="c" muted /></div>
              </td>
              <td class="p-2">
                <ul v-if="i.attachments.length" class="list-disc pl-4 text-xs">
                  <li v-for="a in i.attachments" :key="a.name + a.size" class="break-words">{{ a.name }} ({{ formatBytes(a.size) }})</li>
                </ul>
                <span v-else class="text-xs text-slate-600">Sin documentos</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-semibold"><th scope="row" colspan="3" class="p-2 text-right">Total estimado</th>
              <td class="whitespace-nowrap p-2 text-right">{{ formatClp(total) }}</td><td colspan="2"></td></tr>
          </tfoot>
        </table>
      </div>
      <p class="mt-2 text-xs text-slate-600">Los documentos se muestran solo como metadatos; no se almacenó su contenido.</p>
    </section>

    <RequestRecommendationPanel :recommendation="recommendation" :line-numbers="lineNumbers" />

    <section class="card" aria-labelledby="sum-fm">
      <h2 id="sum-fm" class="mb-3 text-lg font-semibold">Convenio Marco: coincidencias seleccionadas</h2>
      <ul class="space-y-1 text-sm">
        <li v-for="s in selected(request)" :key="s.item.id">
          <strong>Ítem {{ s.item.lineNumber }}:</strong>
          <template v-if="s.product">{{ s.product.name }} – {{ s.product.supplierName }} – {{ formatClp(s.product.priceClp) }} (ficticio)</template>
          <template v-else-if="s.item.frameworkNoneApplies">se indicó que ninguna coincidencia corresponde.</template>
          <template v-else-if="s.item.frameworkMatches.length">hay coincidencias sin seleccionar.</template>
          <template v-else>sin coincidencias.</template>
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="sum-alerts">
      <h2 id="sum-alerts" class="mb-3 text-lg font-semibold">Alertas y antecedentes faltantes</h2>
      <p v-if="!alerts.length" class="text-sm">✔ No se detectaron alertas.</p>
      <ul v-else class="list-disc space-y-1 pl-5 text-sm text-amber-950"><li v-for="a in alerts" :key="a">⚠ {{ a }}</li></ul>
    </section>
  </div>
</template>
