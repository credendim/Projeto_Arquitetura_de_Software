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

              // Passo D: Imprime os detalhes na tela
              console.log(
                "\n================ DETALHES DO FILME ================",
              );
              console.log(`Título: ${detalhes.title}`);
              console.log(`Título Original: ${detalhes.original_title}`);
              console.log(`Data de Lançamento: ${detalhes.release_date}`);
              console.log(`Duração: ${detalhes.runtime} minutos`);
              console.log(
                `Nota (TMDB): ${detalhes.vote_average.toFixed(1)}/10`,
              );
              console.log(
                `Gêneros: ${detalhes.genres.map((g) => g.name).join(", ")}`,
              );
              console.log(
                `\nSinopse:\n${detalhes.overview || "Sinopse não disponível em português."}`,
              );
              console.log(
                "===================================================\n",
              );
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
