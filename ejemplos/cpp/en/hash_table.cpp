// Hash table: an array of "buckets" and a hash function that turns each key
// into the index of its bucket. Finding, inserting and removing cost O(1)
// on average, because you go straight to one bucket instead of walking through everything.
//
// When two keys land in the same bucket there's a COLLISION. Here you can see
// the two classic ways to resolve them:
//   - Chaining: each bucket is a linked list (ChainedHashTable).
//   - Open addressing: another free cell of the same array is searched for
//     with linear probing, quadratic probing or double hashing (OpenAddressingHashTable).
//
// STL equivalents: std::unordered_set and std::unordered_map (they use
// chaining; see bucket_count(), load_factor() and rehash()), and std::hash.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra hash_table.cpp -o hash_table
//   ./hash_table

#include <cmath>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// ─────────────────────────────────────────
//  HASH FUNCTIONS FOR NUMBERS
//  They all return an index between 0 and m - 1.
// ─────────────────────────────────────────

// O(1): division method. With a prime m it spreads better.
int divisionHash(int key, int m) {
    int r = key % m;
    return r < 0 ? r + m : r;   // in C++, -15 % 7 == -1
}

// O(1): multiplication method (Knuth). It works well with any m.
int multiplicationHash(int key, int m) {
    const double A = 0.6180339887;   // (√5 - 1) / 2
    double product = key * A;
    double fraction = product - floor(product);
    return (int)(m * fraction);
}

// O(1): mid-square. Squares the key and keeps the middle digits
// (for keys of up to 3 digits, the square has up to 6).
int midSquareHash(int key, int m) {
    int square = key * key;
    int middle = (square / 100) % 100;
    return middle % m;
}

// O(digits): folding. Cuts the key into groups of 2 digits and adds them up.
int foldingHash(int key, int m) {
    int sum = 0;
    while (key > 0) {
        sum += key % 100;
        key /= 100;
    }
    return sum % m;
}

// ─────────────────────────────────────────
//  HASH FUNCTIONS FOR TEXT (ASCII)
// ─────────────────────────────────────────

// O(length): adds up the letter codes. Anagrams always collide.
int letterSumHash(const string& text, int m) {
    int sum = 0;
    for (char c : text)
        sum += c;
    return sum % m;
}

// O(length): polynomial hash (Horner's method). The order of the letters matters.
int polynomialHash(const string& text, int m) {
    int h = 0;
    for (char c : text)
        h = (h * 31 + c) % m;
    return h;
}

// ─────────────────────────────────────────
//  CHAINING
//  Each bucket keeps a linked list with the keys that land there.
// ─────────────────────────────────────────

struct Node {
    int value;
    Node* next;
    explicit Node(int v) : value(v), next(nullptr) {}
};

class ChainedHashTable {
    vector<Node*> table;   // table[i] points to the first node of bucket i
    int count = 0;

public:
    explicit ChainedHashTable(int m = 7) : table(m, nullptr) {}

    ~ChainedHashTable() {
        for (Node* current : table) {
            while (current) {
                Node* tmp = current;
                current = current->next;
                delete tmp;
            }
        }
    }

    // We forbid copies to keep the example simple.
    ChainedHashTable(const ChainedHashTable&) = delete;
    ChainedHashTable& operator=(const ChainedHashTable&) = delete;

    int size() const { return table.size(); }

    // Load factor α = n / m: how many nodes there are, on average, per bucket.
    double loadFactor() const { return (double)count / table.size(); }

    // O(1): computes the bucket and inserts at the front of its list.
    void insert(int key) {
        int index = divisionHash(key, size());
        Node* newNode = new Node(key);
        newNode->next = table[index];   // inserts at the front
        table[index] = newNode;
        count++;
    }

    // O(1 + α) on average: it only walks the list of one bucket.
    bool find(int key) const {
        int index = divisionHash(key, size());
        Node* current = table[index];
        while (current) {
            if (current->value == key) return true;
            current = current->next;
        }
        return false;
    }

    // O(1 + α) on average: as in a linked list, it remembers the previous one.
    bool remove(int key) {
        int index = divisionHash(key, size());
        Node* current = table[index];
        Node* prev = nullptr;
        while (current) {
            if (current->value == key) {
                if (prev) prev->next = current->next;
                else table[index] = current->next;
                delete current;
                count--;
                return true;
            }
            prev = current;
            current = current->next;
        }
        return false;
    }

    // O(n + m): changes the number of buckets and relocates each node (without copying it).
    void rehash(int newSize) {
        vector<Node*> newTable(newSize, nullptr);
        for (Node* current : table) {
            while (current) {
                Node* nextNode = current->next;
                int index = divisionHash(current->value, newSize);
                current->next = newTable[index];   // at the front, as in insert
                newTable[index] = current;
                current = nextNode;
            }
        }
        table.swap(newTable);
    }

    void print() const {
        for (int i = 0; i < size(); i++) {
            cout << "[" << i << "] -> ";
            for (Node* current = table[i]; current; current = current->next)
                cout << current->value << " -> ";
            cout << "null\n";
        }
    }
};

// ─────────────────────────────────────────
//  OPEN ADDRESSING
//  All the keys live in the same array. If the cell is taken, another one
//  is tried (attempt i = 0, 1, 2, ...) according to the probing strategy.
// ─────────────────────────────────────────

enum class State { Empty, Occupied, Deleted };
enum class Probing { Linear, Quadratic, DoubleHash };

