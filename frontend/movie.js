const API_URL = "http://localhost:3000/api/filmes";

function renderizarTituloPagina(filme) {
  const webtittle = document.getElementById("webtittle");
  webtittle.textContent =
    `Lista de Filme: ${filme.titulo}` || "Título não informado";
}

const fac = new FastAverageColor();

function renderizarHeader(filme, idElemento) {
  const header = document.getElementById(idElemento);

  header.innerHTML = `
    <div class="movieBackground">
      <img crossorigin="anonymous" class="movieBanner" id="movieBanner" />
      <div class="bannerColor" id="bannerColor"></div>
    </div>
    <div class="movieInfo">
      <img class="moviePoster" id="moviePoster" />
      <div class="movieText">
        <div class="titleAndPrhase">
          <h1 class="" id="movieTitle"></h1>
          <p class="moviePhrase subtittle headderSubtittle" id="moviePhrase"></p>
        </div>
        <div class="dateAndDuration inlineText">
          <p class="movieDate headderText" id="movieDate"></p>
          <p class="movieDate headderText">&bull;</p>
          <p class="movieDuration headderText" id="movieDuration"></p>
        </div>
        <div class="Director inlineText">
          <p class="movieDirector bold headderText">Diretor:</p>
          <p class="directorName headderText" id="directorName"></p>
        </div>
      </div>
    </div>
  `;

  // 2. Seleciona os elementos recém-criados para inserir os dados do banco
  const imgBanner = header.querySelector("#movieBanner");
  const imgPoster = header.querySelector("#moviePoster");
  const title = header.querySelector("#movieTitle");
  const phrase = header.querySelector("#moviePhrase");
  const date = header.querySelector("#movieDate");
  const duration = header.querySelector("#movieDuration");
  const directorName = header.querySelector("#directorName");
  const subtittle = document.querySelector(".headderSubtittle");

  const bannerHeader = header.querySelector("#bannerColor");

  // 3. Preenche os valores utilizando propriedades seguras
  imgBanner.src = filme.capa_fundo || "";
  imgBanner.alt = `Banner do filme: ${filme.titulo}`;

  imgPoster.alt = `Poster do filme: ${filme.titulo}`;

  title.textContent = filme.titulo;
  phrase.textContent = filme.frase || "Frase não informada";
  date.textContent = formatarData(filme.lancamento) || "Ano não informado";
  duration.textContent = filme.duracao
    ? `${filme.duracao} min`
    : "Duração não informada";
  directorName.textContent = filme.diretor || "Diretor não informado";
  imgPoster.src = filme.capa || "";

  const headerTexts = header.querySelectorAll(".headderText");

  function aplicarCores(fundo, textoClaro) {
    bannerHeader.style.backgroundColor = fundo;
    const corTexto = textoClaro ? "#f9f9f9" : "#000000";
    title.style.color = corTexto;
    headerTexts.forEach((el) => (el.style.color = corTexto));
    subtittle.style.color = textoClaro ? "#d4d4d4" : "#000000";
  }

  function extrairCor(url) {
    const imgCor = new Image();
    imgCor.crossOrigin = "anonymous";
    imgCor.onload = () => {
      fac
        .getColorAsync(imgCor)
        .then((c) => {
          aplicarCores(
            `rgba(${c.value[0]}, ${c.value[1]}, ${c.value[2]}, 0.75)`,
            c.isDark,
          );
        })
        .catch(() => aplicarCores("rgba(29, 29, 31, 0.75)", true));
    };
    // se o CORS falhar, o poster continua aparecendo; só a cor vira padrão
    imgCor.onerror = () => aplicarCores("rgba(29, 29, 31, 0.75)", true);
    imgCor.src = url;
  }

  if (filme.capa) extrairCor(filme.capa);
  else aplicarCores("rgba(29, 29, 31, 0.75)", true);
}

