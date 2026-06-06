---
title: Integrar Google Sign In en una App MacOS con Swift
date: 2019-12-11 21:28:10
tags: [macOS, Swift, Cocoa]
layout: post
lang: es
thumbnail: /Post-Resources/GGSignIn-Mac/gg_banner.jpg
---
Como desarrollador iOS, podrías tener la oportunidad de escribir aplicaciones en Mac OS. Y a veces, tus aplicaciones requieren que los usuarios se autentiquen antes de poder usar tu app. Habilitar Google Sign in te ayuda a ahorrar mucho tiempo para implementar el flujo de autenticación. Desafortunadamente, hay falta de documentación sobre cómo integrar Google Sign in en apps de MacOS, particularmente en Swift. Una vez tuve la oportunidad de implementar esta característica en mi app. Ahora quiero compartir contigo cómo podemos hacerlo. Comencemos.
<!-- more -->
## Configuración
Primero creemos tu aplicación de Mac OS, nómbrala como quieras. Luego, ejecuta el comando `pod init` para inicializar el workspace de Pod.
Después, agrega la siguiente línea a tu archivo Pod.
```bash
use_frameworks!
pod 'GTMAppAuth'    # GTMAppAuth is an alternative authorizer to GTMOAuth2, supports for authorizing requests with AppAuth.
pod 'SwiftyJSON'    # JSON parser
pod 'PromiseKit'    # Make async requests
pod 'Kingfisher'    # Cached image
pod 'SnapKit'       # Autolayout
```
Luego ejecuta `pod install` para descargar todas estas dependencias.

