const tmdbService = require("../services/tmdbService");

// GET /api/filmes/tmdb/buscar?query=como treinar
async function buscarFilmes(req, res) {
  const titulo = (req.query.query || "").trim();

  if (!titulo) {
    return res.status(400).json({ erro: "Informe o título para a busca" });
  }

  try {
    const resultados = await tmdbService.buscarFilme(titulo);

    // Devolve só o que a lista do popup precisa, e só os 10 primeiros
    const filmes = resultados.slice(0, 10).map((filme) => ({
      id: filme.id,
      titulo: filme.title,
      ano: filme.release_date ? filme.release_date.split("-")[0] : null,
      capa: filme.poster_path
        ? `https://image.tmdb.org/t/p/w154${filme.poster_path}`
        : null,
    }));

    res.status(200).json(filmes);
  } catch (erro) {
    console.error("Erro ao buscar filmes na TMDB:", erro.message);
    res.status(500).json({ erro: erro.message });
  }
}

// GET /api/filmes/tmdb/detalhes/:id
async function detalhesFilme(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID de filme inválido" });
  }

  try {
    const detalhes = await tmdbService.buscarDetalhesFilme(id);
    res.status(200).json(tmdbService.montarFilmeParaSalvar(detalhes));
  } catch (erro) {
    console.error("Erro ao buscar detalhes na TMDB:", erro.message);
    res.status(erro.status === 404 ? 404 : 500).json({ erro: erro.message });
  }
}

module.exports = { buscarFilmes, detalhesFilme };
