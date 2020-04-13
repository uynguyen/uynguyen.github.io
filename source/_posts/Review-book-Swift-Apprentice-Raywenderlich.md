---
title: 'Review book: Swift Apprentice - Raywenderlich'
date: 2020-02-26 22:05:30
tags:
---
![](/Post-Resources/SwiftApprentice/banner.png "SwiftApprentice")
While I was searching for a book to boost my iOS development skill, I found this Swift Apprentice book on Raywenderlich’s book store. Take a quick look at the content of the book, I decided to add the book to my library.
Generally, If your iOS skill is mid-level or senior, you’re so confident with your master programming skill, this book is not for you. But if you’re looking for a book to strengthen your knowledge, or you just want to make sure everything you understand about Swift language is right - as my purpose, then take this book with you.
You’ll learn about very basic things like function, method, constants, control statement, etc. You’ll also have a chance to get in-depth knowledge about Stack/Heap allocation, protocol-oriented programming, and generic programming, which make your daily job more convenient, and you will find yourself like a master in Swift language.
Let’s drive-in!
<!-- more --> 
<div style="text-align:center">
<img src="/Post-Resources/SwiftApprentice/LikeABoss.jpg" />
</div>
# About the author
For those who don't know who Raywenderlich is, it is a community site focused on creating programming tutorials and books (Mainly focus on mobile development on Android and iOS). Their content covers all levels from beginning to advanced topics.
I often access [Raywenderlich](https://www.raywenderlich.com/about) site to get example code and to make my knowledge up to date. Their tutorials are extremely great, technically accurate and are updated to the newest technologies.
Swift Apprentice is one of their collection of iOS programming.
![](/Post-Resources/SwiftApprentice/books.png "Library")

# Keynotes
- Lazy property: If you have a property that might take some time to calculate, you don’t want to slow things down until you actually need the property, let's use the lazy stored property. It is useful for such things as downloading a user’s profile picture or making a serious calculation.
- The heap vs. the stack:
The Stack is used to store anything on the immediate thread of execution; it’s managed and optimized by the CPU. When a function creates a variable, the stack stores that variable and then destroys it when the function exits. Since the stack is so strictly organized, it’s very efficient, and thus quite fast.
The heap, on the other side, is used to store instances of reference types. The heap is generally a large pool of memory from which the system can request and dynamically allocate blocks of memory. Lifetime is flexible and dynamic. It doesn’t automatically destroy its data (the stack does so). Additional work is required to free the memory on the Heap, which makes creating and removing data on the heap a slower process, compared to on the stack.
When an instance of a class is created, your code requests a block of memory on the heap to store the instance itself.
When an instance of a struct is created (that is not part of an instance of a class), the instance itself is stored on the stack, and the heap is never involved.
- When to use a class versus a struct:
*Values vs. objects*: Use structures as values and classes as objects with identity. To make it simple, just keep in mind that there are no two objects are considered equal simply because they hold the same state. In contrast, instances of value types, which are values, are considered equal if they are the same value. e.g, no two students are considered equal, even if they have the same name; Two points (x, y) are equal if x1 and y1 the same to x2 and y2, respectively, so we implement Point as a struct.
*Speed*: If these instances will only exist in memory for a short time — go towards using a struct. If your instance will have a longer lifecycle in memory, let's think of a class.
`Another approach is to use only what you need. If your data will never change or you need a simple data store, then use structures. If you need to update your data and you need it to contain logic to update its own state, then use classes. Often, it’s best to begin with a struct. If you need the added capabilities of a class sometime later, then you just convert the struct to a class.`
![](/Post-Resources/SwiftApprentice/StructVsClass.png "Library")
- Two-Phase initialization: 
• Phase one: Initialize all of the stored properties in the class instance, from the bottom to the top of the class hierarchy. If you use properties and methods before phase one is complete, the compiler will throw errors.
• Phase two: We can now use properties and methods of the object.
- Protocols in the Standard Library: Equatable, Comparable, Hashable, CustomStringConvertible.
- Generic function parameters: 
```swift
func swapped<T, U>(_ x: T, _ y: U) -> (U, T) {
    (y, x)
}
```
- Wildcard pattern: 
```swift
if case (_, 0, 0) = coordinate {
    // x can be any value. y and z must be exactly 0.
    print("On the x-axis") // Printed! 
}
```
- Value-binding pattern:
```swift
if case let (x, y, 0) = coordinate {
    print("On the x-y plane at (\(x), \(y))") // Printed: 1, 0 
}
```
- “Is” type-casting pattern":
```swift
switch element {
    case is String:
        print("Found a string")
    default: break
}
```
- Rethrows: By using rethrows instead of throws, functions indicate that they will only rethrow errors thrown by the functions called inside itself but never errors of its own.
- Protocol-oriented benefits:
By using protocols instead of implementations, we focus on what the object can do instead of how the object does, which makes the application more extendable and testable.
Multiple inheritances: One of the real benefits of protocols is that they allow a form of multiple inheritance.
- Swift is a protocol-oriented language.

# What I like
- *Well organized*. 
- *Real examples*: There are examples for each topic to make sure readers deeply understand what they just mentioned.
- *Easy to understand*: As the content are well-organized, it's easy to follow the content flow.
- *Stop and think*: There are short exercises and challenges throughout the book to give you some programming practice and test your knowledge along the way.
- *Keypoints*: They summarize key points at the end of each chapter.

# What I dislike
I tried to look over the books several times to find a spot that I dislike but there is nothing to complain about, from content to form.

# Generally
Swift is fun and is filled with programming paradigms. After reading this book, I hope you now feel more comfortable enough with the language to move on to building bigger things. With the language fundamentals we've gained, we're ready to explore advanced frameworks such as Animation, UIKit, etc. to build iOS apps, macOS apps and more. 
I hope you find this book interesting.
Happy weekend!