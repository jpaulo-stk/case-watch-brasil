<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "../base/base-modal.vue";
import BaseInput from "../base/base-input.vue";
import BaseButton from "../base/base-button.vue";
import { validate } from "../../utils/validate";
import { taskFormSchema } from "../../schemas/forms";
import { toDateInput } from "../../utils/format";
import type { Category, Task } from "../../types/api";

const props = defineProps<{
  open: boolean;
  categories: Category[];
  task?: Task | null;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "submit",
    data: {
      name: string;
      description: string;
      categoryId: number;
      deadline: string | null;
    },
  ): void;
}>();

const isEdit = computed(() => !!props.task);
const name = ref("");
const description = ref("");
const deadline = ref("");
const categoryId = ref<number | null>(null);
const errors = ref<Record<string, string>>({});

// ao abrir: se tem task -> edição (pré-preenche); senão -> criação (limpa)
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    errors.value = {};
    if (props.task) {
      name.value = props.task.name;
      description.value = props.task.description ?? "";
      deadline.value = toDateInput(props.task.deadline);
      categoryId.value =
        props.task.category?.id ?? props.categories[0]?.id ?? null;
    } else {
      name.value = "";
      description.value = "";
      deadline.value = "";
      categoryId.value = props.categories[0]?.id ?? null;
    }
  },
);

function submit() {
  const res = validate(taskFormSchema, {
    name: name.value,
    description: description.value,
    deadline: deadline.value,
    categoryId: categoryId.value,
  });
  if (!res.ok) {
    errors.value = res.errors;
    return;
  }
  errors.value = {};
  emit("submit", {
    name: res.data.name,
    description: res.data.description ?? "",
    categoryId: res.data.categoryId,
    deadline: res.data.deadline || null,
  });
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Editar tarefa' : 'Nova tarefa'"
    @close="emit('close')"
  >
    <div class="space-y-3">
      <BaseInput v-model="name" label="Nome" :error="errors.name" />
      <BaseInput v-model="description" label="Descrição" />
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">
          Prazo (opcional)
        </span>
        <input
          v-model="deadline"
          type="date"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Categoria</span>
        <select
          v-model="categoryId"
          class="w-full rounded-md border px-3 py-2 text-slate-800"
          :class="errors.categoryId ? 'border-red-400' : 'border-slate-300'"
        >
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <span v-if="errors.categoryId" class="mt-1 block text-xs text-red-600">
          {{ errors.categoryId }}
        </span>
      </label>
      <p v-if="!categories.length" class="text-sm text-amber-600">
        Crie uma categoria primeiro (aba Categorias).
      </p>
      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" @click="emit('close')">Cancelar</BaseButton>
        <BaseButton @click="submit">{{ isEdit ? "Salvar" : "Criar" }}</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
