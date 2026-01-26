---
title: Integrar Google Drive en una app iOS
date: 2019-02-15 20:00:50
tags:
layout: post
permalink: es/posts/Integrate-Google-Drive-to-iOS-app/
lang: es
---
![](/Post-Resources/GoogleDrive/GoogleDrive.png "Cover")
En Fossil, tuve la oportunidad de experimentar con la integración de Google Drive, como almacenamiento basado en la nube. La principal ventaja de usar Google Drive es compartir con otros miembros fácilmente, con una buena interfaz web para modificar los contenidos de las carpetas, y es gratis. Sin embargo, tuve dificultades al intentar hacer funcionar Google Drive debido a la falta de documentación y artículos relacionados con las APIs de Google Drive, especialmente en Swift. Además, el código y los ejemplos en los sitios de Google están desactualizados. Por lo tanto, decidí escribir este artículo con la esperanza de ahorrarte tiempo cuando quieras integrar Google Drive a tus apps. Comencemos.
<!-- more -->
## Crear tu app y acceso a la API de Google
Para usar las APIs de Google, primero debemos ir a Google Console Dashboard para crear un proyecto. Así que dirígete a [Google cloud console](https://console.cloud.google.com), haz clic en el menú desplegable para crear un nuevo proyecto.
![](/Post-Resources/GoogleDrive/Create_new_project.png "Create new project")
Tu API de Google Drive está deshabilitada por defecto cuando creas nuevos proyectos. Para habilitar la API de Google Drive manualmente, haz clic en el elemento "APIs & Services" en la barra lateral izquierda, te llevará a otra página donde puedes habilitar los servicios de Google para tus apps.
Haz clic en el botón "Enable APIs and services", luego escribe para buscar "Google drive", después selecciona Google Drive de los resultados, finalmente haz clic en "Enable" para activar la app.
![](/Post-Resources/GoogleDrive/GoogleDriveSearching.png "Search Google Drive")
![](/Post-Resources/GoogleDrive/EnableGoogleDrive.png "Enable Google Drive")
Eso es todo lo que necesitas para crear una app usando la API de Google.
## Agregar credenciales para tu app iOS
Las credenciales permiten que tu iOS acceda a tus APIs habilitadas. Haz clic en el botón "Credentials" en la barra lateral izquierda para agregar tu app iOS. Luego, ingresa la información de tu app incluyendo el nombre de tu app y el bundle id, por favor ten en cuenta que necesitas escribir exactamente el bundle id, de lo contrario no funcionará.
![](/Post-Resources/GoogleDrive/AddCredentials.png "AddCredentials")
Después de crear las nuevas credenciales exitosamente, deberías poder descargar el archivo plist que contendrá las claves necesarias para configurar tu proyecto Xcode. Guarda este archivo en un lugar seguro, lo usaremos en el siguiente paso.
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
## Configuración del proyecto
[Google APIs Client Library](https://github.com/google/google-api-objectivec-client-for-rest) es una biblioteca escrita por Google para acceder a las APIs de Google. Adelante y agrega la siguiente biblioteca a tu archivo Pod.
```bash
pod 'GoogleAPIClientForREST/Drive', '~> 1.2.1'
pod 'GoogleSignIn', '~> 4.1.1'
```
Encontrarás `YOUR_REVERSED_CLIENT_ID` y `YOUR_CLIENT_ID` en el archivo plist de configuración del cliente que descargaste previamente. Selecciona tu proyecto objetivo, ve a la pestaña "Info", agrega un nuevo elemento en la sección "URL Types", luego ingresa `YOUR_REVERSED_CLIENT_ID` en el cuadro "URL Schemes".
![](/Post-Resources/GoogleDrive/ConfigYOUR_REVERSED_CLIENT_ID.png "YOUR_REVERSED_CLIENT_ID")
En caso de que no sepas para qué sirven los URL Schemes, cada elemento en la sección URL Schemes te permite definir un esquema de URL personalizado para tu app. Por ejemplo, tu app podría permitir a los usuarios tocar una URL personalizada en un correo electrónico para lanzar tu app en un contexto específico. Por defecto, Apple soporta esquemas comunes asociados con apps del sistema como mail, sms, facetime, etc. Para más información, por favor consulta [Defining a Custom URL Scheme for Your App](https://developer.apple.com/documentation/uikit/core_app/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app)
Si no agregas `YOUR_REVERSED_CLIENT_ID` como un esquema de URL personalizado, tu app tendrá el siguiente crash al intentar autorizar con la API de Google. Así que asegúrate de no omitir este paso importante.
![](/Post-Resources/GoogleDrive/Crash-01.png "Missing Custom URL scheme")
Luego, abre el archivo `AppDelegate.swift`, agrega tu client id a la instancia de Google Sign In.
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    GIDSignIn.sharedInstance().clientID = "YOUR_CLIENT_ID"
    return true
}
```
Después, abre tu ViewController donde permites al usuario iniciar sesión con su cuenta de Google e implementa los dos delegados `GIDSignInUIDelegate` y `GIDSignInDelegate` de Google Sign in.
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
Finalmente, asigna el delegado de Google sign in a tu view controller.
```swift
private func setupGoogleSignIn() {
    GIDSignIn.sharedInstance().delegate = self
    GIDSignIn.sharedInstance().uiDelegate = self
    GIDSignIn.sharedInstance().scopes = [kGTLRAuthScopeDrive]
    GIDSignIn.sharedInstance()?.signInSilently()
}
```
Podrías notar la línea de código `GIDSignIn.sharedInstance().scopes`. Esta línea de código define qué permisos otorga el usuario a tu app para acceder a sus datos al autenticarse. En este caso, usamos el scope `kGTLRAuthScopeDrive` que permite a nuestra app ver y administrar todos los archivos en el Google Drive del usuario, *incluyendo team drive*. El método `signInSilently` intentará iniciar sesión silenciosamente con un usuario previamente autenticado.

Si realizas todos los pasos anteriores correctamente, deberías poder autenticar tu app con la API de Google.
<div style="height: 450px; margin-top: -50px;">
<div style="float: left; width: 50%; padding: 20px;">
![](/Post-Resources/GoogleDrive/GoogleSignIn.png "Google Sign in")
</div>
<div style="float: left; width: 50%; padding: 20px;">
![](/Post-Resources/GoogleDrive/GrantPermission.png "Grant permission")
</div>
</div>

## APIs comunes
### Trabajar con "My Drive"
#### Búsqueda
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
#### Listado
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
#### Subida
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
#### Descarga
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
#### Eliminación
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
### Trabajar con "Team Drive"
Lo único que necesitamos hacer para trabajar con "Team Drive" es establecer el parámetro `corpora` de la consulta a `teamDrive`. Por defecto, se aplica el corpora `user`. Eso significa que la consulta solo se aplica a las carpetas propiedad del usuario. Al establecerlo en `teamDrive`, indicamos que la consulta afectará al team drive del usuario. Podemos combinar múltiples corpora en una sola consulta si necesitas hacerlo.
## Reflexiones finales
Google Drive es un almacenamiento ideal para integrar con nuestras aplicaciones. En este artículo, cubrimos cómo configurar la API de Google Drive y cómo ejecutar APIs comunes. Espero que hayas aprendido algo hoy.
Puedes encontrar todo el código fuente de demostración en mi [Github](https://github.com/uynguyen/MyGoogleDrive)
## Referencias
[1] Google Developer https://developers.google.com/drive/api/v3/about-sdk
