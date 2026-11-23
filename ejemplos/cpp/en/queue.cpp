// Queue: the first one in is the first one out (FIFO).
// Two versions:
//   1. std::queue, the STL queue: the one you would use in a real program.
//   2. LinkedQueue: the same idea built with nodes, to see what happens
//      inside. You leave from the head of a linked list and you enter
//      at the end, thanks to a second pointer to the last node.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra queue.cpp -o queue
//   ./queue

#include <iostream>
#include <queue>
#include <stdexcept>
#include <string>

// ------------------------------------------------------------------
// Version 1: std::queue
// ------------------------------------------------------------------

void useQueue() {
    std::queue<int> queue;  // inside, it keeps the values in a std::deque

    // push: it enters at the back. O(1).
    for (int value : {5, 9, 2}) {
        queue.push(value);
    }
    std::cout << "size() = " << queue.size() << ", back() = " << queue.back() << "\n";

    // front: reads the first one without taking it out. O(1). On an empty
    // queue it's undefined behavior (it doesn't throw an exception): you have
    // to ask empty() first.
    if (!queue.empty()) {
        std::cout << "front() = " << queue.front() << "\n";
    }

    // pop: removes the first one and does NOT return it. O(1). If you need
    // the value, read it first with front().
    if (!queue.empty()) {
        queue.pop();
    }

    // When you empty it, the values come out in the same order they went in.
    while (!queue.empty()) {
        std::cout << "out " << queue.front() << "\n";
        queue.pop();
    }
}

// The Josephus problem: n people in a circle; you count k at a time and the
// one you land on leaves, until one is left. With a queue, the first k - 1
// go from the front to the back (like in a circle) and the next one leaves.
// O(n·k).
int josephus(int n, int k) {
    std::queue<int> circle;
    for (int i = 1; i <= n; i++) {
        circle.push(i);
    }
    while (circle.size() > 1) {
        for (int i = 1; i < k; i++) {
            circle.push(circle.front());
            circle.pop();
        }
        circle.pop();
    }
    return circle.front();
}

// ------------------------------------------------------------------
// Version 2: LinkedQueue
// ------------------------------------------------------------------

struct Node {
    int value;
    Node* next;

    explicit Node(int v) : value(v), next(nullptr) {}
};

class LinkedQueue {
public:
    LinkedQueue() = default;

    ~LinkedQueue() {
        while (!isEmpty()) {
            dequeue();
        }
    }

    // We forbid copies to keep the example simple.
    LinkedQueue(const LinkedQueue&) = delete;
    LinkedQueue& operator=(const LinkedQueue&) = delete;

    bool isEmpty() const {
        return head == nullptr;
    }

    int size() const {
        return count;
    }

    // O(1): thanks to tail we don't have to walk the list to reach the
    // end (with nodeAt(count - 1) it would be O(n)). Same as std::queue::push.
    void enqueue(int value) {
        Node* newNode = new Node(value);
        if (tail == nullptr) {
            head = newNode;
        } else {
            tail->next = newNode;
        }
        tail = newNode;
        count++;
    }

    // O(1): the first one leaves, like deleting the head of the list.
    // Same as front() + pop().
    int dequeue() {
        if (head == nullptr) {
            throw std::underflow_error("empty queue");
        }
        Node* temp = head;
        int value = temp->value;
        head = head->next;
        if (head == nullptr) {
            tail = nullptr;
        }
        delete temp;
        count--;
        return value;
    }

    // O(1): same as std::queue::front, but on an empty queue it throws.
    int front() const {
        if (head == nullptr) {
            throw std::underflow_error("empty queue");
        }
        return head->value;
    }

    void print() const {
        std::cout << "head -> ";
        for (Node* n = head; n != nullptr; n = n->next) {
            std::cout << n->value << " -> ";
        }
        std::cout << "nullptr   (tail = " << (tail ? std::to_string(tail->value) : "nullptr")
                  << ", size = " << count << ")\n";
    }

private:
    Node* head = nullptr;  // you leave from here
    Node* tail = nullptr;  // you enter here
    int count = 0;
};

int main() {
    std::cout << "--- std::queue ---\n";
    useQueue();
    std::cout << "josephus(6, 3) = " << josephus(6, 3) << "\n";

    std::cout << "\n--- LinkedQueue ---\n";
    LinkedQueue queue;
    for (int x : {5, 9, 2}) {
        queue.enqueue(x);
        queue.print();
    }

    std::cout << "front() = " << queue.front() << "\n";

    while (!queue.isEmpty()) {
        std::cout << "dequeue() = " << queue.dequeue() << "  ";
        queue.print();
    }

    try {
        queue.dequeue();
    } catch (const std::underflow_error& e) {
        std::cout << "dequeue() on an empty queue throws: " << e.what() << "\n";
    }

    queue.enqueue(42);  // the destructor frees this node
    return 0;
}
