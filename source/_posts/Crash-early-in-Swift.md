---
title: Crash early in Swift
date: 2019-01-19 11:59:38
tags: [iOS, Swift]
---
![](/Post-Resources/Crashing/crashing.png "Crashing")
Last night, I read a chapter of a book as one of my favorite books: `"The pragmatic programmer"` (By Andrew Hunt and David Thomas). This chapter discusses how to use assertion to make the code easier for debugging. We all know that assertion is an essential tool for writing tests, but It does more than that. Let's go with me to meet this guy: *Assertion*.
<!-- more --> 
## Crash, don't trash
Do you ever have one of the following conversations to yourself or with your colleagues in a technical discussion?
- "This case will never happen so we don't need to process this one."
- "This class must be "Dog", it can never be "Cat", let's force unwrap this object."
- "This error will never occur, just ignore it."
- "You idiot! why do we handle this case when your code never reach out to this line?"

But what if "this case" happen somehow? Does the app still response in the way that we expect? Is there any chance that the unexpected situation will damage our essential database?
At the very beginning of this chapter, the author introduces some situations that I can see myself in those examples: "This code won't be used 30 years from now, so two-digit dates are fine." "This application will never be used abroad, so why internationalize it?" "count can't be negative." "This printf can't fail."

```
IF IT CAN'T HAPPEN, USE ASSERTIONS TO ENSURE THAT IT WON'T
```
If we believe something cannot happen, or something true, use assertions to ensure your belief is true! If the condition of assertion is not met, it will immediately crash the app. It's very useful during *development* because it leads us exactly to the problems.

## Before to continue, let's talk about the Swift Optimization levels
Depend on whether the build is in Release mode or Debug mode, the Swift compiler will turn on or off the assertions (Lines with assert statements are omitted), it's good to know the Swift optimization levels before we continue.
There are 3 types of optimization level for a build in Xcode
- *None (Onone)*: The default for debug builds. Compile without any optimization.
- *Fast (O)*: The default for release builds. Compile with optimizations.
- *Unchecked (Ounchecked)*: Compile with optimizations and remove runtime safety checks, including checking array out of bounds, unwrapping nil, precondition and preconditionFailure. That's why we should not use the `Ounchecked` mode in release build because it can lead to memory corruptions and the app might behave inappropriately.

*Updates*: As you can see there is no longer the `-Ounchecked` mode in Xcode10, instead a new option introduced `Optimize for Size`. The main difference between the `O` mode and `Osize` mode is "When compiling with -O the compiler tries to transform the code so that it executes with maximum performance. However, this improvement in runtime performance can sometimes come with a tradeoff of increased code size. With the new -Osize optimization mode the user has the choice to compile for minimal code size rather than for maximum speed" [(swift.org)](https://swift.org/blog/osize/)
![](/Post-Resources/Crashing/Xcode10-OptimizationLevels.png "Xcode10-OptimizationLevels")

## Apply Assertion to Swift
Truly to say, before reading this chapter of the book, I thought "Assertion" only used when writing unit test. The fact that developers use Assertion in developing to make the developing process safer and easier for tracing a bug.
Swift provides 5 types of assertion function that differ from each other in terms of how they affect the flow of codes:
- *assert() & assertionFailure()*: Use them when we want to verify our code, but if it is actually an issue, it wouldn’t necessarily exit the app. The compiler will ignore assert() and assertionFailure() statements for a release version (In -O mode). For example, I use assert to ensure there are no unexpected requests in my business flow. By doing so, I guarantee that if there is a "strange guy" appears in my flow, the flow will be broken and the app will be terminated. Also, the debugger will lead me directly to the problem so that I can identify logic problems and clear out bugs as early as possible.
![](/Post-Resources/Crashing/Assert.png "Assert in practice")
- *precondition() & preconditionFailure()*: Use these functions to detect a condition that must be fulfill before continuing to process, even in release version (-O mode). For example, let's say that we need to load a config file when the app launch. If there is no config file, then we should stop the app immediately rather than continuing the execution.
```swift
guard let fileConfig = Bundle.main.path(forResource: "config", ofType: "json") else {
    preconditionFailure("Unable to load config file.")
}
```
- *fatalError()*: The same as precondition() and preconditionFailure() functions, except fatalError() works for all optimisation levels in all configurations, it means your app ALWAYS be terminated if the fatalError line is reached. In the following example, I use fatalError() to force every inherited class must override the `parseData(files:)` from its super class.
![](/Post-Resources/Crashing/FatalError.png "FatalError in practice")

## Highlighted advice from the author
- `"All errors give you information. You could convince yourself that the error can't happen, and choose to ignore it. Instead, Pragmatic Programmers tell themselves that if there is an error, something very, very bad has happened."` If an error happens, can we recover it? If we can not handle some unexpected problems, then crash early to protect our vital data (Especially in banking apps that require high security for database).
- `"Don't put assertion in the code of real error handling.`" It is a misunderstanding if we put assertion everywhere around the code, particularly in the code of real error handling. Assertion is not supposed to be used this way. If we simply to terminate a running program, it will affect to the user experiences, resulting in users will no longer open your app. The simplest principle to check if we should exit the program when errors occur is `When your code discovers that something that was supposed to be impossible just happened, your program is no longer viable. Anything it does from this point forward becomes suspect, so terminate it as soon as possible. A dead program normally does a lot less damage than a crippled one.`
- `"The condition passed to an assertion should not have a side effect"`. It is embarrassing if we put a code to check errors actually causing to other errors. 😖 For example, the following code (In Java) is added assert to make sure the next element is not nil, but it actually creates a new error. Can you find it?
```java
while (iter.hasmoreElements () { 
    Test.ASSERT(iter.nextElements() != null); 
    object obj = iter.nextElement();
    // ....
}
```

## Conclusion
In this article, we walked through these five methods for an early exit in Swift. In general, the right way to pick which one to use depends on the context of the error: Whether the error can be recoverable or not? If the answer is no, then crashing is the best way we can do to protect our app from unpredictable behaviors. Sometimes, the app is in a situation where it would be too dangerous to continue.
Hope you found this post useful then you can apply this idea to your next project. 
Thanks for reading! 🚀