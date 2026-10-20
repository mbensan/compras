<script setup lang="ts">
import type { RequestRecommendation } from '../../domain/procurement/requestRecommendation';
import MechanismBadge from './MechanismBadge.vue';

defineProps<{ recommendation: RequestRecommendation; lineNumbers: Record<string, number> }>();
</script>

<template>
  <section class="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm" aria-labelledby="req-rec-title">
    <h3 id="req-rec-title" class="text-base font-semibold">Recomendación general provisional</h3>
    <p class="mt-2 font-semibold text-blue-950">
      <MechanismBadge v-if="recommendation.mechanism" :mechanism="recommendation.mechanism" />
      <span v-else>{{ recommendation.label }}</span>
    </p>
    <ul v-if="recommendation.reasons.length" class="mt-2 list-disc pl-5 text-slate-800">
      <li v-for="r in recommendation.reasons" :key="r">{{ r }}</li>
    </ul>
    <div v-if="recommendation.mode === 'GROUPED'" class="mt-3 space-y-1">
      <h4 class="font-semibold">Grupos por mecanismo sugerido</h4>
      <ul class="space-y-1">
        <li v-for="g in recommendation.groups" :key="g.mechanism" class="flex flex-wrap items-center gap-2">
          <MechanismBadge :mechanism="g.mechanism" />
          <span>Ítems: {{ g.itemIds.map((id) => lineNumbers[id]).join(', ') }}</span>
        </li>
      </ul>
    </div>
    <div v-if="recommendation.warnings.length" class="mt-3 rounded-md border border-amber-600 bg-amber-50 p-3 text-amber-950">
      <h4 class="font-semibold">⚠ Advertencias</h4>
      <ul class="list-disc pl-5"><li v-for="w in recommendation.warnings" :key="w">{{ w }}</li></ul>
    </div>
  </section>
</template>
