// Resolve quando a imagem carregou (ou falhou), para nunca travar o loader
function esperarImagem(img) {
  if (!img.getAttribute("src")) return Promise.resolve();
  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

function esperarImagens() {
  const imagens = document.querySelectorAll("main img");
  return Promise.all([...imagens].map(esperarImagem));
}

function esconderLoader() {
  const loader = document.getElementById("loader");
  document.body.classList.remove("loading");
  loader.classList.add("hidden");
  loader.addEventListener("transitionend", () => loader.remove(), {
    once: true,
  });
}
