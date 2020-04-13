---
title: 'Best practice: Core Data Concurrency'
date: 2019-09-01 10:13:01
tags: [Core Data, iOS, Concurrency]
---

![](/Post-Resources/CoreDataConcurrency/banner.png "Core data stack")
Some applications can survive without any data storage. Most other useful applications, however, save some state such as user configurations, user profile, goals, etc. on iOS, Apple provides Core Data as a framework to persist your valuable data. One thing to keep in mind that although CoreData can store data in a relational database it’s actually not a database engine.
In this tutorial, I will share with you a bad experience I faced when I work with Core Data. Hopefully, after reading my sharing, you will avoid facing the same problem in your projects.
Let’s get started.
<!-- more --> 
# Three main components of core data stack
First of all, I will list down the three main components of core data stack, you might or might not familiar with these terms but it's better to get a deep understand of core data stack before digging deeper.
The Core Data API, also called the stack, consists of three main components:
- *NSManagedObjectModel*: The data model describes an entity (object).
- *NSManagedObjectContext*: The objects when fetched from the persistent storage are placed in managed object context. It performs validations and keeps track of the changes made to the object's attributes so that undo and redo operations can be applied to it, if needed. In a given context, a managed object provides a representation of a record in a persistent store. Depending on a situation, there may be multiple contexts, each containing a separate managed object representing that record. All managed objects are registered with a managed object context.
- *NSPersistentStoreCoordinator*: `NSManagedObjectContext does` not work directly with `NSPersistentStore` to store and retrieve data, but NSPersistentStoreCoordinator will do so. The main roles of `NSPersistentStoreCoordinator` are to managed the state of managed object context and to serialize calls to `NSPersistenStore` to avoid redundancy.

You can find the main roles of each component by the following image
![](/Post-Resources/CoreDataConcurrency/CoreDataStack.png "Core data stack")

We have enough knowledge of Core Data and its different components. Now, let's move forward to the main section.

# Core data supports concurrency
Core Data supports multi-threading in an application, which means more than one thread can be executed in parallel to increase performance. Even some tasks can be performed in the background using a separate thread.
As you might know, when working with CoreData, there are two ways to define a managed object context: `NSMainQueueConcurrencyType` and `NSPrivateQueueConcurrencyType`. It depends on us to decide which type of MOC we should create in our applications. Mainly we will work on the main one, but to avoid doing data processing on the main queue, as it might affect the user experience when doing heavy tasks on the main thread, we sometimes need to create a private queue context and perform those heavy tasks on this private context.
Concurrency absolutely makes the app more effective as tasks now can do in parallel, but there are some strict rules defined by Apple we must follow otherwise we will face some unexpected behaviors, including crashes and losing data.
- *Rule 1*: Managed object contexts are stuck with the thread that they are associated with upon declaration. The first rule states that do not use the main queue context in a background thread. Most of the time, there are no-fail at all if we violate the rule. When it comes to production, however, you will soon face crashes on your dashboard, resulting in bad user experiences and more importantly, leading to losing data.
- *Rule 2*: Managed objects retrieved from a context are stuck with the same queue that the context associated with. That means do not pass any objects retrived from main context to private one and vise versa. Violate this rule will lead to the same result as rule 1.

# Crash, crash, crash! 😱
It has been the first time I use CoreData to store valuable data of users in our app. On one hand, I did not take core data concurrency seriously at that time. On the other hand, I do not know there are some strick rules when working with concurrency in Core Data. As a result, when the app comes to production, the number of crashes had been reported to the monitor dashboard.
![](/Post-Resources/CoreDataConcurrency/CoreDataCrash_01.png "Core data crash")

![](/Post-Resources/CoreDataConcurrency/CoreDataCrash_02.png "Core data crash")

At that time, I had no idea how they come. I could not reproduce these issues to find out the root cause was. Additionally, the crash reported by Firebase did not have enough information for an investigation. I tried reviewing the flow of my app, searching on StackOverFlow and then reading deeply Apple's document of Core Data. Finally, the root cause comes from accessing Core Data from multiple threads.

As I'm working with Core Bluetooth, the key point is that Core Bluetooth dispatches Bluetooth events in the main thread by default. However, I configurated the Bluetooth queue to a background queue to avoid locking the UI queue. Here crashes come as Core Data does not allow to access `NSManagedObject` among different queues strictly.

To simulate this issue, I created a non-stop loop to run inserting and deleting actions in a background queue continuously. The following code illustrates how I performed the test. 

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    // Do any additional setup after loading the view.
    
    self.doSomething()
}

