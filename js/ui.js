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
  const btnPantallaCompleta = document.getElementById('btn-pantalla-completa');
  const lienzo = document.getElementById('lienzo-3d');

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
      evento.stopPropagation();
      accion();
    };
    boton.addEventListener('pointerdown', manejar);
    boton.addEventListener('touchstart', (evento) => evento.preventDefault(), {
      passive: false,
    });
  }

  enlazarBotonTactil(btnIzquierda, alIzquierda);
  enlazarBotonTactil(btnDerecha, alDerecha);

  // Control táctil alternativo: tocar la mitad izquierda o derecha de la pantalla
  lienzo.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType !== 'touch') return;
    evento.preventDefault();
    if (evento.clientX < window.innerWidth / 2) {
      alIzquierda();
    } else {
      alDerecha();
    }
  });

  // Botón de pantalla completa con comprobación de soporte del navegador
  const raiz = document.documentElement;
  const soportaPantallaCompleta = Boolean(
    (document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
      (raiz.requestFullscreen || raiz.webkitRequestFullscreen)
  );

  if (!soportaPantallaCompleta) {
    btnPantallaCompleta.classList.add('oculto');
  } else {
    const actualizarEstadoPantallaCompleta = () => {
      const activa = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      btnPantallaCompleta.setAttribute('aria-pressed', String(activa));
      btnPantallaCompleta.setAttribute(
        'aria-label',
        activa ? 'Salir de pantalla completa' : 'Pantalla completa'
      );
    };

    btnPantallaCompleta.addEventListener('click', () => {
      const activa = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (activa) {
        const salir = document.exitFullscreen || document.webkitExitFullscreen;
        if (salir) Promise.resolve(salir.call(document)).catch(() => {});
      } else {
        const entrar = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
        if (entrar) Promise.resolve(entrar.call(raiz)).catch(() => {});
      }
    });

    document.addEventListener('fullscreenchange', actualizarEstadoPantallaCompleta);
    document.addEventListener('webkitfullscreenchange', actualizarEstadoPantallaCompleta);
    actualizarEstadoPantallaCompleta();
  }

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
