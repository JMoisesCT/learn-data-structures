// Recursion: a function that calls itself with a smaller problem.
// It is not a data structure, but it is the natural way to walk through
// trees, heaps and graphs, and heapify, the binary tree traversals and
// merge sort all use it.
//
// Every recursive function has two parts:
//   base case       a problem so small that it is answered without a call
//   recursive case  it calls itself with a smaller problem and uses the result
//
// Each call opens its own frame on the call stack, with its own parameters
// and variables. Without a base case, the stack grows until it overflows
// (stack overflow) and the program ends with an error.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra recursion.cpp -o recursion
//   ./recursion

#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

// ---------------------------------------------------------------------
// 1. Extracting digits: n % 10 is the last digit and n / 10 is the rest.
// ---------------------------------------------------------------------

// O(d), with d = number of digits of n: one call per digit.
// Precondition: n >= 0.
int digitSum(int n) {
    if (n < 10) {
        return n;
    }
    return digitSum(n / 10) + n % 10;
}

// O(d): the work goes AFTER the call, so it is done on the way back,
// starting with the leftmost digit: it prints 1 2 3 4.
void printDigits(int n) {
    if (n >= 10) {
        printDigits(n / 10);
    }
    std::cout << n % 10 << ' ';
}

// O(d): the work goes BEFORE the call, so it is done on the way down,
// starting with the last digit: it prints 4 3 2 1.
void printReversed(int n) {
    std::cout << n % 10 << ' ';
    if (n >= 10) {
        printReversed(n / 10);
    }
}

// O(d): tail recursion. The partial result travels down in accumulated
// and, when it reaches the base case, it is already complete. It is called
// as reverseDigits(n, 0): reverseDigits(1234, 0) = 4321.
int reverseDigits(int n, int accumulated) {
    if (n == 0) {
        return accumulated;
    }
    return reverseDigits(n / 10, accumulated * 10 + n % 10);
}

// ---------------------------------------------------------------------
// 2. Base conversion: the remainders of dividing by the base are the
//    digits, from last to first. The recursion puts them in order on the
//    way back.
// ---------------------------------------------------------------------

// DIGITS[k] is the symbol of the digit worth k: DIGITS[3] is '3',
// DIGITS[10] is 'A' and DIGITS[15] is 'F'. Each one is a char.
const std::string DIGITS = "0123456789ABCDEF";

// std::string(1, c) uses the std::string(count, character) constructor:
// it builds a string with 1 copy of c ('F' -> "F"). It is needed because
// toBase returns std::string, not char. After that, string + char appends
// the character at the end ("F" + 'A' -> "FA").

// O(log_base n): each call divides n by the base.
std::string toBase(int n, int base) {
    if (n < 0 || base < 2 || base > 16) {
        throw std::invalid_argument("n must be >= 0 and the base between 2 and 16");
    }
    if (n < base) {
        return std::string(1, DIGITS[n]);
    }
    return toBase(n / base, base) + DIGITS[n % base];
}

// ---------------------------------------------------------------------
// 3. Palindromes: two base cases (i and j crossed, or there is a mismatch).
// ---------------------------------------------------------------------

// O(n): it compares from the outside in. It is called as
// isPalindrome(text, 0, size - 1).
bool isPalindrome(const std::string& text, int i, int j) {
    if (i >= j) {
        return true;
    }
    if (text[i] != text[j]) {
        return false;
    }
    return isPalindrome(text, i + 1, j - 1);
}

// ---------------------------------------------------------------------
// 4. Fast power: base^exponent = (base^(exponent/2))², times one more base
//    if the exponent is odd. The exponent is cut in half.
// ---------------------------------------------------------------------

// O(log exponent): compute half ONCE and multiply it by itself.
// Calling power(base, exponent / 2) twice would make it O(exponent) again.
long long power(long long base, int exponent) {
    if (exponent == 0) {
        return 1;
    }
    long long half = power(base, exponent / 2);
    if (exponent % 2 == 0) {
        return half * half;
    }
    return half * half * base;
}

// ---------------------------------------------------------------------
// 5. Fibonacci: two calls per call. Without memory, work is repeated.
// ---------------------------------------------------------------------

// O(2^n): fibonacci(n - 1) computes again everything that
// fibonacci(n - 2) needs. fibonacci(40) makes more than 300 million calls.
long long fibonacci(int n) {
    if (n < 2) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// O(n): memo[k] stores fibonacci(k) the first time it is computed
// (-1 = not yet). Each value is computed only once.
long long fibonacciMemo(int n, std::vector<long long>& memo) {
    if (n < 2) {
        return n;
    }
    if (memo[n] != -1) {
        return memo[n];
    }
    memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
    return memo[n];
}

// ---------------------------------------------------------------------
// Demonstration
// ---------------------------------------------------------------------

int main() {
    std::cout << "digitSum(1234) = " << digitSum(1234) << '\n';  // 10
    std::cout << "digitSum(7) = " << digitSum(7) << '\n';        // 7

    std::cout << "printDigits(1234): ";
    printDigits(1234);  // 1 2 3 4
    std::cout << "\nprintReversed(1234): ";
    printReversed(1234);  // 4 3 2 1
    std::cout << '\n';

    std::cout << "reverseDigits(1234, 0) = " << reverseDigits(1234, 0) << '\n';  // 4321
    std::cout << "reverseDigits(1200, 0) = " << reverseDigits(1200, 0) << '\n';  // 21

    std::cout << "toBase(156, 2) = " << toBase(156, 2) << '\n';    // 10011100
    std::cout << "toBase(156, 8) = " << toBase(156, 8) << '\n';    // 234
    std::cout << "toBase(156, 16) = " << toBase(156, 16) << '\n';  // 9C
    std::cout << "toBase(0, 2) = " << toBase(0, 2) << '\n';        // 0
    try {
        toBase(156, 1);
    } catch (const std::invalid_argument& e) {
        std::cout << "toBase(156, 1): error: " << e.what() << '\n';
    }

    for (std::string word : {"racecar", "remember", "noon", "x", ""}) {
        bool is = isPalindrome(word, 0, static_cast<int>(word.size()) - 1);
        std::cout << '"' << word << "\" " << (is ? "is" : "is not") << " a palindrome\n";
    }

    std::cout << "power(2, 10) = " << power(2, 10) << '\n';  // 1024
    std::cout << "power(3, 13) = " << power(3, 13) << '\n';  // 1594323
    std::cout << "power(5, 0) = " << power(5, 0) << '\n';    // 1

    std::cout << "fibonacci(10) = " << fibonacci(10) << '\n';  // 55
    std::vector<long long> memo(91, -1);
    std::cout << "fibonacciMemo(90) = " << fibonacciMemo(90, memo) << '\n';  // 2880067194370816120
    return 0;
}
