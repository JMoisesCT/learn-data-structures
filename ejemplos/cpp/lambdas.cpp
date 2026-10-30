// Lambdas: funciones sin nombre que se escriben justo donde se usan.
// No son una estructura de datos, pero aparecen en todos los temas que
// siguen: le dicen a std::sort cómo ordenar, a std::count_if qué contar
// y a std::priority_queue quién tiene más prioridad.
//
// Forma general:  [capturas](parámetros) -> tipo { cuerpo }
//   [capturas]   variables de afuera que la lambda puede usar
//   (parámetros) lo que recibe en cada llamada, como una función normal
//   -> tipo      opcional: casi siempre el compilador lo deduce del return
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra lambdas.cpp -o lambdas
//   ./lambdas

#include <algorithm>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <queue>
#include <vector>

// ---------------------------------------------------------------------
// 1. Lambda simple: no captura nada y se llama como cualquier función.
// ---------------------------------------------------------------------

// O(1): crear la lambda y llamarla cuesta lo mismo que una función normal.
int elevarAlCuadrado(int n) {
    auto cuadrado = [](int x) {
        return x * x;
    };
    int resultado = cuadrado(n);
    return resultado;
}

// ---------------------------------------------------------------------
// 2. Capturas: por valor [x] guarda una copia; por referencia [&x]
//    guarda el acceso a la variable original.
// ---------------------------------------------------------------------

// La lambda guarda una COPIA de factor en el momento en que se crea.
int capturaPorValor(int factor, int x) {
    auto multiplicar = [factor](int y) {
        return y * factor;
    };
    factor = 100;
    return multiplicar(x);
}

// O(n): la lambda modifica la variable total original en cada llamada.
int sumarConReferencia(const std::vector<int>& numeros) {
    int total = 0;
    auto acumular = [&total](int x) {
        total += x;
    };
    for (int x : numeros) {
        acumular(x);
    }
    return total;
}

// ---------------------------------------------------------------------
// 3. Lambdas anidadas
// ---------------------------------------------------------------------

// Una lambda dentro de otra: cuadrado solo existe mientras se ejecuta
// sumarCuadrados, y cada llamada abre su propio marco en la pila. O(n).
int sumaDeCuadrados(const std::vector<int>& numeros) {
    auto sumarCuadrados = [](const std::vector<int>& v) {
        auto cuadrado = [](int x) {
            return x * x;
        };
        int suma = 0;
        for (int x : v) {
            suma += cuadrado(x);
        }
        return suma;
    };
    return sumarCuadrados(numeros);
}

// Una lambda que fabrica lambdas: cada sumador recuerda su propia b,
// aunque crearSumador ya haya terminado. Por eso captura por valor.
int usarSumador(int base, int x) {
    auto crearSumador = [](int b) {
        return [b](int y) {
            return b + y;
        };
    };
    auto sumarBase = crearSumador(base);
    return sumarBase(x);
}

// ---------------------------------------------------------------------
// 4. Usos prácticos: darle un criterio a los algoritmos de la STL
// ---------------------------------------------------------------------

// O(n): count_if llama a la lambda una vez por elemento.
int contarMayores(const std::vector<int>& numeros, int limite) {
    return std::count_if(numeros.begin(), numeros.end(), [limite](int x) {
        return x > limite;
    });
}

// O(n): find_if se detiene en el primer elemento que cumple (k debe ser >= 1).
int primerMultiplo(const std::vector<int>& numeros, int k) {
    auto it = std::find_if(numeros.begin(), numeros.end(), [k](int x) {
        return x % k == 0;
    });
    if (it == numeros.end()) {
        return -1;
    }
    return *it;
}

// O(n log n): std::sort le pregunta a la lambda "¿a va antes que b?".
void ordenarDescendente(std::vector<int>& numeros) {
    std::sort(numeros.begin(), numeros.end(), [](int a, int b) {
        return a > b;
    });
}

