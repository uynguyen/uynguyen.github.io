---
title: 'Review Book: Clean Code'
date: 2017-10-20 04:09:39
tags: [books, study]
---
This is a book I have been gifted a long time ago from an old colleague, also he is one of my close friends. This is one of the software books that I like the most but have no chance to buy when I was a student.
![](/Post-Resources/CleanCode/CleanCode.jpg "Clean code")
<!-- more --> 
# Introduction
About the author, Robert C. Martin, he is considered one of the oldest engineers in the software industry. He has many years of experience working in the software field from various positions, from a developer, manager, to CEO. He is best known for writing software guides that describe software principles, software patterns, and practices of software. He has published many books like Clean Coder, Clean Code, Clean Architecture, etc. Clean Code is one of the software books that many software engineers in the world encourage reading.
The author said that *"Over time the mess becomes so big and so deep and so tall, they can not clean it up"*. We need to read, think a lot before writing code. We should avoid writing the code in a hurry. Hurry to write the lousy code will lead to spending more time later for maintaining. Clean Code focuses on the technical aspects: instructing the programmer how to organize the code and write clean code. You won't be learning any new frameworks, but it will provide you with a fundamental set of coding style rules. It's worth reading the book.

# The book contents
The contents of the book are divided into three parts: The first chapters will explain the principles, patterns, and practices of writing clean code. The second part consists of many case studies, each case study is an exercise in transforming the code that has some problems into code that has fewer problems. The last part is the play-off. 

## Why clean code?
Bjarne Stroustrup (Inventor of C++): `Elegant`, `Efficiency`.
Grady Booch (Author of Object Oriented Analysis): `Readability`.
David Thomas (Founder of OTI): `Easy for other people to enhance it`.
Warn Cunningham (Inventor of Wiki): `Make the language look simple`.
Me: `To be able to remember what you write in a month ago`.

## Clean code evaluation criteria

### General
- Don't repeat yourself: Duplication may be the root of all evil in software. Many principles and practices have been created for the purpose of controlling or eliminating it. Sometimes we can use `Template method` pattern to remove higher-level duplication.

### Naming variables, methods, arguments, classes, files
- The name of a variable, function or class should answer the question why it exists, what it does and how it is used.
- Use searchable names.
- Classes and objects should have noun or noun phrase names. Methods should be a verb or verb phrase.
- Inconsistency: Be careful with the conventions you choose, and once chosen, continue to follow them.

### Comments
- Comments should say things that the code can not say for itself: Explain the idea in code, if it can not, then write comments.
- Comments should be reserved for technical notes about the code and design.
- Use correct grammar and punctuation.
- Don't comment-out code, delete it.

### Functions
- Functions should be small: Fewer than 100 lines. It makes the function easier to read and understand.
- Functions should do only one thing.
- Functions should have a small number of arguments (Fewer than 4 arguments).
- Don't pass boolean values as arguments.
- Functions that are never called should be deleted.
- Separate error processing from normal processing.
- Encapsulate conditionals.

### Error handling
- Error handling is important, but if it obscures logic, it's wrong.
- Don't return `Null`: Consider throwing an exception or returning a `SPECIAL CASE` object instead. If you code this way, you will minimize the chance of `NullPointerException` and your code will be cleaner.
- Don't pass `Null` as arguments.

### Boundaries
- Wrapping third-party APIs: Minimize your dependency upon it.
- When there are new releases of the third-party package, we should run the test to see whether there are behavioral differences.
- Avoid letting too much of our code know about the third-party particulars: Let's use an `Adapter` to deal with it.

### Classes
- A class should be small: We measure it by responsibilities. (We know it as SRP principle)
- A code should be placed where a reader would naturally expect it to be. (Where should be the `PI` constant go? Should it be in the `Match` class? Or maybe in the `Circle` class?).
- Be aware when creating static methods. A static method does not operate on a single instance. All the data that method uses come from its arguments, and not from any instances of this class. Also, make sure that there is no chance that you want it to behave polymorphically.

### Concurrency
- There are some basic definitions we should know when we talk about concurrency and threads: Bound resources, mutual exclusion, starvation, deadlock, and livelock.
- Concurrency does not always improve performance. It sometimes incurs some overhead and bugs come from it are not usually repeatable.
- Limit the access of the data that is shared between more than two threads. Use copies of data if there is a chance.
- Keep the synchronized sections as small as possible because Locks create delays and add overhead. They are expensive.
- Multithreaded code behaves differently in different environments: Run tests in every potential deployment environment.

# What I like
- The knowledge in this book is useful. It totally could be applied to reality. After reading the book, my coding style has changed a lot.
- The book is easy to understand and follow. You will read a lot of code, you will have challenges to think about what's right about that code and what's wrong with it. 
- After each chapter, the author summarizes the main ideas. It helps me remember the main points longer.

# What I dislike
- The author uses Java code as examples in the book. Sometimes to understand the author's ideas we have to find out more about Java concepts. (Spring framework, JUnit framework, type of exceptions, etc.)
- The author's ideas are duplicated in some chapters.

# Generally
Of course, in the scope of the article, I can not fully describe the ideas of ​​the author. This is a good book that I recommend, especially for junior developers who recently graduated. Since at the school, teachers may not teach us how a code is called clean, your coding styles are not evaluated. In fact, Your code can run properly but is not clean.
If you can afford to buy this book so that you can refer to when you need, it will be very useful.
"You are reading this book for two reasons. First, you are a programmer. Second, you want to be a better programmer."

![](/Post-Resources/CleanCode/Introduction.JPG "Clean code")