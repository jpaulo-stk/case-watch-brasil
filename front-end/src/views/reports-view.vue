<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as tasksService from "../services/tasks.service";
import type { Task, TaskStatus } from "../types/api";

const tasks = ref<Task[]>([]);

const labels: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em progresso",
  review: "Revisão",
  done: "Concluído",
};

const byStatus = computed(() => {
  const acc: Record<TaskStatus, number> = {
    pending: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  };
  for (const t of tasks.value) acc[t.status]++;
  return acc;
});

onMounted(async () => {
  tasks.value = await tasksService.getTasks();
});
</script>

<template>
  <div class="p-6">
    <h1 class="mb-2 text-xl font-semibold text-slate-800">Relatórios</h1>
    <p class="mb-4 text-sm text-slate-500">
      Total de tarefas: {{ tasks.length }}
    </p>
    <div class="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
      <div
        v-for="(count, status) in byStatus"
        :key="status"
        class="rounded-lg border border-slate-200 bg-white p-4 text-center"
      >
        <p class="text-3xl font-bold text-indigo-600">{{ count }}</p>
        <p class="mt-1 text-sm text-slate-500">{{ labels[status] }}</p>
      </div>
    </div>
  </div>
</template>
