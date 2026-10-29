// Notación algorítmica (Big-O): cuántos pasos da un algoritmo según el
// tamaño n de su entrada. Cada función cuenta sus operaciones básicas en
// la variable global `pasos`, y main() imprime una tabla para ver cómo
// crece ese número cuando n se multiplica por 10.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra notacion_algoritmica.cpp -o notacion_algoritmica
//   ./notacion_algoritmica

#include <iomanip>
#include <iostream>
#include <vector>

// Contador de operaciones básicas. Solo sirve para medir: un programa
// normal no lo tendría.
long long pasos = 0;

// O(1): un solo acceso, sea cual sea el tamaño del arreglo.
// Ni siquiera necesita saber n.
int obtener(const int datos[], int i) {
    pasos++;
    return datos[i];
}

// O(n): una vuelta por elemento. El doble de datos, el doble de pasos.
int sumar(const int datos[], int n) {
    int suma = 0;
    for (int i = 0; i < n; i++) {
        pasos++;
        suma += datos[i];
    }
    return suma;
}

// O(n²): compara cada par de elementos. En el peor caso (sin repetidos)
// hace n·(n − 1)/2 comparaciones. El doble de datos, el cuádruple de pasos.
bool hayRepetidos(const int datos[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            pasos++;
            if (datos[i] == datos[j]) {
                return true;
            }
        }
    }
    return false;
}

// O(log n): cada vuelta descarta la mitad del rango que queda.
// El doble de datos, un solo paso más. Requiere datos ordenados.
int busquedaBinaria(const int datos[], int n, int objetivo) {
    int izq = 0;
    int der = n - 1;
    while (izq <= der) {
        pasos++;
        int medio = izq + (der - izq) / 2;
        if (datos[medio] == objetivo) {
            return medio;
        }
        if (datos[medio] < objetivo) {
            izq = medio + 1;
        } else {
            der = medio - 1;
        }
    }
    return -1;
}

// O(n log n): n búsquedas binarias, cada una de O(log n).
// Un ciclo de n vueltas con algo de O(log n) adentro: se multiplican.
int contarPresentes(const int consultas[], const int datos[], int n) {
    int encontrados = 0;
    for (int i = 0; i < n; i++) {
        if (busquedaBinaria(datos, n, consultas[i]) != -1) {
            encontrados++;
        }
    }
    return encontrados;
}

// O(2ⁿ): cada llamada hace otras dos. Sumarle 1 a n casi duplica el trabajo.
long long fibonacci(int n) {
    pasos++;
    if (n < 2) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    std::cout << "Pasos de cada funcion segun n (el peor caso de cada una):\n\n";
    std::cout << std::setw(8) << "n"
              << std::setw(10) << "O(1)"
              << std::setw(10) << "O(log n)"
              << std::setw(10) << "O(n)"
              << std::setw(12) << "O(n log n)"
              << std::setw(12) << "O(n^2)" << "\n";

    for (int n : {10, 100, 1000, 10000}) {
        // Datos ordenados y sin repetidos: 0, 2, 4, 6...
        std::vector<int> datos(n);
        std::vector<int> consultas(n);
        for (int k = 0; k < n; k++) {
            datos[k] = 2 * k;
            consultas[k] = 2 * k + 1; // impares: ninguno está, peor caso
        }

        pasos = 0;
        obtener(datos.data(), n - 1);
        long long constante = pasos;

        pasos = 0;
        busquedaBinaria(datos.data(), n, 2 * n); // mayor que todos: peor caso
        long long logaritmica = pasos;

        pasos = 0;
        sumar(datos.data(), n);
        long long lineal = pasos;

        pasos = 0;
        contarPresentes(consultas.data(), datos.data(), n);
        long long linealLog = pasos;

        pasos = 0;
        hayRepetidos(datos.data(), n);
        long long cuadratica = pasos;

        std::cout << std::setw(8) << n
                  << std::setw(10) << constante
                  << std::setw(10) << logaritmica
                  << std::setw(10) << lineal
                  << std::setw(12) << linealLog
                  << std::setw(12) << cuadratica << "\n";
    }

    std::cout << "\nO(2^n) con fibonacci recursivo:\n";
    for (int n : {10, 20, 25}) {
        pasos = 0;
        long long f = fibonacci(n);
        std::cout << "  fibonacci(" << n << ") = " << f << " -> " << pasos << " llamadas\n";
    }

    // Mejor caso: si hay un repetido al principio, hayRepetidos termina enseguida.
    int conRepetido[] = {7, 7, 3, 9, 1, 5};
    pasos = 0;
    bool repetido = hayRepetidos(conRepetido, 6);
    std::cout << "\nhayRepetidos({7, 7, 3, 9, 1, 5}) = " << std::boolalpha << repetido
              << " en " << pasos << " paso(s): mejor caso\n";

    return 0;
}
