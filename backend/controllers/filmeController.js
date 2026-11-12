const supabaseService = require("../services/supabaseService");

// Função chamada quando o frontend pede para adicionar um filme
async function adicionarFilme(req, res) {
  try {
    const dadosFilme = req.body; // Pega os dados que o script.js enviou
    const novoFilme = await supabaseService.salvarFilmeBanco(dadosFilme);

    // Devolve status 201 (Criado) e o filme salvo
    res
      .status(201)
      .json({ mensagem: "Filme salvo com sucesso!", filme: novoFilme });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
}

// Função chamada quando a tela inicial carrega
async function listarFilmes(req, res) {
  try {
    const filmes = await supabaseService.buscarFilmesBanco();
    res.status(200).json(filmes);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
}

module.exports = { adicionarFilme, listarFilmes };
