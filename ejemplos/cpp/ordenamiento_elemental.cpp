// Ordenamientos elementales: exchange sort, bubble sort, selection sort,
// insertion sort y shell sort. Todos ordenan el vector "en su lugar" (sin
// otro arreglo) comparando pares de valores y moviéndolos.
//
// Los cuatro primeros hacen O(n²) comparaciones en el peor caso: sirven
// para arreglos chicos o casi ordenados, y son la base para entender los
// rápidos (merge sort, quicksort y heapsort, en O(n log n)).
//
// Equivalentes en la STL (en <algorithm>):
//   std::sort(v.begin(), v.end())         rápido, no estable
//   std::stable_sort(v.begin(), v.end())  conserva el orden de los iguales
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra ordenamiento_elemental.cpp -o ordenamiento_elemental
//   ./ordenamiento_elemental

#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// O(n): está ordenado si cada par de vecinos está en orden.
bool estaOrdenado(const vector<int>& v) {
    for (size_t i = 1; i < v.size(); i++) {
        if (v[i - 1] > v[i]) {
            return false;
        }
    }
    return true;
}

// O(n²) siempre: compara cada posición i con todas las que vienen después
// y, si alguna es menor, la intercambia. No es estable.
void exchangeSort(vector<int>& v) {
    int n = v.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = i + 1; j < n; j++) {
            if (v[j] < v[i]) {
                swap(v[i], v[j]);
            }
        }
    }
}

// O(n²) en el peor caso, O(n) si ya está ordenado: compara vecinos y el
// mayor "burbujea" hasta el final. Si una pasada no intercambia nada, el
// arreglo ya está ordenado y se detiene. Es estable.
void bubbleSort(vector<int>& v) {
    int n = v.size();
    for (int i = 0; i < n - 1; i++) {
        bool huboIntercambio = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (v[j] > v[j + 1]) {
                swap(v[j], v[j + 1]);
                huboIntercambio = true;
            }
        }
        if (!huboIntercambio) {
            break;
        }
    }
}

// O(n²) comparaciones siempre, pero a lo más n - 1 intercambios: busca el
// mínimo de lo que falta y lo pone en su lugar. No es estable.
void selectionSort(vector<int>& v) {
    int n = v.size();
    for (int i = 0; i < n - 1; i++) {
        int minimo = i;
        for (int j = i + 1; j < n; j++) {
            if (v[j] < v[minimo]) {
                minimo = j;
            }
        }
        if (minimo != i) {
            swap(v[i], v[minimo]);
        }
    }
}

// O(n²) en el peor caso, O(n) si ya está casi ordenado: toma v[i], corre a
// la derecha los mayores que él y lo deja en el hueco. Es estable.
void insertionSort(vector<int>& v) {
    int n = v.size();
    for (int i = 1; i < n; i++) {
        int clave = v[i];
        int j = i - 1;
        while (j >= 0 && v[j] > clave) {
            v[j + 1] = v[j];
            j--;
        }
        v[j + 1] = clave;
    }
}

// Insertion sort con saltos: primero ordena los valores que están a
// distancia salto (n/2, n/4, …) y termina con salto = 1, que es un
// insertion sort normal sobre un arreglo casi ordenado. Con estos saltos el
// peor caso sigue siendo O(n²), pero en la práctica es mucho más rápido que
// insertion sort. No es estable.
void shellSort(vector<int>& v) {
    int n = v.size();
    for (int salto = n / 2; salto > 0; salto /= 2) {
        for (int i = salto; i < n; i++) {
            int clave = v[i];
            int j = i;
            while (j >= salto && v[j - salto] > clave) {
                v[j] = v[j - salto];
                j -= salto;
            }
            v[j] = clave;
        }
    }
}

void imprimir(const vector<int>& v, const string& titulo) {
    cout << titulo << ": {";
    for (size_t i = 0; i < v.size(); i++) {
        cout << (i ? ", " : " ") << v[i];
    }
    cout << " }" << (estaOrdenado(v) ? "  (ordenado)" : "") << "\n";
}

int main() {
    const vector<int> ejemplo = { 5, 2, 8, 1, 9, 3 };
    imprimir(ejemplo, "original      ");

    vector<int> a = ejemplo;
    exchangeSort(a);
    imprimir(a, "exchangeSort  ");

    vector<int> b = ejemplo;
    bubbleSort(b);
    imprimir(b, "bubbleSort    ");

    vector<int> c = ejemplo;
    selectionSort(c);
    imprimir(c, "selectionSort ");

    vector<int> d = ejemplo;
    insertionSort(d);
    imprimir(d, "insertionSort ");

    vector<int> e = { 23, 29, 15, 19, 31, 7, 9, 5 };
    imprimir(e, "\noriginal      ");
    shellSort(e);
    imprimir(e, "shellSort     ");

    // Casos borde: con 0 o 1 elementos los bucles no dan ninguna vuelta
    // (por eso n es int: con size_t, n - 1 sería un número enorme).
    vector<int> vacio;
    vector<int> uno = { 42 };
    insertionSort(vacio);
    bubbleSort(uno);
    imprimir(vacio, "\nvacio         ");
    imprimir(uno, "un elemento   ");

    return 0;
}
