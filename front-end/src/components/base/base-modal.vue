<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ (e: "close"): void }>();
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-800">{{ title }}</h2>
        <button
          class="text-slate-400 hover:text-slate-600"
          type="button"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
