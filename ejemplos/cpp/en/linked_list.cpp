// Singly linked list: each node stores a value and a pointer to the next one.
// It is the idea behind std::forward_list (and std::list, if it also
// stored a pointer to the previous one).
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra linked_list.cpp -o linked_list
//   ./linked_list

#include <iostream>
#include <stdexcept>

struct Node {
    int value;
    Node* next;

    explicit Node(int v) : value(v), next(nullptr) {}
};

class LinkedList {
public:
    LinkedList() = default;

    ~LinkedList() {
        while (head != nullptr) {
            Node* temp = head;
            head = head->next;
            delete temp;
        }
    }

    // We forbid copies to keep the example simple.
    LinkedList(const LinkedList&) = delete;
    LinkedList& operator=(const LinkedList&) = delete;

    // O(1): only two pointers change.
    void insertAtFront(int value) {
        Node* newNode = new Node(value);
        newNode->next = head;
        head = newNode;
        size++;
    }

    // O(n): nodeAt walks to the node BEFORE pos; linking is two pointers.
    void insertAt(int pos, int value) {
        if (pos < 0 || pos > size) {
            throw std::out_of_range("invalid position");
        }
        if (pos == 0) {
            insertAtFront(value);
            return;
        }
        Node* prev = nodeAt(pos - 1);
        Node* newNode = new Node(value);
        newNode->next = prev->next;
        prev->next = newNode;
        size++;
    }

    // O(n): the end is position size, and insertAt has to get there.
    void insertAtBack(int value) {
        insertAt(size, value);
    }

    // O(n): nodeAt makes pos jumps from the head.
    int get(int pos) const {
        Node* node = nodeAt(pos);
        if (node == nullptr) {
            throw std::out_of_range("invalid position");
        }
        return node->value;
    }

    // O(n): we go node by node.
    bool find(int value) const {
        Node* current = head;
        while (current != nullptr) {
            if (current->value == value) {
                return true;
            }
            current = current->next;
        }
        return false;
    }

    // O(n): we look for the node BEFORE the one with the value.
    bool remove(int value) {
        if (head == nullptr) {
            return false;
        }
        if (head->value == value) {
            Node* temp = head;
            head = head->next;
            delete temp;
            size--;
            return true;
        }
        Node* current = head;
        while (current->next != nullptr && current->next->value != value) {
            current = current->next;
        }
        if (current->next == nullptr) {
            return false;
        }
        Node* temp = current->next;
        current->next = temp->next;
        delete temp;
        size--;
        return true;
    }

    // O(n): like insertAt, nodeAt takes us to the node BEFORE pos.
    int removeAt(int pos) {
        if (pos < 0 || pos >= size) {
            throw std::out_of_range("invalid position");
        }
        Node* temp;
        if (pos == 0) {
            temp = head;
            head = head->next;
        } else {
            Node* prev = nodeAt(pos - 1);
            temp = prev->next;
            prev->next = temp->next;
        }
        int value = temp->value;
        delete temp;
        size--;
        return value;
    }

    void print() const {
        std::cout << "head -> ";
        for (Node* n = head; n != nullptr; n = n->next) {
            std::cout << n->value << " -> ";
        }
        std::cout << "nullptr   (size = " << size << ")\n";
    }

private:
    Node* head = nullptr;
    int size = 0;  // how many nodes there are; insertAtBack uses it as a position

    // O(n): moves pos nodes from the head; nullptr if that position doesn't exist.
    // It's private: it returns an internal node, and get, insertAt and removeAt use it.
    Node* nodeAt(int pos) const {
        if (pos < 0) {
            return nullptr;
        }
        Node* current = head;
        for (int i = 0; i < pos && current != nullptr; i++) {
            current = current->next;
        }
        return current;
    }
};

int main() {
    LinkedList list;

    list.insertAtBack(7);
    list.insertAtBack(12);
    list.insertAtFront(3);
    list.print();

    list.insertAt(2, 9);
    std::cout << "insertAt(2, 9) -> ";
    list.print();
    try {
        list.insertAt(8, 1);
    } catch (const std::out_of_range& e) {
        std::cout << "insertAt(8, 1) throws out_of_range: " << e.what() << "\n";
    }

    std::cout << "get(2) = " << list.get(2) << "\n";
    try {
        list.get(5);
    } catch (const std::out_of_range& e) {
        std::cout << "get(5) throws out_of_range: " << e.what() << "\n";
    }

    std::cout << "find(12) = " << std::boolalpha << list.find(12) << "\n";
    std::cout << "find(99) = " << list.find(99) << "\n";

    std::cout << "removeAt(1) = " << list.removeAt(1) << " -> ";
    list.print();

    list.remove(12);
    std::cout << "remove(12)  -> ";
    list.print();

    list.remove(3);
    std::cout << "remove(3)   -> ";
    list.print();

    std::cout << "remove(99) = " << list.remove(99) << "\n";
    try {
        list.removeAt(1);
    } catch (const std::out_of_range& e) {
        std::cout << "removeAt(1) throws out_of_range: " << e.what() << "\n";
    }

    return 0;
}
