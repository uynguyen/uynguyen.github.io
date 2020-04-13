---
title: Integrate Google Drive to iOS app
date: 2019-02-15 20:00:50
tags:
---
![](/Post-Resources/GoogleDrive/GoogleDrive.png "Cover")
At Fossil, I've had the chance to experiment with Google Drive integration, as a cloud bases storage. The main advantage of using Google Drive is to share with other members easily, with a good web-based UI to modify the contents of folders, and it’s free. However, I struggled when trying to make Google Drive work due to lack of documents and articles related to Google Drive APIs, especially in Swift. Additionally, the code and examples on Google’s sites are out of date. Therefore, I decided to write this article with a hope of saving your time when you want to integrate Google Drive to your apps. Let’s get started.
<!-- more --> 
## Create your app and Google API access
In order to use Google APIs, firstly we have to go to Google Console Dashboard to create a project. So head to [Google cloud console](https://console.cloud.google.com), click the drop-down menu to create a new project.
![](/Post-Resources/GoogleDrive/Create_new_project.png "Create new project")
Your Google Drive API is disabled by default when you create new projects. To enable Google Drive API manually, click on "APIs & Services" item on the left bar side, it will lead you to another page where you can enable Google services for your apps.
Click "Enable APIs and services" button, then type to search for "Google drive", next select Google Drive from results, finally click "Enable" to activate the app.
![](/Post-Resources/GoogleDrive/GoogleDriveSearching.png "Search Google Drive")
![](/Post-Resources/GoogleDrive/EnableGoogleDrive.png "Enable Google Drive")
That's all you need to create an app using Google API.
## Add credential for your iOS app
Credentials allow your iOS to access your enabled APIs. Click to "Credentials" button on the left sidebar to add your iOS app. Next, input your app information including your app name and bundle id, please note that you need to type exactly the bundle id, otherwise it will not work. 
![](/Post-Resources/GoogleDrive/AddCredentials.png "AddCredentials")
After creating new credential successfully, you should be able to download the plist file that will contain the keys necessary for setting up your Xcode project. Keep this file in a safe place, we will use it in the next step.
```swift
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CLIENT_ID</key>
	<string>YOUR_CLIENT_ID</string>
	<key>REVERSED_CLIENT_ID</key>
	<string>YOUR_REVERSED_CLIENT_ID</string>
	<key>PLIST_VERSION</key>
	<string>1</string>
	<key>BUNDLE_ID</key>
	<string>com.example</string>
</dict>
</plist>
```
## Project configuration
[Google APIs Client Library](https://github.com/google/google-api-objectivec-client-for-rest) is a library written by Google for accessing Google APIs. Go ahead and add the following library to your Pod file.
```bash
pod 'GoogleAPIClientForREST/Drive', '~> 1.2.1'
pod 'GoogleSignIn', '~> 4.1.1'
```
You will find `YOUR_REVERSED_CLIENT_ID` and `YOUR_CLIENT_ID` in the client configuration plist file that you downloaded previously. Select your target project, go to "Info" tab, add a new item at the "URL Types" section, then input `YOUR_REVERSED_CLIENT_ID` at the "URL Schemes" box.
![](/Post-Resources/GoogleDrive/ConfigYOUR_REVERSED_CLIENT_ID.png "YOUR_REVERSED_CLIENT_ID")
In case you don't know what URL Schemes use for, every each item in the URL Schemes section allows you to define a custom URL scheme for your app.  For example, your app might let users tapping a custom URL in an email to launch your app in a specified context. By default, Apple supports common schemes associated with system apps like mail, sms, facetime, etc. For more information, please refer to [Defining a Custom URL Scheme for Your App](https://developer.apple.com/documentation/uikit/core_app/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app)
If you don't add `YOUR_REVERSED_CLIENT_ID` as a custom URL scheme, your app will get the following crash when trying to authorize with Google API. So make sure you don't miss this important step.
![](/Post-Resources/GoogleDrive/Crash-01.png "Missing Custom URL scheme")
Next, open the `AppDelegate.swift` file, add your client id to Google Sign In instance.
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    GIDSignIn.sharedInstance().clientID = "YOUR_CLIENT_ID"
    return true
}
```
Then, open your ViewController where you allow user to sign in with their Google account and implement the two delegate `GIDSignInUIDelegate` and `GIDSignInDelegate` from Google Sign in.
```swift
extension ViewController: GIDSignInDelegate {
    func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error!) {
        if let _ = error {
            
        } else {
            print("Authenticate successfully")
        }
    }
    
    func sign(_ signIn: GIDSignIn!, didDisconnectWith user: GIDGoogleUser!, withError error: Error!) {
        print("Did disconnect to user")
    }
}

