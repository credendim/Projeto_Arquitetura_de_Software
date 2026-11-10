require("dotenv").config();
const readline = require("readline");

// ============================================================================
// 1. SUAS FUNÇÕES DE SERVIÇO (Adaptadas para usar a chave v3 do .env)
// ============================================================================

async function buscarFilme(titulo) {
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("query", titulo);
  url.searchParams.set("language", "pt-BR");

  const resposta = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao buscar na TMDB: ${resposta.status}`);
  }

  const dados = await resposta.json();
  return dados.results.slice(0, 5); // Retorna apenas os 5 primeiros
}

async function buscarDetalhesFilme(id) {
  // A chave v3 é injetada na URL da requisição de detalhes
  const url = `https://api.themoviedb.org/3/movie/${id}?language=pt-BR&append_to_response=credits,videos,watch/providers,release_dates`;

  const resposta = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao buscar detalhes na TMDB: ${resposta.status}`);
  }

  return await resposta.json();
}

// ============================================================================
// 2. INTERFACE DO TERMINAL (CLI)
// ============================================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function iniciarBuscaTerminal() {
  // Passo A: Pergunta o título do filme
  rl.question(
    "\nDigite o título do filme que deseja buscar: ",
    async (titulo) => {
      if (!titulo.trim()) {
        console.log("Você precisa digitar um título válido!");
        rl.close();
        return;
      }

      try {
        console.log(`\nBuscando por "${titulo}"...`);

        // Chama a sua função de busca
        const filmes = await buscarFilme(titulo);

        if (filmes.length === 0) {
          console.log("Nenhum filme encontrado com esse título.");
          rl.close();
          return;
        }

        // Passo B: Imprime os 5 primeiros com Título, Ano e Link da Capa
        console.log("\n--- 5 PRIMEIROS RESULTADOS ---");
        filmes.forEach((filme, index) => {
          const ano = filme.release_date
            ? filme.release_date.split("-")[0]
            : "Ano desconhecido";
          const linkCapa = filme.poster_path
            ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
            : "Sem capa disponível";

          console.log(`[${index + 1}] ${filme.title} (${ano})`);
          console.log(`    Capa: ${linkCapa}`);
        });

        // Passo C: Pede para o usuário escolher de 1 a 5
        rl.question(
          "\nSelecione um filme de 1 a 5 para ver os detalhes completos: ",
          async (numero) => {
            const escolha = parseInt(numero) - 1;

            if (escolha >= 0 && escolha < filmes.length) {
              const filmeSelecionado = filmes[escolha];

              const ano = filmeSelecionado.release_date
                ? filmeSelecionado.release_date.split("-")[0]
                : "Ano desconhecido";

              console.log(
                `\nBuscando detalhes completos de: ${filmeSelecionado.title} (${ano})...`,
              );

              // Chama a sua função de detalhes passando o ID do filme escolhido
              const detalhes = await buscarDetalhesFilme(filmeSelecionado.id);

              console.log(detalhes);

              const diretorCru = (detalhes.credits?.crew || []).find(
                (p) => p.job === "Director",
              );

              const atores = (detalhes.credits?.cast || []).map((pessoa) => ({
                nome: pessoa.name,
                personagem: pessoa.character,
                tmdbUrl: `https://www.themoviedb.org/person/${pessoa.id}`,
                fotoUrl: pessoa.profile_path
                  ? `https://image.tmdb.org/t/p/w200${pessoa.profile_path}`
                  : null,
              }));

              const paisBR = (detalhes.release_dates?.results || []).find(
                (p) => p.iso_3166_1 === "BR",
              );
              const certificacao = paisBR?.release_dates?.find(
                (r) => r.certification,
              )?.certification;

              const formatar = (valor) =>
                valor ? valor.toLocaleString("en") : "Não disponível";

              const provedoresBR = detalhes["watch/providers"]?.results?.BR;
              const primeiroProvedor =
                provedoresBR?.flatrate?.[0] ||
                provedoresBR?.rent?.[0] ||
                provedoresBR?.buy?.[0];

              // Passo D: Imprime os detalhes na tela
              console.log(
                "\n================ DETALHES DO FILME ================",
              );
              console.log(
                `Capa de fundo: https://image.tmdb.org/t/p/w500${detalhes.backdrop_path}`,
              );
              console.log(
                `Poster: https://image.tmdb.org/t/p/w200${detalhes.poster_path}`,
              );
              console.log(`Título: ${detalhes.title}`);
              console.log(`- ${detalhes.tagline || "Não disponível"} -`);
              console.log(`Título Original: ${detalhes.original_title}`);
              console.log(
                `Data de Lançamento: ${formatarData(detalhes.release_date)} - Duração: ${detalhes.runtime} minutos`,
              );
              console.log(`Diretor: ${diretorCru?.name || "Não disponível"}`);
              console.log(
                certificacao
                  ? `Classificação: ${certificacao}`
                  : "Classificação: Não disponível",
              );
              console.log(`\nOrçamento: $${formatar(detalhes.budget)}`);
              console.log(`Receita: $${formatar(detalhes.revenue)}`);
              console.log(
                `\nProvedor de streaming (BR): ${primeiroProvedor?.provider_name || "Não disponível"}`,
              );
              console.log(
                `Logo do provedor: https://image.tmdb.org/t/p/w200${primeiroProvedor.logo_path}`,
              );
              console.log(`Link do provedor: ${provedoresBR?.link || null}`);
              console.log(
                `\nSinopse:\n${detalhes.overview || "Sinopse não disponível em português."}`,
              );
              console.log(
                "===================================================\n",
              );
              console.log("Atores Principais:");
              atores.forEach((ator, index) => {
                console.log(
                  `[${index + 1}] ${ator.nome} como ${ator.personagem}`,
                );
                console.log(`    Perfil: ${ator.tmdbUrl}`);
                console.log(
                  `    Foto: ${ator.fotoUrl || "Foto não disponível"}`,
                );
              });
            } else {
              console.log("Opção inválida. Rode o script novamente.");
            }

            rl.close();
          },
        );
      } catch (erro) {
        console.error("\nErro durante a execução do script:", erro.message);
        rl.close();
      }
    },
  );
}

// Inicia o fluxo
iniciarBuscaTerminal();

// ============================================================================
// 3. FORMATAÇÃO DE DADOS
// ============================================================================

function formatarData(dataIso) {
  if (!dataIso) return null;
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}