// Primero los más cercanos a centro; si empatan, el menor.
void ordenarPorCercania(std::vector<int>& numeros, int centro) {
    std::sort(numeros.begin(), numeros.end(), [centro](int a, int b) {
        int da = std::abs(a - centro);
        int db = std::abs(b - centro);
        if (da != db) {
            return da < db;
        }
        return a < b;
    });
}

// Primero los pares y después los impares, cada grupo de menor a mayor
// (para números no negativos).
void ordenarParesPrimero(std::vector<int>& numeros) {
    std::sort(numeros.begin(), numeros.end(), [](int a, int b) {
        if (a % 2 != b % 2) {
            return a % 2 == 0;
        }
        return a < b;
    });
}

void imprimir(const std::vector<int>& numeros) {
    std::cout << "{";
    for (size_t i = 0; i < numeros.size(); i++) {
        std::cout << numeros[i] << (i + 1 < numeros.size() ? ", " : "");
    }
    std::cout << "}\n";
}

int main() {
    std::cout << "elevarAlCuadrado(5)    = " << elevarAlCuadrado(5) << "\n";
    std::cout << "capturaPorValor(3, 4)  = " << capturaPorValor(3, 4) << "  (no 400)\n";

    std::vector<int> numeros = {4, 7, 2, 9, 5};
    std::cout << "numeros = ";
    imprimir(numeros);
    std::cout << "sumarConReferencia     = " << sumarConReferencia(numeros) << "\n";
    std::cout << "sumaDeCuadrados        = " << sumaDeCuadrados(numeros) << "\n";
    std::cout << "usarSumador(10, 5)     = " << usarSumador(10, 5) << "\n";
    std::cout << "contarMayores(_, 4)    = " << contarMayores(numeros, 4) << "\n";
    std::cout << "primerMultiplo(_, 3)   = " << primerMultiplo(numeros, 3) << "\n";
    std::cout << "primerMultiplo(_, 8)   = " << primerMultiplo(numeros, 8) << "  (ninguno)\n";

    ordenarDescendente(numeros);
    std::cout << "ordenarDescendente     -> ";
    imprimir(numeros);
    ordenarPorCercania(numeros, 6);
    std::cout << "ordenarPorCercania(6)  -> ";
    imprimir(numeros);
    ordenarParesPrimero(numeros);
    std::cout << "ordenarParesPrimero    -> ";
    imprimir(numeros);

    // Más formas que vas a encontrar:

    // Lambda genérica (C++14): auto en los parámetros, sirve para cualquier tipo.
    auto mayor = [](auto a, auto b) { return a > b ? a : b; };
    std::cout << "mayor(3, 8) = " << mayor(3, 8) << ", mayor(2.5, 1.5) = " << mayor(2.5, 1.5) << "\n";

    // mutable: permite modificar la copia capturada (el original no cambia).
    int llamadas = 0;
    auto contar = [llamadas]() mutable { return ++llamadas; };
    contar();
    contar();
    std::cout << "contar() devolvio " << contar() << ", pero llamadas sigue en " << llamadas << "\n";

    // [=] copia y [&] referencia todo lo que se use dentro.
    int a = 2;
    int b = 3;
    auto copiaTodo = [=]() { return a * b; };
    auto refTodo = [&]() { a = 10; };
    refTodo();
    std::cout << "copiaTodo() = " << copiaTodo() << " aunque a ahora vale " << a << "\n";

    // Una lambda como criterio de prioridad: un montículo de mínimos.
    auto menorPrimero = [](int x, int y) { return x > y; };
    std::priority_queue<int, std::vector<int>, decltype(menorPrimero)> cola(menorPrimero);
    for (int x : {5, 1, 8, 3}) {
        cola.push(x);
    }
    std::cout << "priority_queue con lambda saca primero el " << cola.top() << "\n";

    // std::function guarda cualquier cosa invocable; permite una lambda recursiva.
    std::function<int(int)> factorial = [&factorial](int n) {
        return n <= 1 ? 1 : n * factorial(n - 1);
    };
    std::cout << "factorial(5) = " << factorial(5) << "\n";

    return 0;
}
