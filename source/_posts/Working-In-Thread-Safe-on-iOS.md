---
title: Working In Thread Safe on iOS
date: 2018-06-05 21:03:32
tags: [iOS, Concurrency]
---

![](/Post-Resources/ThreadSafe/cover.png "")
As you might know, the word “Thread safe” is referred to a computer science concept in the context of multi-thread programs. A code is called “Thread safe” if any shared data is accessed by only one thread at any given time. Notice these shared data are called critical sections in an operating system.
The point is Swift collection types like Array and Dictionary are not thread-safe when declared mutable (With `var` keyword).
In this post, we will discuss some techniques to make our code thread safe in iOS.
<!-- more --> 
## Case study
Let's say we have an array which contains crucial data. In reality, it can be an amount of money in a credit card, transaction states, etc. They are really important so if we don't protect these values accurately, we will face significant errors at runtime.
To simulate a race condition, I'm going to use `DispatchQueue.concurrentPerform` to create 10 concurrent threads running at the same time.
```swift
class ViewController: UIViewController {

    var array = [Int]()
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Do any additional setup after loading the view, typically from a nib.
        DispatchQueue.concurrentPerform(iterations: 10) { index in
            self.array.append(index)
        }
    }
    // The rest of code
}
```

The result of the above code is unpredictable. You will fall into 2 cases:

- Most of the times you run this code, you will get a run-time crash like this
![](/Post-Resources/ThreadSafe/crash.png "")
The fundamental problem is because Swift collections like Array and Dictionary are not thread-safe but we let multiple threads modify the array at the same time. [Stackoverflow](https://stackoverflow.com/questions/47959397/concurrentperform-unsafemutablepointer-deinitialize-error-while-adding-value-to?noredirect=1&lq=1)

- If you luckily don't get this crash, the elements of the array will look random like this:
`Element count 5`
`Element count 9`
`Element count 10`
The point is we do not always get 10 elements as expected.

How it happened?
![](/Post-Resources/ThreadSafe/Race-Condition.png "")
It’s not safe to let one thread modify the value while another is reading it.
## Solutions
The way to avoid race conditions is to synchronize data, or the critical sections. Synchronizing data usually means to "lock" it so that only one thread can access that part of the code at a time.
Since Swift does not support built-in concurrency solutions, we're going to use Grand Central Dispatch to implement thread safe instead.

### Using serial queue
By leveraging serial queues, we can prevent race conditions on a resource. As I introduced how a serial queue works in a previous post, [Grand-Central-Dispatch-in-Swift](/2018/01/04/Grand-Central-Dispatch-in-Swift/), a serial queue allows just only one process run at a time so the array is safe from concurrent processes.

```Swift
class SafetyArray<T> {
        var array = [T]()
        let serialQueue = DispatchQueue(label: "com.uynguyen.queue")

        var last: T? {
            var result: T?
            self.serialQueue.sync {
                result = self.array.last
            }
            return result
        }

        func append(_ newElement: T) {
            self.serialQueue.async() {
                self.array.append(newElement)
            }
        }
    }
```

Although we protect the array from being accessed by multiple threads, using serial queue is not the best solution. Reading the last value is not optimized because multiple read requests have to wait for each other as it is in a serial queue. Reads should be able to happen concurrently, as long as we do not make a write at the same time.

### Using concurrent queue with the `barrier` flag
The main idea of this solution is using a concurrent queue instead of a serial queue. 
Swift supports us to dispatch a block of code to a concurrent queue with a flag called `barrier`. The *barrier* flag ensures that the concurrent queue does not execute any other tasks while executing the `barrier` process. Once the `barrier` process done, then the queue allows running other tasks simultaneously by default implementation.
```swift
class SafeArray<T> {
        var array = [T]()
        let concurrentQueue = DispatchQueue(label: "com.uynguyen.queue", attributes: .concurrent)

        var last: T? {
            var result: T?
            self.concurrentQueue.sync {
                result = self.array.last
            }
            return result
        }

        func append(_ newElement: T) {
            self.concurrentQueue.async(flags: .barrier) {
                self.array.append(newElement)
            }
        }
    }
```
We continue to use the sync method for reading the last element, but all readers will run in parallel this time since we are using a concurrent queue.
![](/Post-Resources/ThreadSafe/Barrier.png "")

## The trade off
Working with multiple threads is a hard part of coding. Although we have to protect critical sections from multiple accesses, we should keep in mind that *"Keep the synchronized sections as small as possible because Locks create delays and add overhead. They are expensive"*. [Clean code](/2017/10/20/Review-Book-Clean-Code/).
Some tips to deal with concurrency:
- Concurrency does not always improve performance. It sometimes incurs some overhead and bugs come from it are not usually repeatable.
- Limit the access of the data that is shared between more than two threads. Use copies of data if there is a chance.
- Multithreaded code behaves differently in different environments: Run tests in every potential deployment environment.

## Final thoughts
Thread safe is one of the most important concepts in computer science, especially in a system which allows accessing data simultaneously. Understand how to make code thread safe, we can avoid serious errors occurring at runtime.
Happy coding.