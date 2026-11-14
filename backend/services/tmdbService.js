require("dotenv").config();

const TMDB_URL = "https://api.themoviedb.org/3";
const headers = { Authorization: `Bearer ${process.env.TMDB_API_KEY}` };

async function requisitarTMDB(url, mensagemErro) {
  const resposta = await fetch(url, { headers });

  if (!resposta.ok) {
    const erro = new Error(`${mensagemErro}: ${resposta.status}`);
    erro.status = resposta.status; // o controller usa para devolver 404 corretamente
    throw erro;
  }

  return resposta.json();
}

async function buscarFilme(titulo) {
  const url = new URL(`${TMDB_URL}/search/movie`);
  url.searchParams.set("query", titulo);
  url.searchParams.set("language", "pt-BR");

  const dados = await requisitarTMDB(url, "Erro ao buscar na TMDB");
  return dados.results || [];
}

async function buscarDetalhesFilme(id) {
  const url = `${TMDB_URL}/movie/${id}?language=pt-BR&append_to_response=credits,videos,watch/providers,release_dates`;
  return requisitarTMDB(url, "Erro ao buscar detalhes na TMDB");
}

// Converte a resposta crua da TMDB no formato que o /adicionar espera
function montarFilmeParaSalvar(detalhes) {
  const diretor = (detalhes.credits?.crew || []).find(
    (p) => p.job === "Director",
  );

  const provedoresBR = detalhes["watch/providers"]?.results?.BR;
  const primeiroProvedor =
    provedoresBR?.flatrate?.[0] ||
    provedoresBR?.rent?.[0] ||
    provedoresBR?.buy?.[0];

  const paisBR = (detalhes.release_dates?.results || []).find(
    (p) => p.iso_3166_1 === "BR",
  );
  const classificacao = paisBR?.release_dates?.find(
    (r) => r.certification,
  )?.certification;

  const atores = (detalhes.credits?.cast || []).slice(0, 15).map((pessoa) => ({
    nome: pessoa.name,
    foto: pessoa.profile_path
      ? `https://image.tmdb.org/t/p/w200${pessoa.profile_path}`
      : null,
    perfil: `https://www.themoviedb.org/person/${pessoa.id}`,
    id_tmdb: pessoa.id,
    personagem: pessoa.character,
  }));

  return {
    idfilme: detalhes.id,
    titulo: detalhes.title,
    frase: detalhes.tagline || null,
    lancamento: detalhes.release_date || null,
    duracao: detalhes.runtime || null,
    diretor: diretor ? diretor.name : "Não informado",
    capa: detalhes.poster_path
      ? `https://image.tmdb.org/t/p/w500${detalhes.poster_path}`
      : null,
    capa_fundo: detalhes.backdrop_path
      ? `https://image.tmdb.org/t/p/original${detalhes.backdrop_path}`
      : null,
    sinopse: detalhes.overview || null,
    titulo_original: detalhes.original_title || null,
    idioma_original: detalhes.original_language || null,
    orcamento: detalhes.budget || null,
    receita: detalhes.revenue || null,
    foto_assistir: primeiroProvedor?.logo_path
      ? `https://image.tmdb.org/t/p/w200${primeiroProvedor.logo_path}`
      : null,
    classificacao: classificacao || "Não informado",
    nota: null,
    comentario: null,
    is_assistido: false,
    is_favorito: false,
    atores,
  };
}

module.exports = { buscarFilme, buscarDetalhesFilme, montarFilmeParaSalvar };
