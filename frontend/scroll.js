const carrossel = document.getElementById("actorsList");
const rightGradient = document.querySelector(".rightGradient");

let targetScroll = carrossel.scrollLeft;
let isAnimating = false;

// 1. O EVENTO DO MOUSE (WHEEL)
carrossel.addEventListener("wheel", function (evento) {
  evento.preventDefault();

  // Atualiza o destino do scroll
  targetScroll += evento.deltaY;

  // Recalcula o limite máximo em tempo real (previne bugs se a tela for redimensionada)
  const maxScroll = carrossel.scrollWidth - carrossel.clientWidth;

  // Trava o destino rigidamente entre 0 e o final
  targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

  // Inicia a animação se estiver parada
  if (!isAnimating) {
    isAnimating = true;
    suavizarScroll();
  }
});

// 2. A ANIMAÇÃO (LOOP)
function suavizarScroll() {
  const maxScroll = carrossel.scrollWidth - carrossel.clientWidth;
  const distancia = targetScroll - carrossel.scrollLeft;

  // Se a distância for menor que 1 pixel (chegou no destino)
  if (Math.abs(distancia) < 1) {
    carrossel.scrollLeft = targetScroll; // Crava o valor exato
    isAnimating = false; // Para a animação
    verificarNevoa(); // Força a checagem da névoa no frame exato em que para
    return;
  }

  // Continua deslizando
  carrossel.scrollLeft += distancia * 0.08;
  requestAnimationFrame(suavizarScroll);
}

// 3. A LÓGICA DA NÉVOA ISOLADA
function verificarNevoa() {
  const maxScroll = carrossel.scrollWidth - carrossel.clientWidth;
  if (maxScroll <= 0) return;

  // Em vez de porcentagem, checamos se faltam 15 pixels ou menos para o fim.
  // Isso ignora qualquer bug de subpixel do navegador ou movimentos bruscos.
  if (carrossel.scrollLeft >= maxScroll - 15) {
    rightGradient.classList.add("escondida");
  } else {
    rightGradient.classList.remove("escondida");
  }
}

// 4. EVENTO SCROLL NATIVO (Garante que funciona no celular ou se arrastar a barra)
carrossel.addEventListener("scroll", verificarNevoa);
