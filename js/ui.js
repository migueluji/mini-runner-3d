/**
 * Gestiona el marcador, las pantallas de inicio/fin y los botones táctiles móviles.
 */
export function crearInterfaz({ alJugar, alReiniciar, alIzquierda, alDerecha }) {
  const valorPuntuacion = document.getElementById('valor-puntuacion');
  const puntuacionFinal = document.getElementById('puntuacion-final');
  const pantallaInicio = document.getElementById('pantalla-inicio');
  const pantallaFin = document.getElementById('pantalla-fin');
  const btnJugar = document.getElementById('btn-jugar');
  const btnReiniciar = document.getElementById('btn-reiniciar');
  const btnIzquierda = document.getElementById('btn-izquierda');
  const btnDerecha = document.getElementById('btn-derecha');

  // Marca el cuerpo del documento si el dispositivo soporta pantalla táctil
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('es-tactil');
  }

  btnJugar.addEventListener('click', alJugar);
  btnReiniciar.addEventListener('click', alReiniciar);

  // Enlaza los botones móviles evitando scroll o zoom accidental al pulsar
  function enlazarBotonTactil(boton, accion) {
    const manejar = (evento) => {
      evento.preventDefault();
      accion();
    };
    boton.addEventListener('pointerdown', manejar);
    boton.addEventListener('touchstart', (evento) => evento.preventDefault(), {
      passive: false,
    });
  }

  enlazarBotonTactil(btnIzquierda, alIzquierda);
  enlazarBotonTactil(btnDerecha, alDerecha);

  function actualizarPuntuacion(puntos) {
    valorPuntuacion.textContent = String(puntos);
  }

  function mostrarInicio() {
    pantallaInicio.classList.remove('oculto');
    pantallaFin.classList.add('oculto');
  }

  function mostrarJuego() {
    pantallaInicio.classList.add('oculto');
    pantallaFin.classList.add('oculto');
  }

  function mostrarFin(puntos) {
    puntuacionFinal.textContent = String(puntos);
    pantallaInicio.classList.add('oculto');
    pantallaFin.classList.remove('oculto');
  }

  return {
    actualizarPuntuacion,
    mostrarInicio,
    mostrarJuego,
    mostrarFin,
  };
}
