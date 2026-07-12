<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as tasksService from "../services/tasks.service";
import * as categoriesService from "../services/categories.service";
import type { Task, TaskStatus, Category } from "../types/api";
import KanbanColumn from "../components/kanban/kanban-column.vue";
import TaskFormModal from "../components/kanban/task-form-modal.vue";
import TaskDetailModal from "../components/kanban/task-detail-modal.vue";
import BaseButton from "../components/base/base-button.vue";

const columns: { title: string; status: TaskStatus }[] = [
  { title: "Pendente", status: "pending" },
  { title: "Em progresso", status: "in_progress" },
  { title: "Revisão", status: "review" },
  { title: "Concluído", status: "done" },
];

const grouped = ref<Record<TaskStatus, Task[]>>({
  pending: [],
  in_progress: [],
  review: [],
  done: [],
});
const categories = ref<Category[]>([]);
const formOpen = ref(false);
const editingTask = ref<Task | null>(null);
const selected = ref<Task | null>(null);

async function load() {
  const tasks = await tasksService.getTasks();
  const g: Record<TaskStatus, Task[]> = {
    pending: [],
    in_progress: [],
    review: [],
    done: [],
  };
  for (const t of tasks) g[t.status].push(t);
  grouped.value = g;
}

// otimista: o card já mudou de coluna; confirma no back e reverte se falhar
async function onMove(payload: { taskId: number; status: TaskStatus }) {
  try {
    await tasksService.updateStatus(payload.taskId, payload.status);
  } catch {
    await load();
  }
}

function openCreate() {
  editingTask.value = null;
  formOpen.value = true;
}

function openEdit(task: Task) {
  editingTask.value = task;
  selected.value = null; // fecha o detalhe e abre o form em modo edição
  formOpen.value = true;
}

async function onSubmitForm(data: {
  name: string;
  description: string;
  categoryId: number;
  deadline: string | null;
}) {
  if (editingTask.value) {
    await tasksService.updateTask(editingTask.value.id, data);
  } else {
    await tasksService.createTask(data);
  }
  formOpen.value = false;
  editingTask.value = null;
  await load();
}

async function onDeleted() {
  selected.value = null;
  await load();
}

onMounted(async () => {
  await load();
  categories.value = await categoriesService.getCategories();
});
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-slate-800">Meu board</h1>
      <BaseButton @click="openCreate">Nova tarefa</BaseButton>
    </div>

    <div class="flex gap-4 overflow-x-auto pb-4">
      <KanbanColumn
        v-for="col in columns"
        :key="col.status"
        :title="col.title"
        :status="col.status"
        :tasks="grouped[col.status]"
        @move="onMove"
        @select="selected = $event"
      />
    </div>

    <TaskFormModal
      :open="formOpen"
      :categories="categories"
      :task="editingTask"
      @close="formOpen = false"
      @submit="onSubmitForm"
    />
    <TaskDetailModal
      :task="selected"
      @close="selected = null"
      @deleted="onDeleted"
      @edit="openEdit"
    />
  </div>
</template>
