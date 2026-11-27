# Mini Runner 3D

Videojuego arcade tridimensional de tres carriles pensado para ejecutarse directamente en el navegador sin procesos de compilación.

## Tecnologías utilizadas

- **HTML5** para la estructura de la página y las pantallas de interfaz.
- **CSS3** para la presentación visual, el marcador y los controles táctiles móviles.
- **JavaScript moderno (ES6 Modules)** mediante `<script type="module">`.
- **Three.js `0.170.0`** importado directamente desde la CDN de jsDelivr (`https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`).

No utiliza React, TypeScript, Vite, Node.js, bases de datos ni claves de API.

## Organización del proyecto

- `index.html`: página principal del juego. Carga únicamente `./css/style.css` y `./js/main.js`.
- `css/style.css`: estilos del lienzo 3D, el marcador, las pantallas de inicio/fin y los botones táctiles.
- `js/main.js`: punto de entrada y escucha de teclado.
- `js/config.js`: constantes de carriles, velocidades, puntuación y colores.
- `js/game.js`: escena 3D, cámara fija en tercera persona, iluminación sencilla, pista en movimiento y bucle de partida.
- `js/player.js`: vehículo futurista low-poly y transición suave entre carriles.
- `js/obstacles.js`: generación, desplazamiento y colisión de obstáculos rojos.
- `js/collectibles.js`: generación, animación y recogida de esferas de energía cian.
- `js/ui.js`: marcador, menús de inicio/fin y botones móviles.

## Archivos de la plantilla de AI Studio (no necesarios para el juego)

Los siguientes archivos pertenecen únicamente a la plantilla base del entorno de Google AI Studio y **no son necesarios** para ejecutar ni publicar el juego:

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `bun.lock`
- `metadata.json`
- `.env.example`
- Carpeta `src/` (`src/App.tsx`, `src/index.css`, `src/main.tsx`)

## Cómo se juega

- **En ordenador**: cambia de carril con las flechas **Izquierda / Derecha** o las teclas **A / D**. Pulsa **Jugar** (o `Enter` / `Espacio`) para empezar o reiniciar.
- **En dispositivos móviles**: utiliza los botones táctiles grandes (`◀` y `▶`) situados en la parte inferior de la pantalla.

Objetivo: esquiva los bloques rojos y recoge las esferas cian para sumar puntos. Al chocar con un obstáculo termina la partida y puedes reiniciar sin recargar la página.

## Publicación en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub (asegurándote de incluir `index.html`, `css/`, `js/` y `README.md`).
2. Entra en **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama **main** y la carpeta raíz **`/ (root)`**, y guarda los cambios.

Todas las rutas son relativas (`./css/style.css`, `./js/main.js`), por lo que funcionará directamente bajo `https://usuario.github.io/nombre-repositorio/`.

## Requisitos del navegador

- Navegador web moderno (Chrome, Firefox, Edge o Safari) con soporte para **WebGL** y **módulos ES6**.
- Conexión a internet la primera vez para descargar Three.js `0.170.0` desde jsDelivr.
