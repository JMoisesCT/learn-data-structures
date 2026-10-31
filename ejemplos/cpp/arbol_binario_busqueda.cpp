// Árbol binario de búsqueda (ABB): cada nodo tiene a lo sumo dos hijos, y
// todo lo que está en su subárbol izquierdo es menor que él y todo lo que
// está en el derecho, mayor. Es la idea detrás de std::set y std::map (que
// además se mantienen balanceados: son árboles rojo-negro).
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra arbol_binario_busqueda.cpp -o arbol_binario_busqueda
//   ./arbol_binario_busqueda

#include <algorithm>
#include <iostream>
#include <vector>

struct Nodo {
    int valor;
    Nodo* izq;
    Nodo* der;

    explicit Nodo(int v) : valor(v), izq(nullptr), der(nullptr) {}
};

class ArbolBinarioBusqueda {
public:
    ArbolBinarioBusqueda() = default;

    ~ArbolBinarioBusqueda() {
        liberar(raiz);
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    ArbolBinarioBusqueda(const ArbolBinarioBusqueda&) = delete;
    ArbolBinarioBusqueda& operator=(const ArbolBinarioBusqueda&) = delete;

    // O(h): en cada nodo se descarta un subárbol entero (h = altura del árbol).
    bool buscar(int valor) const {
        Nodo* actual = raiz;
        while (actual != nullptr) {
            if (valor == actual->valor) {
                return true;
            }
            if (valor < actual->valor) {
                actual = actual->izq;
            } else {
                actual = actual->der;
            }
        }
        return false;
    }

    // O(h): baja como buscar hasta un puntero nullptr y cuelga ahí el nodo nuevo.
    bool insertar(int valor) {
        Nodo* padre = nullptr;
        Nodo* actual = raiz;
        while (actual != nullptr) {
            if (valor == actual->valor) {
                return false;  // sin repetidos, como std::set
            }
            padre = actual;
            if (valor < actual->valor) {
                actual = actual->izq;
            } else {
                actual = actual->der;
            }
        }
        Nodo* nuevo = new Nodo(valor);
        if (padre == nullptr) {
            raiz = nuevo;
        } else if (valor < padre->valor) {
            padre->izq = nuevo;
        } else {
            padre->der = nuevo;
        }
        tamano++;
        return true;
    }

    // O(h): busca el nodo (y su padre) y resuelve uno de tres casos.
    bool eliminar(int valor) {
        Nodo* padre = nullptr;
        Nodo* actual = raiz;
        while (actual != nullptr && actual->valor != valor) {
            padre = actual;
            actual = (valor < actual->valor) ? actual->izq : actual->der;
        }
        if (actual == nullptr) {
            return false;  // no está
        }
        // Caso 3, dos hijos: copiamos el sucesor (el menor del subárbol
        // derecho) y pasamos a borrar el sucesor, que no tiene hijo izquierdo.
        if (actual->izq != nullptr && actual->der != nullptr) {
            Nodo* padreSucesor = actual;
            Nodo* sucesor = actual->der;
            while (sucesor->izq != nullptr) {
                padreSucesor = sucesor;
                sucesor = sucesor->izq;
            }
            actual->valor = sucesor->valor;
            padre = padreSucesor;
            actual = sucesor;
        }
        // Casos 1 y 2, hoja o un solo hijo: el hijo (o nullptr) ocupa su lugar.
        Nodo* hijo = (actual->izq != nullptr) ? actual->izq : actual->der;
        if (padre == nullptr) {
            raiz = hijo;
        } else if (padre->izq == actual) {
            padre->izq = hijo;
        } else {
            padre->der = hijo;
        }
        delete actual;
        tamano--;
        return true;
    }

    // Los recorridos visitan cada nodo una vez: O(n).
    std::vector<int> recorridoInorden() const {
        std::vector<int> salida;
        inorden(raiz, salida);
        return salida;
    }

    std::vector<int> recorridoPreorden() const {
        std::vector<int> salida;
        preorden(raiz, salida);
        return salida;
    }

    std::vector<int> recorridoPostorden() const {
        std::vector<int> salida;
        postorden(raiz, salida);
        return salida;
    }

    // Cuántos niveles tiene (0 si está vacío).
    int altura() const {
        return altura(raiz);
    }

    int cantidad() const {
        return tamano;
    }

private:
    Nodo* raiz = nullptr;
    int tamano = 0;

    // O(n): izquierdo, nodo, derecho. En un ABB, sale de menor a mayor.
    void inorden(Nodo* nodo, std::vector<int>& salida) const {
        if (nodo == nullptr) {
            return;
        }
        inorden(nodo->izq, salida);
        salida.push_back(nodo->valor);
        inorden(nodo->der, salida);
    }

    // O(n): nodo, izquierdo, derecho. Sirve para copiar el árbol tal cual.
    void preorden(Nodo* nodo, std::vector<int>& salida) const {
        if (nodo == nullptr) {
            return;
        }
        salida.push_back(nodo->valor);
        preorden(nodo->izq, salida);
        preorden(nodo->der, salida);
    }

    // O(n): izquierdo, derecho, nodo. Los hijos antes que el padre.
    void postorden(Nodo* nodo, std::vector<int>& salida) const {
        if (nodo == nullptr) {
            return;
        }
        postorden(nodo->izq, salida);
        postorden(nodo->der, salida);
        salida.push_back(nodo->valor);
    }

    // O(n): visita cada nodo una vez.
    int altura(Nodo* nodo) const {
        if (nodo == nullptr) {
            return 0;
        }
        return 1 + std::max(altura(nodo->izq), altura(nodo->der));
    }

    // En postorden: un nodo se libera después de sus dos hijos.
    void liberar(Nodo* nodo) {
        if (nodo == nullptr) {
            return;
        }
        liberar(nodo->izq);
        liberar(nodo->der);
        delete nodo;
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
    ArbolBinarioBusqueda arbol;
    for (int v : {50, 30, 70, 20, 40, 60, 80}) {
        arbol.insertar(v);
    }
    std::cout << std::boolalpha;
    std::cout << "insertar(40) otra vez = " << arbol.insertar(40) << " (ya estaba)\n";
    std::cout << "cantidad = " << arbol.cantidad() << ", altura = " << arbol.altura() << "\n";

    std::cout << "buscar(60) = " << arbol.buscar(60) << "\n";
    std::cout << "buscar(65) = " << arbol.buscar(65) << "\n";

    imprimir("inorden   ", arbol.recorridoInorden());
    imprimir("preorden  ", arbol.recorridoPreorden());
    imprimir("postorden ", arbol.recorridoPostorden());

    arbol.eliminar(20);  // caso 1: una hoja
    imprimir("eliminar(20), una hoja      ", arbol.recorridoInorden());
    arbol.eliminar(30);  // caso 2: un solo hijo (el 40)
    imprimir("eliminar(30), un hijo       ", arbol.recorridoInorden());
    arbol.eliminar(50);  // caso 3: dos hijos (la raíz; la reemplaza su sucesor, 60)
    imprimir("eliminar(50), dos hijos     ", arbol.recorridoInorden());
    imprimir("preorden después            ", arbol.recorridoPreorden());
    std::cout << "eliminar(99) = " << arbol.eliminar(99) << " (no está)\n";

    // Insertar en orden arma una "lista": la altura crece con cada valor.
    ArbolBinarioBusqueda degenerado;
    for (int v = 1; v <= 7; v++) {
        degenerado.insertar(v);
    }
    std::cout << "1..7 en orden: altura = " << degenerado.altura() << "\n";

    ArbolBinarioBusqueda balanceado;
    for (int v : {4, 2, 6, 1, 3, 5, 7}) {
        balanceado.insertar(v);
    }
    std::cout << "4, 2, 6, 1, 3, 5, 7: altura = " << balanceado.altura() << "\n";

    return 0;
}
