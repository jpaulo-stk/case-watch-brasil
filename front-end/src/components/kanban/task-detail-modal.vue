<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "../base/base-modal.vue";
import BaseButton from "../base/base-button.vue";
import * as tasksService from "../../services/tasks.service";
import * as usersService from "../../services/users.service";
import { useAuthStore } from "../../stores/auth";
import { statusLabels, roleLabels } from "../../utils/labels";
import { isEmail } from "../../utils/validation";
import { formatDate } from "../../utils/format";
import type {
  Task,
  Collaborator,
  CollaboratorRole,
  TaskStatus,
} from "../../types/api";
import type { UserSummary } from "../../services/users.service";

const props = defineProps<{ task: Task | null }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "deleted"): void;
  (e: "edit", task: Task): void;
  (e: "moved"): void;
}>();

const auth = useAuthStore();
const collaborators = ref<Collaborator[]>([]);
const newEmail = ref("");
const newRole = ref<CollaboratorRole>("viewer");
const collabError = ref("");
const adding = ref(false);

const suggestions = ref<UserSummary[]>([]);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const statuses: TaskStatus[] = ["pending", "in_progress", "review", "done"];
const currentStatus = ref<TaskStatus>();
const moving = ref(false);
const moveError = ref("");

const isOwner = computed(
  () => !!props.task && props.task.user?.id === auth.user?.id,
);
const myRole = computed<CollaboratorRole | null>(() => {
  if (isOwner.value) return null;
  return (
    collaborators.value.find((c) => c.userId === auth.user?.id)?.role ?? null
  );
});
const canEdit = computed(() => isOwner.value || myRole.value === "editor");

watch(
  () => props.task,
  async (task) => {
    collaborators.value = task
      ? await tasksService.getCollaborators(task.id)
      : [];
    newEmail.value = "";
    collabError.value = "";
    suggestions.value = [];
    currentStatus.value = task?.status;
    moveError.value = "";
  },
);

async function moveTo(status: TaskStatus) {
  if (!props.task || status === currentStatus.value || moving.value) return;
  moving.value = true;
  moveError.value = "";
  try {
    await tasksService.updateStatus(props.task.id, status);
    currentStatus.value = status;
    emit("moved");
  } catch {
    moveError.value = "Não foi possível mover a tarefa";
  } finally {
    moving.value = false;
  }
}

function onEmailInput() {
  collabError.value = "";
  if (searchTimer) clearTimeout(searchTimer);
  const q = newEmail.value.trim();
  if (q.length < 2) {
    suggestions.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      suggestions.value = await usersService.searchUsers(q);
    } catch {
      suggestions.value = [];
    }
  }, 300);
}

function selectSuggestion(u: UserSummary) {
  newEmail.value = u.email;
  suggestions.value = [];
}

async function addCollab() {
  collabError.value = "";
  if (!newEmail.value) {
    collabError.value = "Informe o email";
    return;
  }
  if (!isEmail(newEmail.value)) {
    collabError.value = "Email inválido";
    return;
  }
  if (!props.task) return;

  adding.value = true;
  try {
    await tasksService.addCollaborator(
      props.task.id,
      newEmail.value,
      newRole.value,
    );
    collaborators.value = await tasksService.getCollaborators(props.task.id);
    newEmail.value = "";
    suggestions.value = [];
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    collabError.value =
      err.response?.data?.message ?? "Não foi possível adicionar";
  } finally {
    adding.value = false;
  }
}

async function removeCollab(userId: number) {
  if (!props.task) return;
  await tasksService.removeCollaborator(props.task.id, userId);
  collaborators.value = await tasksService.getCollaborators(props.task.id);
}

async function del() {
  if (!props.task) return;
  await tasksService.deleteTask(props.task.id);
  emit("deleted");
}
</script>