extension ViewController: GIDSignInUIDelegate {}
```
Finally, assign Google sign in delegate to your view controller.
```swift
private func setupGoogleSignIn() {
    GIDSignIn.sharedInstance().delegate = self
    GIDSignIn.sharedInstance().uiDelegate = self
    GIDSignIn.sharedInstance().scopes = [kGTLRAuthScopeDrive]
    GIDSignIn.sharedInstance()?.signInSilently()
}
```
You might notice the `GIDSignIn.sharedInstance().scopes` line of code. This line of code defines which permissions the user grants for your app to access their data when authenticating. In this case, we use the `kGTLRAuthScopeDrive` scope that allows our app to view and manage all the files in the user's Google Drive, *including team drive*. The `signInSilently` method will attempt to sign in a previously authenticated user silently.

If you do all the above steps properly, you should be able to authenticate your app with Google API.
<div style="height: 450px; margin-top: -50px;"> 
<div style="float: left; width: 50%; padding: 20px;"> 
![](/Post-Resources/GoogleDrive/GoogleSignIn.png "Google Sign in")
</div>
<div style="float: left; width: 50%; padding: 20px;">  
![](/Post-Resources/GoogleDrive/GrantPermission.png "Grant permission")
</div>
</div>

## Common APIs
### Work with "My Drive"
#### Searching
```swift
public func search(_ name: String, onCompleted: @escaping (GTLRDrive_File?, Error?) -> ()) {
    let query = GTLRDriveQuery_FilesList.query()
    query.pageSize = 1
    query.q = "name contains '\(name)'"
    self.service.executeQuery(query) { (ticket, results, error) in
        onCompleted((results as? GTLRDrive_FileList)?.files?.first, error)
    }
}
```
#### Listing
```swift
 public func listFiles(_ folderID: String, onCompleted: @escaping (GTLRDrive_FileList?, Error?) -> ()) {
    let query = GTLRDriveQuery_FilesList.query()
    query.pageSize = 100
    query.q = "'\(folderID)' in parents and mimeType != 'application/vnd.google-apps.folder'"
    self.service.executeQuery(query) { (ticket, result, error) in
        onCompleted(result as? GTLRDrive_FileList, error)
    }
}
```
#### Uploading
```swift
private func upload(_ folderID: String, fileName: String, data: Data, MIMEType: String, onCompleted: ((String?, Error?) -> ())?) {
    let file = GTLRDrive_File()
    file.name = fileName
    file.parents = [folderID]
    
    let params = GTLRUploadParameters(data: data, mimeType: MIMEType)
    params.shouldUploadWithSingleRequest = true
    
    let query = GTLRDriveQuery_FilesCreate.query(withObject: file, uploadParameters: params)
    query.fields = "id"
    
    self.service.executeQuery(query, completionHandler: { (ticket, file, error) in
        onCompleted?((file as? GTLRDrive_File)?.identifier, error)
    })
}
```
#### Downloading
```swift
public func download(_ fileItem: GTLRDrive_File, onCompleted: @escaping (Data?, Error?) -> ()) {
    guard let fileID = fileItem.identifier else {
        return onCompleted(nil, nil)
    }
    
    self.service.executeQuery(GTLRDriveQuery_FilesGet.queryForMedia(withFileId: fileID)) { (ticket, file, error) in
        guard let data = (file as? GTLRDataObject)?.data else {
            return onCompleted(nil, nil)
        }
        
        onCompleted(data, nil)
    }
}
```
#### Deleting
```swift
public func delete(_ fileItem: GTLRDrive_File, onCompleted: @escaping ((Error?) -> ())) {
    guard let fileID = fileItem.identifier else {
        return onCompleted(nil)
    }
    
    self.service.executeQuery(GTLRDriveQuery_FilesDelete.query(withFileId: fileID)) { (ticket, nilFile, error) in
        onCompleted(error)
    }
}
```
### Work with "Team Drive"
The only thing we need to do in order to work with "Team Drive" is to set the `corpora` param of the query to `teamDrive`. By default, the `user` corpora is applied. That means the query only applied to the folders onwed by the user. By setting to `teamDrive`, we indicate that the query will affect to team drive of the user. We can combine multiple corpora in a single query if you need to do so.
## Final thoughts
Google Drive is an ideal storage to integrate with our applications. In this article, we covered how to config Google Drive API and how to execute common APIs. I hope you learned something today.
You can find all the source code demo on my [Github](https://github.com/uynguyen/MyGoogleDrive) 🙂
## References
[1] Google Developer https://developers.google.com/drive/api/v3/about-sdk