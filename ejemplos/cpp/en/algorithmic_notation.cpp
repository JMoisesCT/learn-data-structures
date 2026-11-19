// Algorithmic notation (Big-O): how many steps an algorithm takes depending
// on the size n of its input. Each function counts its basic operations in
// the global variable `steps`, and main() prints a table to see how that
// number grows when n is multiplied by 10.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra algorithmic_notation.cpp -o algorithmic_notation
//   ./algorithmic_notation

#include <iomanip>
#include <iostream>
#include <vector>

// Counter of basic operations. It is only for measuring: a normal program
// would not have it.
long long steps = 0;

// O(1): a single access, whatever the size of the array.
// It doesn't even need to know n.
int get(const int data[], int i) {
    steps++;
    return data[i];
}

// O(n): one iteration per element. Twice the data, twice the steps.
int sum(const int data[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        steps++;
        total += data[i];
    }
    return total;
}

// O(n²): compares every pair of elements. In the worst case (no duplicates)
// it makes n·(n − 1)/2 comparisons. Twice the data, four times the steps.
bool hasDuplicates(const int data[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            steps++;
            if (data[i] == data[j]) {
                return true;
            }
        }
    }
    return false;
}

// O(log n): each iteration discards half of the remaining range.
// Twice the data, just one more step. Requires sorted data.
int binarySearch(const int data[], int n, int target) {
    int left = 0;
    int right = n - 1;
    while (left <= right) {
        steps++;
        int mid = left + (right - left) / 2;
        if (data[mid] == target) {
            return mid;
        }
        if (data[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

// O(n log n): n binary searches, each one O(log n).
// A loop of n iterations with something O(log n) inside: they multiply.
int countPresent(const int queries[], const int data[], int n) {
    int found = 0;
    for (int i = 0; i < n; i++) {
        if (binarySearch(data, n, queries[i]) != -1) {
            found++;
        }
    }
    return found;
}

// O(2ⁿ): each call makes two more. Adding 1 to n almost doubles the work.
long long fibonacci(int n) {
    steps++;
    if (n < 2) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    std::cout << "Steps of each function by n (the worst case of each one):\n\n";
    std::cout << std::setw(8) << "n"
              << std::setw(10) << "O(1)"
              << std::setw(10) << "O(log n)"
              << std::setw(10) << "O(n)"
              << std::setw(12) << "O(n log n)"
              << std::setw(12) << "O(n^2)" << "\n";

    for (int n : {10, 100, 1000, 10000}) {
        // Sorted data without duplicates: 0, 2, 4, 6...
        std::vector<int> data(n);
        std::vector<int> queries(n);
        for (int k = 0; k < n; k++) {
            data[k] = 2 * k;
            queries[k] = 2 * k + 1; // odd numbers: none is there, worst case
        }

        steps = 0;
        get(data.data(), n - 1);
        long long constant = steps;

        steps = 0;
        binarySearch(data.data(), n, 2 * n); // greater than all: worst case
        long long logarithmic = steps;

        steps = 0;
        sum(data.data(), n);
        long long linear = steps;

        steps = 0;
        countPresent(queries.data(), data.data(), n);
        long long linearithmic = steps;

        steps = 0;
        hasDuplicates(data.data(), n);
        long long quadratic = steps;

        std::cout << std::setw(8) << n
                  << std::setw(10) << constant
                  << std::setw(10) << logarithmic
                  << std::setw(10) << linear
                  << std::setw(12) << linearithmic
                  << std::setw(12) << quadratic << "\n";
    }

    std::cout << "\nO(2^n) with recursive fibonacci:\n";
    for (int n : {10, 20, 25}) {
        steps = 0;
        long long f = fibonacci(n);
        std::cout << "  fibonacci(" << n << ") = " << f << " -> " << steps << " calls\n";
    }

    // Best case: if there is a duplicate at the start, hasDuplicates finishes right away.
    int withDuplicate[] = {7, 7, 3, 9, 1, 5};
    steps = 0;
    bool duplicate = hasDuplicates(withDuplicate, 6);
    std::cout << "\nhasDuplicates({7, 7, 3, 9, 1, 5}) = " << std::boolalpha << duplicate
              << " in " << steps << " step(s): best case\n";

    return 0;
}
