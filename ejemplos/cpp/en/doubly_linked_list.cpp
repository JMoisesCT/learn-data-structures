// Doubly linked list: each node stores a value, a pointer to the previous
// one and another to the next one, and the list stores the first (head) and
// the last (tail). It is the idea behind std::list.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra doubly_linked_list.cpp -o doubly_linked_list
//   ./doubly_linked_list

#include <iostream>
#include <stdexcept>

struct Node {
    int value;
    Node* prev;
    Node* next;

    explicit Node(int v) : value(v), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList {
public:
    DoublyLinkedList() = default;

    ~DoublyLinkedList() {
        while (head != nullptr) {
            Node* temp = head;
            head = head->next;
            delete temp;
        }
    }

    // We forbid copies to keep the example simple.
    DoublyLinkedList(const DoublyLinkedList&) = delete;
    DoublyLinkedList& operator=(const DoublyLinkedList&) = delete;

    // O(1): the new node points to the head and the head, back, to the new node.
    void insertAtFront(int value) {
        Node* newNode = new Node(value);
        newNode->next = head;
        if (head != nullptr) {
            head->prev = newNode;
        } else {
            tail = newNode;  // it was empty: it's the first and the last
        }
        head = newNode;
        size++;
    }

    // O(1): thanks to tail we don't have to walk the list.
    void insertAtBack(int value) {
        Node* newNode = new Node(value);
        newNode->prev = tail;
        if (tail != nullptr) {
            tail->next = newNode;
        } else {
            head = newNode;  // it was empty: it's the first and the last
        }
        tail = newNode;
        size++;
    }

    // O(n): reach pos; hooking in the new node is four pointers.
    void insertAt(int pos, int value) {
        if (pos < 0 || pos > size) {
            throw std::out_of_range("invalid position");
        }
        if (pos == 0) {
            insertAtFront(value);
            return;
        }
        if (pos == size) {
            insertAtBack(value);
            return;
        }
        Node* next = nodeAt(pos);
        Node* prev = next->prev;
        Node* newNode = new Node(value);
        newNode->prev = prev;
        newNode->next = next;
        prev->next = newNode;
        next->prev = newNode;
        size++;
    }

    // O(n) to reach pos (from the nearest end).
    int get(int pos) const {
        if (pos < 0 || pos >= size) {
            throw std::out_of_range("invalid position");
        }
        return nodeAt(pos)->value;
    }

    // O(n) to find it; taking it out is O(1): no need to look for its previous node.
    bool remove(int value) {
        Node* node = head;
        while (node != nullptr && node->value != value) {
            node = node->next;
        }
        if (node == nullptr) {
            return false;
        }
        unlink(node);
        return true;
    }

    // O(1): in a singly linked list, removing the last one costs O(n).
    int removeBack() {
        if (tail == nullptr) {
            throw std::out_of_range("empty list");
        }
        int value = tail->value;
        unlink(tail);
        return value;
    }

    // O(1)
    int removeFront() {
        if (head == nullptr) {
            throw std::out_of_range("empty list");
        }
        int value = head->value;
        unlink(head);
        return value;
    }

    void print() const {
        std::cout << "head -> ";
        for (Node* n = head; n != nullptr; n = n->next) {
            std::cout << n->value << " <-> ";
        }
        std::cout << "nullptr   (size = " << size << ")\n";
    }

    // Thanks to prev, it can also be walked backward.
    void printBackward() const {
        std::cout << "tail -> ";
        for (Node* n = tail; n != nullptr; n = n->prev) {
            std::cout << n->value << " <-> ";
        }
        std::cout << "nullptr\n";
    }

private:
    Node* head = nullptr;
    Node* tail = nullptr;
    int size = 0;

    // O(n), but from the nearest end: at most size / 2 jumps.
    // Assumes 0 <= pos < size.
    Node* nodeAt(int pos) const {
        if (pos < size / 2) {
            Node* current = head;
            for (int i = 0; i < pos; i++) {
                current = current->next;
            }
            return current;
        }
        Node* current = tail;
        for (int i = size - 1; i > pos; i--) {
            current = current->prev;
        }
        return current;
    }

    // O(1): its neighbors point to each other, skipping it.
    void unlink(Node* node) {
        if (node->prev != nullptr) {
            node->prev->next = node->next;
        } else {
            head = node->next;
        }
        if (node->next != nullptr) {
            node->next->prev = node->prev;
        } else {
            tail = node->prev;
        }
        delete node;
        size--;
    }
};

int main() {
    DoublyLinkedList list;
    list.insertAtBack(12);
    list.insertAtBack(20);
    list.insertAtFront(7);
    list.insertAtFront(3);
    list.print();
    list.printBackward();

    list.insertAt(2, 9);
    std::cout << "insertAt(2, 9) -> ";
    list.print();
    try {
        list.insertAt(9, 1);
    } catch (const std::out_of_range& e) {
        std::cout << "insertAt(9, 1) throws out_of_range: " << e.what() << "\n";
    }

    std::cout << "get(1) = " << list.get(1) << "\n";
    std::cout << "get(4) = " << list.get(4) << " (reached from the tail)\n";

    std::cout << std::boolalpha;
    std::cout << "remove(9) = " << list.remove(9) << " -> ";
    list.print();
    std::cout << "remove(99) = " << list.remove(99) << "\n";

    std::cout << "removeBack() = " << list.removeBack() << " -> ";
    list.print();
    std::cout << "removeFront() = " << list.removeFront() << " -> ";
    list.print();

    list.removeBack();
    list.removeBack();
    try {
        list.removeBack();
    } catch (const std::out_of_range& e) {
        std::cout << "removeBack() on the empty list throws out_of_range: " << e.what() << "\n";
    }

    return 0;
}
