<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import EmptyState from '../components/common/EmptyState.vue';
import FrameworkMatchList from '../components/framework/FrameworkMatchList.vue';
import PurchaseGeneralForm from '../components/purchase/PurchaseGeneralForm.vue';
import PurchaseItemEditor from '../components/purchase/PurchaseItemEditor.vue';
import PurchaseItemList from '../components/purchase/PurchaseItemList.vue';
import RecommendationPanel from '../components/recommendation/RecommendationPanel.vue';
import RequestRecommendationPanel from '../components/recommendation/RequestRecommendationPanel.vue';
import { recommendRequest } from '../domain/procurement/requestRecommendation';
import { searchFrameworkAgreements } from '../services/frameworkAgreementService';
import { clpToUtm } from '../services/utmService';
import { usePurchaseStore } from '../stores/purchaseStore';
import { formatClp } from '../utils/format';
import { showToast } from '../utils/useToast';
import { validateForReview, validateGeneral } from '../utils/validation';
import type { PurchaseItem, PurchaseRequest } from '../types/purchase';

const props = defineProps<{ id: string }>();
const store = usePurchaseStore();
const router = useRouter();

const request = computed(() => store.getById(props.id));
const total = computed(() => store.totalOf(props.id));
const editingId = ref<string>();
const editingItem = computed(() => request.value?.items.find((i) => i.id === editingId.value));
const showErrors = ref(false);
const reviewErrors = ref<string[]>([]);
const generalErrors = computed(() => (showErrors.value && request.value ? validateGeneral(request.value) : {}));
const toDelete = ref<string>();
const confirmCancel = ref(false);

interface SearchState { status: 'idle' | 'loading' | 'error' | 'done'; message?: string }
const searches = reactive<Record<string, SearchState>>({});
const searchOf = (id?: string): SearchState => (id && searches[id]) || { status: 'idle' };

const summaries = computed(() =>
  (request.value?.items ?? []).map((i) => ({
    itemId: i.id,
    lineNumber: i.lineNumber,
    description: i.description,
    category: i.category,
    keywords: i.keywords,
    totalUtm: clpToUtm(i.estimatedTotalClp),
    recommendation: i.recommendation,
  })),
);
const requestRec = computed(() => recommendRequest(summaries.value));
const lineNumbers = computed(() => Object.fromEntries((request.value?.items ?? []).map((i) => [i.id, i.lineNumber])));

const progress = computed(() => {
  const r = request.value;
  if (!r) return { pct: 0, steps: [] as { label: string; done: boolean }[] };
  const steps = [
    { label: 'Datos generales completos', done: Object.keys(validateGeneral(r)).length === 0 },
    { label: 'Al menos un ítem', done: r.items.length > 0 },
    { label: 'Todos los ítems guardados', done: r.items.length > 0 && r.items.every((i) => i.saved) },
  ];
  return { pct: Math.round((steps.filter((s) => s.done).length / steps.length) * 100), steps };
});

