import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {
  VELOCIDAD_BASE,
  VELOCIDAD_MAXIMA,
  INCREMENTO_VELOCIDAD,
  PUNTOS_ESFERA,
  COLORES,
} from './config.js';
import { crearJugador } from './player.js';
import { crearGestorObstaculos } from './obstacles.js';
import { crearGestorEsferas } from './collectibles.js';
import { crearInterfaz } from './ui.js';

/**
 * Detecta si WebGL se ejecuta por software para ajustar sombras y ritmo de dibujo.
 */
function detectarWebGLSoftware() {
  const lienzo = document.createElement('canvas');
  const gl = lienzo.getContext('webgl2');
  if (!gl) return true;

  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const parametro = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(parametro));
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

/**
 * Crea la pista de tres carriles con marcas y postes móviles para dar sensación de velocidad.
 */
function crearPistaMovil(escena) {
  // Suelo exterior amplio
  const sueloExterior = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshStandardMaterial({
      color: COLORES.sueloExterior,
      roughness: 0.95,
    })
  );
  sueloExterior.rotation.x = -Math.PI / 2;
  sueloExterior.position.set(0, -0.04, -35);
  sueloExterior.receiveShadow = true;
  escena.add(sueloExterior);

  // Calzada principal de tres carriles
  const pista = new THREE.Mesh(
    new THREE.BoxGeometry(10.6, 0.08, 140),
    new THREE.MeshStandardMaterial({
      color: COLORES.pista,
      roughness: 0.8,
      metalness: 0.1,
    })
  );
  pista.position.set(0, -0.04, -35);
  pista.receiveShadow = true;
  escena.add(pista);

  // Bordes laterales continuos
  const geomBorde = new THREE.BoxGeometry(0.3, 0.24, 140);
  const matBorde = new THREE.MeshStandardMaterial({
    color: COLORES.bordePista,
    roughness: 0.5,
    metalness: 0.3,
  });

  const bordeIzq = new THREE.Mesh(geomBorde, matBorde);
  bordeIzq.position.set(-5.3, 0.1, -35);
  escena.add(bordeIzq);

  const bordeDer = new THREE.Mesh(geomBorde, matBorde);
  bordeDer.position.set(5.3, 0.1, -35);
  escena.add(bordeDer);

  // Marcas discontinuas entre carriles y postes laterales que se desplazan hacia +Z
  const elementosMoviles = [];
  const separacion = 6;
  const cantidad = 18;
  const zInicio = -90;
  const zFin = zInicio + separacion * cantidad;

  const geomLinea = new THREE.BoxGeometry(0.14, 0.02, 2.4);
  const matLinea = new THREE.MeshStandardMaterial({
    color: COLORES.lineaCarril,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
  });

  const geomPoste = new THREE.BoxGeometry(0.28, 1.3, 0.28);
  const matPoste = new THREE.MeshStandardMaterial({
    color: COLORES.poste,
    roughness: 0.6,
  });
  const geomFoco = new THREE.BoxGeometry(0.32, 0.18, 0.32);
  const matFoco = new THREE.MeshStandardMaterial({
    color: COLORES.luzPoste,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.7,
  });

  for (let i = 0; i < cantidad; i += 1) {
    const z = zInicio + i * separacion;
    const fila = new THREE.Group();
    fila.position.z = z;

    // Separadores entre los tres carriles (-1.6 y +1.6)
    const lineaIzq = new THREE.Mesh(geomLinea, matLinea);
    lineaIzq.position.set(-1.6, 0.015, 0);
    fila.add(lineaIzq);

    const lineaDer = new THREE.Mesh(geomLinea, matLinea);
    lineaDer.position.set(1.6, 0.015, 0);
    fila.add(lineaDer);

    // Postes laterales de referencia visual
    const posteIzq = new THREE.Mesh(geomPoste, matPoste);
    posteIzq.position.set(-6.1, 0.65, 0);
    fila.add(posteIzq);

    const focoIzq = new THREE.Mesh(geomFoco, matFoco);
    focoIzq.position.set(-6.1, 1.35, 0);
    fila.add(focoIzq);

    const posteDer = new THREE.Mesh(geomPoste, matPoste);
    posteDer.position.set(6.1, 0.65, 0);
    fila.add(posteDer);

    const focoDer = new THREE.Mesh(geomFoco, matFoco);
    focoDer.position.set(6.1, 1.35, 0);
    fila.add(focoDer);

    escena.add(fila);
    elementosMoviles.push(fila);
  }

  function actualizar(delta, velocidad) {
    const desplazamiento = velocidad * delta;
    const longitudTotal = zFin - zInicio;

    for (let i = 0; i < elementosMoviles.length; i += 1) {
      const fila = elementosMoviles[i];
      fila.position.z += desplazamiento;
      if (fila.position.z > zFin) {
        fila.position.z -= longitudTotal;
      }
    }
  }

  return { actualizar };
}

/**
 * Pausa entre fotogramas cuando se renderiza con WebGL por software.
 */
function esperarFinDibujo(renderizador, continuar) {
  const gl = renderizador.getContext();
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();

  const comprobar = () => {
    const estado = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (estado === gl.UNSIGNALED) {
      window.setTimeout(comprobar, 5);
    } else {
      gl.deleteSync(sync);
      window.setTimeout(continuar, 80);
    }
  };
  window.setTimeout(comprobar, 5);
}

/**
 * Inicializa y coordina todo el ciclo de vida del videojuego Mini Runner 3D.
 */
