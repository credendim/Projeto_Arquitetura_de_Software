const express = require("express");
const router = express.Router();
const filmeController = require("../controllers/filmeController");
const tmdbController = require("../controllers/tmdbController");

// Quando o frontend fizer um POST para /api/filmes/adicionar, chama o controller
// CREATE
router.post("/adicionar", filmeController.adicionarFilme);

// Quando o frontend fizer um GET para /api/filmes/listar, chama o controller
// READ
router.get("/listar", filmeController.listarFilmes);

router.get("/detalhes/:id", filmeController.buscarFilmePorId);

router.get("/tmdb/buscar", tmdbController.buscarFilmes);

router.get("/tmdb/detalhes/:id", tmdbController.detalhesFilme);

// UPDATE
router.patch("/favorito/:id", filmeController.atualizarFavorito);

router.patch("/assistido/:id", filmeController.atualizarAssistido);

router.patch("/nota/:id", filmeController.atualizarNota);

router.patch("/comentario/:id", filmeController.atualizarComentario);

// DELETE
router.delete("/deletar/:id", filmeController.deletarFilme);

module.exports = router;
