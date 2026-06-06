---
title: Documentando una Arquitectura de Software
date: 2018-04-11 22:19:20
tags: [UML, Software Architecture]
layout: post
lang: es
thumbnail: /Post-Resources/UML/Banner.png
---
Está claro que documentar arquitecturas es una de las tareas más ~~aburridas~~ importantes de la Ingeniería de Software.
<!-- more -->
## Una actividad de dos caras
Hay muchas buenas razones por las que debemos documentar nuestros proyectos de software:
- Otros miembros pueden entender y evaluar el diseño de este software.
- Podemos entender lo que implementamos cuando volvemos a él después de cierto tiempo.
- Podemos hacer análisis del diseño para evaluar el rendimiento de este sistema, prevenir errores antes de comenzar la fase de implementación.

Documentar arquitecturas también tiene algunas desventajas, como:
- Los documentos gradualmente quedarán desactualizados con respecto al código. Mantener los documentos de arquitectura
actualizados es a menudo una actividad olvidada, especialmente bajo las presiones de un proyecto.
- Documentar consume *tiempo* y es *costoso*.
<br />

Entonces, ¿cuándo debemos documentar arquitecturas de software?
Hay muchos factores a considerar si necesitamos documentar o no. Los proyectos con pocas perspectivas de una larga vida probablemente no necesitan mucha documentación. El otro factor a considerar al documentar son las necesidades de las partes interesadas del proyecto, incluyendo los diversos roles como desarrolladores, testers, gerentes, etc. En un equipo pequeño, la documentación puede ser mínima y puede ser reemplazada por comunicación interpersonal, esto ahorra tiempo. En un equipo grande, sin embargo, la documentación se vuelve más importante para describir el sistema, especialmente en empresas que trabajan en múltiples países y en muchas oficinas. Por lo tanto, es importante pensar cuidadosamente antes de documentar porque toma tiempo desarrollar y mantener junto con los proyectos.
En este post, te presentaré el lenguaje más popular para documentar arquitecturas de software: Unified Modeling Language.

## Unified Modeling Language (UML)
UML es un lenguaje de modelado de Ingeniería de Software. Proporciona una forma estándar de visualizar el diseño de un sistema o una aplicación. UML incluye tanto diagramas estructurales como de comportamiento para representar un sistema de software:
- Un diagrama estructural describe arquitecturas estáticas de su sistema.
- Un diagrama de comportamiento muestra las interacciones entre entidades dentro de un sistema.

![](/Post-Resources/UML/UML-Diagram-Types.png "")

Ten en cuenta que nunca he usado *Component diagrams*, *Package diagram*, *Deployment diagrams*, *Profile Diagram*, *Composite Structure diagrams*, *Communication diagrams*, *Interaction Overview diagrams* y *Timing diagrams* así que voy a omitir estos diagramas en este post.

### Diagramas estructurales

#### *Diagramas de clase*
Un diagrama de clase describe la estructura de un sistema mostrando las relaciones entre sus clases. También muestra atributos y métodos de cada clase. El propósito principal de los diagramas de clase es obtener una visión general del sistema.

![](/Post-Resources/UML/Class.png "")

Donde vis = visibilidad

| Sintaxis        | Tipo de visibilidad |
| ------------- |:-------------:  |
| +     		| Public 		  <td rowspan=4>Si una variable o método es static,  <br/> debe estar subrayado.</td>|
| #			    | Protected       |
| -				| Private         |
| ~ 			| Package         |


Las siguientes líneas introducen algunas relaciones principales en los diagramas de clase.

