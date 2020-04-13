---
title: Memory leak
date: 2018-09-12 11:09:15
tags: [iOS, Memory management]
---
![](/Post-Resources/MemoryLeak/Cover.png "")
As a Software Engineer, you definitely have heard about the Memory leak concept. Memory leak is a situation where blocks of memory are located by the program remain in the memory despise they are no longer referenced. Leaks waste space by filling up pages of memory with inaccessible data. As a result, the size of memory using in your apps keep increasing, affect the user experiences and the performance of your app. Even worse, your app will be crashed randomly because a process will be terminated by the system if it consumes too much memory.
In this topic, we will discuss how the memory is managed in iOS and how to use the memory efficiently. Read on.
<!-- more --> 
## Automatic Reference Counting
### ARC
Most of the modern programming languages (such as Java, C#, Go, etc.) have a built-in process which automatically finds unused objects and deletes them to free up memory. The primary purpose of this technology is to reduce memory leak and let programmers focus on their business logic without caring too much about memory management.
As a high-level programming language, Swift also has Automatic Reference Counting (ARC) to manage memory using in our apps.
### How ARC works
Whenever we create a new instance of a class, ARC will allocate a space of memory to store information about that instance. This memory holds information about the type of the instance, any stored properties associated with that instance. Especially, this memory holds the information of how many properties, constants, and variables are currently referring to that instance. ARC will never deallocate that instance as long as at least one active reference to that instance still exists.
Once the number of objects referring to that instance comes to zero, ARC will deallocate that instance and free the memory held by that instance.
By applying this technique, Apple ensures that class instances do not keep holding space in memory when they are no longer needed, generally avoids the problem of memory leaks.

## Memory leak
In most cases, ARC does its job well. We don't usually worry about memory management. However, leaks still happen in iOS by accident. This is when two objects hold strong references to one another so that each object keeps the other one from being deallocated. 

Let's take an example, there are two classed named `Person` and `Car`.
```swift
class Person {
    let name: String
    var car: Car?

    lazy var greeting: () -> String = {
        return "Hello, my name is \(self.name). I have \(self.car?.name ?? "no cars")"
    }

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Person \(self.name) is being destroyed.")
    }
}

class Car {
    let name: String
    var owner: Person?
    
    init(name: String) {
        self.name = name
    }

    deinit {
        print("car \(self.name) is being destroyed.")
    }
}
```
Every `Person` instance has a `name` property of type `String` and an optional `Car` property that initially nil because a person may not always have a car.
Likewise, every `Car` instance has a `name` property of type `String` and an optional `Person` property that initially nil because a car may not always have an owner.
Next, let's define two variables called `Foo` and `BMW` of `Person` and `Car` classes, respectively. Now, we link the two instances together so that the person has a car, and the car has an owner.
```swift
# Main block
var foo: Person? = Person(name: "Foo")
var car: Car? = Car(name: "BMW")
foo!.car = car
seat!.owner = foo
print(foo!.greeting())
```
The next code snippet will release these two instances by setting them to nil.
```swift
foo = nil
seat = nil
```
As you might know, once setting a variable to nil, it means there are no references to this class instance, ARC will deallocate the space of this object to free up memory. As an expectation, we should see the `deinit` methods of `Student` and `Car` are called. However, those two methods are never called, there are no any messages, indicates objects are released, printed to the console. This means that the `foo` and the `car` are never deinitialized. 
![](/Post-Resources/MemoryLeak/Strong_Reference.png "")
The reason why these two objects are not released because these two objects hold strong references to one another so that each object keeps the other one from being deallocated, resulting in they are never deinitialized. This situation is called *strong reference cycle* in programming.

## Break strong reference cycles
There are two ways to break strong reference cycles in Swift. Depending on which situation we are facing, we will choose a sensible approach to solve the problem. Both methods let an instance reference to one another without keeping a strong hold on it.

### Weak reference
Weak references should be used when the object it refers to might become nil in the future. As such, the captured objects are optional types.
In the example above, it’s appropriate for a car to be able to have no owner at some point in its lifetime, and so a weak reference is an appropriate way to break the reference cycle in this case.
![](/Post-Resources/MemoryLeak/Weak_Reference.png "")
Let's make some changes to make the magic happen
```swift
class Car {
    let name: String
    weak var owner: Person?
    
    init(name: String) {
        self.name = name
    }

    deinit {
        print("Car \(self.name) is being destroyed.")
    }
}
```
Let's run the code, there are still no messages printed to the console, it means the two objects are not released. What the heck!
Let's trace back to our code to check what's wrong with it. 
Do you see that? There is another problem with the code: The closure.

### Unowned reference
In the above example, the `Person` class not only creates a strong reference cycle with the `Car` class but also between itself and the `greeting` closure. Here is how the cycle looks:
![](/Post-Resources/MemoryLeak/Strong_Unowned_Reference.png "")
To resolve this problem, we will use "Unowned reference". Unowned references should be used when the closure and the object it refers to will always have the same lifetime as one another. This means the two objects will be deallocated at the same time. As a result, an unowned reference can never become nil.
Let's make some changes to make the magic happen (Again).
```swift
class Person {
    let name: String
    var car: Car?
    
    lazy var greeting: () -> String = { [unowned self] in
        return "Hello, my name is \(self.name). I have \(self.car?.name ?? "no cars")"
    }

    init(name: String) {
        self.name = name
    }

    deinit {
        print("Person \(self.name) is being destroyed.")
    }
}
```
Let's run the code, you should see the following messages printed to the console.
```bash
Hello, my name is Foo. I have BMW
Person Foo is being destroyed.
Car BMW is being destroyed.
```
The two objects `foo` and `car` have been released and the leak has been resolved. 
Here is how the cycle looks so far:
![](/Post-Resources/MemoryLeak/Unowned_Reference.png "")

## Tools to detect strong reference cycles
Encountering memory leaks is usually a nightmare for an iOS developer because it is too difficult to figure out the root cause. Luckily, we have multiple tools are supported by Apple to track down memory leaks.
### Allocations and Leaks Instrument
From the toolbar of XCode, choose Product > Profile > Allocations to start a new instrument profile for tracking memory allocations. Allocations instrument tracks all of the objects that app allocates during its lifetime.
Now, press the red button on the top left in the panel to start recording.
![](/Post-Resources/MemoryLeak/Instrument.png "")
There is so many information related to memory mapping showed in the tool. To identify memory leak, we just need to focus on two main columns: #Persident and #Transident.
- Persident column: keeps a count of the number of objects of each type that currently exist in memory.
- Transident column: shows the number of objects that have existed but have since been deallocated.

As you can see, the #Persident column keep increasing whenever you press to the "Create a leak" button to execute the main block. When you see something like this happend to your app, it's time to revise your classes to find out where the leak is.
![](/Post-Resources/MemoryLeak/Create_Leak_Instrument.png "")
### Debug Memory Graph
Debug Memory Graph is a tool first introduced in Xcode 8. It is able to grab leaks such as retain cycles. 
From the debug navigator, click debug mode > View Memory Graph Hierarchy to visualize the memory mapping
![](/Post-Resources/MemoryLeak/Visual_Strong_Reference_Cycle_1.png "")
You should see somethings like this.
![](/Post-Resources/MemoryLeak/Visual_Strong_Reference_Cycle_2.png "")
From the visualization, we can see there are two strong reference cycles come from the `Person`-`Car` relationship and from inside the `Person` itself.

## Conclusion
Every iOS developer should have a deep understanding of how ARC works to avoid memory leaks. Undeniably, a good management of memory contributes to the app performance and the user experience. Hopefully, all of the concepts we walk through in this article will help you build apps that have the best performance. Feel free to leave your comments here.
## References
[1] The Swift Programming Language (Swift 4.0.3), App Inc., Automatic Reference Counting chapter.