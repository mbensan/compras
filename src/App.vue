<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue';
import ToastMessage from './components/common/ToastMessage.vue';
import { toast } from './utils/useToast';
import { usePurchaseStore } from './stores/purchaseStore';

const store = usePurchaseStore();
</script>

<template>
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-2">
    Saltar al contenido
  </a>
  <AppHeader />
  <main id="main" class="mx-auto max-w-6xl px-4 py-6">
    <div
      v-if="store.storageError"
      role="alert"
      class="mb-4 rounded-md border border-red-700 bg-red-50 p-3 text-sm text-red-900"
    >
      <strong>Error de almacenamiento:</strong> {{ store.storageError }}
    </div>
    <RouterView />
  </main>
  <ToastMessage :message="toast.message" :kind="toast.kind" />
</template>
