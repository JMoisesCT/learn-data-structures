// Lista enlazada simple: cada nodo guarda un valor y un puntero al siguiente.
// Es la idea detrás de std::forward_list.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra lista_enlazada.cpp -o lista_enlazada
//   ./lista_enlazada

#include <iostream>

struct Nodo {
    int valor;
    Nodo* siguiente;

    explicit Nodo(int v) : valor(v), siguiente(nullptr) {}
};

class ListaEnlazada {
public:
    ListaEnlazada() = default;

    ~ListaEnlazada() {
        while (cabeza != nullptr) {
            Nodo* temp = cabeza;
            cabeza = cabeza->siguiente;
            delete temp;
        }
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    ListaEnlazada(const ListaEnlazada&) = delete;
    ListaEnlazada& operator=(const ListaEnlazada&) = delete;

    // O(1): solo se cambian dos punteros.
    void insertarAlInicio(int valor) {
        Nodo* nuevo = new Nodo(valor);
        nuevo->siguiente = cabeza;
        cabeza = nuevo;
    }

    // O(n): hay que recorrer la lista para encontrar el último nodo.
    void insertarAlFinal(int valor) {
        Nodo* nuevo = new Nodo(valor);
        if (cabeza == nullptr) {
            cabeza = nuevo;
            return;
        }
        Nodo* actual = cabeza;
        while (actual->siguiente != nullptr) {
            actual = actual->siguiente;
        }
        actual->siguiente = nuevo;
    }

    // O(n): recorremos nodo por nodo.
    bool buscar(int valor) const {
        Nodo* actual = cabeza;
        while (actual != nullptr) {
            if (actual->valor == valor) {
                return true;
            }
            actual = actual->siguiente;
        }
        return false;
    }

    // O(n): buscamos el nodo ANTERIOR al que queremos borrar.
    bool eliminar(int valor) {
        if (cabeza == nullptr) {
            return false;
        }
        if (cabeza->valor == valor) {
            Nodo* temp = cabeza;
            cabeza = cabeza->siguiente;
            delete temp;
            return true;
        }
        Nodo* actual = cabeza;
        while (actual->siguiente != nullptr && actual->siguiente->valor != valor) {
            actual = actual->siguiente;
        }
        if (actual->siguiente == nullptr) {
            return false;
        }
        Nodo* temp = actual->siguiente;
        actual->siguiente = temp->siguiente;
        delete temp;
        return true;
    }

    void imprimir() const {
        std::cout << "cabeza -> ";
        for (Nodo* n = cabeza; n != nullptr; n = n->siguiente) {
            std::cout << n->valor << " -> ";
        }
        std::cout << "nullptr\n";
    }

private:
    Nodo* cabeza = nullptr;
};

int main() {
    ListaEnlazada lista;

    lista.insertarAlFinal(7);
    lista.insertarAlFinal(12);
    lista.insertarAlInicio(3);
    lista.imprimir();

    std::cout << "buscar(12) = " << std::boolalpha << lista.buscar(12) << "\n";
    std::cout << "buscar(99) = " << lista.buscar(99) << "\n";

    lista.eliminar(7);
    std::cout << "eliminar(7)  -> ";
    lista.imprimir();

    lista.eliminar(3);
    std::cout << "eliminar(3)  -> ";
    lista.imprimir();

    std::cout << "eliminar(99) = " << lista.eliminar(99) << "\n";

    return 0;
}
