// Ordenamientos sin comparaciones: counting sort, radix sort y bucket sort.
//
// Ningún ordenamiento que solo COMPARE pares de valores puede bajar de
// O(n log n). Estos no comparan: usan el valor mismo como posición en un
// arreglo (o en una cubeta). Por eso llegan a O(n), pero solo sirven con
// claves que se pueden usar como índice: enteros en un rango chico, o
// dígitos, o números repartidos parejo en un intervalo.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra ordenamiento_sin_comparaciones.cpp -o ordenamiento_sin_comparaciones
//   ./ordenamiento_sin_comparaciones

#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

// ---------------------------------------------------------------------
// Counting sort
// ---------------------------------------------------------------------

// O(n + k), con k = maximo + 1: cuenta cuántas veces aparece cada valor y
// reescribe el arreglo en orden. Valores entre 0 y maximo.
void contarYReescribir(vector<int>& v, int maximo) {
    vector<int> conteo(maximo + 1, 0);
    for (int x : v) {
        conteo[x]++;
    }
    int k = 0;
    for (int valor = 0; valor <= maximo; valor++) {
        for (int c = 0; c < conteo[valor]; c++) {
            v[k++] = valor;
        }
    }
}

// O(n + k) y estable: las sumas acumuladas dicen dónde termina cada valor
// en la salida, y se recorre v de derecha a izquierda para que los iguales
// conserven su orden. Así sirve para ordenar registros por una clave.
vector<int> countingSort(const vector<int>& v, int maximo) {
    vector<int> conteo(maximo + 1, 0);
    for (int x : v) {
        if (x < 0 || x > maximo) {
            throw out_of_range("valor fuera de 0..maximo");
        }
        conteo[x]++;
    }
    for (int i = 1; i <= maximo; i++) {
        conteo[i] += conteo[i - 1];
    }
    vector<int> salida(v.size());
    for (int i = (int)v.size() - 1; i >= 0; i--) {
        conteo[v[i]]--;
        salida[conteo[v[i]]] = v[i];
    }
    return salida;
}

// ---------------------------------------------------------------------
// Radix sort (LSD: del dígito menos significativo al más significativo)
// ---------------------------------------------------------------------

// Counting sort estable usando solo un dígito como clave (exp = 1, 10, 100…).
void ordenarPorDigito(vector<int>& v, int exp) {
    vector<int> conteo(10, 0);
    for (int x : v) {
        conteo[(x / exp) % 10]++;
    }
    for (int d = 1; d < 10; d++) {
        conteo[d] += conteo[d - 1];
    }
    vector<int> salida(v.size());
    for (int i = (int)v.size() - 1; i >= 0; i--) {
        int d = (v[i] / exp) % 10;
        conteo[d]--;
        salida[conteo[d]] = v[i];
    }
    v = salida;
}

// O(d · (n + 10)), con d = cantidad de dígitos del mayor. Funciona porque
// cada pasada es estable: lo que ordenaron las pasadas anteriores se
// conserva entre los que empatan en el dígito actual. Valores >= 0.
void radixSort(vector<int>& v) {
    if (v.empty()) {
        return;
    }
    int maximo = *max_element(v.begin(), v.end());
    for (int exp = 1; maximo / exp > 0; exp *= 10) {
        ordenarPorDigito(v, exp);
    }
}

// ---------------------------------------------------------------------
// Bucket sort
// ---------------------------------------------------------------------

// O(n) en promedio si los valores están repartidos parejo en 0..maximo:
// cada cubeta recibe pocos y ordenarlas es barato. Si todos caen en la
// misma cubeta, es tan lento como el sort de adentro. Valores >= 0.
void bucketSort(vector<int>& v, int maximo, int cubetas) {
    vector<vector<int>> cubeta(cubetas);
    for (int x : v) {
        cubeta[(long long)x * cubetas / (maximo + 1)].push_back(x);
    }
    int k = 0;
    for (auto& c : cubeta) {
        sort(c.begin(), c.end());
        for (int x : c) {
            v[k++] = x;
        }
    }
}

void imprimir(const vector<int>& v, const string& titulo) {
    cout << titulo << ": {";
    for (size_t i = 0; i < v.size(); i++) {
        cout << (i ? ", " : " ") << v[i];
    }
    cout << " }\n";
}

int main() {
    vector<int> a = { 4, 1, 3, 4, 0, 2, 1 };
    imprimir(a, "original           ");
    contarYReescribir(a, 4);
    imprimir(a, "contarYReescribir  ");

    const vector<int> b = { 4, 1, 3, 4, 0, 2, 1 };
    imprimir(countingSort(b, 4), "countingSort       ");
    try {
        countingSort({ 3, 7, 1 }, 4);
    } catch (const out_of_range& error) {
        cout << "countingSort con un 7 y maximo = 4 lanza excepcion: " << error.what() << "\n";
    }

    vector<int> c = { 170, 45, 75, 90, 802, 24, 2, 66 };
    imprimir(c, "\noriginal           ");
    radixSort(c);
    imprimir(c, "radixSort          ");

    vector<int> d = { 42, 7, 93, 15, 68, 31, 84, 59, 3, 26 };
    imprimir(d, "\noriginal           ");
    bucketSort(d, 99, 5);
    imprimir(d, "bucketSort         ");

    vector<int> vacio;
    radixSort(vacio);
    imprimir(vacio, "\nvacio              ");

    return 0;
}