| Marca        		| Significado |
| ------------- 	|:-------------:  |
| Implementation    | La Clase B implementa los comportamientos definidos en la Clase A. <br/>![](/Post-Resources/UML/Imple.png "")|
| Inheritance		| La Clase B tiene una relación ES-UN con la clase A, o podemos decir que la Clase B es un tipo de Clase A. <br/>![](/Post-Resources/UML/Inher.png "")|
| Dependency 		| Existe entre dos elementos si los cambios en la definición de uno pueden causar cambios en el otro. <br/>![](/Post-Resources/UML/Depen.png "")|
| Association		|  Una asociación binaria (con dos extremos) normalmente se representa como una línea. <br/> Indica que la Clase A contiene una o más propiedades pertenecientes a la clase B, o viceversa. <br/>![](/Post-Resources/UML/Ass.png "")|
| Aggregation 		| Es un caso especial de Association. Podemos decir que la Clase A está agregada con la Clase B si el Objeto X como instancia de la clase A es destruido pero el Objeto Y como instancia de la clase B todavía existe. <br/>![](/Post-Resources/UML/Agg.png "") <br/> Aquí, las vidas tanto del Employee como del Department son independientes entre sí. Los empleados pueden existir sin un departamento. |
| Composition		| Es un caso especial de Aggregation pero es más fuerte que la relación Aggregation. Si el Objeto X como instancia de la clase A es destruido, el Objeto Y como instancia de la clase B también será destruido. También decimos que Composition es una relación TIENE-UN.<br/>![](/Post-Resources/UML/Compo.png "") <br/> Aquí, si eliminamos el objeto verhicle entonces todos los engines son eliminados automáticamente. Los engines no tienen su ciclo de vida independiente, depende de la vida del objeto verhicle.         |

![](/Post-Resources/UML/Ex-Class-Diagram.png "")
<center>Un ejemplo de diagrama de clase.</center>

#### *Diagramas de instancia (Diagramas de objeto)*
Básicamente, un diagrama de instancia es similar al diagrama de clase del cual depende. Sin embargo, un diagrama de instancia es solo una instantánea del sistema en algún punto en el tiempo, y muestra qué valores contienen esos objetos en este momento especificado. Los diagramas de instancia se usan a menudo para hacer prototipos de un sistema, y para obtener mayor comprensión del sistema desde una vista práctica.
Los símbolos y notaciones de los diagramas de instancia pueden utilizarse en los diagramas de clase.

Ejemplo
![](/Post-Resources/UML/Ex-Object-Diagram.png "")
<center>Transferencia de un diagrama de clase a un diagrama de instancia.</center>

### Diagramas de comportamiento
#### *Diagramas de actividad*
Un diagrama de actividad muestra el flujo de una actividad a otra actividad (Una actividad es una función realizada por el sistema). Ten en cuenta que los mensajes no están incluidos en los diagramas de actividad.
Un diagrama de actividad se usa a menudo para describir el alto nivel del sistema, principalmente para usuarios de negocio o personas no técnicas. También puede describir los pasos en un diagrama de casos de uso.
Símbolos y componentes básicos:
![](/Post-Resources/UML/Activity-Symbols.png "")

| Símbolo básico        		| Significado |
| ---------------------		|:-------------:  |
| Start point    					| Representa el estado de acción inicial.|
| Activity					| Representa una actividad del proceso.|
| Condition 			| Usa este símbolo cuando una actividad requiere una decisión antes de pasar a la siguiente actividad|
| Synchronization 						| Indica que múltiples actividades se realizan sincrónicamente.|
| Time event				| Se refiere a un evento que detiene el flujo por un tiempo.       |
| Interrupting Edge					| Un evento que interrumpe el flujo. |
| End Point		| Representa el estado de acción final.       |

#### *Diagramas de secuencia*
Un diagrama de secuencia muestra cómo los objetos y componentes interactúan entre sí para completar una función.
Símbolos y componentes básicos:
![](/Post-Resources/UML/Sequence-Symbols.png "")

| Símbolo básico        		| Significado |
| ---------------------		|:-------------:  |
| Actor    					| Muestra entidades que interactúan con el sistema.|
| Object					| Representa un objeto en UML.|
| Activation box 			| Representa el tiempo necesario para completar una tarea.|
| Loop 						| Indica declaraciones de bucle.   |
| Alternative				| Indica declaraciones de condición.       |
| Parallel					| Cada tarea en el marco representa un hilo de ejecución realizado en paralelo. |
| Synchronous message		| El emisor debe esperar una respuesta a un mensaje antes de continuar. El diagrama debe mostrar tanto la llamada como la respuesta.       |
| Asynchronous message		| El emisor no necesita esperar una respuesta a un mensaje antes de continuar.|
| Return message			| Los mensajes se responden a las llamadas.       |
| Delete object				| Indica que el objeto será destruido.    |

