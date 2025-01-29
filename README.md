# 1. Introducción 

En esta práctica, el objetivo fue desarrollar una recreación interactiva del Cubo de Rubik utilizando WebGL y Three.js, integrándola dentro de una aplicación web construida con React. Este proyecto permitió combinar tecnologías de gráficos 3D con un moderno framework de desarrollo web, creando una experiencia de usuario dinámica y funcional. 

# 2. Solución implementada

## 2.1 Configuración del entorno y herramientas utilizadas

Para este proyecto, se optó por utilizar React como framework principal para la construcción de la interfaz de usuario, debido a su eficiencia en la gestión de estados y componentes reutilizables. Three.js se empleó para manejar la renderización y manipulación de gráficos 3D mediante WebGL, permitiendo crear y animar el Cubo de Rubik de manera eficiente.

## 2.2 Creación del cubo de Rubik con Three.js
Se desarrolló una función createRubikCube que genera un grupo de cubies (pequeños cubos que conforman el Rubik) organizados en una estructura 3x3x3. Cada cubie se posiciona adecuadamente en el espacio 3D y se le asignan colores estándar del Cubo de Rubik a sus caras externas.

## 2.3 Integración con React

La aplicación se estructuró como un componente funcional de React, utilizando hooks como useState, useEffect y useRef para gestionar el estado y las referencias al DOM. El contenedor principal del cubo se referencia mediante mountRef, asegurando que Three.js renderice correctamente dentro del DOM gestionado por React.

## 2.4 Manejo de interactividad y animaciones

Se implementaron eventos de ratón para permitir la rotación interactiva del cubo. Al hacer clic y arrastrar sobre un cubie, se identifica la capa correspondiente (fila de bloques a la que pertenece) y se inicia una rotación animada de dicha capa. Además, se gestionó un sistema de snap que asegura que las rotaciones se alineen correctamente en ángulos de 90°, simulando movimientos reales del cubo de Rubik.

# 3. Contenido extra

Además de las funcionalidades básicas requeridas, se implementaron varias modificaciones personalizadas que enriquecieron el proyecto y mejoraron la experiencia del usuario.

## 3.1 Interfaz en React

En lugar de utilizar HTML, CSS y JS de manera tradicional, se optó por construir la interfaz completamente en React. Esto permitió una gestión más eficiente de los estados y la reutilización de componentes, facilitando la incorporación de nuevas funcionalidades como el contador de movimientos y el randomizador.

## 3.2 Contador de movimientos

Se implementó un contador de movimientos que incrementa cada vez que el usuario realiza una rotación de una capa del cubo. Este contador se muestra en la interfaz, permitiendo al usuario llevar un registro de sus movimientos.

## 3.3 Randomizador de movimientos

Se añadió un botón de randomizar que, al ser presionado, ejecuta una serie de movimientos aleatorios sobre el cubo. Esta funcionalidad simula el mezclado del cubo, proporcionando al usuario un inicio aleatorio para resolver el cubo.

## 3.4 Publicación de la aplicación web

La aplicación web fue desplegada públicamente en Netlify, facilitando el acceso y la compartición del proyecto. La página está disponible en el siguiente enlace:
**https://cubo-rubik-jm.netlify.app/**

# 4. Conclusión 
En esta práctica he demostrado la capacidad de integrar Three.js con React para crear una aplicación web interactiva y visualmente atractiva. La recreación del cubo de Rubik no solo cumplió con los requisitos básicos, sino que también se enriqueció con funcionalidades adicionales como el contador de movimientos y el randomizador, mejorando la experiencia del usuario. La decisión de utilizar React para la interfaz permitió una gestión eficiente de los estados y una fácil implementación de nuevas características, mientras que Three.js proporcionó las herramientas necesarias para manejar gráficos 3D de manera efectiva.
