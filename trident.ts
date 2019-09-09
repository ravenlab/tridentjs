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

enum EventPriority {
	
	LOWEST = 0,
	LOW = 1,
	NORMAL = 2,
	HIGH = 3,
	HIGHEST = 4,
	MONITOR = 5
}


class EventNode {
	
	private data: any;
	private priority: number;
	private next: EventNode;
	private prev: EventNode;
	constructor(data:any, priority: number)
	{
		this.data = data;
		this.priority = priority;
	}
	
	public getData(): any
	{
		return this.data;
	}
	
	public getPriority(): number
	{
		return this.priority;
	}
	
	public getNext(): EventNode
	{
		return this.next;
	}
	
	public setNext(next: EventNode): void
	{
		this.next = next;
	}
	
	public getPrev(): EventNode
	{
		return this.prev;
	}
	
	public setPrev(prev: EventNode): void
	{
		this.prev = prev;
	}
	
}

class EventDoublyLinkedList {
	
	private head: EventNode;
	constructor()
	{
		this.head = undefined;
	}
	
	public getHead(): EventNode
	{
		return this.head;
	}
	
	public insert(executor: any, priority: EventPriority): EventNode
	{
		if(executor == undefined || priority == undefined)
		{
			return undefined;
		}
		
		let priorityValue: number = priority;
		let newNode: EventNode = new EventNode(executor, priorityValue);
		if(this.head == undefined)
		{
			this.head = newNode;
			return newNode;
		}
		
		let found: EventNode = this.findInsertionNode(priorityValue);
		if(found === this.head && priorityValue < this.head.getPriority())
		{
			let oldHead: EventNode = this.head;
			this.head = newNode;
			this.head.setNext(oldHead);
			oldHead.setPrev(this.head);
			return newNode;
		}
		else if(found.getPriority() > priorityValue)
		{
			newNode.setNext(found);
			newNode.setPrev(found.getPrev());
			newNode.getPrev().setNext(newNode);
			found.setPrev(newNode);
			return newNode;
		}
		else if(found.getNext() == undefined)
		{
			found.setNext(newNode);
			newNode.setPrev(found);
			return newNode;
		}
		else
		{
			newNode.setNext(found.getNext());
			found.setNext(newNode);
			newNode.getNext().setPrev(newNode);
			return newNode;
		}
	}
	
	public remove(executor: any): EventNode
	{
		let found: EventNode = this.find(executor);
		
		if(found == undefined)
		{
			return undefined;
		}
		
		if(found == this.head)
		{
			if(this.head.getNext() == undefined)
			{
				this.head = undefined;
			}
			else
			{
				this.head = this.head.getNext();
			}
			
			return found;
		}
		else if(found.getNext() == undefined)
		{
			found.getPrev().setNext(undefined);
			return found;
		}
		else
		{
			found.getPrev().setNext(found.getNext());
			return found;
		}
	}
	
	public find(executor: any): EventNode
	{
		let node: EventNode = this.head;
		while(node != undefined)
		{
			if(node.getData() == executor)
				return node;
			node = node.getNext();
		}
		
		return undefined;
	}
	
	private findInsertionNode(priorityValue: number): EventNode
	{
		let next: EventNode = this.head;
		while(next != undefined)
		{
			if(next.getNext() == undefined)
			{
				return next;
			}
			else if(next.getPriority() == priorityValue && next.getNext().getPriority() > priorityValue)
			{
				return next;
			}
			else if(next.getPriority() > priorityValue)
			{
				return next;
			}
			next = next.getNext();
		}
		
		return undefined;
	}
}
	

abstract class EventBus {
	
	private registeredExecutors: Map<string, EventDoublyLinkedList>;
	constructor()
	{
		this.registeredExecutors = new Map();
	}
	
	public callEvent(event: string, data: any): boolean
	{
		let executors: EventDoublyLinkedList = this.registeredExecutors.get(event);
		
		let ran: boolean = false;
		let node: EventNode = executors.getHead();
		if(node != undefined)
		{
			ran = true;
		}
		
		while(node != null)
		{
			let executor: any = node.getData();
			executor(data);
			node = node.getNext();
		}
		
		return ran;
	}
	
	public registerListener(event:string, listener: any, priority: EventPriority): boolean
	{
		if(listener == undefined)
		{
			return false;
		}
		
		if(this.registeredExecutors.get(event) == undefined)
		{
			this.registeredExecutors.set(event, new EventDoublyLinkedList());
		}
		
		this.registeredExecutors.get(event).insert(listener, priority);
		
		return true;
	}
}