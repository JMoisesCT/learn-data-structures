// Recursión: una función que se llama a sí misma con un problema más chico.
// No es una estructura de datos, pero es la forma natural de recorrer
// árboles, montículos y grafos, y la usan heapify, los recorridos del
// árbol binario y merge sort.
//
// Toda función recursiva tiene dos partes:
//   caso base       un problema tan chico que se responde sin llamarse
//   caso recursivo  se llama con un problema más chico y usa lo que devuelve
//
// Cada llamada abre su propio marco en la pila de llamadas, con sus propios
// parámetros y variables. Sin caso base, la pila crece hasta desbordarse
// (stack overflow) y el programa termina con un error.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra recursion.cpp -o recursion
//   ./recursion

#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

// ---------------------------------------------------------------------
// 1. Sacar dígitos: n % 10 es el último dígito y n / 10 es el resto.
// ---------------------------------------------------------------------

// O(d), con d = cantidad de dígitos de n: una llamada por dígito.
// Precondición: n >= 0.
int sumaDigitos(int n) {
    if (n < 10) {
        return n;
    }
    return sumaDigitos(n / 10) + n % 10;
}

// O(d): el trabajo va DESPUÉS de la llamada, así que se hace de regreso,
// empezando por el dígito de más a la izquierda: imprime 1 2 3 4.
void imprimirDigitos(int n) {
    if (n >= 10) {
        imprimirDigitos(n / 10);
    }
    std::cout << n % 10 << ' ';
}

// O(d): el trabajo va ANTES de la llamada, así que se hace de ida,
// empezando por el último dígito: imprime 4 3 2 1.
void imprimirAlReves(int n) {
    std::cout << n % 10 << ' ';
    if (n >= 10) {
        imprimirAlReves(n / 10);
    }
}

// O(d): recursión de cola. El resultado parcial viaja hacia abajo en
// acumulado y, al llegar al caso base, ya está completo. Se llama con
// invertir(n, 0): invertir(1234, 0) = 4321.
int invertir(int n, int acumulado) {
    if (n == 0) {
        return acumulado;
    }
    return invertir(n / 10, acumulado * 10 + n % 10);
}

// ---------------------------------------------------------------------
// 2. Cambio de base: los restos de dividir entre la base son los dígitos,
//    del último al primero. La recursión los pone en orden al volver.
// ---------------------------------------------------------------------

const std::string DIGITOS = "0123456789ABCDEF";

// O(log_base n): cada llamada divide n entre la base.
std::string aBase(int n, int base) {
    if (n < 0 || base < 2 || base > 16) {
        throw std::invalid_argument("n debe ser >= 0 y la base estar entre 2 y 16");
    }
    if (n < base) {
        return std::string(1, DIGITOS[n]);
    }
    return aBase(n / base, base) + DIGITOS[n % base];
}

// ---------------------------------------------------------------------
// 3. Palíndromos: dos casos base (se cruzaron i y j, o hay una diferencia).
// ---------------------------------------------------------------------

// O(n): compara de afuera hacia adentro. Se llama con
// esPalindromo(texto, 0, tamaño - 1).
bool esPalindromo(const std::string& texto, int i, int j) {
    if (i >= j) {
        return true;
    }
    if (texto[i] != texto[j]) {
        return false;
    }
    return esPalindromo(texto, i + 1, j - 1);
}

// ---------------------------------------------------------------------
// 4. Potencia rápida: base^exponente = (base^(exponente/2))², y una base
//    más si el exponente es impar. El exponente se divide a la mitad.
// ---------------------------------------------------------------------

// O(log exponente): calcular mitad UNA vez y multiplicarla por sí misma.
// Llamar dos veces a potencia(base, exponente / 2) volvería a ser O(exponente).
long long potencia(long long base, int exponente) {
    if (exponente == 0) {
        return 1;
    }
    long long mitad = potencia(base, exponente / 2);
    if (exponente % 2 == 0) {
        return mitad * mitad;
    }
    return mitad * mitad * base;
}

// ---------------------------------------------------------------------
// 5. Fibonacci: dos llamadas por llamada. Sin memoria se repite trabajo.
// ---------------------------------------------------------------------

// O(2^n): fibonacci(n - 1) vuelve a calcular todo lo que necesita
// fibonacci(n - 2). fibonacci(40) hace más de 300 millones de llamadas.
long long fibonacci(int n) {
    if (n < 2) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// O(n): memo[k] guarda fibonacci(k) la primera vez que se calcula
// (-1 = todavía no). Cada valor se calcula una sola vez.
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
// Demostración
// ---------------------------------------------------------------------

int main() {
    std::cout << "sumaDigitos(1234) = " << sumaDigitos(1234) << '\n';  // 10
    std::cout << "sumaDigitos(7) = " << sumaDigitos(7) << '\n';        // 7

    std::cout << "imprimirDigitos(1234): ";
    imprimirDigitos(1234);  // 1 2 3 4
    std::cout << "\nimprimirAlReves(1234): ";
    imprimirAlReves(1234);  // 4 3 2 1
    std::cout << '\n';

    std::cout << "invertir(1234, 0) = " << invertir(1234, 0) << '\n';  // 4321
    std::cout << "invertir(1200, 0) = " << invertir(1200, 0) << '\n';  // 21

    std::cout << "aBase(156, 2) = " << aBase(156, 2) << '\n';    // 10011100
    std::cout << "aBase(156, 8) = " << aBase(156, 8) << '\n';    // 234
    std::cout << "aBase(156, 16) = " << aBase(156, 16) << '\n';  // 9C
    std::cout << "aBase(0, 2) = " << aBase(0, 2) << '\n';        // 0
    try {
        aBase(156, 1);
    } catch (const std::invalid_argument& e) {
        std::cout << "aBase(156, 1): error: " << e.what() << '\n';
    }

    for (std::string palabra : {"reconocer", "recorrer", "abba", "x", ""}) {
        bool es = esPalindromo(palabra, 0, static_cast<int>(palabra.size()) - 1);
        std::cout << '"' << palabra << "\" " << (es ? "es" : "no es") << " palíndromo\n";
    }

    std::cout << "potencia(2, 10) = " << potencia(2, 10) << '\n';  // 1024
    std::cout << "potencia(3, 13) = " << potencia(3, 13) << '\n';  // 1594323
    std::cout << "potencia(5, 0) = " << potencia(5, 0) << '\n';    // 1

    std::cout << "fibonacci(10) = " << fibonacci(10) << '\n';  // 55
    std::vector<long long> memo(91, -1);
    std::cout << "fibonacciMemo(90) = " << fibonacciMemo(90, memo) << '\n';  // 2880067194370816120
    return 0;
}
