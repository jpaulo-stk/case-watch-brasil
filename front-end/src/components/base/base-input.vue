<script setup lang="ts">
// v-model = prop `modelValue` + emit `update:modelValue` (o "value + onChange" do React)
defineProps<{
  modelValue: string;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
}>();

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-slate-700">
      {{ label }}
    </span>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full rounded-md border px-3 py-2 text-slate-800 outline-none focus:ring-2"
      :class="
        error
          ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
      "
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-1 block text-xs text-red-600">{{ error }}</span>
  </label>
</template>
