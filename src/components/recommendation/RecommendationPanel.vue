<script setup lang="ts">
import { MECHANISMS } from '../../domain/procurement/mechanisms';
import type { MechanismRecommendation } from '../../domain/procurement/types';
import MechanismBadge from './MechanismBadge.vue';

defineProps<{ recommendation?: MechanismRecommendation; title?: string; headingId?: string }>();
const confidenceLabel = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' } as const;
</script>

<template>
  <section class="rounded-lg border border-blue-200 bg-blue-50/50 p-4" :aria-labelledby="headingId">
    <h3 :id="headingId" tabindex="-1" class="text-base font-semibold text-slate-900">
      {{ title ?? 'Mecanismo sugerido (recomendación preliminar)' }}
    </h3>
    <p v-if="!recommendation" class="mt-2 text-sm text-slate-700">
      Aún no hay recomendación. Guarde el ítem para ejecutar el motor de reglas.
    </p>
    <div v-else class="mt-3 space-y-3 text-sm">
      <div class="flex flex-wrap items-center gap-2">
        <MechanismBadge :mechanism="recommendation.primaryMechanism" />
        <span v-for="c in recommendation.complementaryModalities" :key="c" class="inline-flex items-center gap-1">
          <span class="text-xs text-slate-700">+ complementaria:</span><MechanismBadge :mechanism="c" />
        </span>
        <span class="text-xs text-slate-700">Confianza: <strong>{{ confidenceLabel[recommendation.confidence] }}</strong></span>
      </div>
      <p class="text-slate-700">{{ MECHANISMS[recommendation.primaryMechanism].shortDescription }}</p>

      <div v-if="recommendation.reasons.length">
        <h4 class="font-semibold">Razones</h4>
        <ul class="list-disc pl-5 text-slate-800"><li v-for="r in recommendation.reasons" :key="r">{{ r }}</li></ul>
      </div>
      <div v-if="recommendation.warnings.length" class="rounded-md border border-amber-600 bg-amber-50 p-3 text-amber-950">
        <h4 class="font-semibold">⚠ Advertencias</h4>
        <ul class="list-disc pl-5"><li v-for="w in recommendation.warnings" :key="w">{{ w }}</li></ul>
      </div>
      <div v-if="recommendation.missingInformation.length" class="rounded-md border border-red-700 bg-red-50 p-3 text-red-900">
        <h4 class="font-semibold">✖ Antecedentes faltantes</h4>
        <ul class="list-disc pl-5"><li v-for="m in recommendation.missingInformation" :key="m">{{ m }}</li></ul>
      </div>
      <div v-if="recommendation.alternatives.length" class="flex flex-wrap items-center gap-2">
        <span class="font-semibold">Alternativas:</span>
        <MechanismBadge v-for="a in recommendation.alternatives" :key="a" :mechanism="a" muted />
      </div>
      <div v-if="recommendation.blockedAlternatives.length">
        <h4 class="font-semibold">Alternativas bloqueadas</h4>
        <ul class="list-disc pl-5 text-slate-800">
          <li v-for="b in recommendation.blockedAlternatives" :key="b.mechanism">
            <MechanismBadge :mechanism="b.mechanism" muted /> 🔒 {{ b.reason }}
          </li>
        </ul>
      </div>
      <p class="text-xs text-slate-600">
        Reglas demostrativas (mock) versión {{ recommendation.rulesetVersion }}. Recomendación referencial: debe ser
        validada por la unidad de adquisiciones y/o asesoría jurídica.
      </p>
    </div>
  </section>
</template>
