---
title: 'Advanced iOS Concurrency: Operations [1]'
date: 2020-05-16 20:54:36
tags: [iOS, Concurrency, Operations]
---

![](/Post-Resources/Operations/operations.png "Operations")
There are two techniques to deal with Concurrency in iOS: GCD - Grand Central Dispatch and Operations. Most of the time, GCD provides most of the concurrency capabilities you need. Yet, sometimes you’ll want some extra advanced customizations. It’s time to use Operations. This tutorial will introduce Operations in Swift, also explain when and why we use Operation instead of GCD.
Let’s switch the gears!
> There is a big gap between knowing the path and walking the path.
<!-- more --> 
## Introduce Operations
Operation is a class allowing you to submit a block of code that should be run on a different thread, it is built on top of GCD. Basically, both GCD and operation roles are similar. However, operations have other benefits that give us more control over the task.
- **OOP design**: as the operation is a Swift class, you can subclass it and override its methods if need. It will be easy to use and re-use in the future.
- **State management**: An Operation has its own state machine that is changed during its lifecycle. The operation itself handles the changes of its states. We can not modify these states of an object.
- **Dependency among operations**: If you want to start a task after other tasks have finished executing, then the operation should be your choice. An operation will not start executing until all of the operations that it depends on have successfully finished their jobs.
- **Cancel the submitted task**: By using operations, we have the capability of canceling a running operation. It's very useful in a case where we want to stop operations that are irrelevant at a certain time. For example, to cancel downloading data when the user scrolls the table making some cells disappear.

Dependency and the capability of canceling making operations much more controllable over GCD.

## Take to practice
Let's assume that we're building an application that will fetch some posts of mine. After downloading the cover images, they will be applied a simple filter, then displayed in a table view.
Go ahead and create a project. The project simply contains only one main screen with a table view that displays posts with a title and a cover image. To simplify the source of data, I created a JSON file that contains 100 rows describing a post with key as title and value as the url linked to the cover image.
```js
[
    // input.json
    {"Building your personal page with Hexo": "https://uynguyen.github.io/Post-Resources/Hexo/Cover.png"},
    {"Beta Test and TestFlight": "https://uynguyen.github.io/Post-Resources/TestFlight/Cover.png"},
    {"iOS: Mix and Match": "https://uynguyen.github.io/Post-Resources/MixMatch/mix-match-banner.png"},
    {"Best practice: Core Data Concurrency": "https://uynguyen.github.io/Post-Resources/CoreDataConcurrency/banner.png"},
    {"Two weeks at Fossil Group in the US": "https://uynguyen.github.io/Post-Resources/Fossil_Group/Fossil_Group.jpg"},
    ...
]
```

Inside the MainViewController, let's read the input file
```swift
class ViewController: UIViewController {
    @IBOutlet weak var tbPosts: UITableView!

    var urls = [(title: String, url: String)]()

    override func viewDidLoad() {
        super.viewDidLoad()
        self.setup()
        // ...
    }

    func setup() {
        let inputUrl = Bundle.main.url(forResource: "input", withExtension: "json")!
        do {
            let data = try Data(contentsOf: inputUrl)
            if let jsonDict = try JSONSerialization.jsonObject(with: data) as? [[String: String]] {
                self.urls = jsonDict.map { ($0.first!.key, $0.first!.value) }
            }
        } catch {
            
        }
    }
```

By using a simple function of CoreImage, the `grayScale(input:)` method will transform a UIImage to a black-white image with the Tonal filter
```swift
func grayScale(input: UIImage) -> UIImage? {
    let context = CIContext(options: nil)
    var inputImage = CIImage(image: input)
    
    let filters = inputImage!.autoAdjustmentFilters()

    for filter: CIFilter in filters {
        filter.setValue(inputImage, forKey: kCIInputImageKey)
        inputImage =  filter.outputImage
    }
    
    let cgImage = context.createCGImage(inputImage!, from: inputImage!.extent)
    let currentFilter = CIFilter(name: "CIPhotoEffectTonal")
    currentFilter!.setValue(CIImage(image: UIImage(cgImage: cgImage!)), forKey: kCIInputImageKey)

    let output = currentFilter!.outputImage
    let cgimg = context.createCGImage(output!, from: output!.extent)
    return UIImage(cgImage: cgimg!)
}
```

It's time to set up the table view, we use URLSession to download the image from the input url, then display to the cell after downloading successfully. 
```swift
extension ViewController: UITableViewDataSource {
    // The rest omitted
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "CellId", for: indexPath) as! PostTableViewCell
        let input = urls[indexPath.row]

        URLSession.shared.dataTask(with: URL(string: input.url)!, completionHandler: { (data, res, error) in
            guard error == nil,
                let data = data,
                let image = UIImage(data: data) else { return }
            
            DispatchQueue.main.async {
                cell.lblPostTitle.text = input.title
                cell.imgPostImage.image = self.grayScale(input: image)
            }
        }).resume()
        
        return cell
    }
}
```
Build and run the project, you should see the images appear on the list. Let's try to scroll the table. Can you feel laggy?
You might notice where the issue comes from. To set up a cell, we first download the image from the internet, then apply a Tonal filter to the image. These two actions are performing in the main thread, putting too much pressure on the thread that should only use for user interaction.

<div style="text-align:center">

![](/Post-Resources/Operations/lagy.gif "Lagy")

</div>

