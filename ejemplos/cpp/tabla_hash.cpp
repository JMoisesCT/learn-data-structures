// Tabla hash: un arreglo de "cubetas" y una función hash que convierte cada
// clave en el índice de su cubeta. Buscar, insertar y eliminar cuestan O(1)
// en promedio, porque se va directo a una cubeta en lugar de recorrerlo todo.
//
// Cuando dos claves caen en la misma cubeta hay una COLISIÓN. Aquí se ven las
// dos formas clásicas de resolverlas:
//   - Encadenamiento: cada cubeta es una lista enlazada (TablaHashEncadenada).
//   - Direccionamiento abierto: se busca otra celda libre del mismo arreglo
//     con sondeo lineal, cuadrático o doble hash (TablaHashAbierta).
//
// Equivalentes en la STL: std::unordered_set y std::unordered_map (usan
// encadenamiento; ver bucket_count(), load_factor() y rehash()), y std::hash.
//
// Compilar y ejecutar:
//   g++ -std=c++17 -Wall -Wextra tabla_hash.cpp -o tabla_hash
//   ./tabla_hash

#include <cmath>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// ─────────────────────────────────────────
//  FUNCIONES HASH PARA NÚMEROS
//  Todas devuelven un índice entre 0 y m - 1.
// ─────────────────────────────────────────

// O(1): método de la división. Con m primo reparte mejor.
int hashDivision(int clave, int m) {
    int r = clave % m;
    return r < 0 ? r + m : r;   // en C++, -15 % 7 == -1
}

// O(1): método de la multiplicación (Knuth). Funciona bien con cualquier m.
int hashMultiplicacion(int clave, int m) {
    const double A = 0.6180339887;   // (√5 - 1) / 2
    double producto = clave * A;
    double fraccion = producto - floor(producto);
    return (int)(m * fraccion);
}

// O(1): cuadrado medio. Eleva al cuadrado y se queda con los dígitos del
// centro (para claves de hasta 3 dígitos, el cuadrado tiene hasta 6).
int hashCuadradoMedio(int clave, int m) {
    int cuadrado = clave * clave;
    int centro = (cuadrado / 100) % 100;
    return centro % m;
}

// O(dígitos): plegado. Corta la clave en grupos de 2 dígitos y los suma.
int hashPlegado(int clave, int m) {
    int suma = 0;
    while (clave > 0) {
        suma += clave % 100;
        clave /= 100;
    }
    return suma % m;
}

// ─────────────────────────────────────────
//  FUNCIONES HASH PARA TEXTO (ASCII)
// ─────────────────────────────────────────

// O(largo): suma los códigos de las letras. Los anagramas siempre chocan.
int hashSumaLetras(const string& texto, int m) {
    int suma = 0;
    for (char c : texto)
        suma += c;
    return suma % m;
}

// O(largo): hash polinomial (método de Horner). El orden de las letras importa.
int hashPolinomial(const string& texto, int m) {
    int h = 0;
    for (char c : texto)
        h = (h * 31 + c) % m;
    return h;
}

// ─────────────────────────────────────────
//  ENCADENAMIENTO
//  Cada cubeta guarda una lista enlazada con las claves que caen ahí.
// ─────────────────────────────────────────

struct Nodo {
    int valor;
    Nodo* sig;
    explicit Nodo(int v) : valor(v), sig(nullptr) {}
};

class TablaHashEncadenada {
    vector<Nodo*> tabla;   // tabla[i] apunta al primer nodo de la cubeta i
    int cantidad = 0;

public:
    explicit TablaHashEncadenada(int m = 7) : tabla(m, nullptr) {}

    ~TablaHashEncadenada() {
        for (Nodo* actual : tabla) {
            while (actual) {
                Nodo* tmp = actual;
                actual = actual->sig;
                delete tmp;
            }
        }
    }

    // Prohibimos las copias para mantener el ejemplo simple.
    TablaHashEncadenada(const TablaHashEncadenada&) = delete;
    TablaHashEncadenada& operator=(const TablaHashEncadenada&) = delete;

    int tamano() const { return tabla.size(); }

    // Factor de carga α = n / m: cuántos nodos hay, en promedio, por cubeta.
    double factorCarga() const { return (double)cantidad / tabla.size(); }

