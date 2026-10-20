<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '../components/common/EmptyState.vue';
import PurchaseSummary from '../components/purchase/PurchaseSummary.vue';
import { recommendRequest } from '../domain/procurement/requestRecommendation';
import { clpToUtm } from '../services/utmService';
import { usePurchaseStore } from '../stores/purchaseStore';
import { showToast } from '../utils/useToast';

const props = defineProps<{ id: string }>();
const store = usePurchaseStore();
const router = useRouter();
const request = computed(() => store.getById(props.id));
const accepted = ref(false);
const showCheckError = ref(false);

const recommendation = computed(() =>
  recommendRequest(
    (request.value?.items ?? []).map((i) => ({
      itemId: i.id,
      lineNumber: i.lineNumber,
      description: i.description,
      category: i.category,
      keywords: i.keywords,
      totalUtm: clpToUtm(i.estimatedTotalClp),
      recommendation: i.recommendation,
    })),
  ),
);

function markReady() {
  if (!accepted.value) {
    showCheckError.value = true;
    return;
  }
  if (store.markReady(props.id)) {
    showToast('La solicitud quedó marcada como lista para revisión.');
    router.push({ name: 'home' });
  } else {
    showToast('No se pudo guardar el estado de la solicitud.', 'error');
  }
}
</script>

<template>
  <EmptyState v-if="!request" title="Solicitud no encontrada" description="El borrador no existe.">
    <button type="button" class="btn-primary" @click="router.push({ name: 'home' })">Volver al inicio</button>
  </EmptyState>
  <div v-else class="space-y-6">
    <h1 class="text-2xl font-bold">Revisión final</h1>
    <p v-if="request.status === 'READY_FOR_REVIEW'" class="rounded-md border border-green-700 bg-green-50 p-3 text-sm text-green-900">
      ✔ Esta solicitud ya está marcada como lista para revisión.
    </p>

    <PurchaseSummary :request="request" :recommendation="recommendation" />

    <section class="card" aria-labelledby="confirm-title">
      <h2 id="confirm-title" class="mb-3 text-lg font-semibold">Confirmación</h2>
      <label class="flex items-start gap-2 text-sm">
        <input v-model="accepted" type="checkbox" class="mt-1 h-4 w-4" required aria-describedby="accept-err" />
        <span>Comprendo que la recomendación es referencial y debe ser validada por la unidad de adquisiciones y/o asesoría jurídica</span>
      </label>
      <p v-if="showCheckError && !accepted" id="accept-err" role="alert" class="field-error">
        Debe aceptar esta advertencia para continuar.
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="btn-secondary" @click="router.push({ name: 'purchase-edit', params: { id } })">Volver a editar</button>
        <button type="button" class="btn-primary" @click="markReady">Marcar como lista para revisión</button>
      </div>
    </section>
  </div>
</template>