## Using GCD
We can dispatch the code of downloading and filtering image to another separated queue
```swift
DispatchQueue.global(qos: .background).async {
    URLSession.shared.dataTask(with: URL(string: input.url)!, completionHandler: { (data, res, error) in
        guard error == nil,
            let data = data,
            let image = UIImage(data: data) else { return }

        let filteredImage = self.grayScale(input: image)
        DispatchQueue.main.async {
            cell.lblPostTitle.text = input.title
            cell.imgPostImage.image = filteredImage
        }
    }).resume()
}
```

By executing the code on a background queue, we offload work to the main queue and make the UI much more responsive.
Rebuild the project, you will see the differences.
Even we resolve the issue of user interaction, the performance of the app is still not optimized.
What can be done to make this better?
As the user scrolls the table, cells come and gone. There's no sense in continuing to download and process an image of an invisible cell. It's better to cancel the block of code to improve the performance and reduce the battery consumption of the app. But how we can cancel a task that is running in GCD?
Here is the Operation come to.

## Switch gear to Operation
Let's break the task to set up a table view cell into two tasks: one is to download the image and another is to apply the filter.
```swift
class DownloadImageOperation: Operation {
    let url: URL
    var outputImage: UIImage?

    init(url: URL) {
        self.url = url
    }

    override func main() {
        guard !isCancelled else { return }
        
        URLSession.shared.dataTask(with: self.url, completionHandler: { (data, res, error) in
            guard error == nil,
                let data = data else { return }

            self.outputImage = UIImage(data: data)
        }).resume()
    }
}
```

```swift
class ImageFilterOperation: Operation {
    let context = CIContext(options: nil)
    var processedImage: UIImage?
    
    func grayScale(input: UIImage) -> UIImage? {
        var inputImage = CIImage(image: input)
        
        let filters = inputImage!.autoAdjustmentFilters()

        for filter: CIFilter in filters {
            filter.setValue(inputImage, forKey: kCIInputImageKey)
            inputImage =  filter.outputImage
        }
        
        let cgImage = context.createCGImage(inputImage!, from: inputImage!.extent)
        let currentFilter = CIFilter(name: "CIPhotoEffectTonal")
        currentFilter!.setValue(CIImage(image: UIImage(cgImage: cgImage!)), forKey: kCIInputImageKey)

        let output = currentFilter!.outputImage
        let cgimg = context.createCGImage(output!, from: output!.extent)
        return UIImage(cgImage: cgimg!)
    }
    
    override func main() {
        guard !isCancelled else { return }
        
        let dependencyImage = self.dependencies
            .compactMap { $0 as? DownloadImageOperation }
            .first
        
        if let image = dependencyImage?.outputImage {
            guard !isCancelled else { return }
            self.processedImage = self.grayScale(input: image)
        }
    }
}
```

To use Operation, we simply subclass the Operation class and override the `main` method where our task is placed. By default, operations run in the background, so there are no worries about blocking the main thread.
Back to the task to set up the table view cell, you might notice that there is a dependency between these two tasks, we only do the filter process after downloading the image. In other words, the `ImageFilterOperation` operation depends on the `DownloadImageOperation` operation.  Operation Dependencies is one of the "killer functions" of Operation along with the capability of canceling a running operation. By linking the two operations, we ensure that the dependent operation does not begin before the prerequisite operation has completed. Additionally, the linking makes a clean way to pass data from the first one to the second one. 
 
```swift
e.g
let dependencyImage = self.dependencies
    .compactMap { $0 as? DownloadImageOperation }
    .first
```

It's time to do the improvement.
Let's first define an `OperationQueue` to the ViewController. The `OperationQueue` class is what we use to manage Operations. 

```swift
class ViewController: UIViewController {
    private let queue = OperationQueue()
    // The rest omiited
    // ...
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "CellId", for: indexPath) as! PostTableViewCell
        let input = urls[indexPath.row]
        let downloadOpt = DownloadImageOperation(url: URL(string: input.url)!)
        let grayScaleOpt = ImageFilterOperation()

        grayScaleOpt.addDependency(downloadOpt)
        grayScaleOpt.completionBlock = {
            DispatchQueue.main.async {
                cell.lblPostTitle.text = input.title
                cell.imgPostImage.contentMode = .scaleToFill
                cell.imgPostImage.image = grayScaleOpt.processedImage
            }
        }
        self.queue.addOperation(downloadOpt)
        self.queue.addOperation(grayScaleOpt)

        return cell
    }
}
```
Here, we init two new instances of the `DownloadImageOperation` and the `ImageFilterOperation` classes. Then, we set `grayScaleOpt` operation depend to `downloadOpt` that will make sure the `grayScaleOpt` only be executed after the `downloadOpt` has completed. Finally, we add these two operations to the `OperationQueue`. Once an operation is added to the queue, the operation will be scheduled. If the queue finds an available thread on which to run the operation, the job will be executed until it has completed or been canceled. When the operation completes, the `completionBlock` is called.

> "Operations have important effects on your application’s performance. For instance, if you want to download a lot of content from the Internet, you might want to do so only when it is absolutely necessary. Also, you might decide to ensure that only a specific number of operations can run at the same time. If you do decide to limit the number of concurrent operations in a queue, you can change the maxConcurrentOperationCount property of your operation queue. This is an integer property that allows you to specify how many operations, at most, can run in a queue at a given time." (iOS 8 Swift Programming Cookbook)

Learning the above theories is enough, let's start practicing. Let re-build the project to see the result.

![](/Post-Resources/Operations/EmptyList.jpeg "EmptyList")

Ops! Nothing appears, the image is not downloaded! Something went wrong ???
In the next tutorial, we will find out what happened to our code and why the Operation did not work properly as expected.
Thank you for reading.