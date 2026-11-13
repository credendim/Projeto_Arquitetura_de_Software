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

const modal = document.getElementById("movieModal");
const inputTitulo = document.getElementById("titulo");

function openAddMovieModal() {
  let choseMovie = randomMovie();
  inputTitulo.placeholder = `Ex: "${choseMovie}"`;
  modal.showModal();
}

function closeModal() {
  modal.close();
}

const API_URL = "http://localhost:3000/api/filmes";

// Monta o card de um filme (mesma estrutura HTML que você já tinha)
function criarCard(filme) {
  const card = document.createElement("article");
  card.className = "movieCard";
  card.innerHTML = `
    <div class="movieImageContainer">
      <img class="movieImage" />
      <svg class="icon buttons">
        <use href="#${filme.is_favorito ? "star-fill" : "star"}" />
      </svg>
    </div>
    <div class="movieInfo">
      <h3></h3>
      <p class="subtitle"></p>
    </div>
  `;

  // textContent/src/alt em vez de innerHTML, para não injetar HTML vindo do banco
  const img = card.querySelector(".movieImage");
  img.src = filme.capa || "";
  img.alt = `Capa do filme: ${filme.titulo}`;
  card.querySelector("h3").textContent = filme.titulo;
  card.querySelector(".subtitle").textContent = filme.duracao
    ? `${filme.duracao} min`
    : "Duração não informada";

  return card;
}

// Preenche uma categoria e esconde a seção inteira se ela estiver vazia
function renderizarCategoria(filmes, idLista, idSecao) {
  const lista = document.getElementById(idLista);
  const secao = document.getElementById(idSecao);

  lista.replaceChildren(...filmes.map(criarCard));
  secao.style.display = filmes.length > 0 ? "" : "none";
}

async function carregarFilmes() {
  try {
    const resposta = await fetch(`${API_URL}/listar`);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
    const filmes = await resposta.json();

    // Ordena todos os filmes em ordem alfabética pelo título antes de renderizar
    filmes.sort((a, b) => a.titulo.localeCompare(b.titulo));

    renderizarCategoria(
      filmes.filter((f) => f.is_favorito),
      "listaFavoritos",
      "secaoFavoritos",
    );

    renderizarCategoria(
      filmes.filter((f) => !f.is_assistido),
      "listaNaoAssistidos",
      "secaoNaoAssistidos",
    );
    renderizarCategoria(
      filmes.filter((f) => f.is_assistido),
      "listaAssistidos",
      "secaoAssistidos",
    );
  } catch (erro) {
    console.error("Não foi possível carregar os filmes:", erro);
  }
}

carregarFilmes();
