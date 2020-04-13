---
title: Asynchronous Programming in Swift
date: 2018-01-16 21:32:45
tags: [Swift, iOS]
---
![](/Post-Resources/PromiseKIT/PromiseKIT.png "")
<center>Promise Kit, one of the best frameworks to deal with asynchronous programming in Swift</center>

In this post, I will use these following third parties to complete the project:
* [Alamofire](https://github.com/Alamofire/Alamofire): A HTTP networking framework in Swift.
* [SwiftyJSON](https://github.com/SwiftyJSON/SwiftyJSON): To process JSON data.
* [SwiftGifOrigin](https://github.com/bahlo/SwiftGif): An UIImage extension to display Gif files.
* [Bolts-Swift](https://github.com/BoltsFramework/Bolts-Swift): Was designed by Parse and Facebook, I use it to create asynchronous methods.
* [PromiseKit](https://github.com/mxcl/PromiseKit): A framework helps us to simplify asynchronous programming.<br />
* [Giphy's APIs](https://giphy.com) for searching and downloading gif images.
<!-- more --> 
## Getting Started

Asynchronous methods, (Async for short), are the methods that not immediately returning results like most method, the async methods take some time to produce results. 
I often use callbacks to deal with asynchronous methods like scanning Bluetooth devices or retrieving some resources from the internet. In fact, callback is a bad programming technique. Callback will make our code hard to read, hard to debug and take much more time to maintain later. In the end, our code will turn into something that we call the callback hell.
In this post, I will create a project using one by one technique to explain why I said callback is bad.
Firstly, go ahead and create a project, named it as whatever you like, then install these Pod frameworks to your project. You also need to edit the `NSAllowsArbitraryLoads` key to `YES` in `NSAppTransportSecurity` dictionary in the info.plist file to specify which domains are excepted from the rules you define for App Transport Security. In our case, this is the giphy domain.

Allow HTTP requests for only giphy domain
```bash
<key>NSAppTransportSecurity</key>
    <dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.giphy.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

Or allow HTTP requests for all domains, it is not a good idea.
```bash
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

Let's create a class named `ImageLoader`. This class contains two methods that help us to fetch and download gif images from the Giphy server.
```swift
//
//  ImageLoader.swift
//

class ImageLoader {
    func fetchImage(keyword: String) {
        // Searching images that matched keyword on Giphy server
    }
    func downloadImage(url: URL) {
        // Download the image at url   
    }
}
```

## The first version: Using callback

Firstly, we need to define two callbacks, which will be passed to the `fetchImage` and `downloadImage` methods.

```swift
public typealias FetchImageBlock = (URL?, Error?) -> Void
public typealias DownloadImageBlock = (URL?, Error?) -> Void
```

Then, we implement these two methods:
- `fetchImage` takes a keyword and a callback as params, sends a request to the Giphy server to query all images that match the keyword, gets the first one and finally returns the download url via the callback.
- `downloadImage` takes an url and a callback as params, then uses the `Alamofire` framework to download the image. Finally, returning the destination url, where the image is saved, via the callback.

```swift
func fetchImage(keyword: String, callback: @escaping FetchImageBlock) {
    let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
    let headers: HTTPHeaders = [
        "Content-Type": "application/json"
    ]
    Alamofire.request(endPoint, headers: headers).responseData { (response) in
        if let error = response.error {
            return callback(nil, error)
        }
        let jsonData = JSON.init(data: response.data!)
        let dataArray = jsonData["data"].array
        if let dataArray = dataArray, dataArray.count > 0 {
            let imagesList = dataArray[0]["images"]
            let downsized_large = imagesList["downsized_large"]["url"].stringValue
            return callback(URL.init(string: downsized_large), nil)
        }
        else {
            return callback(nil, nil)
        }
    }
}
```

```swift
func downloadImage(url: URL, callback: @escaping DownloadImageBlock) {
    let destination: DownloadRequest.DownloadFileDestination = { _, _ in
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
        return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
    }
    Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
        print("\(progress)")
    }).responseData(completionHandler: { (response) in
        if let error = response.error {
            return callback(nil, error)
        }
        callback(response.destinationURL, nil)
    })
}
```

Inside the main view controller, let's define a method called `searchImageWithKeyword`. This method takes a keyword as a param, then pass the param to the `fetchImage` method of an instance of the `ImageLoader` class. We also need to pass a callback to handle the results.
Inside the `fetchImage` callback, let's check if there are any errors. If it is, then we stop calling the next method, `downloadImage`. Otherwise, we call the `downloadImage` of the `imageLoader` object. Then pass the url and a callback as params.
Inside the `downloadImage` callback, let's check if there are any errors. If it is, then we stop calling the next one. Otherwise, we update the image view on the main view by calling the `updateImageAtURL` method.

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    imageLoader.fetchImage(keyword: keyword, callback: {downloadLink, error in
        if let error = error {
            print("Error \(error)")
        }
        else {
            if let downloadLink = downloadLink {
                imageLoader.downloadImage(url: downloadLink, callback: {downloadedURL, error in
                    if let error = error {
                        print("Error \(error)")
                    }
                    else {
                        if let downloadedURL = downloadedURL {
                            self.updateImageAtURL(url: downloadedURL)
                        }
                        else {
                            print("Error: downloadedURL is nil")
                        }
                    }
                })
            }
            else {
                print("Error: downloadLink is nil")
            }
        }
    })
}
```
   
```swift 
func updateImageAtURL(url: URL) {
    guard Thread.isMainThread else {
        DispatchQueue.main.async {
            self.updateImageAtURL(url: url)
        }
        return
    }
    do {
        let data = try Data.init(contentsOf: url)
        self.imgImage.image = UIImage.gif(data: data)
    }
    catch {
        print("Error \(error)")
    }
}
```

As you can see, the `searchImageWithKeyword` is quite complex with many `if` and `else` statements inside the method. We have to check errors in many lines of codes. Imagine how complex it would be if we had more than three methods inside itself? 

![](/Post-Resources/PromiseKIT/CallbackHell.png "")
<center>A callback hell in another language, Javascript</center>

Build and run the project. Enter a keyword you want to search on the Giphy server, press search button then you will see the first result.
<img src="/Post-Resources/PromiseKIT/PromiseKitDemo.gif" width="300">
<center>The async programming project</center>

## A better solution: Using Bolts
Bolts is a framework that was designed by Parse and Facebook, I use it to create asynchronous methods, without using callback. Bolts framework lets we write code as a series of actions based on events.

```swift
func fetchImage(keyword: String) -> Task<URL>! {
    let mainTask = TaskCompletionSource<URL>()
    let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
    let headers: HTTPHeaders = [
        "Content-Type": "application/json"
    ]
    Alamofire.request(endPoint, headers: headers).responseData { (response) in
        if let error = response.error {
            return mainTask.set(error: error)
        }
        
        let jsonData = JSON.init(data: response.data!)
        let dataArray = jsonData["data"].array
        if let dataArray = dataArray, dataArray.count > 0 {
            let imagesList = dataArray[0]["images"]
            let fixed_height_still = imagesList["downsized_large"]["url"].stringValue
            return mainTask.set(result: URL.init(string: fixed_height_still)!)
        }
        else {
            return mainTask.set(error: NSError.init(domain: "myDomain", code: 0, userInfo: nil))
        }
    }
    return mainTask.task
}
```

```swift    
func downloadImage(url: URL) -> Task<URL>! {
    let mainTask = TaskCompletionSource<URL>()
    let destination: DownloadRequest.DownloadFileDestination = { _, _ in
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
        return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
    }

    Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
        print("\(progress)")
    }).responseData(completionHandler: { (response) in
        if let error = response.error {
            return mainTask.set(error: error)
        }
        if let destinationURL = response.destinationURL {
            return mainTask.set(result: destinationURL)
        }
        else {
            return mainTask.set(error: NSError.init(domain: "myDomain", code: 0, userInfo: nil))
        }
    })
    return mainTask.task
}
```

Let's see how simple the `searchImageWithKeyword` would be by using Bolts.

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    imageLoader.fetchImage(keyword: keyword).continueOnSuccessWith { (linkDownload) -> Void in
        imageLoader.downloadImage(url: linkDownload).continueOnSuccessWith(continuation: { (downloadedURL) -> Void in
            self.updateImageAtURL(url: downloadedURL)
        })
    }.continueOnErrorWith { (error) in
        print("Error \(error)")
    }
}
```

Build and run the project, nothing changed. But the code is more readable than the first one, isn't it? We gather all the errors in one place, also separate error handling and success code. 

## A much better solution: Using PromiseKit
One thing I do not like about Bolts framework is the lack of documentation and example projects. When I first use Bolts framework, I was very hard to get used to with the APIs of the Task object.
At the [Swift Summit conference 2017](https://uynguyen.github.io/2017/11/29/Swift-Summit-conference-in-San-Francisco-2017/), there was one speaker introduced a Framework to deal with async methods, PromiseKit. After the conference, I replaced the code using Bolts framework by PromiseKit at the projects in my company. I realize my code now more readable. I think PromiseKit's writing will be more familiar to developers than Bolts's writing, especially those who have worked with Javascript like me. 
An async method created by using PromiseKit returns a new generic Promise, which is the primary class provided by PromiseKit. Its constructor takes a simple execution block with two parameters:
* fulfill: A function to call when the desired value is ready to fulfill the promise.
* reject: A function to call if there is an error.

Let's apply PromiseKit to our project

```swift
    func fetchImage(keyword: String) -> Promise<URL>  {
        return Promise { fullfil, reject in
            let endPoint = "http://api.giphy.com/v1/gifs/search?q=\(keyword)&limit=1&api_key=q4N1oD5jw3xvH2hIOkFAyHXWTTrh0D30"
            let headers: HTTPHeaders = [
                "Content-Type": "application/json"
            ]
            Alamofire.request(endPoint, headers: headers).responseData { (response) in
                if let error = response.error {
                    return reject(error)
                }
                
                let jsonData = JSON.init(data: response.data!)
                let dataArray = jsonData["data"].array
                if let dataArray = dataArray, dataArray.count > 0 {
                    let imagesList = dataArray[0]["images"]
                    let fixed_height_still = imagesList["downsized_large"]["url"].stringValue
                    return fullfil(URL.init(string: fixed_height_still)!)
                }
                return reject(NSError.init(domain: "myDomain", code: 0, userInfo: nil))
            }
        }
    }
```

```swift
    func downloadImage(url: URL) -> Promise<URL> {
        return Promise { fullfil, reject in
            let destination: DownloadRequest.DownloadFileDestination = { _, _ in
                let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let fileURL = documentsURL.appendingPathComponent(url.lastPathComponent)
                return (fileURL, [.removePreviousFile, .createIntermediateDirectories])
            }
            
            Alamofire.download(url, to: destination).downloadProgress(closure: { (progress) in
                print("\(progress)")
            }).responseData(completionHandler: { (response) in
                if let error = response.error {
                    return reject(error)
                }
                
                if let destinationURL = response.destinationURL {
                    return fullfil(destinationURL)
                }
                reject(NSError.init(domain: "myDomain", code: 0, userInfo: nil))
            })
        }
    }
```

And the final result, what a beautiful code! :))

```swift
func searchImageWithKeyword(keyword: String) {
    let imageLoader = ImageLoader()
    firstly {
        imageLoader.fetchImage(keyword: keyword)
    }.then {  downloadLink -> Promise<URL> in
        return imageLoader.downloadImage(url: downloadLink)
    }.then {downloadedURL -> Void in
        self.updateImageAtURL(url: downloadedURL)
    }.catch { error in
        print("Error \(error)")
    }
}
```

A feature that I find very interesting in both frameworks, Bolts and PromiseKit, is that they allow our code run on a given thread (Main thread or background thread). This is a great feature as most of the work done in the view controller has been to update the UI. Sometimes, long-running tasks are best handled on a background thread, so as not to tie up the UI. For more details about this Thread feature, please refer to their documents: *#Threading*

## Conclusion
Since I am working on CoreBluetooth, I often have to work with async methods. Too many callbacks make my project more difficult to understand and difficult to debug if errors occur. `Promise` make my code become a more beautiful girl ;).
You can download the fully finished sample project [here](https://github.com/uynguyen/Asynchronous-In-Swift).
Feel free to leave out your comments on my post.