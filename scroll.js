const carrossel = document.getElementById("actorsList");

let targetScroll = carrossel.scrollLeft;
let isAnimating = false;

carrossel.addEventListener("wheel", function (evento) {
  evento.preventDefault();

  targetScroll += evento.deltaY;

  const maxScroll = carrossel.scrollWidth - carrossel.clientWidth;
  targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

  if (!isAnimating) {
    isAnimating = true;
    suavizarScroll();
  }
});

function suavizarScroll() {
  const distancia = targetScroll - carrossel.scrollLeft;

  if (Math.abs(distancia) < 1) {
    carrossel.scrollLeft = targetScroll;
    isAnimating = false;
    return;
  }

  carrossel.scrollLeft += distancia * 0.08;

  requestAnimationFrame(suavizarScroll);
}
