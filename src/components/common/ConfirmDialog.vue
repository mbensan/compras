<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string }>(),
  { confirmLabel: 'Confirmar', cancelLabel: 'Cancelar' },
);
const emit = defineEmits<{ confirm: []; cancel: [] }>();

const cancelBtn = ref<HTMLButtonElement | null>(null);
const confirmBtn = ref<HTMLButtonElement | null>(null);
let previous: HTMLElement | null = null;

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previous = document.activeElement as HTMLElement | null;
      await nextTick();
      cancelBtn.value?.focus();
    } else {
      previous?.focus?.();
    }
  },
);

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('cancel');
  } else if (e.key === 'Tab') {
    // Trampa de foco entre los dos botones.
    const first = cancelBtn.value;
    const last = confirmBtn.value;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" @keydown="onKey">
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dlg-title"
      aria-describedby="dlg-msg"
      class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
    >
      <h2 id="dlg-title" class="text-lg font-semibold">{{ title }}</h2>
      <p id="dlg-msg" class="mt-2 text-sm text-slate-700">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button ref="cancelBtn" type="button" class="btn-secondary" @click="emit('cancel')">{{ cancelLabel }}</button>
        <button ref="confirmBtn" type="button" class="btn-danger" @click="emit('confirm')">{{ confirmLabel }}</button>
      </div>
    </div>
  </div>
</template>
