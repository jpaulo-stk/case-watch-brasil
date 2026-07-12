<script setup lang="ts">
import { formatDate } from "../../utils/format";
import type { Task } from "../../types/api";

defineProps<{ task: Task }>();
const emit = defineEmits<{ (e: "select", task: Task): void }>();
</script>

<template>
  <div
    class="cursor-grab rounded-md border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow"
    @click="emit('select', task)"
  >
    <p class="font-medium text-slate-800">{{ task.name }}</p>
    <p v-if="task.description" class="mt-1 text-sm text-slate-500">
      {{ task.description }}
    </p>
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <span
        v-if="task.category?.name"
        class="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
      >
        {{ task.category.name }}
      </span>
      <span
        v-if="task.deadline"
        class="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
      >
        📅 {{ formatDate(task.deadline) }}
      </span>
    </div>
  </div>
</template>
