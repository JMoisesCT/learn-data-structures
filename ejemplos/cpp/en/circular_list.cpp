// Circular list: a singly linked list where the last node, instead of
// pointing to nullptr, points to the first one. Keeping a pointer to the
// last one is enough: the first one is last->next. It is used to hand out
// turns (round-robin), like operating systems do with processes.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra circular_list.cpp -o circular_list
//   ./circular_list

#include <algorithm>
#include <iostream>
#include <stdexcept>

struct Node {
    int value;
    Node* next;

    explicit Node(int v) : value(v), next(nullptr) {}
};

class CircularList {
public:
    CircularList() = default;

    ~CircularList() {
        while (last != nullptr) {
            removeFirst();
        }
    }

    // We forbid copies to keep the example simple.
    CircularList(const CircularList&) = delete;
    CircularList& operator=(const CircularList&) = delete;

    // O(1): the new node slips in between the last and the first.
    void insertAtFront(int value) {
        Node* newNode = new Node(value);
        if (last == nullptr) {
            newNode->next = newNode;  // a single node: it points to itself
            last = newNode;
        } else {
            newNode->next = last->next;
            last->next = newNode;
        }
        size++;
    }

    // O(1): it's inserting at the front and moving last one place.
    void insertAtBack(int value) {
        insertAtFront(value);
        last = last->next;
    }

    // O(1): the first one becomes the last. No node moves.
    void rotate() {
        if (last != nullptr) {
            last = last->next;
        }
    }

    // O(1)
    int removeFirst() {
        if (last == nullptr) {
            throw std::out_of_range("empty list");
        }
        Node* first = last->next;
        int value = first->value;
        if (first == last) {
            last = nullptr;  // it was the only one
        } else {
            last->next = first->next;
        }
        delete first;
        size--;
        return value;
    }

    // O(n): one full lap. With do-while the first one is checked too.
    bool find(int value) const {
        if (last == nullptr) {
            return false;
        }
        Node* current = last->next;
        do {
            if (current->value == value) {
                return true;
            }
            current = current->next;
        } while (current != last->next);
        return false;
    }

    // O(1): a reference to the first one's value, so it can be changed.
    int& first() {
        if (last == nullptr) {
            throw std::out_of_range("empty list");
        }
        return last->next->value;
    }

    bool isEmpty() const {
        return last == nullptr;
    }

    void print() const {
        if (last == nullptr) {
            std::cout << "(empty: last = nullptr)\n";
            return;
        }
        Node* current = last->next;
        do {
            std::cout << current->value << " -> ";
            current = current->next;
        } while (current != last->next);
        std::cout << "(back to " << last->next->value << ")   size = " << size << "\n";
    }

private:
    Node* last = nullptr;
    int size = 0;
};

// One round-robin turn: the first one works up to 'quantum' units. If it
// finishes, it leaves the list; if not, it rotates to the back. It returns
// how much work that process still needs.
int takeTurn(CircularList& processes, int quantum) {
    int& remaining = processes.first();
    remaining -= std::min(remaining, quantum);
    if (remaining == 0) {
        processes.removeFirst();
        return 0;
    }
    int leftover = remaining;
    processes.rotate();
    return leftover;
}

int main() {
    CircularList list;
    list.insertAtBack(10);
    list.insertAtBack(20);
    list.insertAtBack(30);
    list.insertAtFront(5);
    list.print();

    list.rotate();
    std::cout << "rotate() -> ";
    list.print();

    std::cout << std::boolalpha;
    std::cout << "find(30) = " << list.find(30) << "\n";
    std::cout << "find(99) = " << list.find(99) << "\n";

    std::cout << "removeFirst() = " << list.removeFirst() << " -> ";
    list.print();

    // Turns: each value is the time a process still needs.
    CircularList processes;
    for (int time : {5, 3, 7}) {
        processes.insertAtBack(time);
    }
    int turn = 1;
    while (!processes.isEmpty()) {
        int remaining = takeTurn(processes, 3);
        std::cout << "turn " << turn++ << ": it still needs " << remaining << " -> ";
        processes.print();
    }
    try {
        processes.removeFirst();
    } catch (const std::out_of_range& e) {
        std::cout << "removeFirst() on the empty list throws out_of_range: " << e.what() << "\n";
    }

    return 0;
}
