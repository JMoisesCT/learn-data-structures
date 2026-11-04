// Búsqueda binaria: en un arreglo ordenado, mirar el elemento del medio
// descarta de golpe la mitad que no puede tener al objetivo. Con n elementos
// alcanzan unas log2(n) comparaciones: un millón de datos, 20 vueltas.
//
// Equivalentes en la STL (<algorithm>): std::binary_search (solo dice si
// está), std::lower_bound, std::upper_bound, std::equal_range y, para buscar
// sobre la respuesta, std::partition_point.
//
// Compilar: g++ -std=c++17 -Wall -Wextra busqueda_binaria.cpp -o busqueda_binaria

#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <vector>

// O(log n): cada vuelta descarta la mitad de los candidatos que quedan.
// Requiere v ordenado de menor a mayor. Devuelve la posición o -1.
//
// medio se calcula como izq + (der - izq) / 2 y no como (izq + der) / 2:
// con arreglos enormes, izq + der puede pasarse del máximo de un int
// (2 147 483 647), y el desbordamiento de un int es comportamiento indefinido.
int busquedaBinaria(const std::vector<int>& v, int objetivo) {
    int izq = 0;
    int der = static_cast<int>(v.size()) - 1;
    while (izq <= der) {
        int medio = izq + (der - izq) / 2;
        if (v[medio] == objetivo) {
            return medio;
        }
        if (v[medio] < objetivo) {
            izq = medio + 1;
        } else {
            der = medio - 1;
        }
    }
    return -1;
}

// O(log n) en tiempo y O(log n) en memoria: cada llamada espera en la pila
// a que la de abajo le devuelva el resultado, y lo devuelve tal cual
// (recursión de cola). Se llama con izq = 0 y der = v.size() - 1.
int busquedaRecursiva(const std::vector<int>& v, int objetivo, int izq, int der) {
    if (izq > der) {
        return -1;
    }
    int medio = izq + (der - izq) / 2;
    if (v[medio] == objetivo) {
        return medio;
    }
    if (v[medio] < objetivo) {
        return busquedaRecursiva(v, objetivo, medio + 1, der);
    }
    return busquedaRecursiva(v, objetivo, izq, medio - 1);
}

// O(log n): la primera posición con v[i] >= x, o v.size() si no hay
// ninguna. Es donde habría que insertar x para que v siga ordenado.
// La respuesta siempre está entre izq y der (der incluida: puede ser
// v.size()). No se detiene al ver x: sigue buscando más a la izquierda.
int lowerBound(const std::vector<int>& v, int x) {
    int izq = 0;
    int der = static_cast<int>(v.size());
    while (izq < der) {
        int medio = izq + (der - izq) / 2;
        if (v[medio] < x) {
            izq = medio + 1;
        } else {
            der = medio;
        }
    }
    return izq;
}

// O(log n): la primera posición con v[i] > x, o v.size() si no hay
// ninguna. Igual que lowerBound, pero con <= en lugar de <.
int upperBound(const std::vector<int>& v, int x) {
    int izq = 0;
    int der = static_cast<int>(v.size());
    while (izq < der) {
        int medio = izq + (der - izq) / 2;
        if (v[medio] <= x) {
            izq = medio + 1;
        } else {
            der = medio;
        }
    }
    return izq;
}

// O(log n): cuántas veces aparece x, sin recorrer las copias. Las copias
// de x ocupan las posiciones desde lowerBound hasta upperBound (sin incluirla).
int contarApariciones(const std::vector<int>& v, int x) {
    int desde = lowerBound(v, x);
    int hasta = upperBound(v, x);
    return hasta - desde;
}

// O(log n): búsqueda sobre la respuesta. No hay arreglo: los candidatos son
// 0, 1, …, n, y la pregunta "¿r * r <= n?" responde sí, sí, …, sí, no, …, no.
// Buscamos el último sí. Las cuentas van en long long: medio * medio no cabe
// en un int cuando n es grande.
int raizEntera(int n) {
    if (n < 0) {
        throw std::invalid_argument("n negativo");
    }
    long long izq = 0;
    long long der = n;
    int respuesta = 0;
    while (izq <= der) {
        long long medio = izq + (der - izq) / 2;
        if (medio * medio <= n) {
            respuesta = static_cast<int>(medio);
            izq = medio + 1;
        } else {
            der = medio - 1;
        }
    }
    return respuesta;
}

void imprimir(const char* nombre, const std::vector<int>& v) {
    std::cout << nombre << " = {";
    for (std::size_t i = 0; i < v.size(); i++) {
        std::cout << (i ? ", " : "") << v[i];
    }
    std::cout << "}\n";
}

int main() {
    std::vector<int> v = {3, 8, 12, 15, 21, 27, 30, 34, 40, 46, 51, 57, 63, 70, 88};
    int n = static_cast<int>(v.size());
    imprimir("v", v);
    std::cout << "busquedaBinaria(v, 63) = " << busquedaBinaria(v, 63) << "\n";   // 12
    std::cout << "busquedaBinaria(v, 20) = " << busquedaBinaria(v, 20) << "\n";   // -1
    std::cout << "busquedaRecursiva(v, 63, 0, n - 1) = "
              << busquedaRecursiva(v, 63, 0, n - 1) << "\n";                       // 12
    std::cout << "std::binary_search(v, 63) = " << std::boolalpha
              << std::binary_search(v.begin(), v.end(), 63) << "\n\n";

    // Sin orden, la búsqueda binaria descarta mitades que sí tenían al objetivo.
    std::vector<int> desordenado = {8, 3, 15, 1, 22, 9, 30, 4, 17, 12, 27};
    imprimir("desordenado", desordenado);
    std::cout << "busquedaBinaria(desordenado, 4) = "
              << busquedaBinaria(desordenado, 4) << "  (¡pero 4 está en la posición 7!)\n\n";

    std::vector<int> r = {2, 4, 4, 4, 7, 9, 9, 12, 15};
    imprimir("r", r);
    for (int x : {4, 5, 9, 1, 20}) {
        int propio = lowerBound(r, x);
        auto stl = std::lower_bound(r.begin(), r.end(), x) - r.begin();
        std::cout << "lowerBound(r, " << x << ") = " << propio << " (std: " << stl << ")"
                  << ", upperBound(r, " << x << ") = " << upperBound(r, x)
                  << ", contarApariciones(r, " << x << ") = " << contarApariciones(r, x) << "\n";
    }
    std::cout << "\n";

    for (int m : {0, 1, 15, 16, 700, 2147483647}) {
        std::cout << "raizEntera(" << m << ") = " << raizEntera(m) << "\n";
    }
    try {
        raizEntera(-4);
    } catch (const std::invalid_argument& e) {
        std::cout << "raizEntera(-4): error: " << e.what() << "\n";
    }
    return 0;
}
