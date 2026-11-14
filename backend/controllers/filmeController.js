const supabaseService = require("../services/supabaseService");

// Função chamada quando o frontend pede para adicionar um filme
async function adicionarFilme(req, res) {
  try {
    const dadosFilme = req.body; // Pega os dados que o script.js enviou
    const novoFilme = await supabaseService.salvarFilmeCompleto(dadosFilme);

    // Devolve status 201 (Criado) e o filme salvo
    res
      .status(201)
      .json({ mensagem: "Filme salvo com sucesso!", filme: novoFilme });
  } catch (erro) {
    res.status(erro.status || 500).json({ erro: erro.message });
  }
}

// Função chamada quando a tela inicial carrega
async function listarFilmes(req, res) {
  try {
    const filmes = await supabaseService.listarFilmesBanco();
    res.status(200).json(filmes);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
}

async function buscarFilmePorId(req, res) {
  try {
    const filme = await supabaseService.buscarFilmePorId(req.params.id);

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado" });
    }

    res.status(200).json(filme);
  } catch (err) {
    res.status(400).json({ erro: err.message });
    console.error("Erro ao buscar filme por ID:", err.message);
  }
}

async function deletarFilme(req, res) {
  try {
    const filme = await supabaseService.deletarFilme(req.params.id);

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado" });
    }

    res.json({ mensagem: "Filme deletado com sucesso", filme });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

async function atualizarFavorito(req, res) {
  try {
    const { is_favorito } = req.body;
    const filme = await supabaseService.atualizarFavorito(
      req.params.id,
      is_favorito,
    );

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado" });
    }

    res.json({ mensagem: "Favorito atualizado", filme });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

async function atualizarAssistido(req, res) {
  try {
    const { is_assistido } = req.body;
    const filme = await supabaseService.atualizarAssistido(
      req.params.id,
      is_assistido,
    );

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado" });
    }

    res.json({ mensagem: "Assistido atualizado", filme });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

module.exports = {
  adicionarFilme,
  listarFilmes,
  buscarFilmePorId,
  deletarFilme,
  atualizarFavorito,
  atualizarAssistido,
};
