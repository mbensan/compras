<script setup lang="ts">
import FrameworkProductCard from './FrameworkProductCard.vue';
import type { FrameworkAgreementMatch } from '../../types/framework';

defineProps<{
  status: 'idle' | 'loading' | 'error' | 'done';
  matches: FrameworkAgreementMatch[];
  errorMessage?: string;
  selectedId?: string;
  noneApplies?: boolean;
}>();
const emit = defineEmits<{ select: [productId: string]; none: []; retry: [] }>();
</script>

<template>
  <section aria-labelledby="fm-title" class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 id="fm-title" class="text-base font-semibold">Coincidencias en Convenio Marco (catálogo ficticio)</h3>
      <button type="button" class="btn-secondary" :disabled="status === 'loading'" @click="emit('retry')">
        Buscar nuevamente en Convenio Marco
      </button>
    </div>
    <div aria-live="polite">
      <p v-if="status === 'idle'" class="text-sm text-slate-700">Guarde el ítem para consultar el catálogo.</p>
      <p v-else-if="status === 'loading'" class="text-sm font-medium text-blue-900">⏳ Buscando en Convenio Marco…</p>
      <div v-else-if="status === 'error'" role="alert" class="rounded-md border border-red-700 bg-red-50 p-3 text-sm text-red-900">
        ✖ {{ errorMessage ?? 'Error al consultar el catálogo.' }}
      </div>
      <p v-else-if="!matches.length" class="rounded-md border border-slate-300 bg-slate-100 p-3 text-sm">
        ℹ No se encontraron coincidencias en Convenio Marco para este ítem.
      </p>
    </div>
    <template v-if="status === 'done' && matches.length">
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="m in matches" :key="m.product.id">
          <FrameworkProductCard
            :match="m"
            :selected="selectedId === m.product.id"
            class="h-full"
            @select="emit('select', m.product.id)"
          />
        </li>
      </ul>
      <button type="button" class="btn-secondary" :aria-pressed="!!noneApplies" @click="emit('none')">
        {{ noneApplies ? '✔ Marcado: ninguna coincidencia corresponde' : 'Ninguna coincidencia corresponde' }}
      </button>
    </template>
  </section>
</template>
