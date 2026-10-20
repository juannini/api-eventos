import { useEffect, useState } from "react";
import { Button, Form, Input, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { getToken, login, registrar } from "../services/authService.js";

export default function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = useState("login");
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (modo !== "registro") return;
    api
      .get("/empresas")
      .then((res) => setEmpresas(res.data.filter((e) => e.activo)))
      .catch(() => message.error("No se pudieron cargar las empresas"));
  }, [modo]);

  const enviar = async (values) => {
    setLoading(true);
    try {
      if (modo === "registro") await registrar(values);
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (err) {
      message.error(err.response?.data?.mensaje || "No se pudo conectar con la API");
    } finally {
      setLoading(false);
    }
  };

  const esLogin = modo === "login";

  return (
    <main className="login-wrap">
      <section className="login-card">
        <h1>{esLogin ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <p className="sub">Sistema de eventos</p>

        <Form key={modo} layout="vertical" requiredMark={false} onFinish={enviar} style={{ marginTop: 24 }}>
          {!esLogin && (
            <>
              <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "Ingresá tu nombre" }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item name="id_empresa" label="Empresa" rules={[{ required: true, message: "Elegí tu empresa" }]}>
                <Select
                  size="large"
                  placeholder="Seleccioná una empresa"
                  options={empresas.map((e) => ({ value: e.id_empresa, label: e.nombre }))}
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Ingresá un email válido" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: "Ingresá la contraseña" },
              ...(esLogin ? [] : [{ min: 6, message: "Mínimo 6 caracteres" }])
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            {esLogin ? "Entrar" : "Crear cuenta y entrar"}
          </Button>
        </Form>

        <button type="button" className="login-switch" onClick={() => setModo(esLogin ? "registro" : "login")}>
          {esLogin ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </section>
    </main>
  );
}
