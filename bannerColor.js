const fac = new FastAverageColor();
const posterImg = document.getElementById("moviePoster");
const bannerHeader = document.getElementById("bannerColor");
const bannerTitle = document.getElementById("movieTitle");

// 1. Criamos uma função separada para extrair e aplicar a cor
function extrairCor() {
  fac
    .getColorAsync(posterImg)
    .then((color) => {
      bannerHeader.style.backgroundColor = color.rgba;
      bannerTitle.style.color = color.isDark ? "#AAAAAA" : "#000000";
    })
    .catch((e) => {
      console.error("Erro ao extrair cor:", e);
    });
}

// 2. Verificamos o status da imagem
if (posterImg.complete) {
  // Se a imagem já carregou (está no cache, por exemplo), executa direto
  extrairCor();
} else {
  // Se ainda está baixando, aguarda o evento onload
  posterImg.onload = extrairCor;
}
