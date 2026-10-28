# Inspiración para el rediseño visual

El dueño del repositorio pidió que el sitio tenga **un formato más interesante, como las páginas de
programación que tienen animaciones**. Estas son las referencias propuestas y qué tomar de cada una.

> Estado: el dueño señaló como referencia principal su otro proyecto,
> [learn-program-animation](https://github.com/JMoisesCT/learn-program-animation) (estilo inspirado en
> Brilliant: pasos cortos, mucho espacio en blanco, tarjetas, feedback inmediato). Las referencias de
> abajo quedan como ideas complementarias.

## Referencias

| Sitio | Qué es | Qué podemos tomar |
| --- | --- | --- |
| [VisuAlgo](https://visualgo.net/es) | Visualizaciones de estructuras y algoritmos de la Universidad Nacional de Singapur (tiene versión en español). | Lienzo grande a pantalla completa, panel de pseudocódigo con la línea actual, modo "e-Lecture" con diapositivas que guían al estudiante. |
| [Hello Algo](https://www.hello-algo.com/en/) | Libro abierto de estructuras de datos con animaciones y código en muchos lenguajes. | Formato de libro con índice lateral, **pestañas para cambiar de lenguaje** (C++, Python, Java…) en cada bloque de código, animaciones como secuencia de pasos numerados. |
| [Sam Rose — samwho.dev](https://samwho.dev/) | Artículos interactivos sobre temas de programación (hashing, balanceo de carga, memoria). | Muchos widgets pequeños **dentro del texto**, colores consistentes por concepto, tono cercano. |
| [Bartosz Ciechanowski](https://ciechanow.ski/) | Ensayos interactivos muy visuales. | Cada párrafo acompañado de un diagrama que se manipula con un deslizador; explicaciones que crecen paso a paso al hacer scroll. |
| [Red Blob Games](https://www.redblobgames.com/) | Explicaciones interactivas de algoritmos (A*, BFS, grillas hexagonales). | Diagramas que se pueden arrastrar, texto y animación intercalados, ideal para el futuro tema de grafos. |
| [Josh W. Comeau](https://www.joshwcomeau.com/) | Blog de desarrollo web con mucha interactividad. | Tipografía y espaciado modernos, notas laterales ("sidenotes"), microanimaciones en botones y tarjetas. |
| [Visualizaciones de USFCA (David Galles)](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html) | Colección clásica de animaciones de estructuras de datos. | Catálogo amplio de temas como referencia de qué operaciones animar. |
| [Algorithm Visualizer](https://algorithm-visualizer.org/) | Código, visualización y registro de pasos lado a lado. | Disposición en tres paneles: código / animación / bitácora de lo que pasó. |
| [Python Tutor (C++)](https://pythontutor.com/cpp.html) | Ejecuta código paso a paso mostrando la memoria. | Dibujo de la pila de llamadas y del heap de memoria con flechas para punteros. |
| [Brilliant](https://brilliant.org/) | Lecciones interactivas de matemáticas y computación. | Lecciones cortas con **preguntas entre pasos** ("¿qué pasará ahora?") y progreso visible. |

## Direcciones posibles

1. **Libro interactivo** (Hello Algo + Josh Comeau): índice lateral con todos los temas, capítulos con
   tipografía cuidada, pestañas de lenguaje en el código, animación integrada en el capítulo.
2. **Ensayo explorable** (samwho + Ciechanowski + Red Blob Games): la explicación se lee de arriba
   abajo y cada idea tiene su mini-animación al lado; la animación completa queda al final como
   "zona de práctica".
3. **Laboratorio** (VisuAlgo + Algorithm Visualizer): la animación ocupa casi toda la pantalla, con
   paneles de código y bitácora, y un modo guiado tipo diapositivas.

Recomendación: combinar **1 y 2**: estructura de libro (índice, capítulos, pestañas de lenguaje,
que además prepara el terreno para mostrar ejemplos en otros lenguajes) con mini-animaciones dentro
del texto. El motor actual (`DS.tema`) ya permite varios visualizadores por página, así que el
cambio es sobre todo de CSS y de estructura de las páginas.
