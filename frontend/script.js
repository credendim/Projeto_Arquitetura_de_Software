const classicos = [
  "Cidade de Deus",
  "O Auto da Compadecida",
  "Tropa de Elite",
  "Central do Brasil",
  "Carandiru",
  "Lisbela e o Prisioneiro",
  "Minha Mãe é uma Peça",
  "O Pagador de Promessas",
  "As Branquelas",
  "A Lagoa Azul",
  "Titanic",
  "Curtindo a Vida Adoidado",
  "De Volta para o Futuro",
  "Esqueceram de Mim",
  "O Rei Leão",
  "Jurassic Park: O Parque dos Dinossauros",
  "E.T.: O Extraterrestre",
  "Ghost: Do Outro Lado da Vida",
  "Karatê Kid: A Hora da Verdade",
  "Edward Mãos de Tesoura",
  "O Poderoso Chefão",
  "Matrix",
  "O Senhor dos Anéis: A Sociedade do Anel",
  "Forrest Gump: O Contador de Histórias",
  "O Exterminador do Futuro 2: O Julgamento Final",
  "Rocky: Um Lutador",
  "Star Wars: Episódio IV - Uma Nova Esperança",
  "A Espera de um Milagre",
  "Clube da Luta",
  "O Sexto Sentido",
];

function randomMovie() {
  const randomIndex = Math.floor(Math.random() * classicos.length);
  return classicos[randomIndex];
}

const TEMPO_ESPERA = 2000; // ms sem digitar antes de pesquisar

const modal = document.getElementById("movieModal");
const formBusca = document.getElementById("searchForm");
const caixaBusca = document.getElementById("searchBox");
const inputTitulo = document.getElementById("titulo");
const listaResultados = document.getElementById("searchResults");
const cardSelecionado = document.getElementById("selectedMovie");
const avisoModal = document.getElementById("modalMessage");
const botaoAdicionar = document.getElementById("addButton");

let timerBusca = null;
let controladorBusca = null;
let filmeSelecionado = null;
let salvando = false;

const idsSalvos = new Set(); // ids dos filmes que já estão no banco

// ---------- Abrir / fechar ----------

function openAddMovieModal() {
  inputTitulo.placeholder = `Ex: "${randomMovie()}"`;
  modal.showModal();
  inputTitulo.focus();
}

function closeModal() {
  if (!salvando) modal.close(); // não fecha no meio do salvamento
}

modal.addEventListener("cancel", (evento) => {
  if (salvando) evento.preventDefault(); // bloqueia o Esc enquanto salva
});

// Dispara no X e no Esc: devolve o popup ao estado inicial
modal.addEventListener("close", () => {
  clearTimeout(timerBusca);
  controladorBusca?.abort();
  filmeSelecionado = null;
  formBusca.reset();
  limparResultados();
  limparAviso();
  cardSelecionado.hidden = true;
  caixaBusca.hidden = false;
});

// ---------- Requisições ----------

// status 0 = sem conexão com o servidor; senão, o status HTTP da resposta
async function requisitarJSON(url, opcoes) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch (erro) {
    if (erro.name === "AbortError") throw erro;
    const semConexao = new Error(
      "Não foi possível conectar ao servidor. Tente novamente em instantes.",
    );
    semConexao.status = 0;
    throw semConexao;
  }

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(corpo.erro || `Erro ${resposta.status}`);
    erro.status = resposta.status;
    throw erro;
  }

  return corpo;
}

// ---------- Avisos dentro do popup ----------

function mostrarAviso(texto, link) {
  avisoModal.textContent = texto;

  if (link) {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.texto;
    avisoModal.append(" ", a);
  }

  avisoModal.hidden = false;
}

function limparAviso() {
  avisoModal.hidden = true;
  avisoModal.textContent = "";
}

function mostrarJaSalvo(filme) {
  mostrarAviso("Este filme já está na sua lista.", {
    href: `movie.html?id=${filme.id}`,
    texto: "Abrir filme",
  });
}

// ---------- Lista de resultados ----------

function limparResultados() {
  listaResultados.replaceChildren();
  listaResultados.hidden = true;
}

function mostrarMensagem(texto) {
  const li = document.createElement("li");
  li.className = "searchMessage";
  li.textContent = texto;
  listaResultados.replaceChildren(li);
  listaResultados.hidden = false;
}

