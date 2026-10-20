<script setup lang="ts">
import { UTM_CONFIG } from '../../services/utmService';
import { formatClp, formatDate } from '../../utils/format';
</script>

<template>
  <header>
    <div class="bg-amber-100 text-amber-950" role="note">
      <p class="mx-auto max-w-6xl px-4 py-2 text-center text-sm font-medium">
        ⚠ Prototipo: recomendaciones referenciales sujetas a validación
      </p>
    </div>
    <div class="bg-brand-900 text-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-blue-100">Gobierno de Chile · Organismo del Estado (neutro)</p>
          <RouterLink to="/" class="text-xl font-bold hover:underline">Asistente de Compras Públicas</RouterLink>
        </div>
        <p class="text-xs text-blue-100">
          UTM de referencia (mock): {{ formatClp(UTM_CONFIG.valueClp) }} al {{ formatDate(UTM_CONFIG.referenceDate) }}
        </p>
      </div>
    </div>
  </header>
</template>
