<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    variant?: "primary" | "secondary" | "danger";
  }>(),
  { type: "button", variant: "primary" },
);

const emit = defineEmits<{ (e: "click", event: MouseEvent): void }>();

const variants: Record<string, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="variants[variant ?? 'primary']"
    class="rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
    @click="(e) => emit('click', e)"
  >
    <slot />
  </button>
</template>
