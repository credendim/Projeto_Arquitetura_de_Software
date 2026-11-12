const express = require("express");
const router = express.Router();
const filmeController = require("../controllers/filmeController");

// Quando o frontend fizer um POST para /api/filmes/adicionar, chama o controller
router.post("/adicionar", filmeController.adicionarFilme);

// Quando o frontend fizer um GET para /api/filmes/listar, chama o controller
router.get("/listar", filmeController.listarFilmes);

module.exports = router;
