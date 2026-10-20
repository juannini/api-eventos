import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Form, Input, Modal, Popconfirm, Segmented, Skeleton, Switch, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { getUsuario, logout } from "../services/authService.js";
import "../App.css";

const API = "/empresas";

async function request(url, options = {}) {
  try {
    const res = await api({
      url,
      method: options.method || "GET",
      data: options.body ? JSON.parse(options.body) : undefined
    });
    return res.data || null;
  } catch (err) {
    throw new Error(err.response?.data?.mensaje || "Algo salió mal");
  }
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const usuario = getUsuario();
  const esAdmin = usuario?.rol === "admin";

  const salir = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const cargar = async () => {
    setLoading(true);
    setError(false);
    try {
      setEmpresas(await request(API));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editing) form.setFieldsValue(editing);
  }, [open, editing, form]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return empresas.filter((e) => {
      if (filtro === "activas" && !e.activo) return false;
      if (filtro === "inactivas" && e.activo) return false;
      return !q || e.nombre.toLowerCase().includes(q) || e.cuit.includes(q);
    });
  }, [empresas, query, filtro]);

  const activas = empresas.filter((e) => e.activo).length;

  const abrir = (empresa = null) => {
    setEditing(empresa);
    setOpen(true);
  };

  const guardar = async () => {
    const values = await form.validateFields();
    const body = {};
    Object.entries(values).forEach(([k, v]) => (body[k] = (v ?? "").trim()));
    setSaving(true);
    try {
      if (editing) {
        const actualizada = await request(`${API}/${editing.id_empresa}`, {
          method: "PUT",
          body: JSON.stringify(body)
        });
        setEmpresas((lista) => lista.map((e) => (e.id_empresa === actualizada.id_empresa ? actualizada : e)));
        message.success("Cambios guardados");
      } else {
        const nueva = await request(API, { method: "POST", body: JSON.stringify(body) });
        setEmpresas((lista) => [...lista, nueva]);
        message.success("Empresa creada");
      }
      setOpen(false);
    } catch (err) {
      message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (empresa, activo) => {
    try {
      const actualizada = await request(`${API}/${empresa.id_empresa}`, {
        method: "PUT",
        body: JSON.stringify({ activo })
      });
      setEmpresas((lista) => lista.map((e) => (e.id_empresa === actualizada.id_empresa ? actualizada : e)));
    } catch (err) {
      message.error(err.message);
    }
  };

  const eliminar = async (empresa) => {
    try {
      await request(`${API}/${empresa.id_empresa}`, { method: "DELETE" });
      setEmpresas((lista) => lista.filter((e) => e.id_empresa !== empresa.id_empresa));
      message.success("Empresa eliminada");
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Empresas</h1>
          <p className="sub">
            {empresas.length} registradas, {activas} activas
          </p>
        </div>
        <div className="top-actions">
          <span className="user">
            {usuario?.nombre} · {usuario?.rol}
          </span>
          <Button size="large" onClick={salir}>
            Cerrar sesión
          </Button>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => abrir()}>
            Nueva empresa
          </Button>
        </div>
      </header>

      <div className="toolbar">
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Buscar por nombre o CUIT"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Segmented
          size="large"
          value={filtro}
          onChange={setFiltro}
          options={[
            { label: "Todas", value: "todas" },
            { label: "Activas", value: "activas" },
            { label: "Inactivas", value: "inactivas" }
          ]}
        />
      </div>

      {loading ? (
        <div className="grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="ticket">
              <div className="ticket-main">
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Empty
          description="No se pudo conectar con la API. Verificá que el servidor esté corriendo en el puerto 3000."
        >
          <Button type="primary" onClick={cargar}>
            Reintentar
          </Button>
        </Empty>
      ) : visibles.length === 0 ? (
        <Empty description={empresas.length === 0 ? "Todavía no hay empresas cargadas" : "Ninguna empresa coincide con la búsqueda"}>
          {empresas.length === 0 && (
            <Button type="primary" onClick={() => abrir()}>
              Crear la primera empresa
            </Button>
          )}
        </Empty>
      ) : (
        <section className="grid">
          {visibles.map((e) => (
            <article key={e.id_empresa} className={`ticket ${e.activo ? "" : "is-off"}`}>
              <div className="ticket-main">
                <h2>{e.nombre}</h2>
                <p className="cuit">CUIT {e.cuit}</p>
                <ul className="contact">
                  {e.email && (
                    <li>
                      <MailOutlined /> {e.email}
                    </li>
                  )}
                  {e.telefono && (
                    <li>
                      <PhoneOutlined /> {e.telefono}
                    </li>
                  )}
                  {e.direccion && (
                    <li>
                      <EnvironmentOutlined /> {e.direccion}
                    </li>
                  )}
                  {!e.email && !e.telefono && !e.direccion && <li className="none">Sin datos de contacto</li>}
                </ul>
              </div>

              <div className="ticket-stub">
                <span className="stub-id">{String(e.id_empresa).padStart(3, "0")}</span>
                <label className="stub-state">
                  <Switch size="small" checked={e.activo} onChange={(v) => cambiarEstado(e, v)} />
                  {e.activo ? "Activa" : "Inactiva"}
                </label>
                <div className="stub-actions">
                  <Button type="text" aria-label={`Editar ${e.nombre}`} icon={<EditOutlined />} onClick={() => abrir(e)} />
                  {esAdmin && (
<Popconfirm
                    title={`¿Eliminar ${e.nombre}?`}
                    description="Esta acción no se puede deshacer."
                    okText="Eliminar"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => eliminar(e)}
                  >
                    <Button type="text" danger aria-label={`Eliminar ${e.nombre}`} icon={<DeleteOutlined />} />
                  </Popconfirm>
)}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <Modal
        title={editing ? "Editar empresa" : "Nueva empresa"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={guardar}
        okText={editing ? "Guardar cambios" : "Crear empresa"}
        cancelText="Cancelar"
        confirmLoading={saving}
        forceRender
      >
        <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "Ingresá el nombre" }]}>
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item
            name="cuit"
            label="CUIT"
            rules={[
              { required: true, message: "Ingresá el CUIT" },
              { pattern: /^\d{2}-\d{8}-\d$/, message: "Usá el formato 30-12345678-9" }
            ]}
          >
            <Input maxLength={13} placeholder="30-12345678-9" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Ingresá un email válido" }]}>
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono">
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item name="direccion" label="Dirección">
            <Input maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
