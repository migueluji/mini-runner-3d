import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {
  CARRILES,
  CARRIL_INICIAL,
  SUAVIZADO_CARRIL,
  COLORES,
} from './config.js';

/**
 * Crea el vehículo futurista del jugador y gestiona su movimiento entre carriles.
 */
export function crearJugador(escena) {
  const grupo = new THREE.Group();

  // Materiales low-poly reutilizables del vehículo
  const matCuerpo = new THREE.MeshStandardMaterial({
    color: COLORES.vehiculoCuerpo,
    roughness: 0.35,
    metalness: 0.45,
  });
  const matCabina = new THREE.MeshStandardMaterial({
    color: COLORES.vehiculoCabina,
    roughness: 0.15,
    metalness: 0.8,
  });
  const matAla = new THREE.MeshStandardMaterial({
    color: COLORES.vehiculoAla,
    roughness: 0.45,
    metalness: 0.3,
  });
  const matMotor = new THREE.MeshStandardMaterial({
    color: COLORES.vehiculoMotor,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  // Fuselaje central
  const fuselaje = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 2.1), matCuerpo);
  fuselaje.position.set(0, 0.32, 0);
  fuselaje.castShadow = true;
  grupo.add(fuselaje);

  // Morro delantero afilado apuntando hacia -Z
  const morro = new THREE.Mesh(new THREE.ConeGeometry(0.56, 1.05, 4), matCuerpo);
  morro.rotation.x = -Math.PI / 2;
  morro.rotation.z = Math.PI / 4;
  morro.position.set(0, 0.3, -1.52);
  morro.castShadow = true;
  grupo.add(morro);

  // Cabina oscura superior
  const cabina = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.34, 1.0), matCabina);
  cabina.position.set(0, 0.62, -0.15);
  cabina.castShadow = true;
  grupo.add(cabina);

  // Alas laterales
  const alaIzquierda = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 1.2), matAla);
  alaIzquierda.position.set(-0.82, 0.28, 0.25);
  alaIzquierda.rotation.z = 0.12;
  alaIzquierda.castShadow = true;
  grupo.add(alaIzquierda);

  const alaDerecha = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 1.2), matAla);
  alaDerecha.position.set(0.82, 0.28, 0.25);
  alaDerecha.rotation.z = -0.12;
  alaDerecha.castShadow = true;
  grupo.add(alaDerecha);

  // Propulsores traseros luminosos
  const geomPropulsor = new THREE.CylinderGeometry(0.16, 0.2, 0.3, 8);
  const propulsorIzq = new THREE.Mesh(geomPropulsor, matMotor);
  propulsorIzq.rotation.x = Math.PI / 2;
  propulsorIzq.position.set(-0.32, 0.3, 1.12);
  grupo.add(propulsorIzq);

  const propulsorDer = new THREE.Mesh(geomPropulsor, matMotor);
  propulsorDer.rotation.x = Math.PI / 2;
  propulsorDer.position.set(0.32, 0.3, 1.12);
  grupo.add(propulsorDer);

  escena.add(grupo);

  let carrilObjetivo = CARRIL_INICIAL;
  const cajaColision = new THREE.Box3();

  function reiniciar() {
    carrilObjetivo = CARRIL_INICIAL;
    grupo.position.set(CARRILES[CARRIL_INICIAL], 0.18, 0);
    grupo.rotation.set(0, 0, 0);
  }

  function moverIzquierda() {
    if (carrilObjetivo > 0) {
      carrilObjetivo -= 1;
    }
  }

  function moverDerecha() {
    if (carrilObjetivo < CARRILES.length - 1) {
      carrilObjetivo += 1;
    }
  }

  function actualizar(delta, tiempo) {
    const xDestino = CARRILES[carrilObjetivo];
    grupo.position.x = THREE.MathUtils.damp(
      grupo.position.x,
      xDestino,
      SUAVIZADO_CARRIL,
      delta
    );

    // Flotación suave e inclinación al cambiar de carril
    grupo.position.y = 0.18 + Math.sin(tiempo * 6) * 0.04;
    const diferenciaX = xDestino - grupo.position.x;
    grupo.rotation.z = THREE.MathUtils.clamp(-diferenciaX * 0.16, -0.32, 0.32);
  }

  function obtenerCaja() {
    cajaColision.setFromObject(grupo);
    // Margen ligeramente más justo para que rozar un borde no sea injusto
    cajaColision.expandByScalar(-0.14);
    return cajaColision;
  }

  function obtenerPosicionX() {
    return grupo.position.x;
  }

  reiniciar();

  return {
    grupo,
    reiniciar,
    moverIzquierda,
    moverDerecha,
    actualizar,
    obtenerCaja,
    obtenerPosicionX,
  };
}
