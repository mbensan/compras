<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { EXCEPTIONAL_GROUNDS } from '../../domain/procurement/rules';
import { calcItemTotal } from '../../utils/calc';
import { formatClp, todayIso } from '../../utils/format';
import { validateItem, type Errors } from '../../utils/validation';
import ItemAttachments from './ItemAttachments.vue';
import type { PurchaseItem } from '../../types/purchase';

const props = defineProps<{ item: PurchaseItem; busy?: boolean }>();
const emit = defineEmits<{
  save: [draft: PurchaseItem];
  cancel: [];
  duplicate: [];
  remove: [];
  research: [];
  explain: [];
}>();

const clone = (i: PurchaseItem): PurchaseItem => JSON.parse(JSON.stringify(i));
const draft = reactive<PurchaseItem>(clone(props.item));
const keywordsText = ref(props.item.keywords.join(', '));
const errors = ref<Errors>({});
const today = todayIso();

watch(
  () => props.item.id,
  () => {
    Object.assign(draft, clone(props.item));
    keywordsText.value = props.item.keywords.join(', ');
    errors.value = {};
  },
);

const total = computed(() => calcItemTotal(draft.quantity, draft.estimatedUnitAmountClp));
const num = (v: string): number => (v === '' ? NaN : Number(v));
const idp = computed(() => `item-${props.item.id}`);
const errorList = computed(() => Object.entries(errors.value));

function save() {
  const next: PurchaseItem = {
    ...clone(draft),
    keywords: keywordsText.value.split(',').map((k) => k.trim()).filter(Boolean),
    estimatedTotalClp: total.value,
  };
  errors.value = validateItem(next);
  if (Object.keys(errors.value).length) return;
  emit('save', next);
}

function onKeyword(e: Event) {
  keywordsText.value = (e.target as HTMLInputElement).value;
}
</script>