function criarPoster(filme) {
  const poster = document.createElement(filme.capa ? "img" : "div");
  poster.className = "searchPoster";

  if (filme.capa) {
    poster.src = filme.capa;
    poster.alt = `Capa do filme: ${filme.titulo}`;
  }

  return poster;
}

function criarAno(filme) {
  const ano = document.createElement("span");
  ano.className = "subtitle";
  ano.textContent = filme.ano ? `(${filme.ano})` : "(Ano desconhecido)";
  return ano;
}

function criarItemResultado(filme, busca) {
  const texto = document.createElement("div");
  texto.className = "searchText";
  texto.append(criarTituloDestacado(filme.titulo, busca), criarAno(filme));

  const li = document.createElement("li");
  li.className = "searchItem";
  li.append(criarPoster(filme), texto);
  li.addEventListener("click", () => selecionarFilme(filme));
  return li;
}

// ---------- Filme selecionado ----------

// A barra de busca dá lugar ao card do filme escolhido
function selecionarFilme(filme) {
  clearTimeout(timerBusca);
  controladorBusca?.abort();
  filmeSelecionado = filme;

  const titulo = document.createElement("span");
  titulo.className = "selectedTitle";
  titulo.textContent = filme.titulo;

  const texto = document.createElement("div");
  texto.className = "searchText";
  texto.append(titulo, criarAno(filme));

  cardSelecionado.replaceChildren(criarPoster(filme), texto);

  limparAviso();
  limparResultados();
  caixaBusca.hidden = true;
  cardSelecionado.hidden = false;
}

// Clicar no card volta para a busca, já refazendo a pesquisa anterior
function voltarParaBusca() {
  if (salvando) return;

  filmeSelecionado = null;
  limparAviso();
  cardSelecionado.hidden = true;
  caixaBusca.hidden = false;
  inputTitulo.focus();

  const busca = inputTitulo.value.trim();
  if (busca) buscarFilmesTMDB(busca);
}

cardSelecionado.addEventListener("click", voltarParaBusca);

// ---------- Busca ----------

async function buscarFilmesTMDB(busca) {
  controladorBusca?.abort(); // cancela a requisição anterior, se ainda estiver rodando
  controladorBusca = new AbortController();

  mostrarMensagem("Buscando...");

  try {
    const filmes = await requisitarJSON(
      `${API_URL}/tmdb/buscar?query=${encodeURIComponent(busca)}`,
      { signal: controladorBusca.signal },
    );

    if (filmes.length === 0) {
      mostrarMensagem(`Nenhum filme encontrado para "${busca}"`);
      return;
    }

    listaResultados.replaceChildren(
      ...filmes.map((filme) => criarItemResultado(filme, busca)),
    );
    listaResultados.hidden = false;
    listaResultados.scrollTop = 0;
  } catch (erro) {
    if (erro.name === "AbortError") return; // foi substituída por uma busca mais nova
    console.error("Erro ao buscar filmes:", erro);
    mostrarMensagem(
      erro.status === 0 ? erro.message : "Não foi possível buscar os filmes",
    );
  }
}

// Debounce: a cada tecla reinicia a contagem; só pesquisa após a pausa
inputTitulo.addEventListener("input", () => {
  clearTimeout(timerBusca);

  const busca = inputTitulo.value.trim();
  if (!busca) {
    controladorBusca?.abort();
    limparResultados();
    return;
  }

  timerBusca = setTimeout(() => buscarFilmesTMDB(busca), TEMPO_ESPERA);
});

// Enter pesquisa na hora, sem esperar a pausa
formBusca.addEventListener("submit", (evento) => {
  evento.preventDefault();
  clearTimeout(timerBusca);

  const busca = inputTitulo.value.trim();
  if (busca) buscarFilmesTMDB(busca);
});

// ---------- Adicionar ----------

function definirSalvando(ativo) {
  salvando = ativo;
  botaoAdicionar.disabled = ativo;
  botaoAdicionar.classList.toggle("carregando", ativo);
  botaoAdicionar.textContent = ativo ? "Adicionando..." : "Adicionar";
  inputTitulo.disabled = ativo;
  cardSelecionado.classList.toggle("bloqueado", ativo);
}

