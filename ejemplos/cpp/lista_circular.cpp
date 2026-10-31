// Lista circular: una lista enlazada simple donde el último nodo, en vez de
// apuntar a nullptr, apunta al primero. Basta con guardar un puntero al
// último: el primero es ultimo->siguiente. Sirve para repartir turnos
// (round-robin), como hacen los sistemas operativos con los procesos.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra lista_circular.cpp -o lista_circular
//   ./lista_circular

#include <algorithm>
#include <iostream>
#include <stdexcept>

struct Nodo {
    int valor;
    Nodo* siguiente;

    explicit Nodo(int v) : valor(v), siguiente(nullptr) {}
};

class ListaCircular {
public:
    ListaCircular() = default;

    ~ListaCircular() {
        while (ultimo != nullptr) {
            eliminarPrimero();
        }
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    ListaCircular(const ListaCircular&) = delete;
    ListaCircular& operator=(const ListaCircular&) = delete;

    // O(1): el nuevo se mete entre el último y el primero.
    void insertarAlInicio(int valor) {
        Nodo* nuevo = new Nodo(valor);
        if (ultimo == nullptr) {
            nuevo->siguiente = nuevo;  // un solo nodo: se apunta a sí mismo
            ultimo = nuevo;
        } else {
            nuevo->siguiente = ultimo->siguiente;
            ultimo->siguiente = nuevo;
        }
        tamano++;
    }

    // O(1): es insertar al inicio y correr ultimo un lugar.
    void insertarAlFinal(int valor) {
        insertarAlInicio(valor);
        ultimo = ultimo->siguiente;
    }

    // O(1): el primero pasa a ser el último. No se mueve ningún nodo.
    void rotar() {
        if (ultimo != nullptr) {
            ultimo = ultimo->siguiente;
        }
    }

    // O(1)
    int eliminarPrimero() {
        if (ultimo == nullptr) {
            throw std::out_of_range("lista vacia");
        }
        Nodo* primero = ultimo->siguiente;
        int valor = primero->valor;
        if (primero == ultimo) {
            ultimo = nullptr;  // era el único
        } else {
            ultimo->siguiente = primero->siguiente;
        }
        delete primero;
        tamano--;
        return valor;
    }

    // O(n): una vuelta completa. Con do-while el primero también se revisa.
    bool buscar(int valor) const {
        if (ultimo == nullptr) {
            return false;
        }
        Nodo* actual = ultimo->siguiente;
        do {
            if (actual->valor == valor) {
                return true;
            }
            actual = actual->siguiente;
        } while (actual != ultimo->siguiente);
        return false;
    }

    // O(1): una referencia al valor del primero, para poder cambiarlo.
    int& primero() {
        if (ultimo == nullptr) {
            throw std::out_of_range("lista vacia");
        }
        return ultimo->siguiente->valor;
    }

    bool vacia() const {
        return ultimo == nullptr;
    }

    void imprimir() const {
        if (ultimo == nullptr) {
            std::cout << "(vacia: ultimo = nullptr)\n";
            return;
        }
        Nodo* actual = ultimo->siguiente;
        do {
            std::cout << actual->valor << " -> ";
            actual = actual->siguiente;
        } while (actual != ultimo->siguiente);
        std::cout << "(vuelve al " << ultimo->siguiente->valor << ")   tamano = " << tamano << "\n";
    }

private:
    Nodo* ultimo = nullptr;
    int tamano = 0;
};

// Un turno de round-robin: el primero trabaja hasta 'quantum' unidades. Si
// termina, sale de la lista; si no, rota al final. Devuelve cuánto le falta.
int unTurno(ListaCircular& procesos, int quantum) {
    int& falta = procesos.primero();
    falta -= std::min(falta, quantum);
    if (falta == 0) {
        procesos.eliminarPrimero();
        return 0;
    }
    int quedan = falta;
    procesos.rotar();
    return quedan;
}

int main() {
    ListaCircular lista;
    lista.insertarAlFinal(10);
    lista.insertarAlFinal(20);
    lista.insertarAlFinal(30);
    lista.insertarAlInicio(5);
    lista.imprimir();

    lista.rotar();
    std::cout << "rotar() -> ";
    lista.imprimir();

    std::cout << std::boolalpha;
    std::cout << "buscar(30) = " << lista.buscar(30) << "\n";
    std::cout << "buscar(99) = " << lista.buscar(99) << "\n";

    std::cout << "eliminarPrimero() = " << lista.eliminarPrimero() << " -> ";
    lista.imprimir();

    // Turnos: cada valor es el tiempo que le falta a un proceso.
    ListaCircular procesos;
    for (int tiempo : {5, 3, 7}) {
        procesos.insertarAlFinal(tiempo);
    }
    int turno = 1;
    while (!procesos.vacia()) {
        int falta = unTurno(procesos, 3);
        std::cout << "turno " << turno++ << ": le falta " << falta << " -> ";
        procesos.imprimir();
    }
    try {
        procesos.eliminarPrimero();
    } catch (const std::out_of_range& e) {
        std::cout << "eliminarPrimero() con la lista vacia lanza out_of_range: " << e.what() << "\n";
    }

    return 0;
}
