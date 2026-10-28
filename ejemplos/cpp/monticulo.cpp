// Montículo binario (heap): un árbol binario completo guardado en un vector.
//   - Max-heap: cada padre es MAYOR o igual que sus hijos -> v[0] es el máximo.
//   - Min-heap: cada padre es MENOR o igual que sus hijos -> v[0] es el mínimo.
// En el vector, el nodo i tiene:
//   padre = (i - 1) / 2,   hijo izquierdo = 2 * i + 1,   hijo derecho = 2 * i + 2
//
// Equivalentes en la STL: std::make_heap, std::push_heap, std::pop_heap y
// std::sort_heap (en <algorithm>), y std::priority_queue (max-heap por defecto).
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra monticulo.cpp -o monticulo
//   ./monticulo

#include <iostream>
#include <string>
#include <vector>
#include <climits>
using namespace std;

// ─────────────────────────────────────────
//  MAX HEAP
// ─────────────────────────────────────────

// O(log n): hunde v[i] (sus dos subárboles ya deben ser max-heaps).
void maxHeapify(vector<int>& v, int n, int i) {
    int mayor = i;
    int izq = 2 * i + 1;
    int der = 2 * i + 2;

    if (izq < n && v[izq] > v[mayor]) mayor = izq;
    if (der < n && v[der] > v[mayor]) mayor = der;

    if (mayor != i) {
        swap(v[i], v[mayor]);
        maxHeapify(v, n, mayor);
    }
}

// O(n): arregla los nodos con hijos, desde el último hasta la raíz.
void buildMaxHeap(vector<int>& v) {
    int n = v.size();
    for (int i = n / 2 - 1; i >= 0; i--)
        maxHeapify(v, n, i);
}

// ─────────────────────────────────────────
//  MIN HEAP
// ─────────────────────────────────────────

// O(log n): igual que maxHeapify, pero sube el MENOR.
void minHeapify(vector<int>& v, int n, int i) {
    int menor = i;
    int izq = 2 * i + 1;
    int der = 2 * i + 2;

    if (izq < n && v[izq] < v[menor]) menor = izq;
    if (der < n && v[der] < v[menor]) menor = der;

    if (menor != i) {
        swap(v[i], v[menor]);
        minHeapify(v, n, menor);   // baja recursivamente
    }
}

// O(n)
void buildMinHeap(vector<int>& v) {
    int n = v.size();
    for (int i = n / 2 - 1; i >= 0; i--)
        minHeapify(v, n, i);
}

// ─────────────────────────────────────────
//  INSERT (funciona para ambos heaps) — O(log n)
//  Se inserta al final y se "sube" el elemento
// ─────────────────────────────────────────

void insertMax(vector<int>& v, int valor) {
    v.push_back(valor);
    int i = v.size() - 1;

    // Sube mientras el padre sea menor
    while (i > 0 && v[(i - 1) / 2] < v[i]) {
        swap(v[i], v[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

void insertMin(vector<int>& v, int valor) {
    v.push_back(valor);
    int i = v.size() - 1;

    // Sube mientras el padre sea mayor
    while (i > 0 && v[(i - 1) / 2] > v[i]) {
        swap(v[i], v[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

// ─────────────────────────────────────────
//  MAXIMUM y MINIMUM — O(1)
//  El tope siempre tiene el valor buscado
// ─────────────────────────────────────────

int maximum(vector<int>& v) {
    if (v.empty()) return INT_MIN;
    return v[0];   // raíz del max-heap
}

int minimum(vector<int>& v) {
    if (v.empty()) return INT_MAX;
    return v[0];   // raíz del min-heap
}

// ─────────────────────────────────────────
//  EXTRACT MAX — O(log n)
//  Saca la raíz, pone el último en su lugar
//  y restaura con maxHeapify
// ─────────────────────────────────────────

int extractMax(vector<int>& v) {
    if (v.empty()) return INT_MIN;

    int raiz = v[0];
    v[0] = v.back();
    v.pop_back();
    maxHeapify(v, v.size(), 0);

    return raiz;
}

// ─────────────────────────────────────────
//  EXTRACT MIN — O(log n)
// ─────────────────────────────────────────

int extractMin(vector<int>& v) {
    if (v.empty()) return INT_MAX;

    int raiz = v[0];
    v[0] = v.back();
    v.pop_back();
    minHeapify(v, v.size(), 0);

    return raiz;
}

// ─────────────────────────────────────────
//  HEAP SORT (usa max-heap → orden ascendente)
//  O(n log n) y sin memoria extra
// ─────────────────────────────────────────

void heapSort(vector<int>& v) {
    buildMaxHeap(v);
    for (int i = v.size() - 1; i > 0; i--) {
        swap(v[0], v[i]);
        maxHeapify(v, i, 0);
    }
}

// ─────────────────────────────────────────
//  UTILIDADES
// ─────────────────────────────────────────

void print(const vector<int>& v, const string& label = "") {
    if (!label.empty()) cout << label << ": ";
    for (int x : v) cout << x << " ";
    cout << "\n";
}

// ─────────────────────────────────────────
//  MAIN — prueba de todas las funciones
// ─────────────────────────────────────────

int main() {
    // ── Max Heap ──
    cout << "=== MAX HEAP ===\n";
    vector<int> maxH = { 3, 10, 1, 8, 6, 4 };
    buildMaxHeap(maxH);
    print(maxH, "buildMaxHeap");

    cout << "maximum()   = " << maximum(maxH) << "\n";
    cout << "extractMax  = " << extractMax(maxH) << "\n";
    print(maxH, "tras extractMax");

    insertMax(maxH, 15);
    print(maxH, "tras insert(15)");

    // ── Min Heap ──
    cout << "\n=== MIN HEAP ===\n";
    vector<int> minH = { 3, 10, 1, 8, 6, 4 };
    buildMinHeap(minH);
    print(minH, "buildMinHeap");

    cout << "minimum()   = " << minimum(minH) << "\n";
    cout << "extractMin  = " << extractMin(minH) << "\n";
    print(minH, "tras extractMin");

    insertMin(minH, 0);
    print(minH, "tras insert(0)");

    // ── Heap vacío: se devuelve un valor centinela ──
    vector<int> vacio;
    cout << "\nextractMax en heap vacio = " << extractMax(vacio) << " (INT_MIN)\n";

    // ── Heap Sort ──
    cout << "\n=== HEAP SORT ===\n";
    vector<int> hs = { 3, 10, 1, 8, 6, 4 };
    print(hs, "antes ");
    heapSort(hs);
    print(hs, "despues");

    return 0;
}
