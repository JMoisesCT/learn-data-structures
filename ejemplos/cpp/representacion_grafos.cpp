// Dos maneras de guardar el mismo grafo en memoria:
//
// - Matriz de adyacencia: una tabla de V × V. matriz[u][v] es 1 si hay una
//   arista de u a v y 0 si no. Responde "¿hay arista?" en O(1), pero ocupa
//   O(V²) aunque el grafo tenga pocas aristas, y para saber los vecinos de
//   un vértice hay que mirar su fila entera.
// - Lista de adyacencia: para cada vértice, un vector con sus vecinos.
//   Ocupa O(V + E) y tiene los vecinos a mano, pero "¿hay arista?" tiene
//   que buscar en la lista: O(grado).
//
// Las dos clases tienen las mismas operaciones y aceptan grafos no dirigidos
// (cada arista se anota en los dos sentidos) y dirigidos (solo de u a v).
// La biblioteca estándar no trae un tipo "grafo": se arma con std::vector.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra representacion_grafos.cpp -o representacion_grafos
//   ./representacion_grafos

#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <vector>

class GrafoMatriz {
public:
    // V × V ceros: ocupa O(V²) desde el principio, aunque no haya aristas.
    GrafoMatriz(int n, bool dirigido) : matriz(n, std::vector<int>(n, 0)), dirigido(dirigido) {}

    int cantidadVertices() const {
        return static_cast<int>(matriz.size());
    }

    // O(1): hayArista mira una sola casilla (sin aristas repetidas ni lazos).
    bool agregarArista(int u, int v) {
        if (hayArista(u, v) || u == v) {  // hayArista valida u y v
            return false;
        }
        matriz[u][v] = 1;
        if (!dirigido) {
            matriz[v][u] = 1;
        }
        return true;
    }

    // O(1): se apaga la casilla (y su espejo, si no es dirigido).
    bool eliminarArista(int u, int v) {
        if (!hayArista(u, v)) {  // hayArista valida u y v
            return false;
        }
        matriz[u][v] = 0;
        if (!dirigido) {
            matriz[v][u] = 0;
        }
        return true;
    }

    // O(1): se lee directo la casilla de la fila u, columna v.
    bool hayArista(int u, int v) const {
        validar(u);
        validar(v);
        return matriz[u][v] == 1;
    }

    // O(V): hay que mirar la fila entera, ceros incluidos.
    std::vector<int> vecinos(int u) const {
        validar(u);
        std::vector<int> resultado;
        for (int v = 0; v < cantidadVertices(); v++) {
            if (matriz[u][v] == 1) {
                resultado.push_back(v);
            }
        }
        return resultado;
    }

    void mostrar() const {
        for (const auto& fila : matriz) {
            std::cout << " ";
            for (int x : fila) {
                std::cout << " " << x;
            }
            std::cout << "\n";
        }
    }

private:
    std::vector<std::vector<int>> matriz;
    bool dirigido;

    void validar(int u) const {
        if (u < 0 || u >= cantidadVertices()) {
            throw std::out_of_range("vértice inválido");
        }
    }
};

class GrafoLista {
public:
    // V listas vacías: ocupa O(V) y crece con cada arista, O(V + E) en total.
    GrafoLista(int n, bool dirigido) : adyacentes(n), dirigido(dirigido) {}

    int cantidadVertices() const {
        return static_cast<int>(adyacentes.size());
    }

    // O(grado(u)): hayArista recorre la lista de u (sin aristas repetidas ni lazos).
    bool agregarArista(int u, int v) {
        if (hayArista(u, v) || u == v) {  // hayArista valida u y v
            return false;
        }
        adyacentes[u].push_back(v);
        if (!dirigido) {
            adyacentes[v].push_back(u);
        }
        return true;
    }

    // O(grado(u) + grado(v)): hay que encontrar cada número para borrarlo.
    bool eliminarArista(int u, int v) {
        if (!hayArista(u, v)) {  // hayArista valida u y v
            return false;
        }
        quitar(adyacentes[u], v);
        if (!dirigido) {
            quitar(adyacentes[v], u);
        }
        return true;
    }

