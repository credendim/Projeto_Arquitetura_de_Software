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
  imgPoster.src = filme.capa || "assets/img/NoPoster.png";

  const headerTexts = header.querySelectorAll(".headderText");

  function aplicarCores(fundo, textoClaro) {
    bannerHeader.style.backgroundColor = fundo;
    header.style.setProperty(
      "--header-text",
      textoClaro ? "#f9f9f9" : "#000000",
    );
    header.style.setProperty(
      "--header-subtext",
      textoClaro ? "#d4d4d4" : "#000000",
    );
  }

  function extrairCor(url) {
    return new Promise((resolve) => {
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
          .catch(() => aplicarCores("rgba(29, 29, 31, 0.75)", true))
          .finally(resolve);
      };
      imgCor.onerror = () => {
        aplicarCores("rgba(29, 29, 31, 0.75)", true);
        resolve();
      };
      imgCor.src = url;
    });
  }

  if (filme.capa) return extrairCor(filme.capa);

  aplicarCores("rgba(29, 29, 31, 0.75)", true);
  return Promise.resolve();
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
  <a id="linkAtor">
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
    </a>
  `;

  // textContent/src/alt em vez de innerHTML, para não injetar HTML vindo do banco
  const img = card.querySelector(".actorImg");
  img.src = filme.ator.foto || "assets/img/Noimage.png";
  img.alt = `Foto do ator: ${filme.ator.nome || "Nome do ator não informado"}`;
  card.querySelector("#actorName").textContent =
    filme.ator.nome || "Nome do ator não informado";
  card.querySelector("#character").textContent =
    filme.personagem || "Personagem não informado";
  card.querySelector("#linkAtor").href = filme.ator.perfil;

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
  const img = document.getElementById("certificationImg");
  const validas = ["L", "10", "12", "14", "16", "18"];
  if (validas.includes(filme.classificacao)) {
    img.src = `assets/img/${filme.classificacao}.png`;
  } else {
    img.closest("section").style.display = "none";
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

  originalLanguage.textContent = filme.idioma_original
    ? nomeIdioma(filme.idioma_original)
    : "Idioma não informado";
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

const API_URL = "http://192.168.0.200:3000/api/filmes";

function esconderLoader() {
  const loader = document.getElementById("loader");
  document.body.classList.remove("loading");
  loader.classList.add("hidden");
  loader.addEventListener("transitionend", () => loader.remove(), {
    once: true,
  });
}

function mostrarNotFound() {
  document.getElementById("notFound").classList.remove("hidden");
  document.querySelector(".navActions").style.display = "none";
  document.body.classList.add("loading"); // trava a rolagem por trás
}

async function buscarDetalhes() {
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  let naoEncontrado = false;

  try {
    const resposta = await fetch(`${API_URL}/detalhes/${id}`);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
    const detalhes = await resposta.json();
    renderizarAcoes(detalhes);

    renderizarAcoes(detalhes);
    renderizarNota(detalhes);
    renderizarComentario(detalhes);

    renderizarTituloPagina(detalhes);
    const corPronta = renderizarHeader(detalhes, "movieHeader");
    renderizarSinopse(detalhes);
    renderizarListaAtor(detalhes.elenco || [], "actorsList");
    renderizarReprodutor(detalhes);
    renderizarClassificacao(detalhes);
    renderizarInformações(detalhes);

    await Promise.race([
      Promise.all([corPronta, esperarImagens()]),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);

    verificarNevoa();
  } catch (erro) {
    console.error("Erro ao carregar filme:", erro);
    naoEncontrado = true;
  } finally {
    esconderLoader(); // faz o fade do spinner
    if (naoEncontrado) mostrarNotFound(); // revela a tela 404 por baixo
  }
}

// ---------- Aviso na tela ----------

let timerToast = null;

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.hidden = false;

  clearTimeout(timerToast);
  timerToast = setTimeout(() => (toast.hidden = true), 3500);
}

// ---------- Requisições ----------

// status 0 = sem conexão com o servidor; senão, o status HTTP da resposta
async function requisitar(url, opcoes) {
  let resposta;

  try {
    resposta = await fetch(url, opcoes);
  } catch {
    const semConexao = new Error(
      "Não foi possível conectar ao servidor. Tente novamente em instantes.",
    );
    semConexao.status = 0;
    throw semConexao;
  }

  if (!resposta.ok) {
    const erro = new Error(`Erro ${resposta.status}`);
    erro.status = resposta.status;
    throw erro;
  }

  return resposta;
}

// ---------- Assistido / Favorito ----------

let filmeAtual = null;
const emAndamento = new Set(); // ações com PATCH em andamento

const ACOES = {
  assistido: {
    botao: document.getElementById("botaoAssistido"),
    campo: "is_assistido",
    rota: "assistido",
    iconeAtivo: "#eye-fill",
    iconeInativo: "#eye-slash",
    rotuloAtivo: "Marcar como não assistido",
    rotuloInativo: "Marcar como assistido",
    erro: "Não foi possível atualizar o status de assistido. Tente novamente.",
  },
  favorito: {
    botao: document.getElementById("botaoFavorito"),
    campo: "is_favorito",
    rota: "favorito",
    iconeAtivo: "#star-fill",
    iconeInativo: "#star",
    rotuloAtivo: "Remover dos favoritos",
    rotuloInativo: "Adicionar aos favoritos",
    erro: "Não foi possível atualizar o favorito. Tente novamente.",
  },
};

function atualizarBotao(acao, ativo) {
  acao.botao
    .querySelector("use")
    .setAttribute("href", ativo ? acao.iconeAtivo : acao.iconeInativo);
  acao.botao.setAttribute("aria-pressed", ativo);
  acao.botao.title = ativo ? acao.rotuloAtivo : acao.rotuloInativo;
}

// Chamada uma vez, quando os dados do filme chegam
function renderizarAcoes(filme) {
  filmeAtual = filme;
  Object.values(ACOES).forEach((acao) =>
    atualizarBotao(acao, Boolean(filme[acao.campo])),
  );
}

function aplicarEstado(nome, valor) {
  const acao = ACOES[nome];
  filmeAtual[acao.campo] = valor;
  atualizarBotao(acao, valor);
}

async function alternarEstado(nome) {
  if (!filmeAtual || emAndamento.has(nome)) return; // ignora cliques repetidos
  emAndamento.add(nome);

  const acao = ACOES[nome];
  const novoValor = !filmeAtual[acao.campo];
  aplicarEstado(nome, novoValor); // atualiza a tela na hora

  try {
    await requisitar(`${API_URL}/${acao.rota}/${filmeAtual.idfilme}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [acao.campo]: novoValor }),
    });
  } catch (erro) {
    console.error(`Erro ao atualizar ${acao.campo}:`, erro);
    aplicarEstado(nome, !novoValor); // desfaz
    mostrarToast(erro.status === 0 ? erro.message : acao.erro);
  } finally {
    emAndamento.delete(nome);
  }
}

