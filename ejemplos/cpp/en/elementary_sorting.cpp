// Elementary sorting: exchange sort, bubble sort, selection sort,
// insertion sort and shell sort. They all sort the vector "in place" (without
// another array) by comparing pairs of values and moving them.
//
// The first four make O(n²) comparisons in the worst case: they're good
// for small or almost sorted arrays, and they're the basis for understanding
// the fast ones (merge sort, quicksort and heapsort, in O(n log n)).
//
// STL equivalents (in <algorithm>):
//   std::sort(v.begin(), v.end())         fast, not stable
//   std::stable_sort(v.begin(), v.end())  keeps the order of equal values
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra elementary_sorting.cpp -o elementary_sorting
//   ./elementary_sorting

#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// O(n): it's sorted if every pair of neighbors is in order.
bool isSorted(const vector<int>& v) {
    for (size_t i = 1; i < v.size(); i++) {
        if (v[i - 1] > v[i]) {
            return false;
        }
    }
    return true;
}

// O(n²) always: it compares each position i with all the ones after it
// and, if one is smaller, swaps them. It's not stable.
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

// O(n²) in the worst case, O(n) if it's already sorted: it compares neighbors
// and the largest one "bubbles up" to the end. If a pass doesn't swap anything,
// the array is already sorted and it stops. It's stable.
void bubbleSort(vector<int>& v) {
    int n = v.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (v[j] > v[j + 1]) {
                swap(v[j], v[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
}

// O(n²) comparisons always, but at most n - 1 swaps: it finds the
// minimum of what's left and puts it in its place. It's not stable.
void selectionSort(vector<int>& v) {
    int n = v.size();
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++) {
            if (v[j] < v[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) {
            swap(v[i], v[minIndex]);
        }
    }
}

// O(n²) in the worst case, O(n) if it's almost sorted: it takes v[i], shifts
// the larger ones to the right and drops it into the gap. It's stable.
void insertionSort(vector<int>& v) {
    int n = v.size();
    for (int i = 1; i < n; i++) {
        int key = v[i];
        int j = i - 1;
        while (j >= 0 && v[j] > key) {
            v[j + 1] = v[j];
            j--;
        }
        v[j + 1] = key;
    }
}

// Insertion sort with gaps: first it sorts the values that are gap apart
// (n/2, n/4, …) and it ends with gap = 1, which is a normal insertion sort
// on an almost sorted array. With these gaps the worst case is still
// O(n²), but in practice it's much faster than insertion sort. It's not
// stable.
void shellSort(vector<int>& v) {
    int n = v.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int key = v[i];
            int j = i;
            while (j >= gap && v[j - gap] > key) {
                v[j] = v[j - gap];
                j -= gap;
            }
            v[j] = key;
        }
    }
}

void print(const vector<int>& v, const string& title) {
    cout << title << ": {";
    for (size_t i = 0; i < v.size(); i++) {
        cout << (i ? ", " : " ") << v[i];
    }
    cout << " }" << (isSorted(v) ? "  (sorted)" : "") << "\n";
}

int main() {
    const vector<int> example = { 5, 2, 8, 1, 9, 3 };
    print(example, "original      ");

    vector<int> a = example;
    exchangeSort(a);
    print(a, "exchangeSort  ");

    vector<int> b = example;
    bubbleSort(b);
    print(b, "bubbleSort    ");

    vector<int> c = example;
    selectionSort(c);
    print(c, "selectionSort ");

    vector<int> d = example;
    insertionSort(d);
    print(d, "insertionSort ");

    vector<int> e = { 23, 29, 15, 19, 31, 7, 9, 5 };
    print(e, "\noriginal      ");
    shellSort(e);
    print(e, "shellSort     ");

    // Edge cases: with 0 or 1 elements the loops don't run even once
    // (that's why n is an int: with size_t, n - 1 would be a huge number).
    vector<int> noElements;
    vector<int> one = { 42 };
    insertionSort(noElements);
    bubbleSort(one);
    print(noElements, "\nempty         ");
    print(one, "one element   ");

    return 0;
}
