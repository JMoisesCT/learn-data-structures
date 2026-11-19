// Stack: the last one in is the first one out (LIFO).
// Two versions:
//   1. std::stack, the STL stack: the one you would use in a real program.
//   2. LinkedStack: the same idea built from nodes, to see what happens
//      inside. The top is the head of a linked list.
//
// Compile and run:
//   g++ -std=c++17 -Wall -Wextra stack.cpp -o stack
//   ./stack

#include <iostream>
#include <stack>
#include <stdexcept>
#include <string>

// ------------------------------------------------------------------
// Version 1: std::stack
// ------------------------------------------------------------------

void useStack() {
    std::stack<int> stack;  // inside, it keeps the values in a std::deque

    // push: puts a value on top. O(1).
    for (int value : {4, 8, 15}) {
        stack.push(value);
    }
    std::cout << "size() = " << stack.size() << "\n";

    // top: reads the top without removing it. O(1). On an empty stack it is
    // undefined behavior (no exception): ask empty() first.
    if (!stack.empty()) {
        std::cout << "top() = " << stack.top() << "\n";
    }

    // pop: removes the top and does NOT return it. O(1). If you need the
    // value, read it first with top().
    if (!stack.empty()) {
        stack.pop();
    }

    // When you empty it, the values come out in the reverse order they went in.
    while (!stack.empty()) {
        std::cout << "out " << stack.top() << "\n";
        stack.pop();
    }
}

// A classic use: are the parentheses, brackets and braces balanced?
// Each opener is pushed; each closer must match the last opener that is
// still open, which is exactly the top. O(n).
bool isBalanced(const std::string& text) {
    std::stack<char> openers;
    for (char c : text) {
        if (c == '(' || c == '[' || c == '{') {
            openers.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (openers.empty()) {
                return false;
            }
            char expected = c == ')' ? '(' : (c == ']' ? '[' : '{');
            if (openers.top() != expected) {
                return false;
            }
            openers.pop();
        }
    }
    return openers.empty();
}

// ------------------------------------------------------------------
// Version 2: LinkedStack
// ------------------------------------------------------------------

struct Node {
    int value;
    Node* next;

    explicit Node(int v) : value(v), next(nullptr) {}
};

class LinkedStack {
public:
    LinkedStack() = default;

    ~LinkedStack() {
        while (!isEmpty()) {
            pop();
        }
    }

    // We forbid copies to keep the example simple.
    LinkedStack(const LinkedStack&) = delete;
    LinkedStack& operator=(const LinkedStack&) = delete;

    bool isEmpty() const {
        return top == nullptr;
    }

    int size() const {
        return count;
    }

    // O(1): it is the linked list's insertAtFront. Same as std::stack::push.
    void push(int value) {
        Node* newNode = new Node(value);
        newNode->next = top;
        top = newNode;
        count++;
    }

    // O(1): it is removing the head of the list. Same as top() + pop().
    int pop() {
        if (top == nullptr) {
            throw std::underflow_error("empty stack");
        }
        Node* temp = top;
        int value = temp->value;
        top = top->next;
        delete temp;
        count--;
        return value;
    }

    // O(1): same as std::stack::top, but on an empty stack it throws an exception.
    int peek() const {
        if (top == nullptr) {
            throw std::underflow_error("empty stack");
        }
        return top->value;
    }

    void print() const {
        std::cout << "top -> ";
        for (Node* n = top; n != nullptr; n = n->next) {
            std::cout << n->value << " -> ";
        }
        std::cout << "nullptr   (size = " << count << ")\n";
    }

private:
    Node* top = nullptr;  // the top: the last one that went in
    int count = 0;
};

int main() {
    std::cout << "--- std::stack ---\n";
    useStack();
    for (const char* text : {"{a[b(c)]}", "([)]", "(()", "())"}) {
        std::cout << "isBalanced(\"" << text << "\") = " << std::boolalpha
                  << isBalanced(text) << "\n";
    }

    std::cout << "\n--- LinkedStack ---\n";
    LinkedStack stack;
    for (int x : {4, 8, 15}) {
        stack.push(x);
        stack.print();
    }

    std::cout << "peek() = " << stack.peek() << "\n";

    while (!stack.isEmpty()) {
        std::cout << "pop() = " << stack.pop() << "\n";
    }

    try {
        stack.pop();
    } catch (const std::underflow_error& e) {
        std::cout << "pop() on an empty stack throws: " << e.what() << "\n";
    }

    stack.push(42);  // the destructor frees this node
    return 0;
}