<template>
  <form class="card space-y-4" :aria-labelledby="`${idp}-title`" novalidate @submit.prevent="save">
    <h3 :id="`${idp}-title`" class="text-lg font-semibold">Ítem {{ item.lineNumber }}</h3>

    <div v-if="errorList.length" role="alert" class="rounded-md border border-red-700 bg-red-50 p-3 text-sm text-red-900">
      <p class="font-semibold">✖ Corrija los siguientes errores para guardar el ítem:</p>
      <ul class="list-disc pl-5">
        <li v-for="[k, m] in errorList" :key="k"><a :href="`#${idp}-${k}`" class="underline">{{ m }}</a></li>
      </ul>
    </div>

    <div>
      <label class="field-label" :for="`${idp}-description`">Descripción detallada del producto o servicio *</label>
      <textarea :id="`${idp}-description`" v-model="draft.description" rows="3" class="field-input"
        :aria-invalid="!!errors.description" :aria-describedby="errors.description ? `${idp}-description-err` : undefined" />
      <p v-if="errors.description" :id="`${idp}-description-err`" class="field-error">{{ errors.description }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label class="field-label" :for="`${idp}-category`">Categoría</label>
        <select :id="`${idp}-category`" v-model="draft.category" class="field-input">
          <option value="PRODUCT">Producto</option>
          <option value="SERVICE">Servicio</option>
          <option value="WORK">Obra</option>
        </select>
      </div>
      <div>
        <label class="field-label" :for="`${idp}-quantity`">Cantidad *</label>
        <input :id="`${idp}-quantity`" type="number" min="0" step="any" class="field-input"
          :value="Number.isNaN(draft.quantity) ? '' : draft.quantity"
          :aria-invalid="!!errors.quantity" :aria-describedby="errors.quantity ? `${idp}-quantity-err` : undefined"
          @input="draft.quantity = num(($event.target as HTMLInputElement).value)" />
        <p v-if="errors.quantity" :id="`${idp}-quantity-err`" class="field-error">{{ errors.quantity }}</p>
      </div>
      <div>
        <label class="field-label" :for="`${idp}-unit`">Unidad de medida *</label>
        <input :id="`${idp}-unit`" v-model="draft.unit" class="field-input"
          :aria-invalid="!!errors.unit" :aria-describedby="errors.unit ? `${idp}-unit-err` : undefined" />
        <p v-if="errors.unit" :id="`${idp}-unit-err`" class="field-error">{{ errors.unit }}</p>
      </div>
      <div>
        <label class="field-label" :for="`${idp}-estimatedUnitAmountClp`">Monto unitario aprox. (CLP) *</label>
        <input :id="`${idp}-estimatedUnitAmountClp`" type="number" min="0" step="any" class="field-input"
          :value="Number.isNaN(draft.estimatedUnitAmountClp) ? '' : draft.estimatedUnitAmountClp"
          :aria-invalid="!!errors.estimatedUnitAmountClp"
          :aria-describedby="errors.estimatedUnitAmountClp ? `${idp}-estimatedUnitAmountClp-err` : undefined"
          @input="draft.estimatedUnitAmountClp = num(($event.target as HTMLInputElement).value)" />
        <p v-if="errors.estimatedUnitAmountClp" :id="`${idp}-estimatedUnitAmountClp-err`" class="field-error">
          {{ errors.estimatedUnitAmountClp }}
        </p>
      </div>
    </div>

    <p class="text-sm" aria-live="polite">
      Monto total calculado: <strong class="break-all text-base">{{ formatClp(total) }}</strong>
    </p>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label class="field-label" :for="`${idp}-termValue`">Plazo requerido *</label>
        <input :id="`${idp}-termValue`" type="number" min="0" step="any" class="field-input"
          :value="Number.isNaN(draft.termValue) ? '' : draft.termValue"
          :aria-invalid="!!errors.termValue" :aria-describedby="errors.termValue ? `${idp}-termValue-err` : undefined"
          @input="draft.termValue = num(($event.target as HTMLInputElement).value)" />
        <p v-if="errors.termValue" :id="`${idp}-termValue-err`" class="field-error">{{ errors.termValue }}</p>
      </div>
      <div>
        <label class="field-label" :for="`${idp}-termUnit`">Unidad de plazo</label>
        <select :id="`${idp}-termUnit`" v-model="draft.termUnit" class="field-input">
          <option value="BUSINESS_DAYS">Días hábiles</option>
          <option value="CALENDAR_DAYS">Días corridos</option>
          <option value="WEEKS">Semanas</option>
          <option value="MONTHS">Meses</option>
        </select>
      </div>
      <div>
        <label class="field-label" :for="`${idp}-requiredDate`">Fecha límite (opcional)</label>
        <input :id="`${idp}-requiredDate`" v-model="draft.requiredDate" type="date" :min="today" class="field-input"
          :aria-invalid="!!errors.requiredDate" :aria-describedby="errors.requiredDate ? `${idp}-requiredDate-err` : undefined" />
        <p v-if="errors.requiredDate" :id="`${idp}-requiredDate-err`" class="field-error">{{ errors.requiredDate }}</p>
      </div>
      <div>
        <label class="field-label" :for="`${idp}-loc`">Comuna o región de entrega</label>
        <input :id="`${idp}-loc`" v-model="draft.deliveryLocation" class="field-input" />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="field-label" :for="`${idp}-kw`">Palabras clave</label>
        <input :id="`${idp}-kw`" :value="keywordsText" class="field-input" :aria-describedby="`${idp}-kw-help`" @input="onKeyword" />
        <p :id="`${idp}-kw-help`" class="field-help">Separadas por coma. Mejoran la búsqueda en Convenio Marco.</p>
      </div>
      <div>
        <label class="field-label" :for="`${idp}-tech`">Requisitos técnicos u observaciones</label>
        <textarea :id="`${idp}-tech`" v-model="draft.technicalRequirements" rows="2" class="field-input" />
      </div>
    </div>

    <fieldset>
      <legend class="field-label">Antecedentes para el motor de reglas</legend>
      <div class="grid gap-2 text-sm md:grid-cols-2">
        <label class="flex items-start gap-2"><input v-model="draft.acceptsEquivalent" type="checkbox" class="mt-1 h-4 w-4" /> Admite alternativas o equivalentes</label>
        <label class="flex items-start gap-2"><input v-model="draft.circularEconomyCandidate" type="checkbox" class="mt-1 h-4 w-4" /> Podría satisfacerse por reutilización, reasignación o economía circular</label>
        <label class="flex items-start gap-2"><input v-model="draft.hasStandardBiddingTerms" type="checkbox" class="mt-1 h-4 w-4" /> Existen Bases Tipo aplicables</label>
        <label class="flex items-start gap-2"><input v-model="draft.frameworkMandatory" type="checkbox" class="mt-1 h-4 w-4" /> Convenio Marco es obligatorio para este bien/servicio</label>
      </div>
      <div class="mt-3 max-w-md">
        <label class="field-label" :for="`${idp}-ground`">Causal excepcional (solo si existe y está justificada)</label>
        <select :id="`${idp}-ground`" v-model="draft.exceptionalGround" class="field-input" :aria-describedby="`${idp}-ground-help`">
          <option :value="undefined">Ninguna</option>
          <option v-for="g in EXCEPTIONAL_GROUNDS" :key="g.id" :value="g.id">{{ g.label }}</option>
        </select>
        <p :id="`${idp}-ground-help`" class="field-help">Opciones genéricas de prueba; no son causales legales.</p>
      </div>
    </fieldset>

    <ItemAttachments v-model="draft.attachments" :input-id="`${idp}-files`" />

    <div class="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
      <button type="submit" class="btn-primary" :disabled="busy">Guardar ítem</button>
      <button type="button" class="btn-secondary" :disabled="busy" @click="emit('cancel')">Cerrar editor</button>
      <button type="button" class="btn-secondary" :disabled="busy" @click="emit('duplicate')">Duplicar</button>
      <button type="button" class="btn-secondary" :disabled="busy || !item.saved" @click="emit('research')">Buscar nuevamente en Convenio Marco</button>
      <button type="button" class="btn-secondary" :disabled="!item.recommendation" @click="emit('explain')">Ver explicación del mecanismo sugerido</button>
      <button type="button" class="btn-danger ml-auto" :disabled="busy" @click="emit('remove')">Eliminar</button>
    </div>
  </form>
</template>
