<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import EmptyState from '../components/common/EmptyState.vue';
import { usePurchaseStore } from '../stores/purchaseStore';
import { formatClp, formatDateTime } from '../utils/format';
import { showToast } from '../utils/useToast';

const store = usePurchaseStore();
const router = useRouter();
// Descarta cualquier solicitud nueva que no se haya guardado.
onMounted(() => store.load());

const drafts = computed(() => [...store.purchases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
const toDelete = ref<string | null>(null);
const statusLabel = { DRAFT: '✎ Borrador', READY_FOR_REVIEW: '✔ Lista para revisión' } as const;

function confirmDelete() {
  if (toDelete.value) {
    store.removeRequest(toDelete.value);
    showToast('Borrador eliminado.');
  }
  toDelete.value = null;
}
</script>

<template>
  <div class="space-y-6">
    <section class="card">
      <h1 class="text-2xl font-bold">Asistente de Compras Públicas</h1>
      <p class="mt-2 max-w-3xl text-sm text-slate-700">
        Registre una solicitud de compra, agregue ítems con sus documentos y obtenga una <strong>recomendación
        preliminar y explicable</strong> del mecanismo de compra. El asistente no adjudica ni reemplaza la revisión
        jurídica.
      </p>
      <button type="button" class="btn-primary mt-4" @click="router.push({ name: 'purchase-new' })">Nueva compra</button>
    </section>

    <section aria-labelledby="drafts-title">
      <h2 id="drafts-title" class="mb-3 text-lg font-semibold">Borradores guardados en este navegador</h2>
      <EmptyState v-if="!drafts.length" title="No hay borradores guardados" description="Cree una nueva compra para comenzar." />
      <ul v-else class="grid gap-4 md:grid-cols-2">
        <li v-for="d in drafts" :key="d.id" class="card">
          <h3 class="break-words text-base font-semibold">{{ d.title || '(Sin título)' }}</h3>
          <p class="mt-1 text-xs font-semibold text-blue-900">{{ statusLabel[d.status] }}</p>
          <dl class="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div><dt class="text-xs text-slate-600">Modificado</dt><dd>{{ formatDateTime(d.updatedAt) }}</dd></div>
            <div><dt class="text-xs text-slate-600">Monto total</dt><dd class="break-all">{{ formatClp(store.totalOf(d.id)) }}</dd></div>
            <div><dt class="text-xs text-slate-600">Ítems</dt><dd>{{ d.items.length }}</dd></div>
          </dl>
          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" class="btn-primary" :aria-label="`Continuar ${d.title || 'borrador'}`" @click="router.push({ name: 'purchase-edit', params: { id: d.id } })">Continuar</button>
            <button type="button" class="btn-danger" :aria-label="`Eliminar ${d.title || 'borrador'}`" @click="toDelete = d.id">Eliminar</button>
          </div>
        </li>
      </ul>
    </section>

    <ConfirmDialog
      :open="!!toDelete"
      title="Eliminar borrador"
      message="Se eliminará el borrador de este navegador. Esta acción no se puede deshacer."
      confirm-label="Eliminar borrador"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>
