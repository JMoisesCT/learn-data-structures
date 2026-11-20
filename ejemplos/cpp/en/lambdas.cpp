// Lambdas: unnamed functions written right where they are used.
// They are not a data structure, but they show up in every topic that
// follows: they tell std::sort how to sort, std::count_if what to count
// and std::priority_queue who has the highest priority.
//
// General form:  [captures](parameters) -> type { body }
//   [captures]   variables from outside that the lambda can use
//   (parameters) what it receives on each call, like a normal function
//   -> type      optional: the compiler almost always deduces it from return
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra lambdas.cpp -o lambdas
//   ./lambdas

#include <algorithm>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <queue>
#include <vector>

// ---------------------------------------------------------------------
// 1. Simple lambda: it captures nothing and is called like any function.
// ---------------------------------------------------------------------

// O(1): creating the lambda and calling it costs the same as a normal function.
int computeSquare(int n) {
    auto square = [](int x) {
        return x * x;
    };
    int result = square(n);
    return result;
}

// ---------------------------------------------------------------------
// 2. Captures: by value [x] keeps a copy; by reference [&x] keeps access
//    to the original variable.
// ---------------------------------------------------------------------

// The lambda keeps a COPY of factor at the moment it is created.
int captureByValue(int factor, int x) {
    auto multiply = [factor](int y) {
        return y * factor;
    };
    factor = 100;
    return multiply(x);
}

// O(n): the lambda modifies the original total variable on each call.
int sumWithReference(const std::vector<int>& numbers) {
    int total = 0;
    auto addToTotal = [&total](int x) {
        total += x;
    };
    for (int x : numbers) {
        addToTotal(x);
    }
    return total;
}

// ---------------------------------------------------------------------
// 3. Nested lambdas
// ---------------------------------------------------------------------

// A lambda inside another: square only exists while sumSquares runs, and
// each call opens its own frame on the stack. O(n).
int sumOfSquares(const std::vector<int>& numbers) {
    auto sumSquares = [](const std::vector<int>& v) {
        auto square = [](int x) {
            return x * x;
        };
        int sum = 0;
        for (int x : v) {
            sum += square(x);
        }
        return sum;
    };
    return sumSquares(numbers);
}

// A lambda that makes lambdas: each adder remembers its own b, even after
// makeAdder has finished. That's why it captures by value.
int useAdder(int base, int x) {
    auto makeAdder = [](int b) {
        return [b](int y) {
            return b + y;
        };
    };
    auto addBase = makeAdder(base);
    return addBase(x);
}

// ---------------------------------------------------------------------
// 4. Practical uses: giving a criterion to the STL algorithms
// ---------------------------------------------------------------------

// O(n): count_if calls the lambda once per element.
int countGreater(const std::vector<int>& numbers, int limit) {
    return std::count_if(numbers.begin(), numbers.end(), [limit](int x) {
        return x > limit;
    });
}

// O(n): find_if stops at the first element that matches (k must be >= 1).
int firstMultiple(const std::vector<int>& numbers, int k) {
    auto it = std::find_if(numbers.begin(), numbers.end(), [k](int x) {
        return x % k == 0;
    });
    if (it == numbers.end()) {
        return -1;
    }
    return *it;
}

// O(n log n): std::sort asks the lambda "does a go before b?".
void sortDescending(std::vector<int>& numbers) {
    std::sort(numbers.begin(), numbers.end(), [](int a, int b) {
        return a > b;
    });
}

// The closest to center first; if they tie, the smaller one.
void sortByCloseness(std::vector<int>& numbers, int center) {
    std::sort(numbers.begin(), numbers.end(), [center](int a, int b) {
        int da = std::abs(a - center);
        int db = std::abs(b - center);
        if (da != db) {
            return da < db;
        }
        return a < b;
    });
}

// Even numbers first and then odd ones, each group from smallest to largest
// (for non-negative numbers).
void sortEvensFirst(std::vector<int>& numbers) {
    std::sort(numbers.begin(), numbers.end(), [](int a, int b) {
        if (a % 2 != b % 2) {
            return a % 2 == 0;
        }
        return a < b;
    });
}

void print(const std::vector<int>& numbers) {
    std::cout << "{";
    for (size_t i = 0; i < numbers.size(); i++) {
        std::cout << numbers[i] << (i + 1 < numbers.size() ? ", " : "");
    }
    std::cout << "}\n";
}

int main() {
    std::cout << "computeSquare(5)       = " << computeSquare(5) << "\n";
    std::cout << "captureByValue(3, 4)   = " << captureByValue(3, 4) << "  (not 400)\n";

    std::vector<int> numbers = {4, 7, 2, 9, 5};
    std::cout << "numbers = ";
    print(numbers);
    std::cout << "sumWithReference       = " << sumWithReference(numbers) << "\n";
    std::cout << "sumOfSquares           = " << sumOfSquares(numbers) << "\n";
    std::cout << "useAdder(10, 5)        = " << useAdder(10, 5) << "\n";
    std::cout << "countGreater(_, 4)     = " << countGreater(numbers, 4) << "\n";
    std::cout << "firstMultiple(_, 3)    = " << firstMultiple(numbers, 3) << "\n";
    std::cout << "firstMultiple(_, 8)    = " << firstMultiple(numbers, 8) << "  (none)\n";

    sortDescending(numbers);
    std::cout << "sortDescending         -> ";
    print(numbers);
    sortByCloseness(numbers, 6);
    std::cout << "sortByCloseness(6)     -> ";
    print(numbers);
    sortEvensFirst(numbers);
    std::cout << "sortEvensFirst         -> ";
    print(numbers);

    // More forms you will run into:

    // Generic lambda (C++14): auto in the parameters, it works for any type.
    auto larger = [](auto a, auto b) { return a > b ? a : b; };
    std::cout << "larger(3, 8) = " << larger(3, 8) << ", larger(2.5, 1.5) = " << larger(2.5, 1.5) << "\n";

    // mutable: lets the lambda modify its captured copy (the original doesn't change).
    int calls = 0;
    auto counter = [calls]() mutable { return ++calls; };
    counter();
    counter();
    std::cout << "counter() returned " << counter() << ", but calls is still " << calls << "\n";

    // [=] copies and [&] references everything used inside.
    int a = 2;
    int b = 3;
    auto copyAll = [=]() { return a * b; };
    auto refAll = [&]() { a = 10; };
    refAll();
    std::cout << "copyAll() = " << copyAll() << " even though a is now " << a << "\n";

    // A lambda as the priority criterion: a min-heap.
    auto smallestFirst = [](int x, int y) { return x > y; };
    std::priority_queue<int, std::vector<int>, decltype(smallestFirst)> pq(smallestFirst);
    for (int x : {5, 1, 8, 3}) {
        pq.push(x);
    }
    std::cout << "priority_queue with a lambda takes out " << pq.top() << " first\n";

    // std::function stores anything callable; it allows a recursive lambda.
    std::function<int(int)> factorial = [&factorial](int n) {
        return n <= 1 ? 1 : n * factorial(n - 1);
    };
    std::cout << "factorial(5) = " << factorial(5) << "\n";

    return 0;
}
