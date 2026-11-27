import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {
  CARRILES,
  Z_APARICION,
  Z_ELIMINACION,
  INTERVALO_ESFERAS,
  COLORES,
} from './config.js';

/**
 * Gestiona la aparición, animación y recogida de las esferas de energía cian.
 */
export function crearGestorEsferas(escena) {
  const esferas = [];
  let temporizador = 0;

  // Geometrías y materiales reutilizables
  const geomEsfera = new THREE.SphereGeometry(0.5, 16, 12);
  const geomAnillo = new THREE.TorusGeometry(0.68, 0.06, 8, 24);

  const matEsfera = new THREE.MeshStandardMaterial({
    color: COLORES.esferaCian,
    emissive: 0x0891b2,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.3,
  });
  const matAnillo = new THREE.MeshStandardMaterial({
    color: COLORES.esferaAnillo,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.6,
    roughness: 0.25,
  });

  const cajaEsfera = new THREE.Box3();

  function crearMallaEsfera() {
    const grupo = new THREE.Group();

    const nucleo = new THREE.Mesh(geomEsfera, matEsfera);
    nucleo.castShadow = true;
    grupo.add(nucleo);

    const anillo = new THREE.Mesh(geomAnillo, matAnillo);
    anillo.rotation.x = Math.PI / 3;
    grupo.add(anillo);

    return grupo;
  }

  function generarEsfera(gestorObstaculos) {
    const ocupados = gestorObstaculos.obtenerCarrilesOcupadosCercaDe(Z_APARICION, 8.5);
    const libres = [0, 1, 2].filter((carril) => !ocupados.has(carril));
    if (libres.length === 0) return;

    const carrilElegido = libres[Math.floor(Math.random() * libres.length)];
    const malla = crearMallaEsfera();
    malla.position.set(CARRILES[carrilElegido], 0.85, Z_APARICION);
    escena.add(malla);
    esferas.push({ malla, fase: Math.random() * Math.PI * 2 });
  }

  function actualizar(delta, velocidad, tiempo, gestorObstaculos) {
    temporizador += delta;
    if (temporizador >= INTERVALO_ESFERAS) {
      temporizador -= INTERVALO_ESFERAS;
      generarEsfera(gestorObstaculos);
    }

    for (let i = esferas.length - 1; i >= 0; i -= 1) {
      const item = esferas[i];
      item.malla.position.z += velocidad * delta;
      item.malla.position.y = 0.85 + Math.sin(tiempo * 4 + item.fase) * 0.14;
      item.malla.rotation.y += delta * 2.5;

      if (item.malla.position.z > Z_ELIMINACION) {
        escena.remove(item.malla);
        esferas.splice(i, 1);
      }
    }
  }

  function comprobarRecogida(cajaJugador) {
    let recogidas = 0;

    for (let i = esferas.length - 1; i >= 0; i -= 1) {
      const malla = esferas[i].malla;
      if (Math.abs(malla.position.z) > 3.0) continue;

      cajaEsfera.setFromObject(malla);
      cajaEsfera.expandByScalar(0.15);
      if (cajaJugador.intersectsBox(cajaEsfera)) {
        escena.remove(malla);
        esferas.splice(i, 1);
        recogidas += 1;
      }
    }

    return recogidas;
  }

  function reiniciar() {
    for (let i = 0; i < esferas.length; i += 1) {
      escena.remove(esferas[i].malla);
    }
    esferas.length = 0;
    temporizador = 0;
  }

  return {
    actualizar,
    comprobarRecogida,
    reiniciar,
  };
}
