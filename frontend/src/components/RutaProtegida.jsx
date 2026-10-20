import { Navigate } from "react-router-dom";
import { getToken } from "../services/authService.js";

export default function RutaProtegida({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}
