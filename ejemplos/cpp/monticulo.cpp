// Montículo binario (heap): un árbol binario completo guardado en un arreglo.
//   - Min-heap: cada padre es MENOR o igual que sus hijos -> la raíz es el mínimo.
//   - Max-heap: cada padre es MAYOR o igual que sus hijos -> la raíz es el máximo.
// En el arreglo, el nodo i tiene:
//   padre = (i - 1) / 2,   hijo izquierdo = 2 * i + 1,   hijo derecho = 2 * i + 2
// En C++ moderno usarías std::priority_queue (max-heap por defecto).
//
// Al final está heapsort: ordena un arreglo usando un max-heap.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra monticulo.cpp -o monticulo
//   ./monticulo

#include <iostream>
#include <stdexcept>
#include <utility>
#include <vector>

class Monticulo {
public:
    explicit Monticulo(bool minimo) : esMinimo(minimo) {}

    bool estaVacio() const { return datos.empty(); }
    int tamano() const { return static_cast<int>(datos.size()); }

    // O(1): equivale a std::priority_queue::top.
    int raiz() const {
        if (estaVacio()) {
            throw std::underflow_error("monticulo vacio");
        }
        return datos[0];
    }

    // O(log n): el valor entra como hoja y "sube" mientras le gane a su padre.
    void insertar(int valor) {
        datos.push_back(valor);
        int i = tamano() - 1;
        while (i > 0) {
            int padre = (i - 1) / 2;
            if (!vaAntes(datos[i], datos[padre])) {
                break;
            }
            std::swap(datos[i], datos[padre]);
            i = padre;
        }
    }

    // O(log n): sacamos la raíz, ponemos la última hoja arriba y la "bajamos".
    int extraerRaiz() {
        if (estaVacio()) {
            throw std::underflow_error("monticulo vacio");
        }
        int valor = datos[0];
        datos[0] = datos.back();
        datos.pop_back();
        bajar(0);
        return valor;
    }

    void imprimir() const {
        std::cout << (esMinimo ? "min-heap [" : "max-heap [");
        for (int i = 0; i < tamano(); i++) {
            std::cout << datos[i] << (i + 1 < tamano() ? ", " : "");
        }
        std::cout << "]\n";
    }

private:
    // En un min-heap va antes el menor; en un max-heap, el mayor.
    bool vaAntes(int a, int b) const {
        return esMinimo ? a < b : a > b;
    }

    // Intercambia datos[i] con su mejor hijo hasta que quede bien ubicado.
    void bajar(int i) {
        int n = tamano();
        while (true) {
            int izq = 2 * i + 1;
            int der = 2 * i + 2;
            int elegido = i;
            if (izq < n && vaAntes(datos[izq], datos[elegido])) {
                elegido = izq;
            }
            if (der < n && vaAntes(datos[der], datos[elegido])) {
                elegido = der;
            }
            if (elegido == i) {
                break;
            }
            std::swap(datos[i], datos[elegido]);
            i = elegido;
        }
    }

    std::vector<int> datos;
    bool esMinimo;
};

// Hunde v[i] dentro de los primeros n elementos para que sea un max-heap.
void hundir(std::vector<int>& v, int n, int i) {
    while (true) {
        int izq = 2 * i + 1;
        int der = 2 * i + 2;
        int mayor = i;
        if (izq < n && v[izq] > v[mayor]) {
            mayor = izq;
        }
        if (der < n && v[der] > v[mayor]) {
            mayor = der;
        }
        if (mayor == i) {
            return;
        }
        std::swap(v[i], v[mayor]);
        i = mayor;
    }
}

// O(n log n) y sin memoria extra:
//   1) convierte el arreglo en un max-heap (el mayor queda en v[0]);
//   2) repite: manda la raíz al final y vuelve a hundir la nueva raíz.
void heapsort(std::vector<int>& v) {
    int n = static_cast<int>(v.size());
    for (int i = n / 2 - 1; i >= 0; i--) {
        hundir(v, n, i);
    }
    for (int fin = n - 1; fin > 0; fin--) {
        std::swap(v[0], v[fin]);
        hundir(v, fin, 0);
    }
}

void imprimir(const std::vector<int>& v) {
    std::cout << "[";
    for (size_t i = 0; i < v.size(); i++) {
        std::cout << v[i] << (i + 1 < v.size() ? ", " : "");
    }
    std::cout << "]\n";
}

int main() {
    Monticulo minimo(true);
    Monticulo maximo(false);
    for (int x : {12, 7, 20, 3, 15, 9}) {
        minimo.insertar(x);
        maximo.insertar(x);
    }
    minimo.imprimir();
    maximo.imprimir();

    std::cout << "raiz del min-heap = " << minimo.raiz() << "\n";
    std::cout << "raiz del max-heap = " << maximo.raiz() << "\n";

    std::cout << "extrayendo del min-heap: ";
    while (!minimo.estaVacio()) {
        std::cout << minimo.extraerRaiz() << " ";
    }
    std::cout << "(salen en orden creciente)\n";

    try {
        minimo.extraerRaiz();
    } catch (const std::underflow_error& e) {
        std::cout << "extraerRaiz() en monticulo vacio lanza: " << e.what() << "\n";
    }

    std::vector<int> v = {38, 27, 43, 3, 9, 82, 10, 5};
    std::cout << "antes de heapsort:   ";
    imprimir(v);
    heapsort(v);
    std::cout << "despues de heapsort: ";
    imprimir(v);

    return 0;
}
