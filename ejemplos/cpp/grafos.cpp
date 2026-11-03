// Grafo no dirigido guardado como lista de adyacencia: para cada vértice,
// un vector con sus vecinos. Recorridos BFS (por capas, con una cola) y DFS
// (lo más hondo posible, con una pila o con recursión), distancias en
// aristas y componentes conexas.
//
// La biblioteca estándar no trae un tipo "grafo": se arma con
// std::vector<std::vector<int>>, std::queue y std::stack.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra grafos.cpp -o grafos
//   ./grafos

#include <algorithm>
#include <iostream>
#include <queue>
#include <stack>
#include <stdexcept>
#include <vector>

class Grafo {
public:
    // Los vértices son 0, 1, ..., n - 1, todavía sin aristas.
    explicit Grafo(int n) : adyacentes(n) {}

    int cantidadVertices() const {
        return static_cast<int>(adyacentes.size());
    }

    // O(grado(u)): revisa que no esté ya (sin aristas repetidas ni lazos).
    // Es no dirigido: v entra en la lista de u y u en la de v.
    bool agregarArista(int u, int v) {
        validar(u);
        validar(v);
        if (u == v || std::find(adyacentes[u].begin(), adyacentes[u].end(), v) != adyacentes[u].end()) {
            return false;
        }
        adyacentes[u].push_back(v);
        adyacentes[v].push_back(u);
        return true;
    }

    // O(V + E): recorre por capas. Cada vértice entra a la cola una sola vez
    // (se marca al entrar) y cada lista de adyacencia se mira una vez.
    std::vector<int> bfs(int origen) const {
        validar(origen);
        std::vector<bool> visitado(adyacentes.size(), false);
        std::vector<int> orden;
        std::queue<int> cola;
        visitado[origen] = true;
        cola.push(origen);
        while (!cola.empty()) {
            int u = cola.front();
            cola.pop();
            orden.push_back(u);
            for (int v : adyacentes[u]) {
                if (!visitado[v]) {
                    visitado[v] = true;
                    cola.push(v);
                }
            }
        }
        return orden;
    }

    // O(V + E): un BFS que anota a cuántas aristas del origen está cada
    // vértice (-1 si no se puede llegar). Es el camino más corto en aristas.
    std::vector<int> distancias(int origen) const {
        validar(origen);
        std::vector<int> dist(adyacentes.size(), -1);
        std::queue<int> cola;
        dist[origen] = 0;
        cola.push(origen);
        while (!cola.empty()) {
            int u = cola.front();
            cola.pop();
            for (int v : adyacentes[u]) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    cola.push(v);
                }
            }
        }
        return dist;
    }

    // O(V + E): se mete lo más hondo posible antes de retroceder. Un vértice
    // puede entrar varias veces a la pila; se marca recién al salir.
    std::vector<int> dfs(int origen) const {
        validar(origen);
        std::vector<bool> visitado(adyacentes.size(), false);
        std::vector<int> orden;
        std::stack<int> pila;
        pila.push(origen);
        while (!pila.empty()) {
            int u = pila.top();
            pila.pop();
            if (visitado[u]) {
                continue;  // ya se visitó por otro camino
            }
            visitado[u] = true;
            orden.push_back(u);
            // Al revés, para que el primer vecino quede arriba y salga primero.
            for (auto it = adyacentes[u].rbegin(); it != adyacentes[u].rend(); ++it) {
                if (!visitado[*it]) {
                    pila.push(*it);
                }
            }
        }
        return orden;
    }

    // O(V + E): el mismo DFS, pero la pila es la de llamadas.
    std::vector<int> dfsRecursivo(int origen) const {
        validar(origen);
        std::vector<bool> visitado(adyacentes.size(), false);
        std::vector<int> orden;
        visitar(origen, visitado, orden);
        return orden;
    }

    // O(V + E): cada recorrido que arranca en un vértice sin visitar
    // descubre una componente nueva (una "isla" del grafo).
    int contarComponentes() const {
        std::vector<bool> visitado(adyacentes.size(), false);
        std::vector<int> orden;
        int componentes = 0;
        for (int u = 0; u < cantidadVertices(); u++) {
            if (!visitado[u]) {
                visitar(u, visitado, orden);
                componentes++;
            }
        }
        return componentes;
    }

private:
    std::vector<std::vector<int>> adyacentes;

    void validar(int u) const {
        if (u < 0 || u >= cantidadVertices()) {
            throw std::out_of_range("vértice inválido");
        }
    }

    void visitar(int u, std::vector<bool>& visitado, std::vector<int>& orden) const {
        visitado[u] = true;
        orden.push_back(u);
        for (int v : adyacentes[u]) {
            if (!visitado[v]) {
                visitar(v, visitado, orden);
            }
        }
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
    // El grafo de la animación: 8 vértices y 10 aristas.
    Grafo g(8);
    const int aristas[][2] = {{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 4}, {2, 5}, {3, 6}, {4, 6}, {5, 7}, {6, 7}};
    for (const auto& a : aristas) {
        g.agregarArista(a[0], a[1]);
    }
    std::cout << std::boolalpha;
    std::cout << "agregarArista(4, 1) = " << g.agregarArista(4, 1) << " (ya estaba)\n";
    std::cout << "agregarArista(3, 3) = " << g.agregarArista(3, 3) << " (lazo)\n";

    imprimir("bfs(0)          ", g.bfs(0));
    imprimir("distancias(0)   ", g.distancias(0));
    imprimir("dfs(0)          ", g.dfs(0));
    imprimir("dfsRecursivo(0) ", g.dfsRecursivo(0));
    std::cout << "componentes = " << g.contarComponentes() << "\n";

    // Tres islas: un triángulo, una arista suelta y un camino.
    Grafo islas(8);
    for (const auto& a : std::vector<std::vector<int>>{{0, 1}, {1, 2}, {0, 2}, {3, 4}, {5, 6}, {6, 7}}) {
        islas.agregarArista(a[0], a[1]);
    }
    std::cout << "islas: componentes = " << islas.contarComponentes() << "\n";
    imprimir("islas: distancias(0)", islas.distancias(0));

    try {
        g.bfs(9);
    } catch (const std::out_of_range& e) {
        std::cout << "bfs(9) lanza out_of_range: " << e.what() << "\n";
    }
    return 0;
}
