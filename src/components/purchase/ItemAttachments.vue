<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatBytes } from '../../utils/format';
import type { AttachmentMetadata } from '../../types/purchase';

const props = withDefaults(defineProps<{ modelValue: AttachmentMetadata[]; maxSizeMb?: number; inputId?: string }>(), {
  maxSizeMb: 10,
  inputId: 'attachments',
});
const emit = defineEmits<{ 'update:modelValue': [value: AttachmentMetadata[]] }>();

const ALLOWED = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'];
const accept = ALLOWED.map((e) => '.' + e).join(',');
const errors = ref<string[]>([]);
const input = ref<HTMLInputElement | null>(null);
const maxBytes = computed(() => props.maxSizeMb * 1024 * 1024);

const ext = (name: string) => (name.includes('.') ? name.split('.').pop()!.toLowerCase() : '');

function onChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  const next = [...props.modelValue];
  const errs: string[] = [];
  for (const f of files) {
    if (!ALLOWED.includes(ext(f.name))) {
      errs.push(`«${f.name}»: tipo no permitido (use ${ALLOWED.join(', ').toUpperCase()}).`);
    } else if (f.size > maxBytes.value) {
      errs.push(`«${f.name}»: supera el máximo de ${props.maxSizeMb} MB (${formatBytes(f.size)}).`);
    } else if (f.size === 0) {
      errs.push(`«${f.name}»: el archivo está vacío.`);
    } else if (next.some((a) => a.name === f.name && a.size === f.size)) {
      errs.push(`«${f.name}»: ya estaba adjunto.`);
    } else {
      next.push({ name: f.name, size: f.size, type: f.type, lastModified: f.lastModified });
    }
  }
  errors.value = errs;
  emit('update:modelValue', next);
  if (input.value) input.value.value = '';
}

function remove(idx: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== idx));
}
</script>

<template>
  <div>
    <label :for="inputId" class="field-label">Documentos adjuntos</label>
    <input
      :id="inputId"
      ref="input"
      type="file"
      multiple
      :accept="accept"
      class="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-slate-400 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold"
      :aria-describedby="`${inputId}-help`"
      @change="onChange"
    />
    <p :id="`${inputId}-help`" class="field-help">
      Tipos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG. Máximo {{ maxSizeMb }} MB por archivo. En este prototipo solo se
      guardan los datos del archivo (nombre, tamaño, tipo y fecha), no su contenido: deberá volver a adjuntarlos
      después de recargar la página.
    </p>
    <ul v-if="errors.length" role="alert" class="mt-2 list-disc pl-5 text-xs font-medium text-red-800">
      <li v-for="e in errors" :key="e">{{ e }}</li>
    </ul>
    <ul v-if="modelValue.length" class="mt-2 divide-y divide-slate-200 rounded-md border border-slate-300 bg-white text-sm">
      <li v-for="(a, i) in modelValue" :key="a.name + a.size" class="flex items-center justify-between gap-2 px-3 py-2">
        <span class="min-w-0 break-words">
          <span class="font-medium">{{ a.name }}</span>
          <span class="ml-2 text-xs text-slate-600">{{ ext(a.name).toUpperCase() }} · {{ formatBytes(a.size) }}</span>
        </span>
        <button type="button" class="btn-danger px-2 py-1 text-xs" :aria-label="`Quitar ${a.name}`" @click="remove(i)">
          Quitar
        </button>
      </li>
    </ul>
    <p v-else class="mt-2 text-xs text-slate-600">Sin documentos adjuntos.</p>
  </div>
</template>
