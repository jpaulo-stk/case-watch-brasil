import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from "../services/auth.service";
import type { User } from "../types/api";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem("user") ?? "null"),
  );

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const res = await authService.login(email, password);
    token.value = res.token;
    user.value = res.user;
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function setUser(u: User) {
    user.value = u;
    localStorage.setItem("user", JSON.stringify(u));
  }

  return { token, user, isAuthenticated, login, logout, setUser };
});