function mensagemDeErro(erro, etapa) {
  if (erro.status === 0) return erro.message; // sem conexão

  if (etapa === "detalhes") {
    return erro.status === 404
      ? "Não encontramos os detalhes desse filme na TMDB."
      : "Não foi possível buscar os detalhes do filme. Tente novamente.";
  }

  return "Não foi possível salvar o filme. Tente novamente.";
}

async function adicionarFilmeSelecionado() {
  if (salvando) return;
  limparAviso();

  const filme = filmeSelecionado;

  if (!filme) {
    mostrarAviso("Selecione um filme para adicionar");
    return;
  }

  // Já está na lista carregada: evita requisições à toa
  if (idsSalvos.has(filme.id)) {
    mostrarJaSalvo(filme);
    return;
  }

  definirSalvando(true);
  let etapa = "detalhes";

  try {
    // 1. Detalhes completos na TMDB (já no formato que o banco espera)
    const dadosFilme = await requisitarJSON(
      `${API_URL}/tmdb/detalhes/${filme.id}`,
    );

    // 2. Salva no banco
    etapa = "salvar";
    const resultado = await requisitarJSON(`${API_URL}/adicionar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosFilme),
    });

    // 3. Abre a página do filme (o botão fica bloqueado até a navegação)
    const id = resultado.filme?.idfilme ?? filme.id;
    window.location.href = `movie.html?id=${id}`;
  } catch (erro) {
    console.error(`Erro ao adicionar filme (etapa: ${etapa}):`, erro);

    if (erro.status === 409) {
      idsSalvos.add(filme.id); // salvo por outra aba, por exemplo
      mostrarJaSalvo(filme);
    } else {
      mostrarAviso(mensagemDeErro(erro, etapa));
    }

    definirSalvando(false);
  }
}

botaoAdicionar.addEventListener("click", adicionarFilmeSelecionado);

// Voltou pelo botão "voltar" do navegador: recarrega para mostrar o filme novo
// e não reaparecer o popup travado em "Adicionando..."
window.addEventListener("pageshow", (evento) => {
  if (evento.persisted) window.location.reload();
});

// ---------- Destaque do trecho digitado ----------

function semAcento(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Cria o título com o trecho digitado em negrito (sem usar innerHTML)
function criarTituloDestacado(titulo, busca) {
  const span = document.createElement("span");
  span.className = "searchTitle";

  const tituloNorm = semAcento(titulo);
  const buscaNorm = semAcento(busca.trim());

  // Se a normalização mudar o tamanho do texto, os índices não batem: não destaca
  if (!buscaNorm || tituloNorm.length !== titulo.length) {
    span.textContent = titulo;
    return span;
  }

  // Tenta a busca inteira ("como t"); se não achar, destaca palavra por palavra
  const faixas = [];
  const inteiro = tituloNorm.indexOf(buscaNorm);

  if (inteiro !== -1) {
    faixas.push([inteiro, inteiro + buscaNorm.length]);
  } else {
    buscaNorm.split(/\s+/).forEach((palavra) => {
      const i = tituloNorm.indexOf(palavra);
      if (i !== -1) faixas.push([i, i + palavra.length]);
    });
    faixas.sort((a, b) => a[0] - b[0]);
  }

  let cursor = 0;
  faixas.forEach(([inicio, fim]) => {
    if (inicio < cursor) return; // faixa sobreposta a uma já destacada

    span.append(titulo.slice(cursor, inicio));
    const negrito = document.createElement("strong");
    negrito.textContent = titulo.slice(inicio, fim);
    span.append(negrito);
    cursor = fim;
  });
  span.append(titulo.slice(cursor));

  return span;
}

const API_URL = "http://localhost:3000/api/filmes";

// Todos os filmes carregados: é a fonte da verdade para montar as seções
let todosFilmes = [];
const favoritosEmAndamento = new Set(); // ids com PATCH em andamento

// ---------- Aviso de erro ----------

let timerToast = null;

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.hidden = false;

  clearTimeout(timerToast);
  timerToast = setTimeout(() => (toast.hidden = true), 3500);
}

// ---------- Favoritar ----------

function atualizarEstrela(estrela, favorito) {
  estrela
    .querySelector("use")
    .setAttribute("href", favorito ? "#star-fill" : "#star");
  estrela.setAttribute("aria-pressed", favorito);
  estrela.setAttribute(
    "aria-label",
    favorito ? "Remover dos favoritos" : "Adicionar aos favoritos",
  );
}

function animarEstrela(estrela) {
  estrela.classList.add("pop");
  estrela.addEventListener(
    "animationend",
    () => estrela.classList.remove("pop"),
    { once: true },
  );
}

// Aplica o valor no objeto, nas estrelas (o filme pode estar em 2 seções)
// e refaz a seção de favoritos: o filme entra ou sai dela
function aplicarFavorito(filme, favorito, animar = false) {
  filme.is_favorito = favorito;

  document
    .querySelectorAll(`.movieLink[data-id="${filme.idfilme}"] .starButton`)
    .forEach((estrela) => {
      atualizarEstrela(estrela, favorito);
      if (animar && favorito) animarEstrela(estrela);
    });

  sincronizarFavoritos(true);
}

async function alternarFavorito(evento, filme) {
  evento.preventDefault(); // não abre a página do filme
  evento.stopPropagation();

  if (favoritosEmAndamento.has(filme.idfilme)) return; // ignora cliques repetidos
  favoritosEmAndamento.add(filme.idfilme);

  const novoValor = !filme.is_favorito;
  aplicarFavorito(filme, novoValor, true); // atualiza a tela na hora

  try {
    await requisitarJSON(`${API_URL}/favorito/${filme.idfilme}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorito: novoValor }),
    });
  } catch (erro) {
    console.error("Erro ao atualizar favorito:", erro);
    aplicarFavorito(filme, !novoValor); // desfaz
    mostrarToast(
      erro.status === 0
        ? erro.message
        : "Não foi possível atualizar o favorito. Tente novamente.",
    );
  } finally {
    favoritosEmAndamento.delete(filme.idfilme);
  }
}

