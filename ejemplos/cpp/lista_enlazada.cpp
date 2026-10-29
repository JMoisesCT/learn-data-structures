// Lista enlazada simple: cada nodo guarda un valor y un puntero al siguiente.
// Es la idea detrás de std::forward_list (y std::list, si además
// guardara un puntero al anterior).
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra lista_enlazada.cpp -o lista_enlazada
//   ./lista_enlazada

#include <iostream>
#include <stdexcept>

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
        tamano++;
    }

    // O(n): nodoEn recorre hasta el nodo ANTERIOR a pos; enlazar son dos punteros.
    void insertarEn(int pos, int valor) {
        if (pos < 0 || pos > tamano) {
            throw std::out_of_range("posicion invalida");
        }
        if (pos == 0) {
            insertarAlInicio(valor);
            return;
        }
        Nodo* anterior = nodoEn(pos - 1);
        Nodo* nuevo = new Nodo(valor);
        nuevo->siguiente = anterior->siguiente;
        anterior->siguiente = nuevo;
        tamano++;
    }

    // O(n): el final es la posición tamano, e insertarEn tiene que llegar ahí.
    void insertarAlFinal(int valor) {
        insertarEn(tamano, valor);
    }

    // O(n): nodoEn da pos saltos desde la cabeza.
    int obtener(int pos) const {
        Nodo* nodo = nodoEn(pos);
        if (nodo == nullptr) {
            throw std::out_of_range("posicion invalida");
        }
        return nodo->valor;
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

    // O(n): buscamos el nodo ANTERIOR al que tiene el valor.
    bool eliminar(int valor) {
        if (cabeza == nullptr) {
            return false;
        }
        if (cabeza->valor == valor) {
            Nodo* temp = cabeza;
            cabeza = cabeza->siguiente;
            delete temp;
            tamano--;
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
        tamano--;
        return true;
    }

    // O(n): como insertarEn, nodoEn nos lleva al nodo ANTERIOR a pos.
    int eliminarEn(int pos) {
        if (pos < 0 || pos >= tamano) {
            throw std::out_of_range("posicion invalida");
        }
        Nodo* temp;
        if (pos == 0) {
            temp = cabeza;
            cabeza = cabeza->siguiente;
        } else {
            Nodo* anterior = nodoEn(pos - 1);
            temp = anterior->siguiente;
            anterior->siguiente = temp->siguiente;
        }
        int valor = temp->valor;
        delete temp;
        tamano--;
        return valor;
    }

    void imprimir() const {
        std::cout << "cabeza -> ";
        for (Nodo* n = cabeza; n != nullptr; n = n->siguiente) {
            std::cout << n->valor << " -> ";
        }
        std::cout << "nullptr   (tamano = " << tamano << ")\n";
    }

private:
    Nodo* cabeza = nullptr;
    int tamano = 0;  // cuántos nodos hay; insertarAlFinal lo usa como posición

    // O(n): avanza pos nodos desde la cabeza; nullptr si esa posición no existe.
    // Es privado: devuelve un nodo interno, y lo usan obtener, insertarEn y eliminarEn.
    Nodo* nodoEn(int pos) const {
        if (pos < 0) {
            return nullptr;
        }
        Nodo* actual = cabeza;
        for (int i = 0; i < pos && actual != nullptr; i++) {
            actual = actual->siguiente;
        }
        return actual;
    }
};

int main() {
    ListaEnlazada lista;

    lista.insertarAlFinal(7);
    lista.insertarAlFinal(12);
    lista.insertarAlInicio(3);
    lista.imprimir();

    lista.insertarEn(2, 9);
    std::cout << "insertarEn(2, 9) -> ";
    lista.imprimir();
    try {
        lista.insertarEn(8, 1);
    } catch (const std::out_of_range& e) {
        std::cout << "insertarEn(8, 1) lanza out_of_range: " << e.what() << "\n";
    }

    std::cout << "obtener(2) = " << lista.obtener(2) << "\n";
    try {
        lista.obtener(5);
    } catch (const std::out_of_range& e) {
        std::cout << "obtener(5) lanza out_of_range: " << e.what() << "\n";
    }

    std::cout << "buscar(12) = " << std::boolalpha << lista.buscar(12) << "\n";
    std::cout << "buscar(99) = " << lista.buscar(99) << "\n";

    std::cout << "eliminarEn(1) = " << lista.eliminarEn(1) << " -> ";
    lista.imprimir();

    lista.eliminar(12);
    std::cout << "eliminar(12)  -> ";
    lista.imprimir();

    lista.eliminar(3);
    std::cout << "eliminar(3)   -> ";
    lista.imprimir();

    std::cout << "eliminar(99) = " << lista.eliminar(99) << "\n";
    try {
        lista.eliminarEn(1);
    } catch (const std::out_of_range& e) {
        std::cout << "eliminarEn(1) lanza out_of_range: " << e.what() << "\n";
    }

    return 0;
}
