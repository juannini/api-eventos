import api from "./api.js";

export const getToken = () => localStorage.getItem("token");

export const getUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
};

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));
  return data.usuario;
};

export const registrar = (datos) => api.post("/auth/registro", datos);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};
