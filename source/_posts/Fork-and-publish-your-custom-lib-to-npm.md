---
title: Fork and publish your custom lib to npm - React Native Wheel Picker
date: 2022-03-26 10:00:26
tags:
---

![](/Post-Resources/npm/cover.png "")


When developing a new feature of our software, we tend to search if there is a "similar" library or framework available in the community to reuse it. No one like to reinvent the wheel, dont you? 😉 However, the lib that most fits our requirement sometimes does not support a feature you need or just a custom property. You can open a pull request to the original repo, but it might take time and depend on the author whether he approves your changes or not. In that case, you can create your own library from the original one, we named it "Fork" process. 
In this post, I will shortly summarize steps to publish a library to `npm`, and tell you about a story that I faced when using `React Native Wheel Picker library`.

<!-- more -->

It's quite simple to publish a lib to `npm`. Just need to do the following steps:
1. Make sure you have a `npm` account. Go to `https://www.npmjs.com` to sign up for an account if you don't have one.
2. Next, sign in to your account on your computer via the command line `npm login`.
![](/Post-Resources/npm/signin.png "")
3. To check which user is signed in, use `npm whoami`.
4. [The lib](https://www.npmjs.com/package/@gregfrench/react-native-wheel-picker) I use for my project support a `Wheel Picker` component, but it has been deprecated, and it does not support setting the color of the selected item on Android. Besides, I want to create my own lib so that I can easily add more features later. So I decided to fork and custom my own wheel picker. To fork a lib, go to the repo of the lib you want to modify, then press the `fork` button on the top right corner.
![](/Post-Resources/npm/fork.png "")

5. After forking successfully, you should see the repo from on your dashboard. Next, clone the code to your computer, and add your new features.
In my case, I need to add a new feature that supports setting the color for the selected item (Refer to [this PR](https://github.com/GregFrench/react-native-wheel-picker/pull/7/commits/b8bf478f3e4ffb7fb5be4e2f524e730678775e50))
![](/Post-Resources/npm/fork-repo.png "")

6. When finishing your modification, commit your changes.
7. Update the repo info at the `package.json` file if needed (Author, version, description, etc.).
8. Finally, run `npm publish --access public` to deliver your awesome lib.
![](/Post-Resources/npm/publish.png "")

It's time to check the new lib. If you install the new lib `@uynguyen505/react-native-wheel-picker` and try to use it, you should see the result as below.

![](/Post-Resources/npm/result.png "")

Happy weekend!

## Refs
1. [Creating and publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
2. [Forking, Modifying, and Publishing NPM Packages — For those almost-perfect packages](https://brandontle.com/writing/forking-modifying-and-publishing-npm-packages/)