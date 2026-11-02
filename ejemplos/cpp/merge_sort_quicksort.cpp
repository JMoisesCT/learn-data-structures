// Merge sort y quicksort: dos formas de "divide y vencerás".
//   1. Dividir el problema en partes más chicas.
//   2. Resolver cada parte con la misma función (recursión).
//   3. Combinar las respuestas.
//
// Merge sort divide a la mitad sin mirar nada y hace el trabajo al
// COMBINAR (mezclar dos mitades ordenadas). Quicksort hace el trabajo al
// DIVIDIR (particionar alrededor de un pivote) y no tiene nada que combinar.
// Los dos bajan de O(n²) a O(n log n).
//
// Equivalentes en la STL (en <algorithm>):
//   std::sort         introsort: quicksort que cambia a heapsort si la
//                     recursión se hace muy profunda, e insertion sort
//                     para los pedazos chicos. No es estable.
//   std::stable_sort  merge sort: estable.
//   std::nth_element  la idea de quickselect.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra merge_sort_quicksort.cpp -o merge_sort_quicksort
//   ./merge_sort_quicksort

#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// ---------------------------------------------------------------------
// Merge sort
// ---------------------------------------------------------------------

// O(n): mezcla v[izq..medio] y v[medio + 1..der], que ya están ordenados,
// tomando siempre el menor de los dos frentes. Usa O(n) de memoria extra.
// Con <= (y no <), entre dos iguales gana el de la izquierda: es estable.
void mezclar(vector<int>& v, int izq, int medio, int der) {
    vector<int> aux;
    int i = izq, j = medio + 1;
    while (i <= medio && j <= der) {
        if (v[i] <= v[j]) aux.push_back(v[i++]);
        else aux.push_back(v[j++]);
    }
    while (i <= medio) aux.push_back(v[i++]);
    while (j <= der) aux.push_back(v[j++]);
    for (int k = 0; k < (int)aux.size(); k++) {
        v[izq + k] = aux[k];
    }
}

// O(n log n) siempre: log n niveles de divisiones y O(n) de mezcla por nivel.
void mergeSort(vector<int>& v, int izq, int der) {
    if (izq >= der) {
        return;
    }
    int medio = izq + (der - izq) / 2;
    mergeSort(v, izq, medio);
    mergeSort(v, medio + 1, der);
    mezclar(v, izq, medio, der);
}

// La misma idea sin recursión: mezcla bloques de 1, después de 2, de 4…
void mergeSortIterativo(vector<int>& v) {
    int n = v.size();
    for (int ancho = 1; ancho < n; ancho *= 2) {
        for (int izq = 0; izq < n - ancho; izq += 2 * ancho) {
            int medio = izq + ancho - 1;
            int der = min(izq + 2 * ancho - 1, n - 1);
            mezclar(v, izq, medio, der);
        }
    }
}

// ---------------------------------------------------------------------
// Quicksort
// ---------------------------------------------------------------------

// O(n), partición de Lomuto: el pivote es el último. Deja a la izquierda
// los <= pivote, a la derecha los mayores, y devuelve dónde quedó el pivote
// (que ya está en su lugar definitivo).
int particionar(vector<int>& v, int bajo, int alto) {
    int pivote = v[alto];
    int i = bajo - 1;
    for (int j = bajo; j < alto; j++) {
        if (v[j] <= pivote) {
            i++;
            swap(v[i], v[j]);
        }
    }
    swap(v[i + 1], v[alto]);
    return i + 1;
}

// O(n log n) en promedio, O(n²) en el peor caso: si el pivote es siempre el
// mayor o el menor (por ejemplo, con el arreglo ya ordenado), cada partición
// solo separa un elemento. No es estable.
void quickSort(vector<int>& v, int bajo, int alto) {
    if (bajo >= alto) {
        return;
    }
    int p = particionar(v, bajo, alto);
    quickSort(v, bajo, p - 1);
    quickSort(v, p + 1, alto);
}

// Un pivote al azar: ningún arreglo en particular es el peor caso.
int particionarAleatorio(vector<int>& v, int bajo, int alto) {
    int k = bajo + rand() % (alto - bajo + 1);
    swap(v[k], v[alto]);
    return particionar(v, bajo, alto);
}

// O(n log n) esperado para cualquier arreglo.
void quickSortAleatorio(vector<int>& v, int bajo, int alto) {
    if (bajo >= alto) {
        return;
    }
    int p = particionarAleatorio(v, bajo, alto);
    quickSortAleatorio(v, bajo, p - 1);
    quickSortAleatorio(v, p + 1, alto);
}

// El k-ésimo menor (k = 0 es el mínimo) sin ordenar todo: después de
// particionar, solo se sigue por el lado donde está k. O(n) en promedio.
int quickselect(vector<int>& v, int bajo, int alto, int k) {
    if (k < bajo || k > alto) {
        throw out_of_range("k fuera del rango");
    }
    if (bajo == alto) {
        return v[bajo];
    }
    int p = particionar(v, bajo, alto);
    if (k == p) {
        return v[p];
    } else if (k < p) {
        return quickselect(v, bajo, p - 1, k);
    } else {
        return quickselect(v, p + 1, alto, k);
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
    const vector<int> ejemplo = { 38, 27, 43, 3, 9, 82, 10 };
    int n = ejemplo.size();
    imprimir(ejemplo, "original           ");

    vector<int> a = ejemplo;
    mergeSort(a, 0, n - 1);
    imprimir(a, "mergeSort          ");

    vector<int> b = ejemplo;
    mergeSortIterativo(b);
    imprimir(b, "mergeSortIterativo ");

    vector<int> c = ejemplo;
    quickSort(c, 0, n - 1);
    imprimir(c, "quickSort          ");

    srand(2024);
    vector<int> d = ejemplo;
    quickSortAleatorio(d, 0, n - 1);
    imprimir(d, "quickSortAleatorio ");

    // La mediana: el elemento que quedaría en el medio si estuviera ordenado.
    vector<int> e = ejemplo;
    cout << "\nmediana (k = " << n / 2 << ") = " << quickselect(e, 0, n - 1, n / 2) << "\n";
    try {
        quickselect(e, 0, n - 1, n);
    } catch (const out_of_range& error) {
        cout << "quickselect con k = " << n << " lanza excepcion: " << error.what() << "\n";
    }

    // Con 0 elementos, der = -1 < izq = 0: mergeSort y quickSort no hacen nada.
    vector<int> vacio;
    mergeSort(vacio, 0, -1);
    quickSort(vacio, 0, -1);
    imprimir(vacio, "\nvacio              ");

    return 0;
}
