---
title: Beta Test and TestFlight
date: 2020-04-14 21:25:25
tags:
---
![](/Post-Resources/TestFlight/Cover.png "TestFlight")
As an iOS developer, you might have heard about TestFlight - a product of Apple that allows you to distribute your apps to beta users.
In this tutorial, we will walk through steps uploading a build to TestFlight, and invite users to test your app.
Let's have fun!
<!-- more --> 
You also need to refer the post (Shipping your app to Store)[]
Note: You need a Paid Developer Account to submit your apps to Store.

TestFlight has two types of testers:
- Internal Tester: "Add up to 25 members of your team who have been assigned the Admin, Technical, App Manager, Developer, or Marketer role to test your app. Each member can test on up to 30 devices. Internal testers can access all of your beta builds available for testing."
- External Tester: You can invite up to 10,000 testers using just their email address or by sharing a public link.

To let External Tester test your app, you must submit your app to Apple for review. The process is the same as App Store submission but it's usually go faster than normal app reviews. By contract, 

### TestFlight App
<div style="text-align:center">
<img src="/Post-Resources/TestFlight/TestFlight.jpeg"/>
</div>

From now on, whenever a new version of this app is available, you’ll see a notification from TestFlight. All you need to do is update your app and run the latest version.

Testers running TestFlight for iOS, version 2.3 and later and iOS 13, can send feedback through the TestFlight app or directly from your beta app by taking a screenshot. You can view this tester feedback in the Feedback section in App Store Connect. Testers running tvOS or earlier versions of iOS can send feedback to the email address you specified in Step 1.

When you are done testing, you can optionally expire a build to stop testing it, and then go to Overview of publishing an app for the process of submitting your app to the App Store. If you don’t expire your build and submit it to the App Store, testers that have received an invite to test will still be able to test your build even after it goes live on the App Store. Your build will become unavailable in TestFlight after 90 days.

https://developer.apple.com/testflight/

https://help.apple.com/app-store-connect/#/devdc42b26b8

Happy coding!