import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Empresas from "./pages/Empresas.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RutaProtegida>
            <Empresas />
          </RutaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
