// Pila (stack): el último en entrar es el primero en salir (LIFO).
// En C++ moderno usarías std::stack; aquí la construimos sobre un arreglo.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra pila.cpp -o pila
//   ./pila

#include <iostream>
#include <stdexcept>

class Pila {
public:
    static constexpr int CAPACIDAD = 8;

    bool estaVacia() const {
        return tope == -1;
    }

    // O(1): equivale a std::stack::push.
    void apilar(int valor) {
        if (tope == CAPACIDAD - 1) {
            throw std::overflow_error("pila llena");
        }
        tope++;
        datos[tope] = valor;
    }

    // O(1): equivale a std::stack::top + std::stack::pop.
    int desapilar() {
        if (estaVacia()) {
            throw std::underflow_error("pila vacia");
        }
        int valor = datos[tope];
        tope--;
        return valor;
    }

    // O(1): equivale a std::stack::top.
    int cima() const {
        if (estaVacia()) {
            throw std::underflow_error("pila vacia");
        }
        return datos[tope];
    }

    void imprimir() const {
        std::cout << "fondo [";
        for (int i = 0; i <= tope; i++) {
            std::cout << datos[i] << (i < tope ? ", " : "");
        }
        std::cout << "] cima\n";
    }

private:
    int datos[CAPACIDAD] = {};
    int tope = -1;  // índice del elemento de arriba; -1 = vacía
};

int main() {
    Pila pila;

    for (int x : {4, 8, 15}) {
        pila.apilar(x);
        pila.imprimir();
    }

    std::cout << "cima() = " << pila.cima() << "\n";

    while (!pila.estaVacia()) {
        std::cout << "desapilar() = " << pila.desapilar() << "\n";
    }

    try {
        pila.desapilar();
    } catch (const std::underflow_error& e) {
        std::cout << "desapilar() en pila vacia lanza: " << e.what() << "\n";
    }

    return 0;
}
