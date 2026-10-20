import jwt from "jsonwebtoken";

// 401: no hay token, la firma no coincide o venció
export const verificarToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  try {
    req.usuario = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch (error) {
    const mensaje = error.name === "TokenExpiredError" ? "El token expiró" : "Token inválido";
    res.status(401).json({ mensaje });
  }
};

// 403: token válido, pero el rol no tiene permiso. Va siempre después de verificarToken
export const verificarRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: "No tenés permiso para esta acción" });
  }
  next();
};
