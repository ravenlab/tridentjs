/*
MIT License

Copyright (c) 2019 ravenlab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var EventPriority;
(function (EventPriority) {
    EventPriority[EventPriority["LOWEST"] = 0] = "LOWEST";
    EventPriority[EventPriority["LOW"] = 1] = "LOW";
    EventPriority[EventPriority["NORMAL"] = 2] = "NORMAL";
    EventPriority[EventPriority["HIGH"] = 3] = "HIGH";
    EventPriority[EventPriority["HIGHEST"] = 4] = "HIGHEST";
    EventPriority[EventPriority["MONITOR"] = 5] = "MONITOR";
})(EventPriority || (EventPriority = {}));
class EventNode {
    constructor(data, priority) {
        this.data = data;
        this.priority = priority;
    }
    getData() {
        return this.data;
    }
    getPriority() {
        return this.priority;
    }
    getNext() {
        return this.next;
    }
    setNext(next) {
        this.next = next;
    }
    getPrev() {
        return this.prev;
    }
    setPrev(prev) {
        this.prev = prev;
    }
}
class EventDoublyLinkedList {
    constructor() {
        this.head = undefined;
    }
    getHead() {
        return this.head;
    }
    insert(executor, priority) {
        if (executor == undefined || priority == undefined) {
            return undefined;
        }
        let priorityValue = priority;
        let newNode = new EventNode(executor, priorityValue);
        if (this.head == undefined) {
            this.head = newNode;
            return newNode;
        }
        let found = this.findInsertionNode(priorityValue);
        if (found === this.head && priorityValue < this.head.getPriority()) {
            let oldHead = this.head;
            this.head = newNode;
            this.head.setNext(oldHead);
            oldHead.setPrev(this.head);
            return newNode;
        }
        else if (found.getPriority() > priorityValue) {
            newNode.setNext(found);
            newNode.setPrev(found.getPrev());
            newNode.getPrev().setNext(newNode);
            found.setPrev(newNode);
            return newNode;
        }
        else if (found.getNext() == undefined) {
            found.setNext(newNode);
            newNode.setPrev(found);
            return newNode;
        }
        else {
            newNode.setNext(found.getNext());
            found.setNext(newNode);
            newNode.getNext().setPrev(newNode);
            return newNode;
        }
    }
    remove(executor) {
        let found = this.find(executor);
        if (found == undefined) {
            return undefined;
        }
        if (found == this.head) {
            if (this.head.getNext() == undefined) {
                this.head = undefined;
            }
            else {
                this.head = this.head.getNext();
            }
            return found;
        }
        else if (found.getNext() == undefined) {
            found.getPrev().setNext(undefined);
            return found;
        }
        else {
            found.getPrev().setNext(found.getNext());
            return found;
        }
    }
    find(executor) {
        let node = this.head;
        while (node != undefined) {
            if (node.getData() == executor)
                return node;
            node = node.getNext();
        }
        return undefined;
    }
    findInsertionNode(priorityValue) {
        let next = this.head;
        while (next != undefined) {
            if (next.getNext() == undefined) {
                return next;
            }
            else if (next.getPriority() == priorityValue && next.getNext().getPriority() > priorityValue) {
                return next;
            }
            else if (next.getPriority() > priorityValue) {
                return next;
            }
            next = next.getNext();
        }
        return undefined;
    }
}
class EventBus {
    constructor() {
        this.registeredExecutors = new Map();
    }
    callEvent(event, data) {
        let executors = this.registeredExecutors.get(event);
        let ran = false;
        let node = executors.getHead();
        if (node != undefined) {
            ran = true;
        }
        while (node != null) {
            let executor = node.getData();
            executor(data);
            node = node.getNext();
        }
        return ran;
    }
    registerListener(event, listener, priority) {
        if (listener == undefined) {
            return false;
        }
        if (this.registeredExecutors.get(event) == undefined) {
            this.registeredExecutors.set(event, new EventDoublyLinkedList());
        }
        this.registeredExecutors.get(event).insert(listener, priority);
        return true;
    }
}
