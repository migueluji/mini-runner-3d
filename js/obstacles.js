import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {
  CARRILES,
  Z_APARICION,
  Z_ELIMINACION,
  INTERVALO_OBSTACULOS,
  COLORES,
} from './config.js';

/**
 * Gestiona la aparición, movimiento y colisión de los obstáculos rojos.
 */
export function crearGestorObstaculos(escena) {
  const obstaculos = [];
  let temporizador = 0;

  // Geometrías y materiales compartidos entre todos los obstáculos
  const geomBase = new THREE.BoxGeometry(2.1, 0.35, 1.3);
  const geomBloque = new THREE.BoxGeometry(1.75, 1.15, 1.05);
  const geomFranja = new THREE.BoxGeometry(1.85, 0.2, 1.12);

  const matBase = new THREE.MeshStandardMaterial({
    color: COLORES.obstaculoBase,
    roughness: 0.7,
    metalness: 0.2,
  });
  const matBloque = new THREE.MeshStandardMaterial({
    color: COLORES.obstaculoBloque,
    emissive: 0x450a0a,
    roughness: 0.45,
    metalness: 0.25,
  });
  const matFranja = new THREE.MeshStandardMaterial({
    color: COLORES.obstaculoDetalle,
    emissive: 0xef4444,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });

  const cajaObstaculo = new THREE.Box3();

  function crearMallaObstaculo() {
    const grupo = new THREE.Group();

    const base = new THREE.Mesh(geomBase, matBase);
    base.position.y = 0.175;
    base.castShadow = true;
    base.receiveShadow = true;
    grupo.add(base);

    const bloque = new THREE.Mesh(geomBloque, matBloque);
    bloque.position.y = 0.92;
    bloque.castShadow = true;
    bloque.receiveShadow = true;
    grupo.add(bloque);

    const franja = new THREE.Mesh(geomFranja, matFranja);
    franja.position.y = 1.15;
    grupo.add(franja);

    return grupo;
  }

  function generarFila() {
    // Elegimos 1 o 2 carriles ocupados para garantizar siempre al menos 1 carril libre
    const indices = [0, 1, 2];
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const cantidad = Math.random() < 0.45 ? 2 : 1;
    for (let i = 0; i < cantidad; i += 1) {
      const carril = indices[i];
      const malla = crearMallaObstaculo();
      malla.position.set(CARRILES[carril], 0, Z_APARICION);
      escena.add(malla);
      obstaculos.push({ malla, carril });
    }
  }

  function actualizar(delta, velocidad) {
    temporizador += delta;
    if (temporizador >= INTERVALO_OBSTACULOS) {
      temporizador -= INTERVALO_OBSTACULOS;
      generarFila();
    }

    for (let i = obstaculos.length - 1; i >= 0; i -= 1) {
      const item = obstaculos[i];
      item.malla.position.z += velocidad * delta;

      if (item.malla.position.z > Z_ELIMINACION) {
        escena.remove(item.malla);
        obstaculos.splice(i, 1);
      }
    }
  }

  function comprobarColision(cajaJugador) {
    for (let i = 0; i < obstaculos.length; i += 1) {
      const malla = obstaculos[i].malla;
      // Filtro rápido en Z antes de calcular Box3
      if (Math.abs(malla.position.z) > 3.2) continue;

      cajaObstaculo.setFromObject(malla);
      cajaObstaculo.expandByScalar(-0.08);
      if (cajaJugador.intersectsBox(cajaObstaculo)) {
        return true;
      }
    }
    return false;
  }

  function obtenerCarrilesOcupadosCercaDe(zObjetivo, margenZ) {
    const ocupados = new Set();
    for (let i = 0; i < obstaculos.length; i += 1) {
      const item = obstaculos[i];
      if (Math.abs(item.malla.position.z - zObjetivo) <= margenZ) {
        ocupados.add(item.carril);
      }
    }
    return ocupados;
  }

  function reiniciar() {
    for (let i = 0; i < obstaculos.length; i += 1) {
      escena.remove(obstaculos[i].malla);
    }
    obstaculos.length = 0;
    temporizador = 0;
  }

  return {
    actualizar,
    comprobarColision,
    obtenerCarrilesOcupadosCercaDe,
    reiniciar,
  };
}
