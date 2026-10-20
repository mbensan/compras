<script setup lang="ts">
import { todayIso } from '../../utils/format';
import type { Errors } from '../../utils/validation';
import type { PurchaseRequest } from '../../types/purchase';

defineProps<{ request: PurchaseRequest; errors: Errors }>();
const emit = defineEmits<{ update: [patch: Partial<PurchaseRequest>] }>();

const val = (e: Event) => (e.target as HTMLInputElement | HTMLTextAreaElement).value;
const chk = (e: Event) => (e.target as HTMLInputElement).checked;
const today = todayIso();
</script>

<template>
  <section class="card" aria-labelledby="general-title">
    <h2 id="general-title" class="mb-4 text-lg font-semibold">1. Datos generales</h2>
    <div class="grid gap-4 md:grid-cols-2">
      <div class="md:col-span-2">
        <label class="field-label" for="title">Nombre o título de la compra *</label>
        <input id="title" class="field-input" :value="request.title" maxlength="150" required
          :aria-invalid="!!errors.title" :aria-describedby="errors.title ? 'title-err' : undefined"
          @input="emit('update', { title: val($event) })" />
        <p v-if="errors.title" id="title-err" class="field-error">{{ errors.title }}</p>
      </div>

      <div>
        <label class="field-label" for="org">Organismo comprador *</label>
        <input id="org" class="field-input" :value="request.buyerOrganization" required
          :aria-invalid="!!errors.buyerOrganization" :aria-describedby="errors.buyerOrganization ? 'org-err' : undefined"
          @input="emit('update', { buyerOrganization: val($event) })" />
        <p v-if="errors.buyerOrganization" id="org-err" class="field-error">{{ errors.buyerOrganization }}</p>
      </div>
      <div>
        <label class="field-label" for="unit">Unidad requirente *</label>
        <input id="unit" class="field-input" :value="request.requestingUnit" required
          :aria-invalid="!!errors.requestingUnit" :aria-describedby="errors.requestingUnit ? 'unit-err' : undefined"
          @input="emit('update', { requestingUnit: val($event) })" />
        <p v-if="errors.requestingUnit" id="unit-err" class="field-error">{{ errors.requestingUnit }}</p>
      </div>
      <div>
        <label class="field-label" for="rname">Nombre del solicitante *</label>
        <input id="rname" class="field-input" :value="request.requesterName" required autocomplete="name"
          :aria-invalid="!!errors.requesterName" :aria-describedby="errors.requesterName ? 'rname-err' : undefined"
          @input="emit('update', { requesterName: val($event) })" />
        <p v-if="errors.requesterName" id="rname-err" class="field-error">{{ errors.requesterName }}</p>
      </div>
      <div>
        <label class="field-label" for="remail">Correo del solicitante *</label>
        <input id="remail" type="email" class="field-input" :value="request.requesterEmail" required autocomplete="email"
          :aria-invalid="!!errors.requesterEmail" :aria-describedby="errors.requesterEmail ? 'remail-err' : undefined"
          @input="emit('update', { requesterEmail: val($event) })" />
        <p v-if="errors.requesterEmail" id="remail-err" class="field-error">{{ errors.requesterEmail }}</p>
      </div>
      <div>
        <label class="field-label" for="cc">Centro de coste o código presupuestario</label>
        <input id="cc" class="field-input" :value="request.costCenter" aria-describedby="cc-help"
          @input="emit('update', { costCenter: val($event) })" />
        <p id="cc-help" class="field-help">Opcional.</p>
      </div>
      <div>
        <label class="field-label" for="rdate">Fecha requerida</label>
        <input id="rdate" type="date" class="field-input" :min="today" :value="request.requiredDate"
          :aria-invalid="!!errors.requiredDate" :aria-describedby="errors.requiredDate ? 'rdate-err' : undefined"
          @input="emit('update', { requiredDate: val($event) })" />
        <p v-if="errors.requiredDate" id="rdate-err" class="field-error">{{ errors.requiredDate }}</p>
      </div>
      <div class="md:col-span-2">
        <label class="field-label" for="just">Justificación de la necesidad *</label>
        <textarea id="just" rows="3" class="field-input" :value="request.justification" required
          :aria-invalid="!!errors.justification" :aria-describedby="errors.justification ? 'just-err' : undefined"
          @input="emit('update', { justification: val($event) })" />
        <p v-if="errors.justification" id="just-err" class="field-error">{{ errors.justification }}</p>
      </div>
      <div>
        <label class="field-label" for="currency">Moneda</label>
        <select id="currency" class="field-input" disabled aria-describedby="cur-help">
          <option value="CLP">CLP – Peso chileno</option>
        </select>
        <p id="cur-help" class="field-help">En esta fase solo se admite CLP.</p>
      </div>
      <div>
        <label class="field-label" for="notes">Observaciones generales</label>
        <textarea id="notes" rows="2" class="field-input" :value="request.notes"
          @input="emit('update', { notes: val($event) })" />
      </div>
      <fieldset class="md:col-span-2">
        <legend class="field-label">Condiciones de la compra</legend>
        <div class="space-y-2 text-sm">
          <label class="flex items-start gap-2">
            <input type="checkbox" class="mt-1 h-4 w-4" :checked="request.recurring"
              @change="emit('update', { recurring: chk($event) })" />
            <span>Compra recurrente</span>
          </label>
          <label class="flex items-start gap-2">
            <input type="checkbox" class="mt-1 h-4 w-4" :checked="request.urgencyDeclared" aria-describedby="urg-help"
              @change="emit('update', { urgencyDeclared: chk($event) })" />
            <span>Urgencia o situación excepcional
              <span id="urg-help" class="field-help block">Declarar urgencia no basta por sí sola para justificar un trato directo.</span>
            </span>
          </label>
        </div>
      </fieldset>
    </div>
  </section>
</template>
