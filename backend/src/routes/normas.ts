import { Router } from "express";
import {
  listarNormas,
  criarNorma,
  deletarNorma
} from "./normaController.js";

const router = Router();

router.get("/", listarNormas);
router.post("/", criarNorma);
router.delete("/:id", deletarNorma);

export default router;