<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { validate } from "../utils/validate";
import { loginSchema } from "../schemas/forms";
import BaseInput from "../components/base/base-input.vue";
import BaseButton from "../components/base/base-button.vue";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const errors = ref<Record<string, string>>({});
const error = ref("");
const loading = ref(false);

async function onSubmit() {
  error.value = "";
  const res = validate(loginSchema, {
    email: email.value,
    password: password.value,
  });
  if (!res.ok) {
    errors.value = res.errors;
    return;
  }
  errors.value = {};
  loading.value = true;
  try {
    await auth.login(res.data.email, res.data.password);
    router.push({ name: "board" });
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    error.value = err.response?.data?.message ?? "Falha no login";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <form
      class="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      @submit.prevent="onSubmit"
    >
      <h1 class="text-xl font-semibold text-slate-800">Entrar</h1>
      <BaseInput
        v-model="email"
        type="email"
        label="Email"
        placeholder="voce@exemplo.com"
        :error="errors.email"
      />
      <BaseInput
        v-model="password"
        type="password"
        label="Senha"
        placeholder="••••••"
        :error="errors.password"
      />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <BaseButton type="submit" :disabled="loading" class="w-full">
        {{ loading ? "Entrando..." : "Entrar" }}
      </BaseButton>
      <p class="text-center text-sm text-slate-500">
        Não tem conta?
        <RouterLink to="/register" class="text-indigo-600 hover:underline">
          Cadastre-se
        </RouterLink>
      </p>
    </form>
  </div>
</template>
