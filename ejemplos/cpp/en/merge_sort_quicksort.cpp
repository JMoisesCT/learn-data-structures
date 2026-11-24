// Merge sort and quicksort: two ways of "divide and conquer".
//   1. Divide the problem into smaller parts.
//   2. Solve each part with the same function (recursion).
//   3. Combine the answers.
//
// Merge sort splits in half without looking at anything and does the work
// when COMBINING (merging two sorted halves). Quicksort does the work when
// DIVIDING (partitioning around a pivot) and has nothing to combine.
// Both go down from O(n²) to O(n log n).
//
// STL equivalents (in <algorithm>):
//   std::sort         introsort: a quicksort that switches to heapsort if
//                     the recursion gets too deep, and insertion sort
//                     for the small pieces. Not stable.
//   std::stable_sort  merge sort: stable.
//   std::nth_element  the idea of quickselect.
//
// Compile and run:
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

// O(n): merges v[left..mid] and v[mid + 1..right], which are already sorted,
// always taking the smaller of the two fronts. It uses O(n) extra memory.
// With <= (and not <), between two equal values the left one wins: it's stable.
void merge(vector<int>& v, int left, int mid, int right) {
    vector<int> aux;
    int i = left, j = mid + 1;
    while (i <= mid && j <= right) {
        if (v[i] <= v[j]) aux.push_back(v[i++]);
        else aux.push_back(v[j++]);
    }
    while (i <= mid) aux.push_back(v[i++]);
    while (j <= right) aux.push_back(v[j++]);
    for (int k = 0; k < (int)aux.size(); k++) {
        v[left + k] = aux[k];
    }
}

// O(n log n) always: log n levels of splits and O(n) of merging per level.
void mergeSort(vector<int>& v, int left, int right) {
    if (left >= right) {
        return;
    }
    int mid = left + (right - left) / 2;
    mergeSort(v, left, mid);
    mergeSort(v, mid + 1, right);
    merge(v, left, mid, right);
}

// The same idea without recursion: it merges blocks of 1, then of 2, of 4…
void iterativeMergeSort(vector<int>& v) {
    int n = v.size();
    for (int width = 1; width < n; width *= 2) {
        for (int left = 0; left < n - width; left += 2 * width) {
            int mid = left + width - 1;
            int right = min(left + 2 * width - 1, n - 1);
            merge(v, left, mid, right);
        }
    }
}

// ---------------------------------------------------------------------
// Quicksort
// ---------------------------------------------------------------------

// O(n), Lomuto partition: the pivot is the last one. It leaves the ones
// <= pivot on the left, the larger ones on the right, and returns where the
// pivot ended up (which is already in its final place).
int partition(vector<int>& v, int low, int high) {
    int pivot = v[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (v[j] <= pivot) {
            i++;
            swap(v[i], v[j]);
        }
    }
    swap(v[i + 1], v[high]);
    return i + 1;
}

// O(n log n) on average, O(n²) in the worst case: if the pivot is always the
// largest or the smallest (for example, with the array already sorted), each
// partition only splits off one element. It's not stable.
void quickSort(vector<int>& v, int low, int high) {
    if (low >= high) {
        return;
    }
    int p = partition(v, low, high);
    quickSort(v, low, p - 1);
    quickSort(v, p + 1, high);
}

// A random pivot: no particular array is the worst case.
int randomPartition(vector<int>& v, int low, int high) {
    int k = low + rand() % (high - low + 1);
    swap(v[k], v[high]);
    return partition(v, low, high);
}

// O(n log n) expected for any array.
void randomQuickSort(vector<int>& v, int low, int high) {
    if (low >= high) {
        return;
    }
    int p = randomPartition(v, low, high);
    randomQuickSort(v, low, p - 1);
    randomQuickSort(v, p + 1, high);
}

// The k-th smallest (k = 0 is the minimum) without sorting everything: after
// partitioning, it only goes on with the side where k is. O(n) on average.
int quickselect(vector<int>& v, int low, int high, int k) {
    if (k < low || k > high) {
        throw out_of_range("k out of range");
    }
    if (low == high) {
        return v[low];
    }
    int p = partition(v, low, high);
    if (k == p) {
        return v[p];
    } else if (k < p) {
        return quickselect(v, low, p - 1, k);
    } else {
        return quickselect(v, p + 1, high, k);
    }
}

void print(const vector<int>& v, const string& title) {
    cout << title << ": {";
    for (size_t i = 0; i < v.size(); i++) {
        cout << (i ? ", " : " ") << v[i];
    }
    cout << " }\n";
}

int main() {
    const vector<int> example = { 38, 27, 43, 3, 9, 82, 10 };
    int n = example.size();
    print(example, "original           ");

    vector<int> a = example;
    mergeSort(a, 0, n - 1);
    print(a, "mergeSort          ");

    vector<int> b = example;
    iterativeMergeSort(b);
    print(b, "iterativeMergeSort ");

    vector<int> c = example;
    quickSort(c, 0, n - 1);
    print(c, "quickSort          ");

    srand(2024);
    vector<int> d = example;
    randomQuickSort(d, 0, n - 1);
    print(d, "randomQuickSort    ");

    // The median: the element that would be in the middle if it were sorted.
    vector<int> e = example;
    cout << "\nmedian (k = " << n / 2 << ") = " << quickselect(e, 0, n - 1, n / 2) << "\n";
    try {
        quickselect(e, 0, n - 1, n);
    } catch (const out_of_range& error) {
        cout << "quickselect with k = " << n << " throws an exception: " << error.what() << "\n";
    }

    // With 0 elements, right = -1 < left = 0: mergeSort and quickSort do nothing.
    vector<int> noElements;
    mergeSort(noElements, 0, -1);
    quickSort(noElements, 0, -1);
    print(noElements, "\nempty              ");

    return 0;
}