export function crearJuego(contenedor) {
  const esSoftwareGl = detectarWebGLSoftware();

  // Escena y niebla en el horizonte
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(COLORES.cielo);
  escena.fog = new THREE.Fog(COLORES.cielo, 30, 88);

  // Cámara fija en tercera persona detrás y ligeramente por encima del vehículo
  const anchoInicial = contenedor.clientWidth || window.innerWidth;
  const altoInicial = contenedor.clientHeight || window.innerHeight;
  const camara = new THREE.PerspectiveCamera(58, anchoInicial / altoInicial, 0.1, 130);
  camara.position.set(0, 4.3, 7.6);
  camara.lookAt(0, 0.85, -10);

  // Renderizador WebGL
  const renderizador = new THREE.WebGLRenderer({
    antialias: !esSoftwareGl,
    powerPreference: 'high-performance',
  });
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.setPixelRatio(esSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderizador.setSize(anchoInicial, altoInicial);
  renderizador.shadowMap.enabled = !esSoftwareGl;
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
  contenedor.appendChild(renderizador.domElement);

  // Iluminación sencilla: luz ambiental y una luz direccional
  const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.75);
  escena.add(luzAmbiental);

  const luzDireccional = new THREE.DirectionalLight(0xfff5e4, 1.45);
  luzDireccional.position.set(8, 16, 10);
  luzDireccional.castShadow = !esSoftwareGl;
  luzDireccional.shadow.mapSize.width = 1024;
  luzDireccional.shadow.mapSize.height = 1024;
  luzDireccional.shadow.camera.near = 1;
  luzDireccional.shadow.camera.far = 45;
  luzDireccional.shadow.camera.left = -12;
  luzDireccional.shadow.camera.right = 12;
  luzDireccional.shadow.camera.top = 12;
  luzDireccional.shadow.camera.bottom = -12;
  escena.add(luzDireccional);

  // Módulos del mundo y entidades
  const pista = crearPistaMovil(escena);
  const jugador = crearJugador(escena);
  const gestorObstaculos = crearGestorObstaculos(escena);
  const gestorEsferas = crearGestorEsferas(escena);

  let estado = 'inicio'; // 'inicio' | 'jugando' | 'fin'
  let puntuacion = 0;
  let velocidad = VELOCIDAD_BASE;

  function iniciarPartida() {
    puntuacion = 0;
    velocidad = VELOCIDAD_BASE;
    jugador.reiniciar();
    gestorObstaculos.reiniciar();
    gestorEsferas.reiniciar();
    interfaz.actualizarPuntuacion(0);
    interfaz.mostrarJuego();
    estado = 'jugando';
  }

  function moverIzquierda() {
    if (estado === 'jugando') {
      jugador.moverIzquierda();
    }
  }

  function moverDerecha() {
    if (estado === 'jugando') {
      jugador.moverDerecha();
    }
  }

  const interfaz = crearInterfaz({
    alJugar: iniciarPartida,
    alReiniciar: iniciarPartida,
    alIzquierda: moverIzquierda,
    alDerecha: moverDerecha,
  });

  interfaz.mostrarInicio();

  // Ajuste automático al redimensionar la ventana
  function alRedimensionar() {
    const ancho = contenedor.clientWidth || window.innerWidth;
    const alto = contenedor.clientHeight || window.innerHeight;
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
    renderizador.setSize(ancho, alto);
  }
  window.addEventListener('resize', alRedimensionar);

  const reloj = new THREE.Clock();

  function actualizarCamara(delta) {
    const xJugador = jugador.obtenerPosicionX();
    camara.position.x = THREE.MathUtils.damp(camara.position.x, xJugador * 0.45, 7, delta);
    camara.lookAt(xJugador * 0.25, 0.85, -10);
  }

  function buclePrincipal() {
    const delta = Math.min(reloj.getDelta(), 0.1);
    const tiempo = reloj.getElapsedTime();

    if (estado === 'inicio') {
      // Movimiento suave de la pista en la pantalla inicial
      pista.actualizar(delta, VELOCIDAD_BASE * 0.5);
      jugador.actualizar(delta, tiempo);
      actualizarCamara(delta);
    } else if (estado === 'jugando') {
      velocidad = Math.min(VELOCIDAD_MAXIMA, velocidad + INCREMENTO_VELOCIDAD * delta);

      pista.actualizar(delta, velocidad);
      jugador.actualizar(delta, tiempo);
      gestorObstaculos.actualizar(delta, velocidad);
      gestorEsferas.actualizar(delta, velocidad, tiempo, gestorObstaculos);

      const cajaJugador = jugador.obtenerCaja();
      const recogidas = gestorEsferas.comprobarRecogida(cajaJugador);
      if (recogidas > 0) {
        puntuacion += recogidas * PUNTOS_ESFERA;
        interfaz.actualizarPuntuacion(puntuacion);
      }

      if (gestorObstaculos.comprobarColision(cajaJugador)) {
        estado = 'fin';
        interfaz.mostrarFin(puntuacion);
      }

      actualizarCamara(delta);
    }

    renderizador.render(escena, camara);

    if (esSoftwareGl) {
      esperarFinDibujo(renderizador, buclePrincipal);
    } else {
      window.requestAnimationFrame(buclePrincipal);
    }
  }

  buclePrincipal();

  return {
    iniciarPartida,
    moverIzquierda,
    moverDerecha,
    obtenerEstado: () => estado,
  };
}
