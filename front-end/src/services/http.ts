import axios from "axios";

export const http = axios.create({ baseURL: "http://localhost:3000" });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token inválido/expirado numa requisição autenticada -> desloga e volta pro login.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // só desloga se tínhamos token (senão é um 401 de login com senha errada)
    if (status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
