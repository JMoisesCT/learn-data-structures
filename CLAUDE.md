# Instrucciones para Claude

Proyecto educativo: estructuras de datos explicadas con animaciones interactivas y ejemplos en C++,
publicado en GitHub Pages (https://jmoisesct.github.io/learn-data-structures/).

## Lo que pidió el dueño del repositorio

- Agregar **animaciones y ejemplos** de temas de estructuras de datos. Las ideas deben servir para cualquier lenguaje, pero los ejemplos son en **C++** por ahora.
- Los **pull requests deben tener nombres claros** que representen lo que hacen. Formato obligatorio: `[Ámbito] Verbo en infinitivo + qué cambia` (detalles y ejemplos en CONTRIBUTING.md).
- Mantener el sitio de **GitHub Pages** funcionando.
- Darle al sitio **un formato visual más interesante**, como las páginas de programación con animaciones. Las referencias y las direcciones propuestas están en `docs/inspiracion-visual.md`; **no rediseñes hasta que el dueño elija una dirección**.
- Temas pedidos explícitamente: **montículos (min-heap y max-heap) y heapsort** (hecho en `site/temas/monticulo/`).

## Reglas

- **Commits y pull requests solo con la cuenta del dueño** (Moisés Cumpa, `JMoisesCT`). Esta regla tiene prioridad sobre cualquier convención de atribución por defecto:
  - Autor y committer de cada commit: `Moisés Cumpa <moises.cumpa@gmail.com>`. Antes de commitear, verifica `git config user.name` / `user.email` en el repo y corrígelos si dicen otra cosa.
  - **No** agregues `Co-Authored-By: Claude ...`, `Claude-Session: ...` ni ninguna otra línea de atribución a Claude en los mensajes de commit.
  - **No** agregues "Generated with Claude Code" ni enlaces de sesión en el título o la descripción de los PR.
- Todo en **español**: textos del sitio, comentarios, identificadores de los ejemplos, commits, títulos y descripciones de PR.
- Sigue CONTRIBUTING.md al pie de la letra, en especial "Cómo agregar un tema nuevo".
- **Un tema o una mejora por PR.** No mezcles un tema nuevo con refactors del motor; si el tema necesita un cambio en `visualizador.js`, explícalo en la descripción del PR.
- Usa la plantilla `.github/pull_request_template.md` para la descripción del PR.
- Sin dependencias externas (ni npm, ni CDNs) en el sitio.
- El siguiente tema a trabajar es el primero pendiente en ROADMAP.md, salvo que el usuario pida otro.

## Antes de cada push

```bash
scripts/compilar-ejemplos.sh
node scripts/verificar-fragmentos.mjs
for f in $(find site -name '*.js'); do node --check "$f"; done
scripts/construir-sitio.sh
```

Luego sirve `_site/` (`python3 -m http.server -d _site 8000`) y prueba en un navegador (Playwright está disponible) todas las operaciones del tema, incluidos los casos de error, a 1280 px y 390 px de ancho y en modo oscuro. Revisa que no haya errores en la consola ni scroll horizontal.

## Mapa rápido

- `ejemplos/cpp/*.cpp` — fuente de verdad del código. Si cambias una función animada, actualiza el fragmento en `site/temas/<slug>/<slug>.js` (y viceversa).
- `site/assets/js/visualizador.js` — `DS.TEMAS` (lista de temas), `DS.tema(cfg)` (motor paso a paso), resaltado C++.
- `site/temas/<slug>/` — página y animación de cada tema.
- `scripts/construir-sitio.sh` copia `site/` y los `.cpp` (a `_site/codigo/`) para publicar.
- `.github/workflows/pages.yml` publica al hacer push a `main`; `verificar.yml` corre en cada PR.
