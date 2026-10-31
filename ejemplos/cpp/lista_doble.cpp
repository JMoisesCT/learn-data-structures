// Lista doblemente enlazada: cada nodo guarda un valor, un puntero al
// anterior y otro al siguiente, y la lista guarda el primero (cabeza) y el
// último (cola). Es la idea detrás de std::list.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra lista_doble.cpp -o lista_doble
//   ./lista_doble

#include <iostream>
#include <stdexcept>

struct Nodo {
    int valor;
    Nodo* anterior;
    Nodo* siguiente;

    explicit Nodo(int v) : valor(v), anterior(nullptr), siguiente(nullptr) {}
};

class ListaDoble {
public:
    ListaDoble() = default;

    ~ListaDoble() {
        while (cabeza != nullptr) {
            Nodo* temp = cabeza;
            cabeza = cabeza->siguiente;
            delete temp;
        }
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    ListaDoble(const ListaDoble&) = delete;
    ListaDoble& operator=(const ListaDoble&) = delete;

    // O(1): el nuevo apunta a la cabeza y la cabeza, de vuelta, al nuevo.
    void insertarAlInicio(int valor) {
        Nodo* nuevo = new Nodo(valor);
        nuevo->siguiente = cabeza;
        if (cabeza != nullptr) {
            cabeza->anterior = nuevo;
        } else {
            cola = nuevo;  // estaba vacía: es el primero y el último
        }
        cabeza = nuevo;
        tamano++;
    }

    // O(1): gracias a cola no hay que recorrer la lista.
    void insertarAlFinal(int valor) {
        Nodo* nuevo = new Nodo(valor);
        nuevo->anterior = cola;
        if (cola != nullptr) {
            cola->siguiente = nuevo;
        } else {
            cabeza = nuevo;  // estaba vacía: es el primero y el último
        }
        cola = nuevo;
        tamano++;
    }

    // O(n): llegar a pos; enganchar el nuevo son cuatro punteros.
    void insertarEn(int pos, int valor) {
        if (pos < 0 || pos > tamano) {
            throw std::out_of_range("posicion invalida");
        }
        if (pos == 0) {
            insertarAlInicio(valor);
            return;
        }
        if (pos == tamano) {
            insertarAlFinal(valor);
            return;
        }
        Nodo* siguiente = nodoEn(pos);
        Nodo* anterior = siguiente->anterior;
        Nodo* nuevo = new Nodo(valor);
        nuevo->anterior = anterior;
        nuevo->siguiente = siguiente;
        anterior->siguiente = nuevo;
        siguiente->anterior = nuevo;
        tamano++;
    }

    // O(n) por llegar a pos (desde el extremo más cercano).
    int obtener(int pos) const {
        if (pos < 0 || pos >= tamano) {
            throw std::out_of_range("posicion invalida");
        }
        return nodoEn(pos)->valor;
    }

    // O(n) para encontrarlo; sacarlo es O(1): no hay que buscar su anterior.
    bool eliminar(int valor) {
        Nodo* nodo = cabeza;
        while (nodo != nullptr && nodo->valor != valor) {
            nodo = nodo->siguiente;
        }
        if (nodo == nullptr) {
            return false;
        }
        desenganchar(nodo);
        return true;
    }

    // O(1): en una lista simple, quitar el último cuesta O(n).
    int eliminarAlFinal() {
        if (cola == nullptr) {
            throw std::out_of_range("lista vacia");
        }
        int valor = cola->valor;
        desenganchar(cola);
        return valor;
    }

    // O(1)
    int eliminarAlInicio() {
        if (cabeza == nullptr) {
            throw std::out_of_range("lista vacia");
        }
        int valor = cabeza->valor;
        desenganchar(cabeza);
        return valor;
    }

    void imprimir() const {
        std::cout << "cabeza -> ";
        for (Nodo* n = cabeza; n != nullptr; n = n->siguiente) {
            std::cout << n->valor << " <-> ";
        }
        std::cout << "nullptr   (tamano = " << tamano << ")\n";
    }

    // Gracias a anterior, también se puede recorrer al revés.
    void imprimirAlReves() const {
        std::cout << "cola -> ";
        for (Nodo* n = cola; n != nullptr; n = n->anterior) {
            std::cout << n->valor << " <-> ";
        }
        std::cout << "nullptr\n";
    }

private:
    Nodo* cabeza = nullptr;
    Nodo* cola = nullptr;
    int tamano = 0;

    // O(n), pero desde el extremo más cercano: como mucho tamano / 2 saltos.
    // Supone 0 <= pos < tamano.
    Nodo* nodoEn(int pos) const {
        if (pos < tamano / 2) {
            Nodo* actual = cabeza;
            for (int i = 0; i < pos; i++) {
                actual = actual->siguiente;
            }
            return actual;
        }
        Nodo* actual = cola;
        for (int i = tamano - 1; i > pos; i--) {
            actual = actual->anterior;
        }
        return actual;
    }

    // O(1): sus vecinos se apuntan entre sí, saltándolo.
    void desenganchar(Nodo* nodo) {
        if (nodo->anterior != nullptr) {
            nodo->anterior->siguiente = nodo->siguiente;
        } else {
            cabeza = nodo->siguiente;
        }
        if (nodo->siguiente != nullptr) {
            nodo->siguiente->anterior = nodo->anterior;
        } else {
            cola = nodo->anterior;
        }
        delete nodo;
        tamano--;
    }
};

int main() {
    ListaDoble lista;
    lista.insertarAlFinal(12);
    lista.insertarAlFinal(20);
    lista.insertarAlInicio(7);
    lista.insertarAlInicio(3);
    lista.imprimir();
    lista.imprimirAlReves();

    lista.insertarEn(2, 9);
    std::cout << "insertarEn(2, 9) -> ";
    lista.imprimir();
    try {
        lista.insertarEn(9, 1);
    } catch (const std::out_of_range& e) {
        std::cout << "insertarEn(9, 1) lanza out_of_range: " << e.what() << "\n";
    }

    std::cout << "obtener(1) = " << lista.obtener(1) << "\n";
    std::cout << "obtener(4) = " << lista.obtener(4) << " (llega desde la cola)\n";

    std::cout << std::boolalpha;
    std::cout << "eliminar(9) = " << lista.eliminar(9) << " -> ";
    lista.imprimir();
    std::cout << "eliminar(99) = " << lista.eliminar(99) << "\n";

    std::cout << "eliminarAlFinal() = " << lista.eliminarAlFinal() << " -> ";
    lista.imprimir();
    std::cout << "eliminarAlInicio() = " << lista.eliminarAlInicio() << " -> ";
    lista.imprimir();

    lista.eliminarAlFinal();
    lista.eliminarAlFinal();
    try {
        lista.eliminarAlFinal();
    } catch (const std::out_of_range& e) {
        std::cout << "eliminarAlFinal() con la lista vacia lanza out_of_range: " << e.what() << "\n";
    }

    return 0;
}
