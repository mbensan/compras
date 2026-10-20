<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <div class="rounded-lg border border-dashed border-slate-400 bg-white p-8 text-center">
    <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-slate-700">{{ description }}</p>
    <div class="mt-4 flex justify-center"><slot /></div>
  </div>
</template>
