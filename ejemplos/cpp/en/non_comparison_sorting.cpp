// Non-comparison sorting: counting sort, radix sort and bucket sort.
//
// No sort that only COMPARES pairs of values can go below O(n log n).
// These don't compare: they use the value itself as a position in an
// array (or in a bucket). That's how they reach O(n), but they only work
// with keys that can be used as an index: integers in a small range, or
// digits, or numbers spread evenly over an interval.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra non_comparison_sorting.cpp -o non_comparison_sorting
//   ./non_comparison_sorting

#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

// ---------------------------------------------------------------------
// Counting sort
// ---------------------------------------------------------------------

// O(n + k), with k = maxValue + 1: counts how many times each value
// appears and rewrites the array in order. Values between 0 and maxValue.
void countAndRewrite(vector<int>& v, int maxValue) {
    vector<int> count(maxValue + 1, 0);
    for (int x : v) {
        count[x]++;
    }
    int k = 0;
    for (int value = 0; value <= maxValue; value++) {
        for (int c = 0; c < count[value]; c++) {
            v[k++] = value;
        }
    }
}

// O(n + k) and stable: the running sums say where each value ends in the
// output, and v is walked from right to left so that equal values keep
// their order. That way it works for sorting records by a key.
vector<int> countingSort(const vector<int>& v, int maxValue) {
    vector<int> count(maxValue + 1, 0);
    for (int x : v) {
        if (x < 0 || x > maxValue) {
            throw out_of_range("value outside 0..maxValue");
        }
        count[x]++;
    }
    for (int i = 1; i <= maxValue; i++) {
        count[i] += count[i - 1];
    }
    vector<int> output(v.size());
    for (int i = (int)v.size() - 1; i >= 0; i--) {
        count[v[i]]--;
        output[count[v[i]]] = v[i];
    }
    return output;
}

// ---------------------------------------------------------------------
// Radix sort (LSD: from the least significant digit to the most significant)
// ---------------------------------------------------------------------

// Stable counting sort using only one digit as the key (exp = 1, 10, 100…).
void sortByDigit(vector<int>& v, int exp) {
    vector<int> count(10, 0);
    for (int x : v) {
        count[(x / exp) % 10]++;
    }
    for (int d = 1; d < 10; d++) {
        count[d] += count[d - 1];
    }
    vector<int> output(v.size());
    for (int i = (int)v.size() - 1; i >= 0; i--) {
        int d = (v[i] / exp) % 10;
        count[d]--;
        output[count[d]] = v[i];
    }
    v = output;
}

// O(d · (n + 10)), with d = number of digits of the largest value. It works
// because each pass is stable: what the earlier passes sorted is kept
// among the values that tie on the current digit. Values >= 0.
void radixSort(vector<int>& v) {
    if (v.empty()) {
        return;
    }
    int maxValue = *max_element(v.begin(), v.end());
    for (int exp = 1; maxValue / exp > 0; exp *= 10) {
        sortByDigit(v, exp);
    }
}

// ---------------------------------------------------------------------
// Bucket sort
// ---------------------------------------------------------------------

// O(n) on average if the values are spread evenly over 0..maxValue: each
// bucket gets few of them and sorting them is cheap. If they all land in
// the same bucket, it's as slow as the sort inside. Values >= 0.
void bucketSort(vector<int>& v, int maxValue, int numBuckets) {
    vector<vector<int>> buckets(numBuckets);
    for (int x : v) {
        buckets[(long long)x * numBuckets / (maxValue + 1)].push_back(x);
    }
    int k = 0;
    for (auto& b : buckets) {
        sort(b.begin(), b.end());
        for (int x : b) {
            v[k++] = x;
        }
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
    vector<int> a = { 4, 1, 3, 4, 0, 2, 1 };
    print(a, "original           ");
    countAndRewrite(a, 4);
    print(a, "countAndRewrite    ");

    const vector<int> b = { 4, 1, 3, 4, 0, 2, 1 };
    print(countingSort(b, 4), "countingSort       ");
    try {
        countingSort({ 3, 7, 1 }, 4);
    } catch (const out_of_range& error) {
        cout << "countingSort with a 7 and maxValue = 4 throws an exception: " << error.what() << "\n";
    }

    vector<int> c = { 170, 45, 75, 90, 802, 24, 2, 66 };
    print(c, "\noriginal           ");
    radixSort(c);
    print(c, "radixSort          ");

    vector<int> d = { 42, 7, 93, 15, 68, 31, 84, 59, 3, 26 };
    print(d, "\noriginal           ");
    bucketSort(d, 99, 5);
    print(d, "bucketSort         ");

    vector<int> empty;
    radixSort(empty);
    print(empty, "\nempty              ");

    return 0;
}
