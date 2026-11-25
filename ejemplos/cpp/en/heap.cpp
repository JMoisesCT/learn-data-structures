// Binary heap: a complete binary tree stored in a vector.
//   - Max-heap: each parent is GREATER than or equal to its children -> v[0] is the maximum.
//   - Min-heap: each parent is LESS than or equal to its children -> v[0] is the minimum.
// In the vector, node i has:
//   parent = (i - 1) / 2,   left child = 2 * i + 1,   right child = 2 * i + 2
//
// STL equivalents: std::make_heap, std::push_heap, std::pop_heap and
// std::sort_heap (in <algorithm>), and std::priority_queue (max-heap by default).
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra heap.cpp -o heap
//   ./heap

#include <iostream>
#include <string>
#include <vector>
#include <climits>
using namespace std;

// ─────────────────────────────────────────
//  MAX HEAP
// ─────────────────────────────────────────

// O(log n): sinks v[i] (its two subtrees must already be max-heaps).
void maxHeapify(vector<int>& v, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && v[left] > v[largest]) largest = left;
    if (right < n && v[right] > v[largest]) largest = right;

    if (largest != i) {
        swap(v[i], v[largest]);
        maxHeapify(v, n, largest);
    }
}

// O(n): fixes the nodes that have children, from the last one up to the root.
void buildMaxHeap(vector<int>& v) {
    int n = v.size();
    for (int i = n / 2 - 1; i >= 0; i--)
        maxHeapify(v, n, i);
}

// ─────────────────────────────────────────
//  MIN HEAP
// ─────────────────────────────────────────

// O(log n): same as maxHeapify, but brings up the SMALLEST.
void minHeapify(vector<int>& v, int n, int i) {
    int smallest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && v[left] < v[smallest]) smallest = left;
    if (right < n && v[right] < v[smallest]) smallest = right;

    if (smallest != i) {
        swap(v[i], v[smallest]);
        minHeapify(v, n, smallest);   // goes down recursively
    }
}

// O(n)
void buildMinHeap(vector<int>& v) {
    int n = v.size();
    for (int i = n / 2 - 1; i >= 0; i--)
        minHeapify(v, n, i);
}

// ─────────────────────────────────────────
//  INSERT (works for both heaps) — O(log n)
//  The value goes in at the end and "rises"
// ─────────────────────────────────────────

void insertMax(vector<int>& v, int value) {
    v.push_back(value);
    int i = v.size() - 1;

    // Rise while the parent is smaller
    while (i > 0 && v[(i - 1) / 2] < v[i]) {
        swap(v[i], v[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

void insertMin(vector<int>& v, int value) {
    v.push_back(value);
    int i = v.size() - 1;

    // Rise while the parent is larger
    while (i > 0 && v[(i - 1) / 2] > v[i]) {
        swap(v[i], v[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

// ─────────────────────────────────────────
//  MAXIMUM and MINIMUM — O(1)
//  The top always holds the value we want
// ─────────────────────────────────────────

int maximum(vector<int>& v) {
    if (v.empty()) return INT_MIN;
    return v[0];   // root of the max-heap
}

int minimum(vector<int>& v) {
    if (v.empty()) return INT_MAX;
    return v[0];   // root of the min-heap
}

// ─────────────────────────────────────────
//  EXTRACT MAX — O(log n)
//  Takes out the root, puts the last one in its place
//  and restores the heap with maxHeapify
// ─────────────────────────────────────────

int extractMax(vector<int>& v) {
    if (v.empty()) return INT_MIN;

    int root = v[0];
    v[0] = v.back();
    v.pop_back();
    maxHeapify(v, v.size(), 0);

    return root;
}

// ─────────────────────────────────────────
//  EXTRACT MIN — O(log n)
// ─────────────────────────────────────────

int extractMin(vector<int>& v) {
    if (v.empty()) return INT_MAX;

    int root = v[0];
    v[0] = v.back();
    v.pop_back();
    minHeapify(v, v.size(), 0);

    return root;
}

// ─────────────────────────────────────────
//  HEAP SORT (uses a max-heap → ascending order)
//  O(n log n) and no extra memory
// ─────────────────────────────────────────

void heapSort(vector<int>& v) {
    buildMaxHeap(v);
    for (int i = v.size() - 1; i > 0; i--) {
        swap(v[0], v[i]);
        maxHeapify(v, i, 0);
    }
}

// ─────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────

void print(const vector<int>& v, const string& label = "") {
    if (!label.empty()) cout << label << ": ";
    for (int x : v) cout << x << " ";
    cout << "\n";
}

// ─────────────────────────────────────────
//  MAIN — tries out every function
// ─────────────────────────────────────────

int main() {
    // ── Max Heap ──
    cout << "=== MAX HEAP ===\n";
    vector<int> maxH = { 3, 10, 1, 8, 6, 4 };
    buildMaxHeap(maxH);
    print(maxH, "buildMaxHeap");

    cout << "maximum()   = " << maximum(maxH) << "\n";
    cout << "extractMax  = " << extractMax(maxH) << "\n";
    print(maxH, "after extractMax");

    insertMax(maxH, 15);
    print(maxH, "after insert(15)");

    // ── Min Heap ──
    cout << "\n=== MIN HEAP ===\n";
    vector<int> minH = { 3, 10, 1, 8, 6, 4 };
    buildMinHeap(minH);
    print(minH, "buildMinHeap");

    cout << "minimum()   = " << minimum(minH) << "\n";
    cout << "extractMin  = " << extractMin(minH) << "\n";
    print(minH, "after extractMin");

    insertMin(minH, 0);
    print(minH, "after insert(0)");

    // ── Empty heap: a sentinel value is returned ──
    vector<int> empty;
    cout << "\nextractMax on an empty heap = " << extractMax(empty) << " (INT_MIN)\n";

    // ── Heap Sort ──
    cout << "\n=== HEAP SORT ===\n";
    vector<int> hs = { 3, 10, 1, 8, 6, 4 };
    print(hs, "before");
    heapSort(hs);
    print(hs, "after ");

    return 0;
}
