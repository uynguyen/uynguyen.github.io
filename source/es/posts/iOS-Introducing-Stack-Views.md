---
title: 'iOS: Introduccion a Stack Views Programaticamente'
date: 2020-07-18 17:00:08
tags: [UI, UIStackView, iOS]
layout: post
lang: es
thumbnail: /Post-Resources/StackView/stackview.png
---

A medida que tu habilidad de desarrollo iOS crece, creo que usas `UIScrollView`, `UICollectionView`, `UITableView` y otras vistas nativas regularmente y con competencia en tus aplicaciones. Sin embargo, algunos desarrolladores iOS todavia no saben que es exactamente `UIStackView`, para que se usa o en que situacion debemos usar `UIStackView`.
En este tutorial, te presentare `UIStackView` - Una vista que nos ayuda a simplificar nuestros layouts de iOS.

Imaginemos que vas a construir una aplicacion que permite al usuario agregar o eliminar vistas en tiempo de ejecucion. Recuerdas como lograremos esta tarea? Primero tenemos que eliminar todas las constraints en el area relativa y actualizarlas todas de nuevo. O recuerda el caso donde implementas la vista de inicio de sesion / registro, agregas muchos campos de texto y estableces constraints manualmente entre esas vistas. En tales situaciones, `UIStackView` parece ser mas util que otras vistas.

<!-- more -->

Para demostrar como aplicar `UIStackView` a tus proyectos, vamos a construir una aplicacion simple que permite al usuario controlar dispositivos inteligentes en su hogar; Los usuarios pueden agregar o eliminar que habitacion quieren que se muestre en su lista de control. La clave principal aqui es que todas las acciones del usuario se ejecutan en tiempo de ejecucion dinamicamente. Adicionalmente, en lugar de usar Storyboard en este proyecto, voy a usar codigo dinamicamente junto con la ayuda del framework AutoLayout ([SnapKit](https://github.com/SnapKit/SnapKit) - es solo una cuestion de preferencia). Dejemos de lado otras implementaciones complejas, la aplicacion contiene solo dos vistas: Una vista de inicio de sesion y una pagina principal. Ademas, no habra codigo de logica en absoluto.

<center>

![](/Post-Resources/StackView/demo.gif "Demo")

</center>

## Propiedades clave
Para entender como funciona un Stack View, primero necesitamos echar un vistazo a sus propiedades. Sin importar que tipo de Stack View sea (Horizontal o Vertical), hay cuatro propiedades principales: **Axis**, **Spacing**, **Alignment** y **Distribution**. La siguiente imagen resume la relacion entre esos atributos.

![](/Post-Resources/StackView/StackViewProps.png "Props")

- **Axis**: determina la orientacion del stack, incluyendo Horizontal y Vertical.
- **Spacing**: determina el espacio minimo entre las vistas del stack.
- **Alignment**: determina el layout de las vistas del stack perpendicular a su eje.
Tanto los stack views horizontales como verticales tienen las opciones `Fill` y `Center`.
    - Fill: Las vistas organizadas del Stack se redimensionaran para que se ajusten al stack view perpendicularmente a su eje. Los bordes leading y trailing de los elementos apilados verticalmente o los bordes superior e inferior de los horizontales, respectivamente.
    - Center: Como su nombre sugiere, centra las vistas del stack horizontalmente (Stack vertical) o verticalmente (Stack horizontal).

Fill             |  Center
:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_alighment/fill.png)  |  ![](/Post-Resources/StackView/h_alighment/center.png)

Hay algunas opciones de alignment que aplican solo para stack views horizontales:
- Top: Como su nombre sugiere, centra las vistas del stack horizontalmente (Stack vertical) o verticalmente (Stack horizontal).
- Bottom: Como su nombre sugiere, centra las vistas del stack horizontalmente (Stack vertical) o verticalmente (Stack horizontal).
- First baseline: Un layout donde el stack view alinea sus vistas organizadas basandose en su primera linea base.
- Last baseline: Un layout donde el stack view alinea sus vistas organizadas basandose en su ultima linea base.

Top             |  Bottom |  First baseline |  Last baseline
:-------------------------:|:-------------------------:|:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_alighment/top.png)  |  ![](/Post-Resources/StackView/h_alighment/bottom.png) |  ![](/Post-Resources/StackView/h_alighment/firstbaseline.png) |  ![](/Post-Resources/StackView/h_alighment/lastbaseline.png)
  |   |  ![](/Post-Resources/StackView/h_alighment/first_baseline.png) |  ![](/Post-Resources/StackView/h_alighment/last_baseline.png)


