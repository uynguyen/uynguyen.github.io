---
title: 'Concurrencia Avanzada en iOS: Operations [1]'
date: 2020-05-16 20:54:36
tags: [iOS, Concurrency, Operations]
layout: post
lang: es
thumbnail: /Post-Resources/Operations/operations.png
---

Hay dos tecnicas para manejar la Concurrencia en iOS: GCD - Grand Central Dispatch y Operations. La mayoria del tiempo, GCD proporciona la mayoria de las capacidades de concurrencia que necesitas. Sin embargo, a veces querras algunas personalizaciones avanzadas adicionales. Es hora de usar Operations. Este tutorial introducira Operations en Swift, tambien explicara cuando y por que usar Operation en lugar de GCD.
Cambiemos de marcha!
> Hay una gran brecha entre conocer el camino y recorrerlo.
<!-- more -->
## Introduccion a Operations
Operation es una clase que te permite enviar un bloque de codigo que deberia ejecutarse en un hilo diferente, esta construida sobre GCD. Basicamente, tanto GCD como Operation tienen roles similares. Sin embargo, Operations tienen otros beneficios que nos dan mas control sobre la tarea.
- **Diseno OOP**: como Operation es una clase de Swift, puedes crear subclases y sobrescribir sus metodos si es necesario. Sera facil de usar y reutilizar en el futuro.
- **Gestion de estados**: Una Operation tiene su propia maquina de estados que cambia durante su ciclo de vida. La operacion misma maneja los cambios de sus estados. No podemos modificar estos estados de un objeto.
- **Dependencia entre operaciones**: Si quieres iniciar una tarea despues de que otras tareas hayan terminado de ejecutarse, entonces Operation deberia ser tu eleccion. Una operacion no comenzara a ejecutarse hasta que todas las operaciones de las que depende hayan terminado exitosamente sus trabajos.
- **Cancelar la tarea enviada**: Al usar Operations, tenemos la capacidad de cancelar una operacion en ejecucion. Es muy util en un caso donde queremos detener operaciones que son irrelevantes en un momento determinado. Por ejemplo, para cancelar la descarga de datos cuando el usuario desplaza la tabla haciendo que algunas celdas desaparezcan.

La dependencia y la capacidad de cancelar hacen que las Operations sean mucho mas controlables que GCD.

## Llevemoslo a la practica
Supongamos que estamos construyendo una aplicacion que obtendra algunas de mis publicaciones. Despues de descargar las imagenes de portada, se les aplicara un filtro simple, luego se mostraran en una table view.
Adelante, crea un proyecto. El proyecto simplemente contiene solo una pantalla principal con una table view que muestra publicaciones con un titulo y una imagen de portada. Para simplificar la fuente de datos, cree un archivo JSON que contiene 100 filas describiendo una publicacion con clave como titulo y valor como la URL vinculada a la imagen de portada.
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

Dentro del MainViewController, leamos el archivo de entrada
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

Usando una funcion simple de CoreImage, el metodo `grayScale(input:)` transformara una UIImage a una imagen en blanco y negro con el filtro Tonal
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

Es hora de configurar la table view, usamos URLSession para descargar la imagen desde la URL de entrada, luego mostrarla en la celda despues de descargarla exitosamente.
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
Compila y ejecuta el proyecto, deberias ver las imagenes aparecer en la lista. Intentemos desplazar la tabla. Puedes sentir el lag?
Podrias notar de donde viene el problema. Para configurar una celda, primero descargamos la imagen de internet, luego aplicamos un filtro Tonal a la imagen. Estas dos acciones se estan realizando en el hilo principal, poniendo demasiada presion en el hilo que solo deberia usarse para la interaccion del usuario.

<div style="text-align:center">

![](/Post-Resources/Operations/lagy.gif "Lagy")

</div>

## Usando GCD
Podemos despachar el codigo de descarga y filtrado de imagen a otra cola separada
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

Al ejecutar el codigo en una cola de fondo, descargamos trabajo de la cola principal y hacemos la UI mucho mas receptiva.
Recompila el proyecto, veras las diferencias.
Aunque resolvemos el problema de interaccion del usuario, el rendimiento de la app todavia no esta optimizado.
Que se puede hacer para mejorar esto?
A medida que el usuario desplaza la tabla, las celdas van y vienen. No tiene sentido continuar descargando y procesando una imagen de una celda invisible. Es mejor cancelar el bloque de codigo para mejorar el rendimiento y reducir el consumo de bateria de la app. Pero como podemos cancelar una tarea que se esta ejecutando en GCD?
Aqui es donde entra Operation.

## Cambiemos a Operation
Dividamos la tarea de configurar una celda de table view en dos tareas: una es descargar la imagen y otra es aplicar el filtro.
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

Para usar Operation, simplemente creamos una subclase de la clase Operation y sobrescribimos el metodo `main` donde se coloca nuestra tarea. Por defecto, las operaciones se ejecutan en segundo plano, asi que no hay preocupaciones sobre bloquear el hilo principal.
Volviendo a la tarea de configurar la celda de table view, podrias notar que hay una dependencia entre estas dos tareas, solo hacemos el proceso de filtrado despues de descargar la imagen. En otras palabras, la operacion `ImageFilterOperation` depende de la operacion `DownloadImageOperation`. Las Dependencias de Operaciones es una de las "funciones estrella" de Operation junto con la capacidad de cancelar una operacion en ejecucion. Al vincular las dos operaciones, aseguramos que la operacion dependiente no comience antes de que la operacion prerequisito se haya completado. Adicionalmente, el vinculo crea una forma limpia de pasar datos de la primera a la segunda.

```swift
e.g
let dependencyImage = self.dependencies
    .compactMap { $0 as? DownloadImageOperation }
    .first
```

Es hora de hacer la mejora.
Primero definamos un `OperationQueue` en el ViewController. La clase `OperationQueue` es lo que usamos para gestionar Operations.

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
Aqui, inicializamos dos nuevas instancias de las clases `DownloadImageOperation` e `ImageFilterOperation`. Luego, establecemos que la operacion `grayScaleOpt` depende de `downloadOpt` lo que asegurara que `grayScaleOpt` solo se ejecute despues de que `downloadOpt` se haya completado. Finalmente, agregamos estas dos operaciones al `OperationQueue`. Una vez que una operacion se agrega a la cola, la operacion sera programada. Si la cola encuentra un hilo disponible en el cual ejecutar la operacion, el trabajo se ejecutara hasta que se complete o sea cancelado. Cuando la operacion se completa, se llama al `completionBlock`.

> "Las operaciones tienen efectos importantes en el rendimiento de tu aplicacion. Por ejemplo, si quieres descargar mucho contenido de Internet, podrias querer hacerlo solo cuando sea absolutamente necesario. Tambien, podrias decidir asegurar que solo un numero especifico de operaciones puedan ejecutarse al mismo tiempo. Si decides limitar el numero de operaciones concurrentes en una cola, puedes cambiar la propiedad maxConcurrentOperationCount de tu cola de operaciones. Esta es una propiedad entera que te permite especificar cuantas operaciones, como maximo, pueden ejecutarse en una cola en un momento dado." (iOS 8 Swift Programming Cookbook)

Aprender las teorias anteriores es suficiente, ahora recompila el proyecto para ver el resultado.

![](/Post-Resources/Operations/EmptyList.jpeg "EmptyList")

Ops! Nada aparece, la imagen no se descargo! Algo salio mal ???
En el siguiente tutorial, descubriremos que paso con nuestro codigo y por que Operation no funciono correctamente como se esperaba.
Gracias por leer.