    // O(grado(u)): std::find recorre la lista de u hasta encontrar a v.
    bool hayArista(int u, int v) const {
        validar(u);
        validar(v);
        return std::find(adyacentes[u].begin(), adyacentes[u].end(), v) != adyacentes[u].end();
    }

    // O(1): la lista ya tiene solo los vecinos; se devuelve sin copiarla.
    const std::vector<int>& vecinos(int u) const {
        validar(u);
        return adyacentes[u];
    }

    void mostrar() const {
        for (int u = 0; u < cantidadVertices(); u++) {
            std::cout << "  " << u << " ->";
            for (int v : adyacentes[u]) {
                std::cout << " " << v;
            }
            std::cout << "\n";
        }
    }

private:
    std::vector<std::vector<int>> adyacentes;
    bool dirigido;

    void validar(int u) const {
        if (u < 0 || u >= cantidadVertices()) {
            throw std::out_of_range("vértice inválido");
        }
    }

    // O(largo de la lista): busca x y lo borra; los de atrás se corren un lugar.
    static void quitar(std::vector<int>& lista, int x) {
        lista.erase(std::find(lista.begin(), lista.end(), x));
    }
};

void imprimir(const char* nombre, const std::vector<int>& valores) {
    std::cout << nombre << ":";
    for (int v : valores) {
        std::cout << " " << v;
    }
    std::cout << "\n";
}

int main() {
    // El grafo de la animación: 6 vértices y 7 aristas, guardado de las dos maneras.
    const int aristas[][2] = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 4}, {3, 5}, {4, 5}};
    GrafoMatriz matriz(6, false);
    GrafoLista lista(6, false);
    for (const auto& a : aristas) {
        matriz.agregarArista(a[0], a[1]);
        lista.agregarArista(a[0], a[1]);
    }
    std::cout << "Matriz de adyacencia (36 casillas, 14 unos):\n";
    matriz.mostrar();
    std::cout << "Lista de adyacencia (14 números):\n";
    lista.mostrar();

    std::cout << std::boolalpha;
    std::cout << "hayArista(1, 3): matriz " << matriz.hayArista(1, 3) << ", lista " << lista.hayArista(1, 3) << "\n";
    std::cout << "hayArista(0, 5): matriz " << matriz.hayArista(0, 5) << ", lista " << lista.hayArista(0, 5) << "\n";
    imprimir("vecinos(2) en la matriz", matriz.vecinos(2));
    imprimir("vecinos(2) en la lista ", lista.vecinos(2));
    std::cout << "agregarArista(1, 0) = " << lista.agregarArista(1, 0) << " (ya estaba)\n";
    std::cout << "agregarArista(3, 3) = " << matriz.agregarArista(3, 3) << " (lazo)\n";

    matriz.eliminarArista(1, 2);
    lista.eliminarArista(1, 2);
    imprimir("sin 1-2, vecinos(1) en la matriz", matriz.vecinos(1));
    imprimir("sin 1-2, vecinos(1) en la lista ", lista.vecinos(1));

    // Dirigido: cada arco va en un solo sentido y la matriz deja de ser simétrica.
    const int arcos[][2] = {{0, 1}, {0, 2}, {1, 3}, {2, 1}, {3, 5}, {4, 2}, {5, 4}};
    GrafoMatriz matrizDirigida(6, true);
    GrafoLista listaDirigida(6, true);
    for (const auto& a : arcos) {
        matrizDirigida.agregarArista(a[0], a[1]);
        listaDirigida.agregarArista(a[0], a[1]);
    }
    std::cout << "Dirigido, matriz:\n";
    matrizDirigida.mostrar();
    std::cout << "Dirigido, lista:\n";
    listaDirigida.mostrar();
    std::cout << "hayArista(2, 1) = " << matrizDirigida.hayArista(2, 1) << ", hayArista(1, 2) = " << matrizDirigida.hayArista(1, 2) << "\n";

    try {
        matriz.hayArista(0, 9);
    } catch (const std::out_of_range& e) {
        std::cout << "hayArista(0, 9) lanza out_of_range: " << e.what() << "\n";
    }
    return 0;
}
