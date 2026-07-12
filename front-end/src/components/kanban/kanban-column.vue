<script setup lang="ts">
import draggable from "vuedraggable";
import TaskCard from "./task-card.vue";
import type { Task, TaskStatus } from "../../types/api";

const props = defineProps<{
  title: string;
  status: TaskStatus;
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: "move", payload: { taskId: number; status: TaskStatus }): void;
  (e: "select", task: Task): void;
}>();

function onChange(evt: any) {
  if (evt.added) {
    emit("move", { taskId: evt.added.element.id, status: props.status });
  }
}
</script>

<template>
  <div class="flex w-72 flex-none flex-col rounded-lg bg-slate-100 p-3">
    <h3 class="mb-3 text-sm font-semibold text-slate-600">
      {{ title }} ({{ tasks.length }})
    </h3>
    <draggable
      :list="tasks"
      group="tasks"
      item-key="id"
      class="flex min-h-4 flex-col gap-2"
      @change="onChange"
    >
      <template #item="{ element }">
        <TaskCard :task="element" @select="emit('select', $event)" />
      </template>
    </draggable>
  </div>
</template>
