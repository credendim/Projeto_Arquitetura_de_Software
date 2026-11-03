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
