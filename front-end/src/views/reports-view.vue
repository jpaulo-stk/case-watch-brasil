<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as tasksService from "../services/tasks.service";
import { formatDate } from "../utils/format";
import type { Task, TaskStatus } from "../types/api";
import BaseButton from "../components/base/base-button.vue";

const tasks = ref<Task[]>([]);

const labels: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em progresso",
  review: "Revisão",
  done: "Concluído",
};
const statusOrder: TaskStatus[] = ["pending", "in_progress", "review", "done"];

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

function csvCell(value: string): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv() {
  const headers = [
    "Status",
    "Tarefa",
    "Descrição",
    "Categoria",
    "Prazo",
    "Criada em",
  ];
  const sorted = [...tasks.value].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
  );
  const rows = sorted.map((t) => [
    labels[t.status],
    t.name,
    t.description ?? "",
    t.category?.name ?? "",
    t.deadline ? formatDate(t.deadline) : "",
    formatDate(t.createdAt),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map(csvCell).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio-tarefas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(async () => {
  tasks.value = await tasksService.getTasks();
});
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Relatórios</h1>
        <p class="text-sm text-slate-500">
          Total de tarefas: {{ tasks.length }}
        </p>
      </div>
      <BaseButton :disabled="!tasks.length" @click="exportCsv">
        Exportar CSV
      </BaseButton>
    </div>

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
