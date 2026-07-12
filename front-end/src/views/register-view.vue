<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import * as authService from "../services/auth.service";
import { useAuthStore } from "../stores/auth";
import { validate } from "../utils/validate";
import { registerSchema } from "../schemas/forms";
import { formatPhone, phoneDigits } from "../utils/format";
import BaseInput from "../components/base/base-input.vue";
import BaseButton from "../components/base/base-button.vue";

const router = useRouter();
const auth = useAuthStore();

const form = ref({
  name: "",
  email: "",
  username: "",
  password: "",
  phone: "",
});
const errors = ref<Record<string, string>>({});
const error = ref("");
const loading = ref(false);

function onPhone(value: string) {
  form.value.phone = formatPhone(value);
}

async function onSubmit() {
  error.value = "";
  const res = validate(registerSchema, form.value);
  if (!res.ok) {
    errors.value = res.errors;
    return;
  }
  errors.value = {};
  loading.value = true;
  try {
    await authService.register({
      ...res.data,
      phone: phoneDigits(res.data.phone ?? "") || undefined,
    });
    await auth.login(res.data.email, res.data.password);
    router.push({ name: "board" });
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    error.value = err.response?.data?.message ?? "Falha no cadastro";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <form
      class="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      @submit.prevent="onSubmit"
    >
      <h1 class="text-xl font-semibold text-slate-800">Criar conta</h1>
      <BaseInput v-model="form.name" label="Nome" :error="errors.name" />
      <BaseInput v-model="form.email" type="email" label="Email" :error="errors.email" />
      <BaseInput v-model="form.username" label="Usuário" :error="errors.username" />
      <BaseInput
        v-model="form.password"
        type="password"
        label="Senha"
        :error="errors.password"
      />
      <BaseInput
        :model-value="form.phone"
        label="Telefone (opcional)"
        placeholder="(11) 99999-9999"
        :error="errors.phone"
        @update:model-value="onPhone"
      />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <BaseButton type="submit" :disabled="loading" class="w-full">
        {{ loading ? "Cadastrando..." : "Cadastrar" }}
      </BaseButton>
      <p class="text-center text-sm text-slate-500">
        Já tem conta?
        <RouterLink to="/login" class="text-indigo-600 hover:underline">
          Entrar
        </RouterLink>
      </p>
    </form>
  </div>
</template>
