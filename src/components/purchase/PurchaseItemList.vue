<script setup lang="ts">
import { computed, ref } from 'vue';
import { mechanismLabel } from '../../domain/procurement/mechanisms';
import type { ProcurementMechanism } from '../../domain/procurement/types';
import { formatClp } from '../../utils/format';
import EmptyState from '../common/EmptyState.vue';
import MechanismBadge from '../recommendation/MechanismBadge.vue';
import type { PurchaseItem } from '../../types/purchase';

const props = defineProps<{ items: PurchaseItem[]; editingId?: string }>();
const emit = defineEmits<{ add: []; edit: [id: string]; duplicate: [id: string]; remove: [id: string] }>();

const grouped = ref(false);
const groups = computed(() => {
  const map = new Map<ProcurementMechanism | 'NONE', PurchaseItem[]>();
  props.items.forEach((i) => {
    const key = i.recommendation?.primaryMechanism ?? 'NONE';
    map.set(key, [...(map.get(key) ?? []), i]);
  });
  return [...map.entries()].map(([key, items]) => ({
    key,
    title: key === 'NONE' ? 'Sin recomendación aún' : mechanismLabel(key),
    items,
  }));
});
const sections = computed(() => (grouped.value ? groups.value : [{ key: 'ALL', title: '', items: props.items }]));
</script>

<template>
  <section class="card" aria-labelledby="items-title">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 id="items-title" class="text-lg font-semibold">2. Ítems ({{ items.length }})</h2>
      <div class="flex flex-wrap gap-2">
        <button v-if="items.length > 1" type="button" class="btn-secondary" :aria-pressed="grouped" @click="grouped = !grouped">
          {{ grouped ? 'Ver lista simple' : 'Agrupar por mecanismo sugerido' }}
        </button>
        <button type="button" class="btn-primary" @click="emit('add')">Agregar ítem</button>
      </div>
    </div>

    <EmptyState v-if="!items.length" title="Aún no hay ítems" description="Agregue al menos un ítem para obtener una recomendación.">
      <button type="button" class="btn-primary" @click="emit('add')">Agregar primer ítem</button>
    </EmptyState>

    <template v-else>
      <div class="space-y-4">
        <template v-for="g in sections" :key="g.key">
          <section>
            <h3 v-if="grouped" class="mb-2 text-sm font-semibold text-blue-900">
              {{ g.title }} ({{ g.items.length }} ítem{{ g.items.length === 1 ? '' : 's' }})
            </h3>
            <ul class="space-y-2">
              <li v-for="i in g.items" :key="i.id"
                :class="['rounded-md border p-3 text-sm', i.id === editingId ? 'border-blue-700 bg-blue-50' : 'border-slate-300 bg-white']">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold">Ítem {{ i.lineNumber }}</p>
                    <p class="break-words text-slate-800">{{ i.description || '(sin descripción)' }}</p>
                    <p class="mt-1 text-xs text-slate-700">
                      {{ i.quantity }} {{ i.unit }} · {{ formatClp(i.estimatedTotalClp) }} · {{ i.attachments.length }} adjunto(s)
                    </p>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <MechanismBadge v-if="i.recommendation" :mechanism="i.recommendation.primaryMechanism" />
                    <span v-else class="rounded-full border border-slate-400 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">
                      ◌ Sin guardar
                    </span>
                  </div>
                </div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <button type="button" class="btn-secondary px-3 py-1 text-xs" :aria-label="`Editar ítem ${i.lineNumber}`" @click="emit('edit', i.id)">Editar</button>
                  <button type="button" class="btn-secondary px-3 py-1 text-xs" :aria-label="`Duplicar ítem ${i.lineNumber}`" @click="emit('duplicate', i.id)">Duplicar</button>
                  <button type="button" class="btn-danger px-3 py-1 text-xs" :aria-label="`Eliminar ítem ${i.lineNumber}`" @click="emit('remove', i.id)">Eliminar</button>
                </div>
              </li>
            </ul>
          </section>
        </template>
      </div>
    </template>
  </section>
</template>
