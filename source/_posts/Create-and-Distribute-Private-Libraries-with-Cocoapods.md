---
title: Create and Distribute Private Libraries with Cocoapods
date: 2017-09-25 11:38:40
tags: iOS
---

![](/Post-Resources/PrivatePod/PrivatePod.png "")
[CocoaPods](https://cocoapods.org/) is a dependency manager for Swift and Objective-C projects. This tool not only allows us to easily integrate those dependencies but also allows us to create our own libraries. In this post I'm going to guide you how to create a private library and distribute it to your private team without publishing the library.
<!-- more --> 
# Init repositories
Go to [Github](https://github.com/) or [Bitbutket](https://bitbucket.org/), then create two repositories. One for our source code that is shared between our team, the other one for Podspec, which defines all the information about that Pod.

![](/Post-Resources/PrivatePod/InitGit-Source.png "")
<center>Image 1. Create Github repo to store our source code</center>

![](/Post-Resources/PrivatePod/InitGit-Spec.png "")
<center>Image 2. Create Github repo to store our Podspec files</center>

Following the instructions on Github page, it guides you how to add your project to these repositories.

```bash
$ echo "# MyAwesomeKit-Spec" >> README.md
$ git init
$ git add README.md
$ git commit -m "first commit"
$ git remote add origin git@github.com:uynguyen/MyAwesomeKit-Spec.git
$ git push -u origin master
```

# Create our own library
Open XCode and create a new Cocoa Touch Framework named `MyAwesomeKit`. After that, create a simple class called `HaHaHaManager`, this class defines our public methods for clients. To make it easier, I define a simple method, which takes 2 numbers as arguments then return their addition:

```obj-c
public class HaHaHaManager {
    public init() { }
    public func awesomeFunction(a: Int, b: Int) -> Int {
        return a + b
    }
}
```

*Note: Since we are creating a public Framework, we have to overide the default constructor of the `HaHaHaManager` class, make it become public. Otherwise, our clients who use this Framework can not create an instance of this class because the default scope of classes in Swift is internal.*

After then, push our code to the repository that we created at the first step. Make sure you add a tag as a version for this commit.

```bash
$ git add .
$ git commit -m "Our first commit"
$ git tag MyAwesomeKit_1.0.0
$ git push -u origin master --tags
```

# Add your Private Repository to your CocoaPods Installation
Use the following command to create your new private repository to your CocoaPods
```bash
$ pod repo add REPO_NAME SOURCE_URL
```

```bash
$ pod repo add MyAwesomeKit https://github.com/uynguyen/MyAwesomeKit
```

Make sure you have the correct access rights to the repository. You can config ssh to access the repo via ssh key. See also: [Generating a new SSH key and adding it to the ssh-agent](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)
To check if your installation is successful, use the following commands:
```bash
$ cd ~/.cocoapods/repos/MyAwesomeKit
$ pod spec lint . --allow-warnings
```
This command is used to validate specifications. `--allow-warnings` flag indicates that we skip all warnings when validate the Pod file. (Missing some options such as lisence, author or description).

# Generate our Podspec file

Type the command to generate our Podspec file. This file contains all information about our code, including git repository, the version of the library, dependencies, etc.

```bash
$ pod spec create MyAwesomeKit
```

You will see something like this

```bash
Pod::Spec.new do |s|
  s.name             	= "MyAwesomeKit"
  s.version          	= "1.0.0"
  s.summary          	= "An awesome KIT can do anything for you"
  s.homepage         	= "https://github.com/uynguyen/MyAwesomeKit"
  s.author           	= { "Uy Nguyen" => "uynguyen.itus@gmail.com" }
  s.source           	= { :git => "git@github.com:uynguyen/MyAwesomeKit.git", :tag => "MyAwesomeKit_#{s.version}" }
  s.platform     		= :ios, '8.0'
  s.requires_arc 		= true
  s.dependency 'AFNetworking', '~> 3.1.0' [1]
  s.source_files 		= "MyAwesomeKit/**/*.{swift}" [2]
  s.frameworks 			= 'UIKit', 'CoreText' [3]
  s.library 			= 'z', 'c++'
  s.module_name 		= 'MyAwesomeKit'
end
```

Here’s what’s going on:
* 1: Your other Podspecs depenencies. For more than one dependency, add new line to define it.
* 2: The source files that will be included. (Replace it by .m, .mm, .c or .cpp if you need)
* 3: The framewords that are linked with your library.

For other options, please refer to [Podspec Syntax Reference](https://guides.cocoapods.org/syntax/podspec.html)


Push to Spec Repo 

```bash
$ pod repo push MyAwesomeKit MyAwesomeKit.podspec  --allow-warnings
```

The structure of your folder will be like

```bash
.
├── MyAwesomeKit-Spec
    └── MyAwesomeKit
        └── 1.0.0
            └── MyAwesomeKit.podspec
```

Whenever you update the library, you have to run the update command to update your Pod repos
```bash
$ pod repo update
```

# Use our awesome Kit

It's time to use our powerful Kit. Open XCode and create new project named `MyAwesomeApp`. After that, type the below command to init the Pod file
```bash
$ Pod init
```
Open the Pod file, add the following code to install our library.

```bash
# Uncomment the next line to define a global platform for your project
source 'git@github.com:uynguyen/MyAwesomeKit-Spec.git'
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, :deployment_target => '8.0'
target 'MyAwesomeApp' do
  # Comment the next line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!
  pod 'MyAwesomeKit', '1.0.0'
  # Pods for MyAwesomeApp
  target 'MyAwesomeAppTests' do
    inherit! :search_paths
    # Pods for testing
  end
  target 'MyAwesomeAppUITests' do
    inherit! :search_paths
    # Pods for testing
  end
end
```
Let see our results (Pray and hope to it works well) 
![](/Post-Resources/PrivatePod/Result.png "")

# Conclusion
We have just published our first private Pod to our team. From now on, our team can use this library privately. Moreover, it's easy to update and distribute the library when it gets upgrade. Thanks to CocoaPod!
If you have any questions or comments about the post, feel free to kick an email to me.
# References

[1] [Private Pods](https://guides.cocoapods.org/making/private-cocoapods.html)

