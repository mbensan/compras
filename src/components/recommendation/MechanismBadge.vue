<script setup lang="ts">
import { computed } from 'vue';
import { mechanismLabel } from '../../domain/procurement/mechanisms';
import type { ProcurementMechanism } from '../../domain/procurement/types';

const props = defineProps<{ mechanism: ProcurementMechanism; muted?: boolean }>();
const label = computed(() => mechanismLabel(props.mechanism));
const style = computed(() => {
  if (props.muted) return 'border-slate-400 bg-slate-100 text-slate-800';
  if (props.mechanism === 'REQUIERE_REVISION_MANUAL') return 'border-amber-700 bg-amber-50 text-amber-950';
  return 'border-blue-700 bg-blue-50 text-blue-950';
});
const icon = computed(() => (props.mechanism === 'REQUIERE_REVISION_MANUAL' ? '⚠' : '◆'));
</script>

<template>
  <span :class="['inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', style]">
    <span aria-hidden="true">{{ icon }}</span>{{ label }}
  </span>
</template>