Similarmente, hay algunas opciones de alignment que funcionan solo para stack views verticales:
- Leading: El stack view alinea el borde leading (Izquierdo) de sus vistas organizadas a lo largo de su borde leading. Similar al alignment top para stacks horizontales.
- Trailing: El stack view alinea el borde trailing (Derecho) de sus vistas organizadas a lo largo de su borde leading. Similar al alignment bottom para stacks horizontales.
Leading             |  Trailing
:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_alighment/leading.png)  |  ![](/Post-Resources/StackView/h_alighment/trailing.png)

- **Distribution**: determina el layout de las vistas del stack a lo largo de su eje. Las subvistas se redimensionan basandose en esta configuracion.
    - Fill: Este se establece como la distribucion predeterminada cuando se crea un Stack View. Cuando ponemos vistas dentro de un UIStackView con Fill establecido como distribucion, seguira intentando estirar el tamano de una de las vistas para llenar el espacio.
    Entonces la pregunta es, en que criterio se basara para elegir la vista a redimensionar? **Content Hugging Priority (CHP)** sera. Para determinar que vista se estirara, el stack view se basara en CHP para la evaluacion, cuanto menor sea su prioridad, mas probable es que sea elegida. Si todas las vistas tienen el mismo CHP, se elegira la primera.
    - Fill Equally: Cada control en un UIStackView sera de igual tamano.
    - Fill Proportionally: Todos los controles necesitan tener un tamano de contenido intrinseco, Stack view asegurara que los controles mantengan la misma proporcion.
    - Equal Spacing: Este tipo de distribucion mantendra un espaciado igual entre las subvistas.
    - Equal Centering: Este tipo de distribucion mantendra un espacio igual entre el centro de las subvistas.

Fill             |  Fill Equally               |  Fill Proportionally
:-------------------------:|:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_distribution/fill.png)  |  ![](/Post-Resources/StackView/h_distribution/equally.png) |  ![](/Post-Resources/StackView/h_distribution/proportionally.png)

Equal Spacing             |  Equal Centering
:-------------------------:|:-------------------------:
![](/Post-Resources/StackView/h_distribution/equalspacing.png)  |  ![](/Post-Resources/StackView/h_distribution/equalcentering.png)


> Nota: `UIStackView` es una vista sin renderizado, lo que significa que no puedes establecer la propiedad background-color, o sobrescribir el metodo `draw`, etc.

## Llevemoslo a la practica
Ahora, con ese conocimiento en mente, vamos a aplicarlo a un proyecto existente que actualmente no usa `UIStackView` para organizar su vista en absoluto. Al aplicar `UIStackView` en la practica, realmente entenderemos como funciona un `UIStackView` y que problemas puede resolver.

### Auto organizar vistas
Lo primero que `UIStackView` nos trae es la libertad de establecer constraints para todas las vistas.
La vista de inicio de sesion es bastante simple, contiene dos campos de texto, un boton de inicio de sesion y algunas etiquetas de texto.

![](/Post-Resources/StackView/login.png "Log in view")

Sin usar `UIStackView`, tenemos que establecer constraints manualmente para todos esos campos de texto.

```swift
view.addSubview(lblLogin)
lblLogin.snp.makeConstraints { (make) in
    make.centerX.equalToSuperview()
    make.centerY.equalToSuperview().offset(-250)
    make.left.equalToSuperview().offset(20)
    make.right.equalToSuperview().offset(-20)
    make.height.equalTo(30)
}

view.addSubview(lblUsername)
lblUsername.snp.makeConstraints { (make) in
    make.centerX.left.right.equalTo(lblLogin)
    make.top.equalTo(lblLogin.snp.bottom).offset(30)
    make.height.equalTo(30)
}

view.addSubView(btnLogin)
//...
// The rest omitted
```

Pero todavia no es una pesadilla. Imagina que ahora quieres agregar algunas otras vistas, como una etiqueta y una vista switch para permitir al usuario recordar la sesion de inicio de sesion. Ahora tenemos que alterar todas las otras vistas para insertar esas nuevas vistas en el lugar correcto en la pantalla!

![](/Post-Resources/StackView/login2.png "Log in view")

La tarea sera mas facil y simple si usamos `StackView`. Ahora veamos como podemos hacerlo.
Primero, agreguemos una nueva propiedad al controlador de vista de inicio de sesion.
```swift
lazy var stackView: UIStackView = {
    let stack = UIStackView()
    stack.axis = .vertical
    stack.spacing = 20.0
    stack.alignment = .fill
    stack.distribution = .fillEqually
    [self.lblUsername,
        self.txtUserName,
        self.lblPassword,
        self.txtPassword,
        self.btnLogin].forEach { stack.addArrangedSubview($0) } [1]
    return stack
}()
```