func doSomething() {
    self.managedContext?.insert(person: self.person)
    self.managedContext?.delete(person: self.person)
    DispatchQueue.global(qos: .background).asyncAfter(deadline: .now() + 0.1, execute: {
        self.doSomething()
    })
}
```

Sooner or later, the crash will come to us.
```swift
2019-10-13 12:31:55.497690+0700 CoreData-Concurrency[90636:1151728] [error] error: Serious application error.  Exception was caught during Core Data change processing. This is usually a bug within an observer of NSManagedObjectContextObjectsDidChangeNotification.  -[__NSCFSet addObject:]: attempt to insert nil with userInfo (null)
CoreData: error: Serious application error.  Exception was caught during Core Data change processing.  This is usually a bug within an observer of NSManagedObjectContextObjectsDidChangeNotification.  -[__NSCFSet addObject:]: attempt to insert nil with userInfo (null)
2019-10-13 12:31:55.569306+0700 CoreData-Concurrency[90636:1151728] *** Terminating app due to uncaught exception 'NSInvalidArgumentException', reason: '-[__NSCFSet addObject:]: attempt to insert nil'
```

![](/Post-Resources/CoreDataConcurrency/Simulate_Crash.png "Core data crash")

Here are some answers from the community you can find on Stackoverflow:
https://stackoverflow.com/questions/36402366/core-data-crash-attempt-to-insert-nil-with-userinfo-null
https://stackoverflow.com/questions/55517083/ios-core-data-serious-application-error-attempt-to-insert-nil-in-less-than

# Avoid crashing

To avoid the crash, the are two techniques we can apply, both of them make sure that we do not violate concurrent-confinement rules. 
## #1
The first one is to ensure that the `managedObjectContext` is performed on the queue that it is associated with upon initialization, which is the main queue in this case.
```swift
func doSomething() {
    self.managedContext?.insert(person: self.person)
    self.managedContext?.delete(person: self.person)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: { // Dispatch to main queue
        self.doSomething()
    })
}
```
In case for some reason, we can not execute the actions on the main queue (e.g importing huge data to disk) we can create multiple contexts to solve this problem. Move to #2.

## #2
Using `Core data multiple context` technique.
A child managed object context (MOC) does not hold a reference to the persistent store coordinator (PSC). Instead, it keeps a reference to another (MOC) as its parent. Whenever a child performs `saveContext`, the changes will be pushed to its parent, and keep pushing to other parents (If had). It is only when the root parent MOC performs `saveContext`, the changes are saved to the PSC. 

![](/Post-Resources/CoreDataConcurrency/CoreData-MultipleContext.png "Core data multiple context")

Let's create a private MOC inside our `PersonManagedObject` class.
```swift
private let privateMOC = NSManagedObjectContext(concurrencyType: .privateQueueConcurrencyType)
```

Then set its parent as the main MOC.
```swift
init?() {
    ...
    
    privateMOC.parent = self.managedObjectContext
}
```

From now on, all action will be performed on this `privateMOC`. The method `performAndWait` blocks the caller from returning until the block is executed.
`
The perform(_:) method returns immediately and the context executes the block methods on its own thread. With the performAndWait(_:) method, the context still executes the block methods on its own thread, but the method doesn’t return until the block is executed.
`

```swift
func insert(person: Person) {
    ...
    // Some code are obmitted
    self.privateMOC.performAndWait {
        self.privateMOC.insert(object)
        synchronize()
    }
}
```

Don't forget to call `saveContext` method of the parent context to save the changes to PSC.
```swift
private func synchronize() {
    do {
        try self.privateMOC.save() // We call save on the private context, which moves all of the changes into the main queue context without blocking the main queue.
        self.managedObjectContext.performAndWait {
            do {
                try self.managedObjectContext.save()
            } catch {
                print("Could not synchonize data. \(error), \(error.localizedDescription)")
            }
        }
    } catch {
        print("Could not synchonize data. \(error), \(error.localizedDescription)")
    }
}
```

After modifying the code by using either #1 or #2, I ran the program again in a long time but there were no more crashes!

# Conclusion
Core data is a very useful framework and certainly is indispensable in most mobile applications today. To avoid the same bad situations as I just went through, make sure you dig into its components before starting your code, especially core data concurrency.
You can find my completed project at [Github - Core Data Concurrency](https://github.com/uynguyen/Core_Data_Concurrency)
Thanks for reading.
# References
[1] B.M. Harwani - Core Data iOS Essentials-Packt Publishing (2011)
[2] [Core Data, Multithreading, and the Main Thread](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/Concurrency.html)
[3] [Multiple context CoreData] https://www.cocoanetics.com/2012/07/multi-context-coredata/