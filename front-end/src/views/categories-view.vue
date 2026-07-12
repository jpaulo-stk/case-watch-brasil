<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as categoriesService from "../services/categories.service";
import { validate } from "../utils/validate";
import { categorySchema } from "../schemas/forms";
import type { Category } from "../types/api";
import BaseButton from "../components/base/base-button.vue";
import BaseInput from "../components/base/base-input.vue";
import BaseModal from "../components/base/base-modal.vue";

const categories = ref<Category[]>([]);
const showModal = ref(false);
const editing = ref<Category | null>(null);
const name = ref("");
const errors = ref<Record<string, string>>({});

async function load() {
  categories.value = await categoriesService.getCategories();
}

function openCreate() {
  editing.value = null;
  name.value = "";
  errors.value = {};
  showModal.value = true;
}

function openEdit(category: Category) {
  editing.value = category;
  name.value = category.name;
  errors.value = {};
  showModal.value = true;
}

async function save() {
  const res = validate(categorySchema, { name: name.value });
  if (!res.ok) {
    errors.value = res.errors;
    return;
  }
  errors.value = {};
  if (editing.value) {
    await categoriesService.updateCategory(editing.value.id, res.data.name);
  } else {
    await categoriesService.createCategory(res.data.name);
  }
  showModal.value = false;
  await load();
}

async function remove(id: number) {
  await categoriesService.deleteCategory(id);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-slate-800">Categorias</h1>
      <BaseButton @click="openCreate">Nova categoria</BaseButton>
    </div>

    <ul class="max-w-md space-y-2">
      <li
        v-for="c in categories"
        :key="c.id"
        class="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-2"
      >
        <span class="text-slate-800">{{ c.name }}</span>
        <span class="flex gap-3 text-sm">
          <button class="text-indigo-600 hover:underline" @click="openEdit(c)">
            editar
          </button>
          <button class="text-red-600 hover:underline" @click="remove(c.id)">
            excluir
          </button>
        </span>
      </li>
      <li v-if="!categories.length" class="text-sm text-slate-400">
        Nenhuma categoria ainda.
      </li>
    </ul>

    <BaseModal
      :open="showModal"
      :title="editing ? 'Editar categoria' : 'Nova categoria'"
      @close="showModal = false"
    >
      <div class="space-y-3">
        <BaseInput v-model="name" label="Nome" :error="errors.name" />
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="showModal = false">
            Cancelar
          </BaseButton>
          <BaseButton @click="save">Salvar</BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