async function focusEditor() {
  await nextTick();
  document.getElementById('item-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addItem() {
  const it = store.addItem(props.id);
  editingId.value = it.id;
  focusEditor();
}
function editItem(id: string) {
  editingId.value = id;
  focusEditor();
}
function duplicateItem(id: string) {
  const copy = store.duplicateItem(props.id, id);
  if (copy) {
    editingId.value = copy.id;
    showToast('Ítem duplicado. Revíselo y guárdelo para consultar el catálogo.');
    focusEditor();
  }
}
function confirmRemove() {
  if (toDelete.value) {
    if (editingId.value === toDelete.value) editingId.value = undefined;
    store.removeItem(props.id, toDelete.value);
    store.saveDraft(props.id);
    showToast('Ítem eliminado.');
  }
  toDelete.value = undefined;
}

async function runSearch(itemId: string) {
  const item = request.value?.items.find((i) => i.id === itemId);
  if (!item) return;
  searches[itemId] = { status: 'loading' };
  try {
    const matches = await searchFrameworkAgreements({ description: item.description, keywords: item.keywords });
    store.setMatches(props.id, itemId, matches);
    searches[itemId] = { status: 'done' };
  } catch (e) {
    console.error('Error en la búsqueda de Convenio Marco', e);
    store.setMatches(props.id, itemId, []);
    searches[itemId] = {
      status: 'error',
      message: e instanceof Error ? e.message : 'No fue posible consultar Convenio Marco. Intente nuevamente.',
    };
  }
  store.recompute(props.id, itemId);
  store.saveDraft(props.id);
}

async function saveItem(draft: PurchaseItem) {
  // El borrador local no conoce las coincidencias/recomendación vigentes: no se sobrescriben.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { frameworkMatches, recommendation, selectedFrameworkProductId, frameworkNoneApplies, ...editable } = draft;
  store.updateItem(props.id, draft.id, { ...editable, saved: true });
  store.recompute(props.id, draft.id);
  showToast(`Ítem ${draft.lineNumber} guardado. Consultando Convenio Marco…`, 'info');
  await runSearch(draft.id);
  if (searchOf(draft.id).status === 'done') showToast(`Ítem ${draft.lineNumber} guardado y recomendación actualizada.`);
}

function selectMatch(productId: string) {
  if (!editingId.value) return;
  const already = editingItem.value?.selectedFrameworkProductId === productId;
  store.selectMatch(props.id, editingId.value, already ? undefined : productId);
  store.saveDraft(props.id);
}
function noneMatches() {
  if (!editingId.value) return;
  store.selectMatch(props.id, editingId.value, undefined, !editingItem.value?.frameworkNoneApplies);
  store.saveDraft(props.id);
}

async function explain() {
  await nextTick();
  const el = document.getElementById('item-rec-title');
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el?.focus();
}

function updateGeneral(patch: Partial<PurchaseRequest>) {
  store.updateGeneral(props.id, patch);
}

function saveDraft() {
  if (store.saveDraft(props.id)) showToast('Borrador guardado en este navegador.');
  else showToast('No se pudo guardar el borrador.', 'error');
}

function review() {
  showErrors.value = true;
  const r = request.value;
  if (!r) return;
  reviewErrors.value = validateForReview(r);
  if (reviewErrors.value.length) {
    showToast('Hay errores que corregir antes de revisar la compra.', 'error');
    nextTick(() => document.getElementById('error-summary')?.focus());
    return;
  }
  if (store.saveDraft(props.id)) router.push({ name: 'purchase-review', params: { id: props.id } });
}

function cancel() {
  confirmCancel.value = false;
  store.load(); // revierte a lo último guardado
  router.push({ name: 'home' });
}
</script>

<template>
  <EmptyState v-if="!request" title="Solicitud no encontrada" description="El borrador no existe o no fue guardado.">
    <button type="button" class="btn-primary" @click="router.push({ name: 'home' })">Volver al inicio</button>
  </EmptyState>

  <div v-else class="space-y-6">
    <h1 class="text-2xl font-bold">{{ request.title || 'Nueva compra' }}</h1>

    <section class="card" aria-labelledby="status-title">
      <h2 id="status-title" class="sr-only">Estado de la solicitud</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <p class="text-xs text-slate-600">Monto total estimado</p>
          <p class="break-all text-xl font-bold">{{ formatClp(total) }}</p>
          <p class="text-sm">{{ request.items.length }} ítem(s)</p>
        </div>
        <div>
          <p class="text-xs text-slate-600">Progreso: {{ progress.pct }}%</p>
          <div class="mt-1 h-2 w-full rounded bg-slate-200" role="progressbar" :aria-valuenow="progress.pct" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso de la solicitud">
            <div class="h-2 rounded bg-brand-700" :style="{ width: progress.pct + '%' }"></div>
          </div>
          <ul class="mt-2 space-y-0.5 text-xs">
            <li v-for="s in progress.steps" :key="s.label">{{ s.done ? '✔' : '○' }} {{ s.label }}</li>
          </ul>
        </div>
        <div class="text-sm">
          <p class="text-xs text-slate-600">Recomendación general provisional</p>
          <p class="font-semibold">{{ requestRec.label }}</p>
        </div>
      </div>
    </section>

    <div v-if="reviewErrors.length" id="error-summary" tabindex="-1" role="alert" class="rounded-md border border-red-700 bg-red-50 p-4 text-sm text-red-900">
      <p class="font-semibold">✖ Corrija lo siguiente antes de revisar la compra:</p>
      <ul class="list-disc pl-5"><li v-for="m in reviewErrors" :key="m">{{ m }}</li></ul>
    </div>

    <PurchaseGeneralForm :request="request" :errors="generalErrors" @update="updateGeneral" />

    <PurchaseItemList
      :items="request.items"
      :editing-id="editingId"
      @add="addItem"
      @edit="editItem"
      @duplicate="duplicateItem"
      @remove="toDelete = $event"
    />

    <div v-if="editingItem" id="item-editor" class="space-y-4">
      <PurchaseItemEditor
        :item="editingItem"
        :busy="searchOf(editingItem.id).status === 'loading'"
        @save="saveItem"
        @cancel="editingId = undefined"
        @duplicate="duplicateItem(editingItem.id)"
        @remove="toDelete = editingItem.id"
        @research="runSearch(editingItem.id)"
        @explain="explain"
      />
      <div class="card space-y-4">
        <FrameworkMatchList
          :status="searchOf(editingItem.id).status === 'idle' && editingItem.frameworkMatches.length ? 'done' : searchOf(editingItem.id).status"
          :matches="editingItem.frameworkMatches"
          :error-message="searchOf(editingItem.id).message"
          :selected-id="editingItem.selectedFrameworkProductId"
          :none-applies="editingItem.frameworkNoneApplies"
          @select="selectMatch"
          @none="noneMatches"
          @retry="runSearch(editingItem.id)"
        />
        <RecommendationPanel :recommendation="editingItem.recommendation" heading-id="item-rec-title" />
      </div>
    </div>

    <RequestRecommendationPanel :recommendation="requestRec" :line-numbers="lineNumbers" />

    <div class="flex flex-wrap gap-2 border-t border-slate-300 pt-4">
      <button type="button" class="btn-secondary" @click="saveDraft">Guardar borrador</button>
      <button type="button" class="btn-primary" @click="review">Revisar compra</button>
      <button type="button" class="btn-danger" @click="confirmCancel = true">Cancelar</button>
    </div>

    <ConfirmDialog
      :open="!!toDelete"
      title="Eliminar ítem"
      message="Se eliminará el ítem y sus datos adjuntos. Esta acción no se puede deshacer."
      confirm-label="Eliminar ítem"
      @confirm="confirmRemove"
      @cancel="toDelete = undefined"
    />
    <ConfirmDialog
      :open="confirmCancel"
      title="Cancelar edición"
      message="Se descartarán los cambios no guardados en el borrador."
      confirm-label="Descartar cambios"
      cancel-label="Seguir editando"
      @confirm="cancel"
      @cancel="confirmCancel = false"
    />
  </div>
</template>