// ---------- Cards e seções ----------

// Monta o card de um filme
function criarCard(filme) {
  const link = document.createElement("a");
  link.href = `movie.html?id=${filme.idfilme}`;
  link.className = "movieLink";
  link.dataset.id = filme.idfilme;
  link.innerHTML = `
  <article class="movieCard">
    <div class="movieImageContainer">
      <img class="movieImage" />
      <svg class="icon buttons starButton" role="button" tabindex="0">
        <use href="#star" />
      </svg>
    </div>
    <div class="movieInfo">
      <h3></h3>
      <p class="subtitle"></p>
    </div>
  </article>`;

  // textContent/src/alt em vez de innerHTML, para não injetar HTML vindo do banco
  const img = link.querySelector(".movieImage");
  img.src = filme.capa || "";
  img.alt = `Capa do filme: ${filme.titulo}`;
  link.querySelector("h3").textContent = filme.titulo;
  link.querySelector(".subtitle").textContent = filme.duracao
    ? `${filme.duracao} min`
    : "Duração não informada";

  const estrela = link.querySelector(".starButton");
  atualizarEstrela(estrela, Boolean(filme.is_favorito));
  estrela.addEventListener("click", (evento) =>
    alternarFavorito(evento, filme),
  );
  estrela.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      alternarFavorito(evento, filme);
    }
  });

  return link;
}

// Preenche uma categoria e esconde a seção inteira se ela estiver vazia
function renderizarCategoria(filmes, idLista, idSecao) {
  const lista = document.getElementById(idLista);
  const secao = document.getElementById(idSecao);

  lista.replaceChildren(...filmes.map(criarCard));
  secao.style.display = filmes.length > 0 ? "" : "none";
}

// ---------- Animação das seções (técnica FLIP) ----------

const DURACAO_ANIMACAO = 450;
const SUAVIZACAO = "cubic-bezier(0.16, 1, 0.3, 1)";
// Cards e títulos das seções: tudo que precisa deslizar junto
const ALVOS_ANIMADOS = ".movieLink:not(.fantasma), main section > h2";
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

// Posição atual de cada card e título na tela
function capturarPosicoes() {
  const posicoes = new Map();
  document.querySelectorAll(ALVOS_ANIMADOS).forEach((el) => {
    posicoes.set(el, el.getBoundingClientRect());
  });
  return posicoes;
}