function renderizarSinopse(filme) {
  const sinopseSection = document.getElementById("sinopse");
  const sinopseText = document.getElementById("sinopseText");
  sinopseText.textContent = filme.sinopse || "Sinopse não informada";
  sinopseSection.style.display = filme.sinopse ? "" : "none";
}

function criarCardAtor(filme) {
  const card = document.createElement("li");
  card.id = "actorsListItem";
  card.innerHTML = `
    <figure id="actorFigure">
      <img
        alt="actor image"
        id="actorImg"
        class="actorImg"
      />
      <figcaption>
        <strong id="actorName"></strong>
        <span id="character"></span>
      </figcaption>
    </figure>
  `;

  // textContent/src/alt em vez de innerHTML, para não injetar HTML vindo do banco
  const img = card.querySelector(".actorImg");
  img.src = filme.ator.foto || "";
  img.alt = `Foto do ator: ${filme.ator.nome || "Nome do ator não informado"}`;
  card.querySelector("#actorName").textContent =
    filme.ator.nome || "Nome do ator não informado";
  card.querySelector("#character").textContent =
    filme.personagem || "Personagem não informado";

  return card;
}

function renderizarListaAtor(filmes, idLista) {
  const lista = document.getElementById(idLista);

  lista.replaceChildren(...filmes.map(criarCardAtor));
}

function renderizarReprodutor(filme) {
  const streamingProviderImg = document.getElementById("streamingProviderImg");
  streamingProviderImg.src = filme.foto_assistir || "";
}

function renderizarClassificacao(filme) {
  const streamingProviderImg = document.getElementById("certificationImg");
  if (filme.classificacao === "L") {
    streamingProviderImg.src = "assets/img/L.png";
  } else if (filme.classificacao === "10") {
    streamingProviderImg.src = "assets/img/10.png";
  } else if (filme.classificacao === "12") {
    streamingProviderImg.src = "assets/img/12.png";
  } else if (filme.classificacao === "14") {
    streamingProviderImg.src = "assets/img/14.png";
  } else if (filme.classificacao === "16") {
    streamingProviderImg.src = "assets/img/16.png";
  } else if (filme.classificacao === "18") {
    streamingProviderImg.src = "assets/img/18.png";
  }
}

function renderizarInformações(filme) {
  const originalLanguage = document.getElementById("originalLanguage");
  const originalLanguageContainer = document.getElementById(
    "originalLanguageContainer",
  );
  const budget = document.getElementById("budget");
  const budgetContainer = document.getElementById("budgetContainer");
  const revenue = document.getElementById("revenue");
  const revenueContainer = document.getElementById("revenueContainer");

  originalLanguage.textContent =
    filme.idioma_original || "Idioma não informado";
  budget.textContent = filme.orcamento
    ? `$${filme.orcamento.toLocaleString()}`
    : "Orçamento não informado";
  revenue.textContent = filme.receita
    ? `$${filme.receita.toLocaleString()}`
    : "Receita não informada";
  originalLanguageContainer.style.display = filme.idioma_original ? "" : "none";
  budgetContainer.style.display = filme.orcamento ? "" : "none";
  revenueContainer.style.display = filme.receita ? "" : "none";
}

async function buscarDetalhes(filmeId) {
  try {
    const resposta = await fetch(`${API_URL}/detalhes/${filmeId}`);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
    const detalhes = await resposta.json();

    console.log(detalhes);

    renderizarTituloPagina(detalhes);
    renderizarHeader(detalhes, "movieHeader");
    renderizarSinopse(detalhes);
    renderizarListaAtor(detalhes.elenco || [], "actorsList");
    renderizarReprodutor(detalhes);
    renderizarClassificacao(detalhes);
    renderizarInformações(detalhes);
  } catch (erro) {
    console.error("Não foi possível carregar os detalhes do filme:", erro);
  }
}

// ============================================================================
// FORMATAÇÃO DE DADOS
// ============================================================================
function formatarData(dataIso) {
  if (!dataIso) return null;
  const [ano, mes, dia] = dataIso.split("-");

  return `${dia}/${mes}/${ano}`;
}

buscarDetalhes(597);
