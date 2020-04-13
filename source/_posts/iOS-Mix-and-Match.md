---
title: 'iOS: Mix and Match'
date: 2020-01-30 17:33:16
tags:
---
![](/Post-Resources/MixMatch/mix-match-banner.png "")
As Swift has been becoming a flagship language for iOS development, most of the new iOS projects nowadays are built in Swift. However, there are many useful libraries are developed in other low-level programming languages such as Objective-C and / or C++ to boost performance. On the other hand, not all engineering positions are open to new projects, most of them are hired to maintain and develop new features based on the current code base that are built-in Objective-C.
Having the knowledge to mix the two languages within a single project is good for your iOS development skills as you will face it someday in your career path. In this post, I’m going to show you not only how to use Objective-C and Swift in one single project but also how to use a set of programming languages in a single one, including C++/ Objective-C/ Swift and React Native. Hope you will find this post interesting.
Let’s drive-in.
<!-- more --> 
## C++ <- Objective-C++
For those who have not heard about Objective-C++, 
Objective-C++ is Objective-C is actually a source code that mixes Objective-C classes and C++ classes in one single file.
You just need to change your `.m` file to `.mm` to get the magic worked.
First, I will create a C++ library that will be used by Objective-C++ classes.
```swift
class CPlusPlusMath {
    public:
        int multiplyTwoNumbers(int a, int b);
};
```
The implementation
```swift
int CPlusPlusMath::multiplyTwoNumbers(int a, int b) {
    return a * b;
}
```
Then, you need to create a bridging header file to your project because our new project is in Swift language.

![](/Post-Resources/MixMatch/bridging-header.png "")

The bridging header is where you define all the Objective-C classes that are exposed to Swift. When we add a new Objective-C class to the Swift code-based project, XCode automatically offers to add this file to the project.
Next, you rename the `.m` file to `.mm` to change it from Objective-C code to Objective-C++. 
From now on, you can call to our C++ lib (or other ones) inside this Objective-C++ file
```swift
#import "CPlusPlusMath.hpp"

@implementation ObjMath

- (long)multiplyTwoNumbers:(int) num1 num2:(int) num2 {
    CPlusPlusMath *a = new CPlusPlusMath();
    return a->multiplyTwoNumbers(num1, num2);
}

```

## Objective-C++ <-> Swift
The interesting thing is we can call Objective-C(++) code from Swift code and vise versa.
To use Objective-C classes from Swift, we need to declare their headers to the bridging header file. Let's go ahead and include our mathematical library to this file.
```swift
//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#include "ObjMath.h"

```
That's all you need to do to build the first line from Objective-C to Swift.

```swift
func multiply(num1: Int, num2: Int) -> Int {
    let objMath = ObjMath()
    return objMath.multiplyTwoNumbers(Int32(num1), num2: Int32(num2))
}
```

Next, we need to build the other line from Swift to Objective-C.
We use `objc` keyword before any classes and methods we want to expose to Objective-C classes. A small note is that these exposed classes need to be inherited from the `NSObject` class. Otherwiser, we will get the complile error `Only classes that inherit from NSObject can be declared @objc`.

```swift
@objc
class SwifthMath: NSObject {
    @objc
    func add(num1: Int, num2: Int) -> Int {
        return num1 + num2
    }

    // The rest omited
}
```

## Swift <-> React Native

## Limitation

- Swift objects can have a subclass of an objective-c class, like NSObject. But a swift class cannot be a base class for an objective-c class.

## Troubleshoot

## Conclusions
Many developers are still using Objective-C for many reasons, and they definitely use C++ libraries in their projects, especially in Game development where C++ reaches full its performance. 
I hope that this post will give you a quick look at how to Mix and Match multiple languages in a single project. 
You can find the demonstration project at [Github](https://github.com/uynguyen/iOS-Mix-Match)
Thanks for reading.