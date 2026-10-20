<script setup lang="ts">
import { formatClp, formatDate } from '../../utils/format';
import type { FrameworkAgreementMatch } from '../../types/framework';

defineProps<{ match: FrameworkAgreementMatch; selected: boolean }>();
const emit = defineEmits<{ select: [] }>();
const stock = {
  AVAILABLE: '✔ Disponible',
  LIMITED: '⚠ Stock limitado',
  UNAVAILABLE: '✖ Sin stock',
} as const;
const PLACEHOLDER = '/placeholders/product.svg';
function onImgError(e: Event) {
  const img = e.target as HTMLImageElement;
  if (!img.src.endsWith(PLACEHOLDER)) img.src = PLACEHOLDER;
}
</script>

<template>
  <article :class="['flex flex-col overflow-hidden rounded-lg border bg-white', selected ? 'border-green-700 ring-2 ring-green-700' : 'border-slate-300']">
    <img
      :src="match.product.imageUrl"
      :alt="`Imagen referencial de ${match.product.name}`"
      class="h-36 w-full bg-slate-100 object-contain"
      loading="lazy"
      @error="onImgError"
    />
    <div class="flex flex-1 flex-col gap-1 p-3 text-sm">
      <p class="text-xs font-semibold text-blue-900">Coincidencia: {{ match.score }}%</p>
      <h4 class="break-words font-semibold">{{ match.product.name }}</h4>
      <p class="line-clamp-3 text-slate-700">{{ match.product.description }}</p>
      <dl class="mt-1 space-y-0.5 text-xs text-slate-700">
        <div><dt class="inline font-medium">Convenio: </dt><dd class="inline">{{ match.product.agreementName }}</dd></div>
        <div><dt class="inline font-medium">Proveedor: </dt><dd class="inline">{{ match.product.supplierName }}</dd></div>
        <div v-if="match.product.brand || match.product.model">
          <dt class="inline font-medium">Marca/modelo: </dt>
          <dd class="inline">{{ [match.product.brand, match.product.model].filter(Boolean).join(' ') }}</dd>
        </div>
        <div><dt class="inline font-medium">Vigente hasta: </dt><dd class="inline">{{ formatDate(match.product.validUntil) }}</dd></div>
      </dl>
      <p class="mt-1 text-base font-bold">{{ formatClp(match.product.priceClp) }} <span class="text-xs font-normal text-slate-600">(referencial)</span></p>
      <p class="text-xs font-medium">{{ stock[match.product.stockStatus] }}</p>
      <p class="text-xs italic text-slate-600">Enlace ficticio del MVP</p>
      <div class="mt-auto flex flex-col gap-2 pt-2">
        <a :href="match.product.productUrl" target="_blank" rel="noopener noreferrer" class="btn-secondary text-center">
          Ver en Convenio Marco (ficticio)
        </a>
        <button type="button" :class="selected ? 'btn-secondary' : 'btn-primary'" :aria-pressed="selected" @click="emit('select')">
          {{ selected ? '✔ Coincidencia seleccionada' : 'Seleccionar coincidencia' }}
        </button>
      </div>
    </div>
  </article>
</template>
