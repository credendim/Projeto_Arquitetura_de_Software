const supabase = require("../config/supabaseClient"); // O arquivo que você já arrumou

// Salva um novo filme no banco de dados
async function salvarFilmeBanco(dadosFilme) {
  const { data, error } = await supabase
    .from("filme")
    .insert([
      {
        titulo: dadosFilme.titulo,
        frase: dadosFilme.frase,
        lancamento: dadosFilme.lancamento,
        duracao: dadosFilme.duracao,
        diretor: dadosFilme.diretor,
        capa: dadosFilme.capaPath,
        capa_fundo: dadosFilme.capaFundoPath,
        sinopse: dadosFilme.sinopse,
        titulo_original: dadosFilme.tituloOriginal,
        idioma_original: dadosFilme.idiomaOriginal,
        orcamento: dadosFilme.orcamento,
        receita: dadosFilme.receita,
        foto_assistir: dadosFilme.fotoAssistir,
        classificacao: dadosFilme.classificacao,
        nota: dadosFilme.nota,
        comentario: dadosFilme.comentario,
        is_assistido: false,
        is_favorito: false,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

// Busca todos os filmes salvos para enviar ao frontend
async function buscarFilmesBanco() {
  const { data, error } = await supabase.from("filme").select("*");

  if (error) throw error;
  return data;
}

module.exports = { salvarFilmeBanco, buscarFilmesBanco };
