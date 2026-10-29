// Pila (stack): el último en entrar es el primero en salir (LIFO).
// Dos versiones:
//   1. std::stack, la pila de la STL: la que usarías en un programa real.
//   2. PilaEnlazada: la misma idea construida con nodos, para ver qué pasa
//      por dentro. La cima es la cabeza de una lista enlazada.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra pila.cpp -o pila
//   ./pila

#include <iostream>
#include <stack>
#include <stdexcept>
#include <string>

// ------------------------------------------------------------------
// Versión 1: std::stack
// ------------------------------------------------------------------

void usarStack() {
    std::stack<int> pila;  // por dentro guarda los valores en un std::deque

    // push: apila encima. O(1).
    for (int valor : {4, 8, 15}) {
        pila.push(valor);
    }
    std::cout << "size() = " << pila.size() << "\n";

    // top: lee la cima sin sacarla. O(1). Con la pila vacía es comportamiento
    // indefinido (no lanza excepción): hay que preguntar empty() antes.
    if (!pila.empty()) {
        std::cout << "top() = " << pila.top() << "\n";
    }

    // pop: quita la cima y NO la devuelve. O(1). Si necesitas el valor,
    // léelo antes con top().
    if (!pila.empty()) {
        pila.pop();
    }

    // Al vaciarla, los valores salen en el orden inverso al que entraron.
    while (!pila.empty()) {
        std::cout << "sale " << pila.top() << "\n";
        pila.pop();
    }
}

// Un uso clásico: ¿los paréntesis, corchetes y llaves están balanceados?
// Cada apertura se apila; cada cierre tiene que coincidir con la última
// apertura que sigue sin cerrar, que es justo la cima. O(n).
bool estanBalanceados(const std::string& texto) {
    std::stack<char> abiertos;
    for (char c : texto) {
        if (c == '(' || c == '[' || c == '{') {
            abiertos.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (abiertos.empty()) {
                return false;
            }
            char esperado = c == ')' ? '(' : (c == ']' ? '[' : '{');
            if (abiertos.top() != esperado) {
                return false;
            }
            abiertos.pop();
        }
    }
    return abiertos.empty();
}

// ------------------------------------------------------------------
// Versión 2: PilaEnlazada
// ------------------------------------------------------------------

struct Nodo {
    int valor;
    Nodo* siguiente;

    explicit Nodo(int v) : valor(v), siguiente(nullptr) {}
};

class PilaEnlazada {
public:
    PilaEnlazada() = default;

    ~PilaEnlazada() {
        while (!estaVacia()) {
            desapilar();
        }
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    PilaEnlazada(const PilaEnlazada&) = delete;
    PilaEnlazada& operator=(const PilaEnlazada&) = delete;

    bool estaVacia() const {
        return tope == nullptr;
    }

    int tamano() const {
        return cantidad;
    }

    // O(1): es insertarAlInicio de la lista enlazada. Equivale a std::stack::push.
    void apilar(int valor) {
        Nodo* nuevo = new Nodo(valor);
        nuevo->siguiente = tope;
        tope = nuevo;
        cantidad++;
    }

    // O(1): es borrar la cabeza de la lista. Equivale a top() + pop().
    int desapilar() {
        if (tope == nullptr) {
            throw std::underflow_error("pila vacia");
        }
        Nodo* temp = tope;
        int valor = temp->valor;
        tope = tope->siguiente;
        delete temp;
        cantidad--;
        return valor;
    }

    // O(1): equivale a std::stack::top, pero con la pila vacía lanza una excepción.
    int cima() const {
        if (tope == nullptr) {
            throw std::underflow_error("pila vacia");
        }
        return tope->valor;
    }

    void imprimir() const {
        std::cout << "tope -> ";
        for (Nodo* n = tope; n != nullptr; n = n->siguiente) {
            std::cout << n->valor << " -> ";
        }
        std::cout << "nullptr   (tamano = " << cantidad << ")\n";
    }

private:
    Nodo* tope = nullptr;  // la cima: el último que entró
    int cantidad = 0;
};

int main() {
    std::cout << "--- std::stack ---\n";
    usarStack();
    for (const char* texto : {"{a[b(c)]}", "([)]", "(()", "())"}) {
        std::cout << "estanBalanceados(\"" << texto << "\") = " << std::boolalpha
                  << estanBalanceados(texto) << "\n";
    }

    std::cout << "\n--- PilaEnlazada ---\n";
    PilaEnlazada pila;
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

    pila.apilar(42);  // el destructor libera este nodo
    return 0;
}
