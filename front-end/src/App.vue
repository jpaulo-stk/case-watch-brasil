<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import ProfileModal from "./components/profile-modal.vue";

const auth = useAuthStore();
const router = useRouter();
const showProfile = ref(false);

function logout() {
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <nav
      v-if="auth.isAuthenticated"
      class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-white px-6 py-3"
    >
      <RouterLink to="/" class="text-sm text-slate-600 hover:text-slate-900">
        Tarefas
      </RouterLink>
      <RouterLink
        to="/categories"
        class="text-sm text-slate-600 hover:text-slate-900"
      >
        Categorias
      </RouterLink>
      <RouterLink
        to="/reports"
        class="text-sm text-slate-600 hover:text-slate-900"
      >
        Relatórios
      </RouterLink>
      <button
        class="ml-auto text-sm font-medium text-slate-700 hover:text-indigo-600"
        @click="showProfile = true"
      >
        {{ auth.user?.name ?? "Perfil" }}
      </button>
      <button
        class="text-sm text-slate-600 hover:text-slate-900"
        @click="logout"
      >
        Sair
      </button>
    </nav>

    <RouterView />

    <ProfileModal :open="showProfile" @close="showProfile = false" />
  </div>
</template>
