import { crearJuego } from './game.js';

// Inicializa el juego dentro del contenedor principal
const contenedor = document.getElementById('lienzo-3d');
const juego = crearJuego(contenedor);

// Controles de teclado para escritorio
window.addEventListener('keydown', (evento) => {
  if (evento.repeat) return;

  const tecla = evento.key;

  if (tecla === 'ArrowLeft' || tecla === 'a' || tecla === 'A') {
    juego.moverIzquierda();
  } else if (tecla === 'ArrowRight' || tecla === 'd' || tecla === 'D') {
    juego.moverDerecha();
  } else if (tecla === 'Enter' || tecla === ' ') {
    if (juego.obtenerEstado() !== 'jugando') {
      evento.preventDefault();
      juego.iniciarPartida();
    }
  }
});