<template>
  <BaseModal :open="!!task" :title="task?.name" @close="emit('close')">
    <div v-if="task" class="space-y-4">
      <p class="text-sm text-slate-600">
        {{ task.description || "Sem descrição" }}
      </p>

      <div class="flex flex-wrap items-center gap-3">
        <span
          class="inline-block rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
        >
          {{ statusLabels[currentStatus ?? task.status] }}
        </span>
        <span class="text-xs text-slate-500">
          Dono:
          <strong class="text-slate-700">
            {{ isOwner ? "você" : (task.user?.name ?? "—") }}
          </strong>
        </span>
        <span v-if="task.deadline" class="text-xs text-amber-700">
          📅 {{ formatDate(task.deadline) }}
        </span>
      </div>

      <div v-if="canEdit">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">Mover para</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in statuses"
            :key="s"
            type="button"
            :disabled="moving || s === currentStatus"
            class="rounded-md border px-3 py-1.5 text-sm font-medium transition"
            :class="
              s === currentStatus
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50'
            "
            @click="moveTo(s)"
          >
            {{ statusLabels[s] }}
          </button>
        </div>
        <p v-if="moveError" class="mt-1 text-xs text-red-600">
          {{ moveError }}
        </p>
      </div>

      <div
        v-if="!isOwner"
        class="rounded-md bg-indigo-50 p-3 text-sm text-indigo-900"
      >
        <p v-if="myRole === 'editor'">
          Você é <strong>Editor</strong>: pode ver e
          <strong>mover/editar</strong> esta tarefa.
        </p>
        <p v-else>
          Você é <strong>Visualizador</strong>: pode
          <strong>apenas ver</strong> esta tarefa.
        </p>
        <p class="mt-1 text-xs text-indigo-700">
          Só o dono ({{ task.user?.name ?? "—" }}) pode gerenciar colaboradores
          ou excluir a tarefa.
        </p>
      </div>

      <div>
        <h3 class="mb-2 text-sm font-semibold text-slate-700">
          Quem tem acesso
        </h3>
        <ul class="space-y-1">
          <li
            v-for="c in collaborators"
            :key="c.userId"
            class="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-sm"
          >
            <span>
              <span class="font-medium text-slate-700">
                {{ c.user?.name ?? c.user?.email ?? `#${c.userId}` }}
              </span>
              <span class="text-slate-400"> — {{ roleLabels[c.role] }}</span>
              <span v-if="c.userId === auth.user?.id" class="text-indigo-500">
                (você)
              </span>
            </span>
            <button
              v-if="isOwner"
              class="text-red-600 hover:underline"
              @click="removeCollab(c.userId)"
            >
              remover
            </button>
          </li>
          <li v-if="!collaborators.length" class="text-sm text-slate-400">
            Só o dono por enquanto.
          </li>
        </ul>

        <div v-if="isOwner" class="mt-3">
          <div class="flex items-end gap-2">
            <div class="relative flex-1">
              <span class="mb-1 block text-sm font-medium text-slate-700">
                Email do colaborador
              </span>
              <input
                v-model="newEmail"
                type="email"
                placeholder="colega@exemplo.com"
                autocomplete="off"
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                @input="onEmailInput"
              />
              <ul
                v-if="suggestions.length"
                class="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
              >
                <li
                  v-for="u in suggestions"
                  :key="u.id"
                  class="cursor-pointer px-3 py-2 text-sm hover:bg-slate-50"
                  @click="selectSuggestion(u)"
                >
                  <span class="font-medium text-slate-700">{{ u.name }}</span>
                  <span class="text-slate-400"> — {{ u.email }}</span>
                </li>
              </ul>
            </div>
            <select
              v-model="newRole"
              class="rounded-md border border-slate-300 px-2 py-2 text-sm"
            >
              <option value="viewer">{{ roleLabels.viewer }}</option>
              <option value="editor">{{ roleLabels.editor }}</option>
            </select>
            <BaseButton
              variant="secondary"
              :disabled="adding"
              @click="addCollab"
            >
              {{ adding ? "..." : "Add" }}
            </BaseButton>
          </div>
          <p v-if="collabError" class="mt-1 text-xs text-red-600">
            {{ collabError }}
          </p>
        </div>
      </div>

      <div class="flex justify-between border-t border-slate-100 pt-3">
        <BaseButton v-if="isOwner" variant="danger" @click="del">
          Excluir tarefa
        </BaseButton>
        <span v-else></span>
        <div class="flex gap-2">
          <BaseButton v-if="canEdit" @click="emit('edit', task)">
            Editar
          </BaseButton>
          <BaseButton variant="secondary" @click="emit('close')">
            Fechar
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
