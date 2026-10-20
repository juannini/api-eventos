import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../data/db.js";

// El rol nunca viene del cliente: todo registro es "usuario"
export const registrar = async (req, res) => {
  const { nombre, email, password, id_empresa } = req.body;

  if (!nombre || !email || !password || !id_empresa) {
    return res.status(400).json({ mensaje: "nombre, email, password e id_empresa son obligatorios" });
  }
  if (password.length < 6) {
    return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const resultado = await pool.query(
      `INSERT INTO usuarios (id_empresa, nombre, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, id_empresa, nombre, email, rol`,
      [id_empresa, nombre, email.toLowerCase(), hash]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(400).json({ mensaje: "Ese email ya está registrado" });
    if (error.code === "23503" || error.code === "22P02") {
      return res.status(400).json({ mensaje: "La empresa indicada no existe" });
    }
    res.status(500).json({ mensaje: "Error al registrar el usuario" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "email y password son obligatorios" });
  }

  try {
    const resultado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email.toLowerCase()]);
    const u = resultado.rows[0];

    // Mismo mensaje si falla el email o la contraseña
    if (!u || !(await bcrypt.compare(password, u.password_hash))) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: u.id_usuario, id_empresa: u.id_empresa, email: u.email, rol: u.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      token,
      usuario: { id_usuario: u.id_usuario, id_empresa: u.id_empresa, nombre: u.nombre, email: u.email, rol: u.rol }
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};

export const perfil = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id_usuario, id_empresa, nombre, email, rol FROM usuarios WHERE id_usuario = $1",
      [req.usuario.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el perfil" });
  }
};
