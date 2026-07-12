<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthStore } from "../stores/auth";
import * as usersService from "../services/users.service";
import { validate } from "../utils/validate";
import { profileSchema } from "../schemas/forms";
import { formatPhone, phoneDigits } from "../utils/format";
import BaseModal from "./base/base-modal.vue";
import BaseInput from "./base/base-input.vue";
import BaseButton from "./base/base-button.vue";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const auth = useAuthStore();
const form = ref({ name: "", email: "", username: "", phone: "" });
const errors = ref<Record<string, string>>({});
const message = ref("");
const error = ref("");
const loading = ref(false);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    form.value = {
      name: auth.user?.name ?? "",
      email: auth.user?.email ?? "",
      username: auth.user?.username ?? "",
      phone: formatPhone(auth.user?.phone ?? ""),
    };
    errors.value = {};
    message.value = "";
    error.value = "";
  },
);

function onPhone(value: string) {
  form.value.phone = formatPhone(value);
}

async function onSubmit() {
  message.value = "";
  error.value = "";
  const res = validate(profileSchema, form.value);
  if (!res.ok) {
    errors.value = res.errors;
    return;
  }
  errors.value = {};
  if (!auth.user) return;

  loading.value = true;
  try {
    const updated = await usersService.updateUser(auth.user.id, {
      name: res.data.name,
      email: res.data.email,
      username: res.data.username,
      phone: phoneDigits(res.data.phone ?? "") || undefined,
    });
    auth.setUser(updated);
    message.value = "Perfil atualizado!";
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    error.value = err.response?.data?.message ?? "Falha ao atualizar";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <BaseModal :open="open" title="Meu perfil" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="onSubmit">
      <BaseInput v-model="form.name" label="Nome" :error="errors.name" />
      <BaseInput
        v-model="form.email"
        type="email"
        label="Email"
        :error="errors.email"
      />
      <BaseInput
        v-model="form.username"
        label="Usuário"
        :error="errors.username"
      />
      <BaseInput
        :model-value="form.phone"
        label="Telefone"
        placeholder="(11) 99999-9999"
        :error="errors.phone"
        @update:model-value="onPhone"
      />
      <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" type="button" @click="emit('close')">
          Fechar
        </BaseButton>
        <BaseButton type="submit" :disabled="loading">
          {{ loading ? "Salvando..." : "Salvar" }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