Object.keys(ACOES).forEach((nome) => {
  ACOES[nome].botao.addEventListener("click", () => alternarEstado(nome));
});

// ---------- Deletar ----------

const botaoDeletar = document.getElementById("botaoDeletar");
let deletando = false;

async function deletarFilme() {
  if (deletando) return;

  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  if (
    !confirm(
      "Deletar este filme da sua lista? Essa ação não pode ser desfeita.",
    )
  ) {
    return;
  }

  deletando = true;
  botaoDeletar.disabled = true;

  try {
    await requisitar(`${API_URL}/deletar/${id}`, { method: "DELETE" });
    window.location.href = "index.html";
  } catch (erro) {
    // 404 = o filme já não existe mais: o objetivo foi cumprido
    if (erro.status === 404) {
      window.location.href = "index.html";
      return;
    }

    console.error("Erro ao deletar filme:", erro);
    mostrarToast(
      erro.status === 0
        ? erro.message
        : "Não foi possível deletar o filme. Tente novamente.",
    );
    deletando = false;
    botaoDeletar.disabled = false;
  }
}

botaoDeletar.addEventListener("click", deletarFilme);

// ---------- Nota (estrelas de 0,5 em 0,5) ----------

const estrelasContainer = document.getElementById("stars");
const textoNota = document.getElementById("notaTexto");

estrelasContainer.innerHTML = Array.from(
  { length: 5 },
  () => `<svg class="icon starRating"><use href="#star" /></svg>`,
).join("");

const estrelasNota = [...estrelasContainer.querySelectorAll(".starRating")];

let notaSalva = 0;
let notaExibida = null;
let salvandoNota = false;

