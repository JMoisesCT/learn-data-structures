// Dynamic array: an array that grows automatically when it fills up.
// It is the idea behind std::vector.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra dynamic_array.cpp -o dynamic_array
//   ./dynamic_array

#include <iostream>
#include <stdexcept>

class DynamicArray {
public:
    DynamicArray() : data(new int[2]), size(0), capacity(2) {}

    ~DynamicArray() {
        delete[] data;
    }

    // We forbid copies to keep the example simple
    // (copying the pointer would cause a double delete[]).
    DynamicArray(const DynamicArray&) = delete;
    DynamicArray& operator=(const DynamicArray&) = delete;

    int get(int i) const {
        if (i < 0 || i >= size) {
            throw std::out_of_range("invalid index");
        }
        return data[i];
    }

    int getSize() const { return size; }
    int getCapacity() const { return capacity; }

    // Amortized O(1): there is almost always free space at the end.
    void pushBack(int value) {
        if (size == capacity) {
            resize(capacity * 2);
        }
        data[size] = value;
        size++;
    }

    // O(n): everything after pos has to shift one place to the right.
    void insert(int pos, int value) {
        if (pos < 0 || pos > size) {
            throw std::out_of_range("invalid position");
        }
        if (size == capacity) {
            resize(capacity * 2);
        }
        for (int i = size; i > pos; i--) {
            data[i] = data[i - 1];
        }
        data[pos] = value;
        size++;
    }

    // O(n): everything shifts to the left to close the gap.
    void removeAt(int pos) {
        if (pos < 0 || pos >= size) {
            throw std::out_of_range("invalid position");
        }
        for (int i = pos; i < size - 1; i++) {
            data[i] = data[i + 1];
        }
        size--;
    }

    // O(n): linear search. Returns the index, or -1 if it is not there.
    int find(int value) const {
        for (int i = 0; i < size; i++) {
            if (data[i] == value) {
                return i;
            }
        }
        return -1;
    }

    void print() const {
        std::cout << "[";
        for (int i = 0; i < size; i++) {
            std::cout << data[i] << (i + 1 < size ? ", " : "");
        }
        std::cout << "]  size=" << size << " capacity=" << capacity << "\n";
    }

private:
    // O(n): we reserve a bigger array and copy everything.
    void resize(int newCapacity) {
        int* newData = new int[newCapacity];
        for (int i = 0; i < size; i++) {
            newData[i] = data[i];
        }
        delete[] data;
        data = newData;
        capacity = newCapacity;
    }

    int* data;
    int size;
    int capacity;
};

int main() {
    DynamicArray v;

    for (int x : {10, 20, 30}) {
        v.pushBack(x);
        v.print();
    }

    v.insert(1, 15);
    std::cout << "insert(1, 15)  -> ";
    v.print();

    v.removeAt(0);
    std::cout << "removeAt(0)    -> ";
    v.print();

    std::cout << "find(30) = " << v.find(30) << "\n";
    std::cout << "find(99) = " << v.find(99) << "\n";
    std::cout << "get(0) = " << v.get(0) << "\n";

    try {
        v.get(10);
    } catch (const std::out_of_range& e) {
        std::cout << "get(10) throws an exception: " << e.what() << "\n";
    }

    return 0;
}