// Cada elemento volta visualmente para onde estava e desliza até onde ficou
function animarDeslizamento(antes) {
  antes.forEach((rectAntes, el) => {
    if (!el.isConnected) return;

    const rectDepois = el.getBoundingClientRect();
    if (!rectAntes.width || !rectDepois.width) return; // seção estava/ficou escondida

    const dx = rectAntes.left - rectDepois.left;
    const dy = rectAntes.top - rectDepois.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: DURACAO_ANIMACAO, easing: SUAVIZACAO },
    );
  });
}

function animarEntrada(card) {
  card.animate(
    [
      { opacity: 0, transform: "scale(0.85)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    { duration: DURACAO_ANIMACAO, easing: SUAVIZACAO },
  );
}

// O card já foi removido do DOM: uma cópia fixa na posição antiga some aos poucos
function animarSaida(card, rect) {
  if (!rect || !rect.width) return;

  const fantasma = card.cloneNode(true);
  fantasma.classList.add("fantasma");
  fantasma.removeAttribute("data-id");
  fantasma.removeAttribute("href");
  fantasma.setAttribute("aria-hidden", "true");
  Object.assign(fantasma.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  document.body.append(fantasma);

  const animacao = fantasma.animate(
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(0.85)" },
    ],
    { duration: DURACAO_ANIMACAO, easing: SUAVIZACAO, fill: "forwards" },
  );
  animacao.onfinish = () => fantasma.remove();
}

// Deixa a seção de favoritos igual ao estado de todosFilmes, animando a diferença
function sincronizarFavoritos(animar) {
  const lista = document.getElementById("listaFavoritos");
  const secao = document.getElementById("secaoFavoritos");

  const favoritos = todosFilmes.filter((f) => f.is_favorito);
  const idsFavoritos = new Set(favoritos.map((f) => String(f.idfilme)));

  // FIRST: onde está cada um agora (inclui deslizes em andamento, para continuar suave)
  const antes = capturarPosicoes();
  // Cancela deslizes em andamento: o layout real precisa ser medido sem transformações
  antes.forEach((_, el) => el.getAnimations().forEach((a) => a.cancel()));

  // 1. Remove quem deixou de ser favorito
  const cardsAtuais = new Map();
  const removidos = [];
  lista.querySelectorAll(".movieLink").forEach((card) => {
    if (idsFavoritos.has(card.dataset.id)) {
      cardsAtuais.set(card.dataset.id, card);
    } else {
      removidos.push({ card, rect: antes.get(card) });
      card.remove();
    }
  });

  // 2. Insere quem entrou, mantendo a ordem alfabética (percorre de trás para frente)
  const novos = [];
  let proximo = null;
  for (let i = favoritos.length - 1; i >= 0; i--) {
    const id = String(favoritos[i].idfilme);
    let card = cardsAtuais.get(id);

    if (!card) {
      card = criarCard(favoritos[i]);
      novos.push(card);
    }
    if (card.parentNode !== lista || card.nextElementSibling !== proximo) {
      lista.insertBefore(card, proximo);
    }
    proximo = card;
  }

  secao.style.display = favoritos.length > 0 ? "" : "none";

  if (!animar || reduzirMovimento.matches) return;

  // LAST / INVERT / PLAY
  animarDeslizamento(antes);
  novos.forEach(animarEntrada);
  removidos.forEach(({ card, rect }) => animarSaida(card, rect));
}

async function carregarFilmes() {
  try {
    const resposta = await fetch(`${API_URL}/listar`);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

    todosFilmes = await resposta.json();
    todosFilmes.forEach((filme) => idsSalvos.add(filme.idfilme));

    // Ordem alfabética: as seções herdam essa ordem ao filtrar
    todosFilmes.sort((a, b) => a.titulo.localeCompare(b.titulo));

    sincronizarFavoritos(false);
    renderizarCategoria(
      todosFilmes.filter((f) => !f.is_assistido),
      "listaNaoAssistidos",
      "secaoNaoAssistidos",
    );
    renderizarCategoria(
      todosFilmes.filter((f) => f.is_assistido),
      "listaAssistidos",
      "secaoAssistidos",
    );

    // Espera todas as capas, com limite de 8s para não travar
    await Promise.race([
      esperarImagens(),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);
  } catch (erro) {
    console.error("Não foi possível carregar os filmes:", erro);
    document.querySelector("main").textContent =
      "Não foi possível carregar os filmes.";
  } finally {
    esconderLoader(); // roda no sucesso e no erro
  }
}

carregarFilmes();