#### *Diagramas de máquina de estados*
El propósito principal de los diagramas de máquina de estados es mostrar el cambio de estado de un objeto durante su vida útil.

![](/Post-Resources/UML/State-Machine-Diagram.png "")

| Símbolo básico        		| Significado |
| ---------------------		|:-------------:  |
| State    					| Un estado representa una situación durante la vida de un objeto.|
| Initial State				| El estado inicial del objeto.|
| Final State 				| El estado final del objeto.|

El siguiente ejemplo muestra la transición de estado de un pedido.

![](/Post-Resources/UML/Ex-State-Machine.png "")

#### *Diagramas de casos de uso*
Un diagrama de casos de uso muestra cómo los usuarios u otras aplicaciones externas interactúan con el sistema. También muestra el alcance del sistema.

![](/Post-Resources/UML/Usecase-Diagram.png "")

| Símbolo básico        		| Significado |
| ---------------------		|:-------------:  |
| Actors    					| Representan los usuarios o sistemas externos que interactúan con nuestro sistema.|
| Use cases					| Representan los diferentes usos que un usuario podría tener.|
| Associations 			| Hay dos tipos de asociaciones: Actor-caso de uso y caso de uso - caso de uso. <br /> Una asociación Actor - caso de uso indica qué actores están asociados con qué casos de uso. <br /> Una asociación Caso de uso - Caso de uso muestra la relación de dos casos de uso: <br /> - *Include*: Un caso de uso "incluye" otro si es una acción requerida por el caso de uso.<br /> - *Extend*: Un caso de uso "extiende" otro si es un uso opcional del caso de uso. <br /> - *Generalization*: El caso de uso hereda la estructura, comportamiento y relaciones de otro. ![](/Post-Resources/UML/Ex-Association-Usecase.png "")|

## ¿Has oído hablar de Business Process Model and Notation (o BPMN)?
"Business Process Model and Notation (BPMN) es un estándar para modelado de procesos de negocio que proporciona una notación gráfica para especificar procesos de negocio en un Business Process Diagram (BPD)." ([Wiki](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)).
Los principales objetivos de BPMN son:
- Proporcionar un conjunto de notación estándar que sea comprensible por las partes interesadas del negocio.
- A menudo se usa para definir lógica de negocio porque tiene conceptos más completos de eventos y soporta intercambios de mensajes asíncronos, que son importantes en el procesamiento de negocios. BPMN es similar al diagrama de actividad de UML.

Un ejemplo de BPMN.
![](/Post-Resources/UML/shopping-process-bpmn.png "")
<center>Un proceso de compra descrito usando BPMN (Fuente de imagen de Google)</center>
## Diferencias entre UML y BPMN, ¿cuál usar?
Usamos BMPN para describir el sistema a alto nivel, sin preocuparnos demasiado por los detalles computacionales. En contraste, UML se usa para definir los detalles de este sistema, ¿cómo está construido? ¿cómo está organizado? ¿cómo interactúa con otros componentes? ¿cómo se procesan los datos? etc.

## Conclusión
En este post, te mostré las ideas generales de algunos diagramas UML populares, y te mostré la diferencia principal entre UML y BPMN. Por supuesto, todavía hay muchos propósitos y notaciones de esos diagramas que no puedo listar aquí debido al alcance de este post.
Si estás interesado en UML, puedes descargar el documento completo de UML [aquí (La última versión de UML es 2.5.1)](https://www.omg.org/spec/UML/).
Gracias por leer.

## Referencias
[1] Essential Software Architecture (2011, Springer-Verlag Berlin Heidelberg)Ian Gorton (auth.), Capítulo 8 Documenting a Software Architecture.
