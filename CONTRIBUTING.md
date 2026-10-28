# Cómo contribuir

Todo el contenido (textos, comentarios, identificadores del código de ejemplo y nombres de PR) va **en español**.

## Flujo de trabajo

1. Crea una rama desde `main` con un nombre descriptivo (ver abajo). **No hagas push directo a `main`.**
2. Haz cambios pequeños y enfocados: **un tema o una mejora por pull request**.
3. Antes de abrir el PR, ejecuta las verificaciones locales (ver abajo).
4. Abre el PR contra `main` usando la plantilla.
5. Cuando el CI (`Verificar ejemplos`) quede en verde, **haz el merge de inmediato** (método *rebase*, para que `main` conserve los commits tal cual, sin commit de merge).
6. GitHub Pages publica `main` en uno o dos minutos.

## Nombres de pull requests

El título debe decir **qué cambia** sin tener que abrir el PR:

```
[Ámbito] Verbo en infinitivo + qué cambia
```

- **Ámbito**: el tema (`Pila`, `Cola`, `Árbol binario de búsqueda`…) o el área: `Sitio`, `Motor`, `CI`, `Docs`.
- **Verbo**: `Agregar`, `Corregir`, `Mejorar`, `Explicar`, `Refactorizar`, `Eliminar`.
- Máximo ~70 caracteres. Sin punto final.

Ejemplos:

| ✅ Claro | ❌ Poco claro |
| --- | --- |
| `[Árbol binario de búsqueda] Agregar animación de insertar y buscar con ejemplo en C++` | `Nuevo tema` |
| `[Pila] Corregir mensaje al desapilar una pila vacía` | `fix` |
| `[Motor] Agregar control de velocidad por teclado` | `Cambios varios` |
| `[Sitio] Publicar desde la raíz de main en GitHub Pages` | `Update index.html` |
| `[Docs] Explicar cómo agregar un tema nuevo` | `docs` |

La descripción sigue [la plantilla](.github/pull_request_template.md): qué hace, lista de cambios y checklist.

## Ramas y commits

- Ramas con nombre práctico: `tema/<slug>` para temas nuevos (`tema/arbol-binario-busqueda`), `mejora/<descripcion>`, `arreglo/<descripcion>`, `docs/<descripcion>`. **Nunca** ramas con nombres aleatorios (como las `claude/...` que crean las sesiones).
- Commits en español, en infinitivo y con el ámbito en minúsculas: `pila: corregir mensaje de pila vacía`, `sitio: agregar modo oscuro`.
- Los commits y pull requests van **solo a nombre de la cuenta del dueño** (`JMoisesCT`): sin líneas `Co-Authored-By`, sin firmas de herramientas ni "Generated with…" en commits o descripciones de PR.

## Verificaciones locales

```bash
scripts/compilar-ejemplos.sh          # compila con -Wall -Wextra -Werror y sanitizadores, y ejecuta
node scripts/verificar-fragmentos.mjs # el código de las animaciones coincide con los .cpp
python3 -m http.server 8000           # desde la raíz: revisar en el navegador
```

Prueba cada operación de la animación, incluidos los casos de error (estructura vacía, llena, posición inválida), en pantalla ancha y en móvil (~390 px), en modo claro y oscuro.

## Cómo agregar un tema nuevo

Usa un tema existente como plantilla (`pila` es el más simple; `lista-enlazada` muestra cómo animar movimientos).

1. **Código C++** — `ejemplos/cpp/<nombre>.cpp`
   - Programa completo con `main()` que demuestre cada operación e imprima resultados.
   - C++17, sin dependencias externas, sin advertencias con `-Wall -Wextra -Wpedantic`.
   - Identificadores y comentarios en español; menciona el equivalente de la STL (`std::stack`, `std::map`…).
   - Cada operación con un comentario de complejidad (`// O(1): ...`).
   - Sin fugas de memoria (el CI usa AddressSanitizer).
2. **Animación** — `temas/<slug>/<slug>.js`
   - Llama a `DS.tema({...})` (la API está documentada al inicio de la sección "Visualizador" en `assets/js/visualizador.js`).
   - `codigo`: copia **exacta** de cada función del `.cpp` que se anima (la sangría no importa). `verificar-fragmentos.mjs` falla si no coinciden.
   - `ejecutar(s, args, paso)`: modifica el estado `s` como lo haría el C++ y llama a `paso(clave, linea, mensaje, tipo)` después de cada línea relevante. Las líneas empiezan en 1, contadas dentro del fragmento.
   - Muestra también los casos de error (`tipo = "error"`) en la línea del `throw` o del `return` correspondiente.
   - Mensajes cortos que expliquen **por qué**, no solo qué.
   - No toques el DOM fuera de `dibujar()` (el verificador ejecuta el archivo sin navegador).
3. **Página** — `temas/<slug>/index.html`
   - Copia la estructura de otro tema: idea + analogía, animación, nota, complejidad, cuándo usarlo, código completo (`data-codigo-completo="<nombre>.cpp"`), ejercicios.
4. **Registro** — agrega el tema en `DS.TEMAS` (`assets/js/visualizador.js`); si estaba como `proximamente`, quita esa marca. Eso actualiza menú, portada y enlaces anterior/siguiente.
5. **Docs** — agrega la fila en la tabla de `README.md` y marca el tema como hecho en `ROADMAP.md`.

## Estilo del sitio

- Sin frameworks ni dependencias externas: HTML, CSS y JS simples que funcionen en GitHub Pages.
- Colores solo mediante variables de `:root` en `estilos.css` (cada una con su versión oscura).
- Nada debe causar scroll horizontal de la página en móvil; si una animación es ancha, el escenario hace scroll por dentro.
