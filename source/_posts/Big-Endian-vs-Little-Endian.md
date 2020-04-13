---
title: Big Endian vs Little Endian
date: 2018-04-30 10:51:30
tags: [Swift, Objective-C, iOS]
---
![](/Post-Resources/Endian/cover.png "Endian cover")
In computer science, a bit is the smallest piece of information. It represents a digit of the binary numeral system. A string of 8 bits called a byte. There are two ways to store a string of data in computers: Big Endian and Little Endian. If your tasks are working with data in a piece of bytes, you ought to know how to deal with bytes in these two formats. In this post, I will explain how data is stored in computers, what are the main differences between these two, then provide some useful code to work with bytes in Swift and Objective-C.
<!-- more --> 
## Basic concepts
To understand Big Endian and Little Endian, you need to know what the *Least Significant Byte (LSB)* and the *Most Significant Byte (MSB)* are. The LSB is the right-most bit in a string, it is called that because it has the least effect on the value of the binary number. In contrast, the left-most byte is the MSB that carries the greatest numerical value.
After understanding these two, it is easy to distinguish between Big Endian and Little Endian:
- In Big Endian, the MSB of the data is placed at the byte with the lowest address.
- In Little Endian, the LSB of the data is placed at the byte with the lowest address.

That's all!
![](/Post-Resources/Endian/Endian-Overview.png "Endian overview")
<center></center>

## The advantages of Big Endian and Little Endian in a computer architecture
According to [Wiki](https://en.wikipedia.org/wiki/Endianness), Big endian is "the most common format in data networking", many network protocols like TCP, UPD, IPv4 and IPv6 are using Big endian order to transmit data. Little endian is mainly using on microprocessors. But the point is why do they do that?
Well, when working with byte order on iOS, I also ask the question to myself and my colleagues, "why do they do that?", "Why do they choose Big Endian instead of Little Endian?". After researching on the internet, and getting answers from a senior firmware engineer in my office, I gradually understand the up-side of these both order ways. 
The advantages of Little Endian are:
- It's easy to read the value in a variety of type sizes. For example, the variable `A = 0x13` in 64-bit value in memory at the address B will be `1300 0000 0000 0000`. A will always be read as `19` regardless of using 8, 16, 32, 64-bit reads. By contrast, in Big Endian we have to know in which size we have written the value to read it correctly.
- It's easy to cast the value to a smaller type like from int16_t to int8_t since int8_t is the byte at the beginning of int16_t.
- Easily to do mathematical computations "because of the 1:1 relationship between address offset and byte number (offset 0 is byte 0), multiple precision math routines are correspondingly easy to write."

Some main advantages of Big Endian are 
- We can always test whether the number is positive or negative by looking at the byte at offset zero, so it's easy to do a comparison. 
- The numbers are also stored in the order in which they are printed out, so binary to decimal routines are particularly efficient.


## Byte order on iOS

Both Swift and Objective-C support methods that help us read and write data in the two ways Litte Endian and Big Endian. The following sections demonstrate how we use these methods to interact with data on memory.

### Byte order in Objective-C

```obj-c
NSString *strData = @"001E653A";
NSData *data = [NSData dataWithHexString:strData];
uint8_t *bytes = (uint8_t *)data.bytes;

/* Functions for loading little endian to host endianess. */
uint16_t firstInLittle = OSReadLittleInt16(bytes, 0); // 0x1E00 = 7680
uint16_t secondInLittle = OSReadLittleInt16(bytes, 2); // 0x3A65 = 14949

uint16_t firstInBig = OSReadBigInt16(bytes, 0); // 0x001E = 30
uint16_t secondInBig = OSReadBigInt16(bytes, 2); // 0x653A = 25914 

/* Functions for storing host endianess to little endian. */
uint8_t byte16[2];
OSWriteLittleInt16(byte16, 0, firstInLittle); // byte16 = [0x00, 0x1E]
```

### Byte order in Swift

```swift
let strData = "3A651E00"
if let data = strData.hexadecimal() {
    let bytesArr = [UInt8](data)

    /* Functions for loading native endian values. */
    let little = _OSReadInt16(bytesArr, 0) // 0x653A = 25914
    let big = first.bigEndian // 0x3A65 = 14949
    
    /* Functions for storing native endian values. */
    let bytes = [UInt8](repeating: 0, count: 2) 
    _OSWriteInt16(UnsafeMutableRawPointer(mutating:bytes), 0, second) // bytes = [0x65, 0x3A]
}
```

## Final thoughts
In this post, I showed you how differences between endianness formats and provided some useful code to work with bytes in iOS. If you have any suggestions, just let me know.
Happy weekend.