// Desenha as 5 estrelas para um valor: inteira, meia ou vazia
function desenharEstrelas(valor) {
  if (valor === notaExibida) return; // evita redesenhar a cada pixel do mouse
  notaExibida = valor;

  estrelasNota.forEach((estrela, i) => {
    const numero = i + 1;
    let icone = "#star";
    if (valor >= numero) icone = "#star-fill";
    else if (valor >= numero - 0.5) icone = "#star-half";
    estrela.querySelector("use").setAttribute("href", icone);
  });

  textoNota.textContent = valor > 0 ? `${valor} / 5` : "Sem nota";
  estrelasContainer.setAttribute("aria-label", `Nota: ${valor} de 5`);
}

// Metade esquerda da estrela = meia estrela; metade direita = estrela inteira
function valorDoPonteiro(evento, indice) {
  const rect = evento.currentTarget.getBoundingClientRect();
  const naMetadeEsquerda = evento.clientX < rect.left + rect.width / 2;
  return indice + (naMetadeEsquerda ? 0.5 : 1);
}

async function definirNota(valor) {
  if (salvandoNota || valor === notaSalva) return;
  salvandoNota = true;

  const notaAnterior = notaSalva;
  notaSalva = valor;
  desenharEstrelas(valor); // atualiza na hora

  try {
    await requisitar(`${API_URL}/nota/${filmeAtual.idfilme}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota: valor }),
    });
  } catch (erro) {
    console.error("Erro ao salvar nota:", erro);
    notaSalva = notaAnterior;
    desenharEstrelas(notaAnterior); // desfaz
    mostrarToast(
      erro.status === 0
        ? erro.message
        : "Não foi possível salvar a nota. Tente novamente.",
    );
  } finally {
    salvandoNota = false;
  }
}

estrelasNota.forEach((estrela, indice) => {
  estrela.addEventListener("mousemove", (evento) => {
    desenharEstrelas(valorDoPonteiro(evento, indice)); // prévia ao passar o mouse
  });

  // O valor é calculado no clique (e não pela prévia), então também funciona no celular
  estrela.addEventListener("click", (evento) => {
    definirNota(valorDoPonteiro(evento, indice));
  });
});

// Saiu das estrelas: volta para a nota salva
estrelasContainer.addEventListener("mouseleave", () => {
  desenharEstrelas(notaSalva);
});

function renderizarNota(filme) {
  notaSalva = Number(filme.nota) || 0; // null (sem nota) vira 0
  desenharEstrelas(notaSalva);
}

// ---------- Comentário ----------

const campoComentario = document.getElementById("comentario");
const botaoConfirmar = document.getElementById("botaoConfirmar");
let salvandoComentario = false;

campoComentario.addEventListener("input", () => {
  campoComentario.style.height = "auto";
  campoComentario.style.height = `${campoComentario.scrollHeight}px`;
});

function renderizarComentario(filme) {
  campoComentario.value = filme.comentario || "";
  campoComentario.style.height = "auto";
  campoComentario.style.height = `${campoComentario.scrollHeight}px`;
}

async function salvarComentario() {
  if (salvandoComentario) return;

  const texto = campoComentario.value.trim();

  if (!texto) {
    mostrarToast("Escreva um comentário antes de confirmar.");
    campoComentario.focus();
    return;
  }

  salvandoComentario = true;
  botaoConfirmar.disabled = true;
  botaoConfirmar.textContent = "Salvando...";

  try {
    await requisitar(`${API_URL}/comentario/${filmeAtual.idfilme}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentario: texto }),
    });

    campoComentario.value = texto; // sem espaços sobrando nas pontas
    mostrarToast("Comentário salvo!");
  } catch (erro) {
    console.error("Erro ao salvar comentário:", erro);
    mostrarToast(
      erro.status === 0
        ? erro.message
        : "Não foi possível salvar o comentário. Tente novamente.",
    );
  } finally {
    salvandoComentario = false;
    botaoConfirmar.disabled = false;
    botaoConfirmar.textContent = "Confirmar";
  }
}

botaoConfirmar.addEventListener("click", salvarComentario);

// ============================================================================
// FORMATAÇÃO DE DADOS
// ============================================================================
function formatarData(dataIso) {
  if (!dataIso) return null;
  const [ano, mes, dia] = dataIso.split("-");

  return `${dia}/${mes}/${ano}`;
}

function nomeIdioma(codigo) {
  try {
    const idioma = new Intl.DisplayNames(["pt-BR"], { type: "language" }).of(
      codigo,
    );
    idiomaFormatado = idioma.charAt(0).toUpperCase() + idioma.slice(1);
    return idiomaFormatado;
  } catch {
    return codigo;
  }
}

buscarDetalhes();
