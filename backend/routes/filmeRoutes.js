const express = require("express");
const router = express.Router();
const filmeController = require("../controllers/filmeController");

// Quando o frontend fizer um POST para /api/filmes/adicionar, chama o controller
router.post("/adicionar", filmeController.adicionarFilme);

// Quando o frontend fizer um GET para /api/filmes/listar, chama o controller
router.get("/listar", filmeController.listarFilmes);

router.get("/detalhes/:id", filmeController.buscarFilmePorId);

router.delete("/deletar/:id", filmeController.deletarFilme);

router.patch("/favorito/:id", filmeController.atualizarFavorito);

router.patch("/assistido/:id", filmeController.atualizarAssistido);

module.exports = router;
