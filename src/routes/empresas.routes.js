import { Router } from "express";
import {
  obtenerEmpresas,
  obtenerEmpresa,
  crearEmpresa,
  editarEmpresa,
  eliminarEmpresa
} from "../controllers/empresas.controller.js";

import { verificarToken, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", obtenerEmpresas);
router.get("/:id", obtenerEmpresa);
router.post("/", verificarToken, crearEmpresa);
router.put("/:id", verificarToken, editarEmpresa);
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarEmpresa);

export default router;
