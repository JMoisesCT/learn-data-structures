// Cola (queue): el primero en entrar es el primero en salir (FIFO).
// La implementamos como un arreglo circular: los índices "dan la vuelta"
// con el operador %, así no hace falta mover elementos al desencolar.
// En C++ moderno usarías std::queue.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra cola.cpp -o cola
//   ./cola

#include <iostream>
#include <stdexcept>

class Cola {
public:
    static constexpr int CAPACIDAD = 8;

    bool estaVacia() const {
        return cantidad == 0;
    }

    // O(1): equivale a std::queue::push.
    void encolar(int valor) {
        if (cantidad == CAPACIDAD) {
            throw std::overflow_error("cola llena");
        }
        datos[fin] = valor;
        fin = (fin + 1) % CAPACIDAD;
        cantidad++;
    }

    // O(1): equivale a std::queue::front + std::queue::pop.
    int desencolar() {
        if (estaVacia()) {
            throw std::underflow_error("cola vacia");
        }
        int valor = datos[inicio];
        inicio = (inicio + 1) % CAPACIDAD;
        cantidad--;
        return valor;
    }

    // O(1): equivale a std::queue::front.
    int frente() const {
        if (estaVacia()) {
            throw std::underflow_error("cola vacia");
        }
        return datos[inicio];
    }

    void imprimir() const {
        std::cout << "frente [";
        for (int k = 0; k < cantidad; k++) {
            std::cout << datos[(inicio + k) % CAPACIDAD] << (k + 1 < cantidad ? ", " : "");
        }
        std::cout << "] final   (inicio=" << inicio << ", fin=" << fin << ")\n";
    }

private:
    int datos[CAPACIDAD] = {};
    int inicio = 0;    // índice del primer elemento
    int fin = 0;       // índice donde irá el próximo elemento
    int cantidad = 0;
};

int main() {
    Cola cola;

    for (int x : {5, 9, 2}) {
        cola.encolar(x);
        cola.imprimir();
    }

    std::cout << "frente() = " << cola.frente() << "\n";
    std::cout << "desencolar() = " << cola.desencolar() << "\n";
    cola.imprimir();

    // Llenamos la cola para ver cómo "fin" da la vuelta al arreglo.
    for (int x = 10; x <= 15; x++) {
        cola.encolar(x);
    }
    cola.imprimir();

    try {
        cola.encolar(99);
    } catch (const std::overflow_error& e) {
        std::cout << "encolar(99) en cola llena lanza: " << e.what() << "\n";
    }

    return 0;
}
