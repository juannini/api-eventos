import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Agrega Authorization: Bearer <token> a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si la API responde 401 (token vencido o inválido), cierra la sesión
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const esAuth = error.config?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && !esAuth) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