Observa en [1], asi es como agregamos vistas organizadas a un stack view. Luego, solo necesitamos establecer constraints para el stackView.

```swift
 override func viewDidLoad() {
    super.viewDidLoad()
    // ...
    view.addSubview(stackView)
    stackView.snp.makeConstraints { (make) in
        make.centerX.left.right.equalTo(lblLogin)
        make.top.equalTo(lblLogin.snp.bottom).offset(30)
        make.height.equalTo(280)
    }
 }
```
En el futuro, si queremos agregar nuevas vistas, solo necesitamos ponerlas en el array de vistas organizadas. Como se muestra a continuacion.

```swift
lazy var keepLoginStackView: UIStackView = {
    let stackView = UIStackView()
    stackView.axis = .horizontal
    stackView.alignment = .trailing
    stackView.distribution = .fill
    [self.lblRememberMe,
        self.swKeepLogin].forEach { stackView.addArrangedSubview($0) }
    return stackView
}()
```

```swift
    // ...
    self.txtPassword,
    self.keepLoginStackView,
    self.btnLogin].forEach { stack.addArrangedSubview($0) }
    // ...
```

Puedes ver las diferencias? El codigo base ahora es mas limpio y mantenible que el anterior, no es asi?

### Vistas dinamicas
Ahora cambiemos al caso donde implementaremos la pagina principal de la aplicacion.
Cuando el usuario presiona el boton derecho de la pantalla, una nueva vista, que representa una habitacion a controlar en este caso, se colocara en la pagina principal. El usuario tambien puede eliminar cualquier habitacion en la lista presionando el boton "Remove". Dentro de cada habitacion, hay un boton "Hide" / "Show" que permite ocultar y mostrar la imagen de la habitacion. Recuerda en el pasado donde tenias que implementar una caracteristica similar en tu app sin usar `UIStackView`, que harias? Algo doloroso! Primero necesitamos eliminar todas las constraints en el area relativa y actualizarlas todas de nuevo.

Aqui esta lo que vamos a hacer con `UIStackView`, la pagina principal contiene un stack view vertical embebido dentro de un scroll view. Cuando se presiona el boton Add, una nueva vista `TaskView` se agregara a este stack view.

![](/Post-Resources/StackView/dynamic.png "Dynamic View")


```swift
func addMoreView() {
    let view = TaskView(delegate: self, data: room[Int.random(in: 0..<room.count)])
    let constraint1 = view.heightAnchor.constraint(lessThanOrEqualToConstant: 400.0)
    constraint1.isActive = true
    self.taskStackView.addArrangedSubview(view)
    self.view.layoutIfNeeded()
}
```

Tambien necesitamos establecer constraints de altura para esta nueva vista. Debido a que la altura de la vista podria cambiar cuando se presiona el boton show/hide, necesitamos definir esta constraint como `lessThanOrEqualToConstant:value` para que el stack view pueda ajustar esta constraint de altura.

```swift
func onRemove(_ view: TaskView) {
    if let first = self.taskStackView.arrangedSubviews.first(where: { $0 === view }) {
        UIView.animate(withDuration: 0.3, animations: {
            first.isHidden = true
            first.removeFromSuperview()
        }) { (_) in
            self.view.layoutIfNeeded()
        }
    }
}
```
Cuando se hace clic en el boton remove en una vista de tarea, esta vista se eliminara del stack view. Podemos acceder a todas las vistas organizadas de un stack view accediendo a la propiedad `arrangedSubviews`. Primero iteramos por todas las vistas organizadas y encontramos la vista apropiada que tiene la misma direccion que el emisor, luego la eliminamos de la super vista. Adicionalmente, hago una pequena animacion, `UIView.animate(withDuration:animations:)`, para que la transicion se vea mas suave y elegante que la anterior.
Usando el mismo enfoque, puedes hacer lo mismo cuando el usuario hace clic en el boton Show / Hide para mostrar/ocultar la vista de imagen. Intentalo por ti mismo.

## Pensamiento final
En este tutorial, te presente `UIStackView` - una subclase de UIView que ayuda a gestionar la posicion y el tamano de sus vistas organizadas. Tambien trabajamos a traves de una demostracion que lleva `UIStackView` a la practica. Ahora que tienes la idea de como funciona `UIStackView` y para que se usa, las proximas veces intenta usar `UIStackView` en tu app para aprovechar su poder. Yo lo hare, y tu?
Puedes descargar la demo completa en [Github](https://github.com/uynguyen/UIStackView),
Feliz programacion!
