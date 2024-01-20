---
title: Protobuf In Practice
date: 2024-01-12 16:07:40
tags:
---
![](/Post-Resources/protobuf/banner.png "banner")

I have worked on Bluetooth products, including wearable devices and smart locks, in many years. Facilitating the transfer of messages between system components is a crucial aspect due to differences in programming languages, the necessity for consistency, and limitations on data transfer size. To address these challenges, we utilize [Protocol Buffers](https://github.com/protocolbuffers/protobuf).
Protocol Buffers, also known as Protobuf, is a free and open-source cross-platform data format used to serialize structured data developed by Google. It is designed to be efficient, extensible, and user-friendly. In this tutorial, we will cover the basics of creating a simple Protocol Buffers message, defining a schema, and generating code in various programming languages.

<!-- more --> 

## Installation
To install the protobuf compiler, follow the instructions outlined in [protobuf-compiler-installation](https://github.com/protocolbuffers/protobuf#protobuf-compiler-installation) to do the installation. The basic usage can be summarized by the image below.

![](/Post-Resources/protobuf/flow.png "flow")

Steps to set up:
- Install the protobuf compiler. On Mac, use brew: `brew install protobuf`
- Validate if the installation completed successfully: `protoc --version`.
- Installing the Code Generator Plugin: Protobuf supports several different programming languages. You need to find and install the code generator for the specific language depending on which programming languages are used in your project. For example, for Swift, use `swift-protobuf`: `brew install swift-protobuf`. For JavaScript, use `npm install -g protoc-gen-js`.
- Define your schemes: Visit (Programming Guides)[https://protobuf.dev/programming-guides/proto3/] to learn how to use the protocol buffer language to structure your protocol buffer data
```bash example.proto
message Person {
  optional string name = 1;
  optional int32 id = 2;
  optional string email = 3;
}
```
- Compile `.proto` files to generate code for specific languages.

```bash
nguyenuy@192  ~/Desktop/protobuf  protoc --js_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --java_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --cpp_out=. example.proto
nguyenuy@192  ~/Desktop/protobuf  protoc --dart_out=. example.proto
```

- Distribute (import) the generated files into your projects.
- Install the runtime plugin. For instance, in an iOS project, include the `SwiftProtobuf` framework in the `Podfile`. For Flutter projects, add `protobuf` to the `pubspec.yaml` file. For ReactJS projects, include `google-protobuf` in the `package.json` file.
- Implement serialization and deserialization:
Example in Python
```py
person = example_pb2.Person()

# Set values
person.name = "Uy Nguyen"
person.id = 1
person.email = "uynguyen.itus@gmail.com"

# Serialize the message to bytes
serialized_data = person.SerializeToString()

# Parse the bytes back into a message
new_person = example_pb2.Person()
new_person.ParseFromString(serialized_data)
```

Example in Java
```java
Person person = Person.newBuilder()
    .setName("Uy Nguyen")
    .setId(1)
    .setEmail("uynguyen@gmail.com")
    .build();

// Serialize the message to bytes
byte[] serializedData = person.toByteArray();

// Parse the bytes back into a message
Person newPerson = Person.parseFrom(serializedData);
```

Example in Swift
```swift
var p = Person()
p.id = 1
p.email = "uynguyen.itus@gmail.com"
p.name = "Uy Nguyen"

// Serialize the message to bytes
let data = try? p.serializedData()

// Parse the bytes back into a message
let converted = try? Person(serializedData: data!)
```

Below is how the generated files look in different languages.
![](/Post-Resources/protobuf/generated.png "generated")

## Pros
- **Binary Format**: `Protobuf` uses a binary format for serialization, which is more compact than `JSON` text-based format. This results in smaller message sizes, making it more efficient in terms of both bandwidth and storage.
- **Performance**: Due to its binary format and efficient encoding, Protobuf serialization and deserialization processes are generally faster than `JSON`. This can be particularly important in scenarios with high-throughput or low-latency requirements, such as systems applying BLE.
- **Code Generation**: Protobuf relies on code generation to create data classes in various programming languages based on the defined schema. This can lead to type-safe and efficient code, reducing the chances of runtime errors related to data structure mismatches.
- **Support for Multiple Languages**: Protobuf supports code generation in a variety of programming languages, making it suitable for projects with different technologies. This allows different services written in different languages to easily communicate using the same data structures.

## Cons
- **Human Readability**: `Protobuf` binary format is not human-readable, which can make debugging and troubleshooting more challenging compared to `JSON`. `JSON` plain text format allows developers to inspect the data easily.
- **Debugging Complexity**: Due to the binary nature of protobuf, debugging can be more complex when compared to `JSON`. Specialized tools are often needed to inspect the content of protobuf-encoded messages.
- **Less Common in Web Technologies**: `JSON` is more prevalent in web development and is natively supported by many web APIs. If interoperability with web technologies is a top priority, `JSON` might be a more natural choice.
- **Complexity in Nested Structures**: Dealing with nested structures in `protobuf` messages can sometimes be less intuitive than in `JSON`. Care must be taken when designing nested structures to avoid unnecessary complexity.

## Summary
In summary, while `protobuf` offers significant advantages in terms of efficiency and performance, its adoption should be considered based on the specific requirements and constraints of the project. It's essential to weigh the pros and cons and choose the serialization format that best aligns with your project's goals and constraints.

## Ref
- [Protocol Buffers Documentation](https://protobuf.dev/overview/)