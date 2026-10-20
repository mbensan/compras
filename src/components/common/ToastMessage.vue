<script setup lang="ts">
defineProps<{ message: string; kind: 'success' | 'error' | 'info' }>();
const styles = {
  success: 'border-green-700 bg-green-50 text-green-900',
  error: 'border-red-700 bg-red-50 text-red-900',
  info: 'border-blue-700 bg-blue-50 text-blue-900',
};
const icons = { success: '✔ Correcto:', error: '✖ Error:', info: 'ℹ Información:' };
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4" aria-live="polite" role="status">
    <p v-if="message" :class="['pointer-events-auto max-w-lg rounded-md border px-4 py-3 text-sm shadow-lg', styles[kind]]">
      <strong>{{ icons[kind] }}</strong> {{ message }}
    </p>
  </div>
</template>