    // O(1): calcula la cubeta e inserta al frente de su lista.
    void insertar(int clave) {
        int indice = hashDivision(clave, tamano());
        Nodo* nuevo = new Nodo(clave);
        nuevo->sig = tabla[indice];   // inserta al frente
        tabla[indice] = nuevo;
        cantidad++;
    }

    // O(1 + α) en promedio: solo recorre la lista de una cubeta.
    bool buscar(int clave) const {
        int indice = hashDivision(clave, tamano());
        Nodo* actual = tabla[indice];
        while (actual) {
            if (actual->valor == clave) return true;
            actual = actual->sig;
        }
        return false;
    }

    // O(1 + α) en promedio: como en una lista enlazada, recuerda el anterior.
    bool eliminar(int clave) {
        int indice = hashDivision(clave, tamano());
        Nodo* actual = tabla[indice];
        Nodo* anterior = nullptr;
        while (actual) {
            if (actual->valor == clave) {
                if (anterior) anterior->sig = actual->sig;
                else tabla[indice] = actual->sig;
                delete actual;
                cantidad--;
                return true;
            }
            anterior = actual;
            actual = actual->sig;
        }
        return false;
    }

    // O(n + m): cambia el número de cubetas y reubica cada nodo (sin copiarlo).
    void rehash(int nuevoTamano) {
        vector<Nodo*> nueva(nuevoTamano, nullptr);
        for (Nodo* actual : tabla) {
            while (actual) {
                Nodo* siguiente = actual->sig;
                int indice = hashDivision(actual->valor, nuevoTamano);
                actual->sig = nueva[indice];   // al frente, como en insertar
                nueva[indice] = actual;
                actual = siguiente;
            }
        }
        tabla.swap(nueva);
    }

    void imprimir() const {
        for (int i = 0; i < tamano(); i++) {
            cout << "[" << i << "] -> ";
            for (Nodo* actual = tabla[i]; actual; actual = actual->sig)
                cout << actual->valor << " -> ";
            cout << "null\n";
        }
    }
};

// ─────────────────────────────────────────
//  DIRECCIONAMIENTO ABIERTO
//  Todas las claves viven en el mismo arreglo. Si la celda está ocupada,
//  se prueba otra (intento i = 0, 1, 2, ...) según la estrategia de sondeo.
// ─────────────────────────────────────────

enum class Estado { Vacia, Ocupada, Borrada };
enum class Sondeo { Lineal, Cuadratico, DobleHash };

class TablaHashAbierta {
    vector<int> claves;
    vector<Estado> estados;
    Sondeo sondeo;
    int m;
    int cantidad = 0;

public:
    TablaHashAbierta(int tamano, Sondeo tipo)
        : claves(tamano, 0), estados(tamano, Estado::Vacia), sondeo(tipo), m(tamano) {}

    double factorCarga() const { return (double)cantidad / m; }

    // O(1): la celda que toca en el intento i.
    int posicion(int clave, int i) const {
        int h = hashDivision(clave, m);
        if (sondeo == Sondeo::Lineal) return (h + i) % m;
        if (sondeo == Sondeo::Cuadratico) return (h + i * i) % m;
        int paso = 1 + hashDivision(clave, m - 1);   // segundo hash: nunca 0
        return (h + i * paso) % m;
    }

    // O(1) en promedio si α es baja; O(m) en el peor caso.
    bool insertar(int clave) {
        for (int i = 0; i < m; i++) {
            int p = posicion(clave, i);
            if (estados[p] != Estado::Ocupada) {
                claves[p] = clave;
                estados[p] = Estado::Ocupada;
                cantidad++;
                return true;
            }
        }
        return false;   // ningún intento encontró lugar
    }

    // Se detiene en la primera celda vacía: si la clave existiera, estaría antes.
    bool buscar(int clave) const {
        for (int i = 0; i < m; i++) {
            int p = posicion(clave, i);
            if (estados[p] == Estado::Vacia) return false;
            if (estados[p] == Estado::Ocupada && claves[p] == clave) return true;
        }
        return false;
    }

    // No vacía la celda: deja una lápida para no cortar el camino de otras claves.
    bool eliminar(int clave) {
        for (int i = 0; i < m; i++) {
            int p = posicion(clave, i);
            if (estados[p] == Estado::Vacia) return false;
            if (estados[p] == Estado::Ocupada && claves[p] == clave) {
                estados[p] = Estado::Borrada;   // lápida
                cantidad--;
                return true;
            }
        }
        return false;
    }