class OpenAddressingHashTable {
    vector<int> keys;
    vector<State> states;
    Probing probing;
    int m;
    int count = 0;

public:
    OpenAddressingHashTable(int size, Probing type)
        : keys(size, 0), states(size, State::Empty), probing(type), m(size) {}

    double loadFactor() const { return (double)count / m; }

    // O(1): the cell for attempt i.
    int position(int key, int i) const {
        int h = divisionHash(key, m);
        if (probing == Probing::Linear) return (h + i) % m;
        if (probing == Probing::Quadratic) return (h + i * i) % m;
        int step = 1 + divisionHash(key, m - 1);   // second hash: never 0
        return (h + i * step) % m;
    }

    // O(1) on average if α is low; O(m) in the worst case.
    bool insert(int key) {
        for (int i = 0; i < m; i++) {
            int p = position(key, i);
            if (states[p] != State::Occupied) {
                keys[p] = key;
                states[p] = State::Occupied;
                count++;
                return true;
            }
        }
        return false;   // no attempt found a place
    }

    // Stops at the first empty cell: if the key existed, it would be before it.
    bool find(int key) const {
        for (int i = 0; i < m; i++) {
            int p = position(key, i);
            if (states[p] == State::Empty) return false;
            if (states[p] == State::Occupied && keys[p] == key) return true;
        }
        return false;
    }

    // Doesn't empty the cell: it leaves a tombstone so other keys' paths aren't cut.
    bool remove(int key) {
        for (int i = 0; i < m; i++) {
            int p = position(key, i);
            if (states[p] == State::Empty) return false;
            if (states[p] == State::Occupied && keys[p] == key) {
                states[p] = State::Deleted;   // tombstone
                count--;
                return true;
            }
        }
        return false;
    }

    void print() const {
        for (int i = 0; i < m; i++) {
            cout << "[" << i << "] ";
            if (states[i] == State::Occupied) cout << keys[i];
            else if (states[i] == State::Deleted) cout << "(tombstone)";
            else cout << "-";
            cout << "\n";
        }
    }
};

// ─────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────

bool isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++)
        if (n % d == 0) return false;
    return true;
}

int nextPrime(int n) {
    while (!isPrime(n)) n++;
    return n;
}

const char* yesNo(bool b) { return b ? "yes" : "no"; }

// ─────────────────────────────────────────
//  MAIN — tries out every function
// ─────────────────────────────────────────

int main() {
    vector<int> nums = { 15, 7, 42, 3, 99 };

    // ── Different hash functions, same table of 7 buckets ──
    cout << "=== HASH FUNCTIONS (m = 7) ===\n";
    cout << "  key  division  multiplication      midSquare  folding\n";
    for (int n : nums) {
        cout << setw(5) << n
             << setw(10) << divisionHash(n, 7)
             << setw(16) << multiplicationHash(n, 7)
             << setw(15) << midSquareHash(n, 7)
             << setw(9) << foldingHash(n, 7) << "\n";
    }
    cout << "divisionHash(-15, 7) = " << divisionHash(-15, 7) << " (never negative)\n";

    // ── Text: the letter sum doesn't tell anagrams apart ──
    cout << "\n=== HASH OF WORDS (m = 7) ===\n";
    for (string word : { "listen", "silent", "enlist", "tinsel" }) {
        cout << word << ": sum = " << letterSumHash(word, 7)
             << ", polynomial = " << polynomialHash(word, 7) << "\n";
    }

    // ── Chaining: collisions form a list in the bucket ──
    cout << "\n=== CHAINING (m = 7) ===\n";
    ChainedHashTable ht;
    for (int n : nums)
        ht.insert(n);
    ht.print();
    cout << "Is 42 there? " << yesNo(ht.find(42)) << "\n";
    cout << "Is 10 there? " << yesNo(ht.find(10)) << "\n";
    cout << "load factor = " << ht.loadFactor() << "\n";

    ht.remove(42);
    cout << "after remove(42):\n";
    ht.print();
    cout << "remove(10) = " << yesNo(ht.remove(10)) << "\n";

    // ── Rehash: when α goes over 1, the table grows ──
    cout << "\n=== REHASH ===\n";
    ChainedHashTable small(5);
    for (int n : nums)
        small.insert(n);
    small.insert(20);
    cout << "m = " << small.size() << ", load factor = " << small.loadFactor() << "\n";
    small.print();
    if (small.loadFactor() > 1.0)
        small.rehash(nextPrime(2 * small.size()));
    cout << "after rehash: m = " << small.size() << ", load factor = " << small.loadFactor() << "\n";
    small.print();

    // ── Open addressing with the three probing strategies ──
    const pair<Probing, const char*> strategies[] = {
        { Probing::Linear, "LINEAR" },
        { Probing::Quadratic, "QUADRATIC" },
        { Probing::DoubleHash, "DOUBLE HASHING" },
    };
    for (const auto& [probing, name] : strategies) {
        cout << "\n=== " << name << " PROBING (m = 7) ===\n";
        OpenAddressingHashTable t(7, probing);
        for (int n : nums)
            t.insert(n);
        t.print();
        cout << "Is 99 there? " << yesNo(t.find(99)) << "\n";
        // 14 % 7 == 0, like 7 and 42. Quadratic probing doesn't manage it
        // even though there are free cells: i * i % 7 only visits 0, 1, 2 and 4.
        cout << "insert(14) = " << yesNo(t.insert(14)) << "\n";
        t.remove(7);
        cout << "after remove(7), is 42 there? " << yesNo(t.find(42)) << " (thanks to the tombstone)\n";
    }

    return 0;
}
