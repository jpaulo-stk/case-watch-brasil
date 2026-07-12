import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/login-view.vue"),
      meta: { public: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/register-view.vue"),
      meta: { public: true },
    },
    {
      path: "/",
      name: "board",
      component: () => import("../views/board-view.vue"),
    },
    {
      path: "/categories",
      name: "categories",
      component: () => import("../views/categories-view.vue"),
    },
    {
      path: "/reports",
      name: "reports",
      component: () => import("../views/reports-view.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: "login" };
  }
});

export default router;