    void imprimir() const {
        for (int i = 0; i < m; i++) {
            cout << "[" << i << "] ";
            if (estados[i] == Estado::Ocupada) cout << claves[i];
            else if (estados[i] == Estado::Borrada) cout << "(lapida)";
            else cout << "-";
            cout << "\n";
        }
    }
};

// ─────────────────────────────────────────
//  UTILIDADES
// ─────────────────────────────────────────

bool esPrimo(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++)
        if (n % d == 0) return false;
    return true;
}

int siguientePrimo(int n) {
    while (!esPrimo(n)) n++;
    return n;
}

const char* siNo(bool b) { return b ? "si" : "no"; }

// ─────────────────────────────────────────
//  MAIN — prueba de todas las funciones
// ─────────────────────────────────────────

int main() {
    vector<int> nums = { 15, 7, 42, 3, 99 };

    // ── Distintas funciones hash, misma tabla de 7 cubetas ──
    cout << "=== FUNCIONES HASH (m = 7) ===\n";
    cout << "clave  division  multiplicacion  cuadradoMedio  plegado\n";
    for (int n : nums) {
        cout << setw(5) << n
             << setw(10) << hashDivision(n, 7)
             << setw(16) << hashMultiplicacion(n, 7)
             << setw(15) << hashCuadradoMedio(n, 7)
             << setw(9) << hashPlegado(n, 7) << "\n";
    }
    cout << "hashDivision(-15, 7) = " << hashDivision(-15, 7) << " (nunca negativo)\n";

    // ── Texto: la suma de letras no distingue anagramas ──
    cout << "\n=== HASH DE PALABRAS (m = 7) ===\n";
    for (string palabra : { "amor", "roma", "mora", "ramo" }) {
        cout << palabra << ": suma = " << hashSumaLetras(palabra, 7)
             << ", polinomial = " << hashPolinomial(palabra, 7) << "\n";
    }

    // ── Encadenamiento: las colisiones forman una lista en la cubeta ──
    cout << "\n=== ENCADENAMIENTO (m = 7) ===\n";
    TablaHashEncadenada ht;
    for (int n : nums)
        ht.insertar(n);
    ht.imprimir();
    cout << "Existe 42? " << siNo(ht.buscar(42)) << "\n";
    cout << "Existe 10? " << siNo(ht.buscar(10)) << "\n";
    cout << "factor de carga = " << ht.factorCarga() << "\n";

    ht.eliminar(42);
    cout << "tras eliminar(42):\n";
    ht.imprimir();
    cout << "eliminar(10) = " << siNo(ht.eliminar(10)) << "\n";

    // ── Rehash: cuando α supera 1, se agranda la tabla ──
    cout << "\n=== REHASH ===\n";
    TablaHashEncadenada chica(5);
    for (int n : nums)
        chica.insertar(n);
    chica.insertar(20);
    cout << "m = " << chica.tamano() << ", factor de carga = " << chica.factorCarga() << "\n";
    chica.imprimir();
    if (chica.factorCarga() > 1.0)
        chica.rehash(siguientePrimo(2 * chica.tamano()));
    cout << "tras rehash: m = " << chica.tamano() << ", factor de carga = " << chica.factorCarga() << "\n";
    chica.imprimir();

    // ── Direccionamiento abierto con las tres estrategias de sondeo ──
    const pair<Sondeo, const char*> estrategias[] = {
        { Sondeo::Lineal, "LINEAL" },
        { Sondeo::Cuadratico, "CUADRATICO" },
        { Sondeo::DobleHash, "DOBLE HASH" },
    };
    for (const auto& [sondeo, nombre] : estrategias) {
        cout << "\n=== SONDEO " << nombre << " (m = 7) ===\n";
        TablaHashAbierta t(7, sondeo);
        for (int n : nums)
            t.insertar(n);
        t.imprimir();
        cout << "Existe 99? " << siNo(t.buscar(99)) << "\n";
        // 14 % 7 == 0, como 7 y 42. El sondeo cuadrático no lo logra
        // aunque quedan celdas libres: i * i % 7 solo visita 0, 1, 2 y 4.
        cout << "insertar(14) = " << siNo(t.insertar(14)) << "\n";
        t.eliminar(7);
        cout << "tras eliminar(7), existe 42? " << siNo(t.buscar(42)) << " (gracias a la lapida)\n";
    }

    return 0;
}