## Obtener un OAuth client ID
Antes de comenzar con el ejemplo, primero ve a [Google Console](https://console.developers.google.com) y crea un nuevo proyecto. Luego presiona "Create credentials" > "OAuth client ID" > tipo de aplicación "Other" > Sigue las instrucciones para obtener tus credenciales.
Después de crear el OAuth client ID, toma nota del client ID y el client secret, los cuales necesitarás para configurar Google Sign-in en tu app. Opcionalmente puedes descargar el archivo de configuración que contiene la información de tu proyecto para referencia futura.

![](/Post-Resources/GGSignIn-Mac/google-credential.jpg "")

## Configurar el proyecto
Asegúrate de configurar tu app para permitir conexiones de red entrantes y salientes yendo a Signing & Capabilities > App Sandbox > Marca tanto Incoming Connections como Outgoing Connections. Si no haces eso, obtendrás el siguiente error porque tu app no tiene permiso para realizar solicitudes.
```bash
2019-12-11 22:22:49.472046+0700 GoogleSignInDemo[3955:65750] Metal API Validation Enabled
2019-12-11 22:22:51.444494+0700 GoogleSignInDemo[3955:66166] dnssd_clientstub ConnectToServer: connect() failed path:/var/run/mDNSResponder Socket:11 Err:-1 Errno:1 Operation not permitted
```
Después, abre el `Info.plist` y agrega un nuevo valor para `CFBundleURLTypes`, que es la forma de notación DNS inversa de tu client ID. Safari usará esta notación DNS para abrir tu app después de que el proceso de autenticación se realice exitosamente.
```javascript
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.REPLACE_BY_YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```
## Realizando la autorización
Primero creemos nuestro objeto de servicio, la clase `GoogleSignInService`, que maneja todas las solicitudes relacionadas con Google Sign in. También contiene todas las credenciales de tu proyecto.
```swift
class GoogleSignInService: NSObject, OIDExternalUserAgent {
    static let kYourClientNumer = "REPLACE_BY_YOUR_CLIENT_ID"
    static let kIssuer = "https://accounts.google.com"
    static let kClientID = "\(Self.kYourClientNumer).apps.googleusercontent.com"
    static let kClientSecret = "REPLACE_BY_YOUR_CLIENT_SECRET"
    static let kRedirectURI = "com.googleusercontent.apps.\(Self.kYourClientNumer):/oauthredirect"
    static let kExampleAuthorizerKey = "REPLACE_BY_YOUR_AUTHORIZATION_KEY"
    // The rest omitted
}
```
Descubre el endpoint del servicio de Google y define una solicitud.
```swift
OIDAuthorizationService.discoverConfiguration(forIssuer: URL(string: Self.kIssuer)!) {
    // The rest omitted
    let request = OIDAuthorizationRequest(configuration: config,
                                            clientId: Self.kClientID,
                                            clientSecret: Self.kClientSecret,
                                            scopes: [OIDScopeOpenID, OIDScopeProfile, OIDScopeEmail],
                                            redirectURL: URL(string: Self.kRedirectURI)!,
                                            responseType: OIDResponseTypeCode,
                                            additionalParameters: nil)
    // The rest omitted
}
```
Mira el parámetro `scopes`, este parámetro define a qué información del usuario puede acceder tu app. Google Sign In ofrece 5 scopes diferentes, incluyendo:
- NSString *const OIDScopeOpenID = @"openid";
- NSString *const OIDScopeProfile = @"profile";
- NSString *const OIDScopeEmail = @"email";
- NSString *const OIDScopeAddress = @"address";
- NSString *const OIDScopePhone = @"phone";

Puedes seleccionar cuáles se ajustan a los requisitos de tu app.
Finalmente, inicia el proceso de autenticación.
```swift
OIDAuthState.authState(byPresenting: request, externalUserAgent: self, callback: { (state, error) in
    guard error == nil else {
        seal.reject(error!)
        return
    }
    // You got the OIDAuthState object here
})
```
Después de que el proceso de autenticación se realiza exitosamente, obtendrás un objeto `OIDAuthState` que se usará como parámetro para inicializar el objeto `GTMAppAuthFetcherAuthorization`.
Normalmente, deberías guardar este objeto `GTMAppAuthFetcherAuthorization` en un keychain y reutilizarlo para las siguientes llamadas a la API REST.
```swift
private func saveState() {
    // The rest omitted
    if auth.canAuthorize() {
        GTMAppAuthFetcherAuthorization.save(auth, toKeychainForName: Self.kExampleAuthorizerKey)
    }
}
```
## Realizando solicitudes
Después de guardar el objeto de servicio en el keychain, ahora puedes recuperarlo para hacer cualquier solicitud. Haré una solicitud para obtener el perfil del usuario actual.
```swift
func loadProfile() -> Promise<GoogleSignInProfile> {
    return Promise { (seal) in
        // The rest omitted
        if let url = URL(string: "https://www.googleapis.com/oauth2/v3/userinfo") {
            let service = GTMSessionFetcherService()
            service.authorizer = auth
            service.fetcher(with: url).beginFetch { (data, error) in
                // Process the data here
                // data = ["locale", "family_name", "given_name", "picture", "sub", "name", emai]
            }
        }
    }
}
```

## Solución de problemas
- Después de iniciar sesión, si tu Safari no puede redirigir de vuelta a tu app. Solo limpia tu proyecto (Shift + Cmd + K) y luego ejecútalo de nuevo.
![](/Post-Resources/GGSignIn-Mac/safari_can_not_open.jpg "")
- Otros navegadores web (Chrome, Firefox, etc) no pueden abrir tu app así que asegúrate de lanzar la web de inicio de sesión en Safari.
```swift
NSWorkspace.shared.open([url], withAppBundleIdentifier: "com.apple.Safari", options: .default, additionalEventParamDescriptor: nil, launchIdentifiers: nil) {
```
## Reflexiones finales
Puedes encontrar la demostración completa aquí
![](/Post-Resources/GGSignIn-Mac/demo.gif "")
Ahora puedes usar Google Sign in dentro de tu macOS para reducir tus esfuerzos en la autenticación. Para obtener el código fuente completo, por favor descárgalo a través del [enlace de Github](https://github.com/uynguyen/GoogleSignIn-MacOS).
En caso de que tengas algún problema, no dudes en contactarme.
