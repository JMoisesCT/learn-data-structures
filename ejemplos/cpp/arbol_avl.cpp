// Árbol AVL: un árbol binario de búsqueda que se rebalancea solo. Cada nodo
// guarda su altura, y en todos los nodos las alturas de los dos subárboles
// difieren en 1 como mucho (el factor de balance es -1, 0 o +1). Cuando una
// inserción o un borrado lo rompe, una o dos rotaciones lo arreglan en O(1).
// Así la altura queda en O(log n) aunque los valores lleguen ordenados.
//
// std::set y std::map también son árboles balanceados, pero rojo-negro: una
// regla menos estricta que rota menos al insertar y borrar.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra arbol_avl.cpp -o arbol_avl
//   ./arbol_avl

#include <algorithm>
#include <iostream>
#include <vector>

struct Nodo {
    int valor;
    int altura;  // niveles de su subárbol: una hoja tiene altura 1
    Nodo* izq;
    Nodo* der;

    explicit Nodo(int v) : valor(v), altura(1), izq(nullptr), der(nullptr) {}
};

class ArbolAVL {
public:
    ArbolAVL() = default;

    ~ArbolAVL() {
        liberar(raiz);
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    ArbolAVL(const ArbolAVL&) = delete;
    ArbolAVL& operator=(const ArbolAVL&) = delete;

    // O(log n): igual que en un ABB, pero la altura siempre es O(log n).
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

    // O(log n): devuelve false si el valor ya estaba (sin repetidos, como std::set).
    bool insertar(int valor) {
        int antes = tamano;
        raiz = insertarEn(raiz, valor);
        return tamano > antes;
    }

    // O(log n): devuelve false si el valor no estaba.
    bool eliminar(int valor) {
        int antes = tamano;
        raiz = eliminarDe(raiz, valor);
        return tamano < antes;
    }

    std::vector<int> recorridoInorden() const {
        std::vector<int> salida;
        inorden(raiz, salida);
        return salida;
    }

    // Cuántos niveles tiene (0 si está vacío). O(1): la raíz la tiene guardada.
    int alturaTotal() const {
        return altura(raiz);
    }

    int cantidad() const {
        return tamano;
    }

private:
    Nodo* raiz = nullptr;
    int tamano = 0;

    // O(1): la altura está guardada en el nodo; la de nullptr es 0.
    static int altura(Nodo* nodo) {
        return nodo == nullptr ? 0 : nodo->altura;
    }

    // O(1): altura del izquierdo menos la del derecho. En un AVL es -1, 0 o +1.
    static int factorBalance(Nodo* nodo) {
        return altura(nodo->izq) - altura(nodo->der);
    }

    // O(1): se recalcula con las alturas (ya correctas) de sus dos hijos.
    static void actualizarAltura(Nodo* nodo) {
        nodo->altura = 1 + std::max(altura(nodo->izq), altura(nodo->der));
    }

    // O(1): el hijo izquierdo x sube y y baja a su derecha. El subárbol del
    // medio (t2, mayor que x y menor que y) cambia de padre. Devuelve la nueva raíz.
    static Nodo* rotarDerecha(Nodo* y) {
        Nodo* x = y->izq;
        Nodo* t2 = x->der;
        x->der = y;
        y->izq = t2;
        actualizarAltura(y);
        actualizarAltura(x);
        return x;
    }

    // O(1): el espejo de rotarDerecha. El hijo derecho y sube y x baja a su izquierda.
    static Nodo* rotarIzquierda(Nodo* x) {
        Nodo* y = x->der;
        Nodo* t2 = y->izq;
        y->izq = x;
        x->der = t2;
        actualizarAltura(x);
        actualizarAltura(y);
        return y;
    }

    // O(1): si el nodo quedó con factor +2 o -2, lo arregla con una o dos
    // rotaciones. Devuelve la raíz (quizás nueva) de ese subárbol.
    static Nodo* rebalancear(Nodo* nodo) {
        actualizarAltura(nodo);
        int balance = factorBalance(nodo);
        if (balance > 1) {  // cargado a la izquierda
            if (factorBalance(nodo->izq) < 0) {
                nodo->izq = rotarIzquierda(nodo->izq);  // caso izquierda-derecha
            }
            return rotarDerecha(nodo);  // caso izquierda-izquierda
        }
        if (balance < -1) {  // cargado a la derecha
            if (factorBalance(nodo->der) > 0) {
                nodo->der = rotarDerecha(nodo->der);  // caso derecha-izquierda
            }
            return rotarIzquierda(nodo);  // caso derecha-derecha
        }
        return nodo;  // ya estaba balanceado
    }

    // O(log n): baja como en un ABB y, al volver de la recursión, cada nodo
    // del camino se rebalancea. Devuelve la raíz (quizás nueva) del subárbol.
    Nodo* insertarEn(Nodo* nodo, int valor) {
        if (nodo == nullptr) {
            tamano++;
            return new Nodo(valor);
        }
        if (valor < nodo->valor) {
            nodo->izq = insertarEn(nodo->izq, valor);
        } else if (valor > nodo->valor) {
            nodo->der = insertarEn(nodo->der, valor);
        } else {
            return nodo;  // ya estaba: no cambia nada
        }
        return rebalancear(nodo);
    }

    // O(log n): borra como en un ABB y rebalancea al volver. A diferencia de
    // insertar, puede hacer falta rotar en más de un nivel del camino.
    Nodo* eliminarDe(Nodo* nodo, int valor) {
        if (nodo == nullptr) {
            return nullptr;  // no está
        }
        if (valor < nodo->valor) {
            nodo->izq = eliminarDe(nodo->izq, valor);
        } else if (valor > nodo->valor) {
            nodo->der = eliminarDe(nodo->der, valor);
        } else if (nodo->izq == nullptr || nodo->der == nullptr) {
            Nodo* hijo = (nodo->izq != nullptr) ? nodo->izq : nodo->der;
            delete nodo;  // hoja o un hijo: el hijo (o nullptr) ocupa su lugar
            tamano--;
            return hijo;
        } else {
            Nodo* sucesor = nodo->der;  // dos hijos: el menor del subárbol derecho
            while (sucesor->izq != nullptr) {
                sucesor = sucesor->izq;
            }
            nodo->valor = sucesor->valor;
            nodo->der = eliminarDe(nodo->der, sucesor->valor);
        }
        return rebalancear(nodo);
    }

    void inorden(Nodo* nodo, std::vector<int>& salida) const {
        if (nodo == nullptr) {
            return;
        }
        inorden(nodo->izq, salida);
        salida.push_back(nodo->valor);
        inorden(nodo->der, salida);
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
    std::cout << std::boolalpha;

    // Los mismos valores que dejaban al ABB como una lista de altura 7.
    ArbolAVL arbol;
    for (int v = 1; v <= 7; v++) {
        arbol.insertar(v);
    }
    std::cout << "1..7 en orden: altura = " << arbol.alturaTotal() << " (en un ABB sería 7)\n";
    imprimir("inorden", arbol.recorridoInorden());

    // Con 1000 valores ordenados la altura queda en 10, cerca de log2(1000).
    ArbolAVL grande;
    for (int v = 1; v <= 1000; v++) {
        grande.insertar(v);
    }
    std::cout << "1..1000 en orden: altura = " << grande.alturaTotal() << "\n";

    std::cout << "insertar(4) otra vez = " << arbol.insertar(4) << " (ya estaba)\n";
    std::cout << "buscar(6) = " << arbol.buscar(6) << ", buscar(9) = " << arbol.buscar(9) << "\n";

    // Rotación doble: 30, 10 y después 20 (izquierda-derecha).
    ArbolAVL doble;
    for (int v : {30, 10, 20}) {
        doble.insertar(v);
    }
    std::cout << "30, 10, 20: altura = " << doble.alturaTotal() << " (el 20 sube a la raíz)\n";

    // Borrar también puede desbalancear: se rebalancea al volver.
    for (int v : {1, 3, 2}) {
        arbol.eliminar(v);
    }
    imprimir("eliminar 1, 3 y 2", arbol.recorridoInorden());
    std::cout << "altura = " << arbol.alturaTotal() << ", cantidad = " << arbol.cantidad() << "\n";
    std::cout << "eliminar(99) = " << arbol.eliminar(99) << " (no está)\n";

    return 0;
}
