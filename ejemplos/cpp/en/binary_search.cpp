// Binary search: in a sorted array, looking at the middle element
// discards at once the half that can't hold the target. With n elements
// about log2(n) comparisons are enough: a million values, 20 iterations.
//
// STL equivalents (<algorithm>): std::binary_search (only says whether
// it's there), std::lower_bound, std::upper_bound, std::equal_range and, to
// search over the answer, std::partition_point.
//
// Compile: g++ -std=c++17 -Wall -Wextra binary_search.cpp -o binary_search

#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <vector>

// O(log n): each iteration discards half of the remaining candidates.
// Requires v sorted from smallest to largest. Returns the position or -1.
//
// mid is computed as left + (right - left) / 2 and not as (left + right) / 2:
// with huge arrays, left + right can go past the largest int
// (2,147,483,647), and int overflow is undefined behavior.
int binarySearch(const std::vector<int>& v, int target) {
    int left = 0;
    int right = static_cast<int>(v.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (v[mid] == target) {
            return mid;
        }
        if (v[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

// O(log n) in time and O(log n) in memory: each call waits on the stack
// for the one below to return the result, and returns it as is
// (tail recursion). It's called with left = 0 and right = v.size() - 1.
int recursiveSearch(const std::vector<int>& v, int target, int left, int right) {
    if (left > right) {
        return -1;
    }
    int mid = left + (right - left) / 2;
    if (v[mid] == target) {
        return mid;
    }
    if (v[mid] < target) {
        return recursiveSearch(v, target, mid + 1, right);
    }
    return recursiveSearch(v, target, left, mid - 1);
}

// O(log n): the first position with v[i] >= x, or v.size() if there's
// none. It's where x would have to be inserted to keep v sorted.
// The answer is always between left and right (right included: it can be
// v.size()). It doesn't stop when it sees x: it keeps searching further left.
int lowerBound(const std::vector<int>& v, int x) {
    int left = 0;
    int right = static_cast<int>(v.size());
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (v[mid] < x) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}

// O(log n): the first position with v[i] > x, or v.size() if there's
// none. Same as lowerBound, but with <= instead of <.
int upperBound(const std::vector<int>& v, int x) {
    int left = 0;
    int right = static_cast<int>(v.size());
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (v[mid] <= x) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}

// O(log n): how many times x appears, without walking through the copies. The
// copies of x take up the positions from lowerBound up to upperBound (not included).
int countOccurrences(const std::vector<int>& v, int x) {
    int start = lowerBound(v, x);
    int end = upperBound(v, x);
    return end - start;
}

// O(log n): search over the answer. There's no array: the candidates are
// 0, 1, …, n, and the question "r * r <= n?" answers yes, yes, …, yes, no, …, no.
// We look for the last yes. The math is done in long long: mid * mid doesn't fit
// in an int when n is large.
int integerSqrt(int n) {
    if (n < 0) {
        throw std::invalid_argument("negative n");
    }
    long long left = 0;
    long long right = n;
    int answer = 0;
    while (left <= right) {
        long long mid = left + (right - left) / 2;
        if (mid * mid <= n) {
            answer = static_cast<int>(mid);
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return answer;
}

void print(const char* name, const std::vector<int>& v) {
    std::cout << name << " = {";
    for (std::size_t i = 0; i < v.size(); i++) {
        std::cout << (i ? ", " : "") << v[i];
    }
    std::cout << "}\n";
}

int main() {
    std::vector<int> v = {3, 8, 12, 15, 21, 27, 30, 34, 40, 46, 51, 57, 63, 70, 88};
    int n = static_cast<int>(v.size());
    print("v", v);
    std::cout << "binarySearch(v, 63) = " << binarySearch(v, 63) << "\n";   // 12
    std::cout << "binarySearch(v, 20) = " << binarySearch(v, 20) << "\n";   // -1
    std::cout << "recursiveSearch(v, 63, 0, n - 1) = "
              << recursiveSearch(v, 63, 0, n - 1) << "\n";                   // 12
    std::cout << "std::binary_search(v, 63) = " << std::boolalpha
              << std::binary_search(v.begin(), v.end(), 63) << "\n\n";

    // Without order, binary search discards halves that did hold the target.
    std::vector<int> unsorted = {8, 3, 15, 1, 22, 9, 30, 4, 17, 12, 27};
    print("unsorted", unsorted);
    std::cout << "binarySearch(unsorted, 4) = "
              << binarySearch(unsorted, 4) << "  (but 4 is at position 7!)\n\n";

    std::vector<int> r = {2, 4, 4, 4, 7, 9, 9, 12, 15};
    print("r", r);
    for (int x : {4, 5, 9, 1, 20}) {
        int own = lowerBound(r, x);
        auto stl = std::lower_bound(r.begin(), r.end(), x) - r.begin();
        std::cout << "lowerBound(r, " << x << ") = " << own << " (std: " << stl << ")"
                  << ", upperBound(r, " << x << ") = " << upperBound(r, x)
                  << ", countOccurrences(r, " << x << ") = " << countOccurrences(r, x) << "\n";
    }
    std::cout << "\n";

    for (int m : {0, 1, 15, 16, 700, 2147483647}) {
        std::cout << "integerSqrt(" << m << ") = " << integerSqrt(m) << "\n";
    }
    try {
        integerSqrt(-4);
    } catch (const std::invalid_argument& e) {
        std::cout << "integerSqrt(-4): error: " << e.what() << "\n";
    }
    return 0;
}
