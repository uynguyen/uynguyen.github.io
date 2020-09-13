---
title: 'Best practice: Advanced BLE scanning process on iOS'
date: 2020-08-23 09:51:43
tags: [iOS, BLE]
---

![](/Post-Resources/ScanningInBG/cover.png "Banner")

iOS developers are building applications that play both roles Peripheral and Central to exchange data with other copies apps. The data can be exchange a small of information via BLE packets or the signal strength indicator (RSSI) value from one to the others. However, keeping the app last forever in the foreground is impossible. Sooner or later, the app will enter to background mode by the user and finally will be suspended by the system depending on RAM available, power consumption and other factors. Thus, understanding the procedure of advertising and scanning on iOS devices helps you to build good applications that fit your expectations.
At the end of this tutorial, we will build a simple application that acts as both a scanner and an advertiser. When two applications find each other, they will write a log record for analysis. Depending on the results, we will find out how effective our application is using Core Bluetooth.
Let’s switch the gear!

<!-- more -->

It's coming!