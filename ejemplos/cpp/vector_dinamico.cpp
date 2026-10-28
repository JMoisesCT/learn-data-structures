// Vector dinámico: un arreglo que crece automáticamente cuando se llena.
// Es la idea detrás de std::vector.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra vector_dinamico.cpp -o vector_dinamico
//   ./vector_dinamico

#include <iostream>
#include <stdexcept>

class VectorDinamico {
public:
    VectorDinamico() : datos(new int[2]), tamano(0), capacidad(2) {}

    ~VectorDinamico() {
        delete[] datos;
    }

    // Prohibimos las copias para mantener el ejemplo simple
    // (copiar el puntero causaría un doble delete[]).
    VectorDinamico(const VectorDinamico&) = delete;
    VectorDinamico& operator=(const VectorDinamico&) = delete;

    int obtener(int i) const {
        if (i < 0 || i >= tamano) {
            throw std::out_of_range("indice invalido");
        }
        return datos[i];
    }

    int size() const { return tamano; }
    int capacity() const { return capacidad; }

    // O(1) amortizado: casi siempre hay espacio libre al final.
    void agregarAlFinal(int valor) {
        if (tamano == capacidad) {
            redimensionar(capacidad * 2);
        }
        datos[tamano] = valor;
        tamano++;
    }

    // O(n): hay que desplazar a la derecha todo lo que está después de pos.
    void insertar(int pos, int valor) {
        if (pos < 0 || pos > tamano) {
            throw std::out_of_range("posicion invalida");
        }
        if (tamano == capacidad) {
            redimensionar(capacidad * 2);
        }
        for (int i = tamano; i > pos; i--) {
            datos[i] = datos[i - 1];
        }
        datos[pos] = valor;
        tamano++;
    }

    // O(n): hay que desplazar a la izquierda para cerrar el hueco.
    void eliminarEn(int pos) {
        if (pos < 0 || pos >= tamano) {
            throw std::out_of_range("posicion invalida");
        }
        for (int i = pos; i < tamano - 1; i++) {
            datos[i] = datos[i + 1];
        }
        tamano--;
    }

    // O(n): búsqueda lineal. Devuelve el índice o -1 si no existe.
    int buscar(int valor) const {
        for (int i = 0; i < tamano; i++) {
            if (datos[i] == valor) {
                return i;
            }
        }
        return -1;
    }

    void imprimir() const {
        std::cout << "[";
        for (int i = 0; i < tamano; i++) {
            std::cout << datos[i] << (i + 1 < tamano ? ", " : "");
        }
        std::cout << "]  tamano=" << tamano << " capacidad=" << capacidad << "\n";
    }

private:
    // O(n): reservamos un arreglo más grande y copiamos todo.
    void redimensionar(int nuevaCapacidad) {
        int* nuevos = new int[nuevaCapacidad];
        for (int i = 0; i < tamano; i++) {
            nuevos[i] = datos[i];
        }
        delete[] datos;
        datos = nuevos;
        capacidad = nuevaCapacidad;
    }

    int* datos;
    int tamano;
    int capacidad;
};

int main() {
    VectorDinamico v;

    for (int x : {10, 20, 30}) {
        v.agregarAlFinal(x);
        v.imprimir();
    }

    v.insertar(1, 15);
    std::cout << "insertar(1, 15)  -> ";
    v.imprimir();

    v.eliminarEn(0);
    std::cout << "eliminarEn(0)    -> ";
    v.imprimir();

    std::cout << "buscar(30) = " << v.buscar(30) << "\n";
    std::cout << "buscar(99) = " << v.buscar(99) << "\n";
    std::cout << "obtener(0) = " << v.obtener(0) << "\n";

    try {
        v.obtener(10);
    } catch (const std::out_of_range& e) {
        std::cout << "obtener(10) lanza excepcion: " << e.what() << "\n";
    }

    return 0;
}
