// Cola (queue): el primero en entrar es el primero en salir (FIFO).
// Dos versiones:
//   1. std::queue, la cola de la STL: la que usarías en un programa real.
//   2. ColaEnlazada: la misma idea construida con nodos, para ver qué pasa
//      por dentro. Se sale por la cabeza de una lista enlazada y se entra
//      por el final, gracias a un segundo puntero al último nodo.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra cola.cpp -o cola
//   ./cola

#include <iostream>
#include <queue>
#include <stdexcept>
#include <string>

// ------------------------------------------------------------------
// Versión 1: std::queue
// ------------------------------------------------------------------

void usarQueue() {
    std::queue<int> cola;  // por dentro guarda los valores en un std::deque

    // push: entra por el final. O(1).
    for (int valor : {5, 9, 2}) {
        cola.push(valor);
    }
    std::cout << "size() = " << cola.size() << ", back() = " << cola.back() << "\n";

    // front: lee el primero sin sacarlo. O(1). Con la cola vacía es
    // comportamiento indefinido (no lanza excepción): hay que preguntar empty().
    if (!cola.empty()) {
        std::cout << "front() = " << cola.front() << "\n";
    }

    // pop: quita el primero y NO lo devuelve. O(1). Si necesitas el valor,
    // léelo antes con front().
    if (!cola.empty()) {
        cola.pop();
    }

    // Al vaciarla, los valores salen en el mismo orden en que entraron.
    while (!cola.empty()) {
        std::cout << "sale " << cola.front() << "\n";
        cola.pop();
    }
}

// El problema de Josefo: n personas en ronda; se cuenta de k en k y sale
// la que cae en k, hasta que queda una. Con una cola, las k - 1 primeras
// pasan del frente al final (como en una ronda) y la siguiente sale. O(n·k).
int josefo(int n, int k) {
    std::queue<int> ronda;
    for (int i = 1; i <= n; i++) {
        ronda.push(i);
    }
    while (ronda.size() > 1) {
        for (int i = 1; i < k; i++) {
            ronda.push(ronda.front());
            ronda.pop();
        }
        ronda.pop();
    }
    return ronda.front();
}

// ------------------------------------------------------------------
// Versión 2: ColaEnlazada
// ------------------------------------------------------------------

struct Nodo {
    int valor;
    Nodo* siguiente;

    explicit Nodo(int v) : valor(v), siguiente(nullptr) {}
};

class ColaEnlazada {
public:
    ColaEnlazada() = default;

    ~ColaEnlazada() {
        while (!estaVacia()) {
            desencolar();
        }
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    ColaEnlazada(const ColaEnlazada&) = delete;
    ColaEnlazada& operator=(const ColaEnlazada&) = delete;

    bool estaVacia() const {
        return primero == nullptr;
    }

    int tamano() const {
        return cantidad;
    }

    // O(1): gracias a ultimo no hay que recorrer la lista para llegar al
    // final (con nodoEn(cantidad - 1) sería O(n)). Equivale a std::queue::push.
    void encolar(int valor) {
        Nodo* nuevo = new Nodo(valor);
        if (ultimo == nullptr) {
            primero = nuevo;
        } else {
            ultimo->siguiente = nuevo;
        }
        ultimo = nuevo;
        cantidad++;
    }

    // O(1): sale el primero, como borrar la cabeza de la lista.
    // Equivale a front() + pop().
    int desencolar() {
        if (primero == nullptr) {
            throw std::underflow_error("cola vacia");
        }
        Nodo* temp = primero;
        int valor = temp->valor;
        primero = primero->siguiente;
        if (primero == nullptr) {
            ultimo = nullptr;
        }
        delete temp;
        cantidad--;
        return valor;
    }

    // O(1): equivale a std::queue::front, pero con la cola vacía lanza una excepción.
    int frente() const {
        if (primero == nullptr) {
            throw std::underflow_error("cola vacia");
        }
        return primero->valor;
    }

    void imprimir() const {
        std::cout << "primero -> ";
        for (Nodo* n = primero; n != nullptr; n = n->siguiente) {
            std::cout << n->valor << " -> ";
        }
        std::cout << "nullptr   (ultimo = " << (ultimo ? std::to_string(ultimo->valor) : "nullptr")
                  << ", tamano = " << cantidad << ")\n";
    }

private:
    Nodo* primero = nullptr;  // de aquí se sale
    Nodo* ultimo = nullptr;   // aquí se entra
    int cantidad = 0;
};

int main() {
    std::cout << "--- std::queue ---\n";
    usarQueue();
    std::cout << "josefo(6, 3) = " << josefo(6, 3) << "\n";

    std::cout << "\n--- ColaEnlazada ---\n";
    ColaEnlazada cola;
    for (int x : {5, 9, 2}) {
        cola.encolar(x);
        cola.imprimir();
    }

    std::cout << "frente() = " << cola.frente() << "\n";

    while (!cola.estaVacia()) {
        std::cout << "desencolar() = " << cola.desencolar() << "  ";
        cola.imprimir();
    }

    try {
        cola.desencolar();
    } catch (const std::underflow_error& e) {
        std::cout << "desencolar() en cola vacia lanza: " << e.what() << "\n";
    }

    cola.encolar(42);  // el destructor libera este nodo
    return 0;
}
