# Cairo Charts
The Alberto Cairo chart for multiple countries (work in progress) ([Test site] (http://www.bsc.es/viz/gini/))

To Do:

**Bugs**

* Arreglar el algoritmo de posicionamiento de etiquetas (de años) para que no se pisen entre ellos ni con la curva en caso de que le pase cerca (posibilidad: user algoritmo de fuerzas tipo [d3.layout.force] (https://github.com/mbostock/d3/wiki/Force-Layout)
* Las etiquetas de años tambien podrían tener un color/tamaño diferente que los ticks de los ejes, se confunden.
* Pensar e implementar un algoritmo para posicionar las etiquetas de los PRESIDENTES.
* Rellenar los períodos presidenciales para todos los países (actualmente solo están los 6 paises del cono sur)
* Evaluar (entrevistas, comentarios, etc) si el gráfico de dirección funciona, y ver como mejorarlo.
* Mejorar la diferencia de color entre periodos presidenciales para que se entienda y se pueda distinguir cuando estan todos los paises juntos.
* Decidir si las escalas de colores son buenas
* Intentar hacer mas visible/obvio el boton de agregar paises
* Arreglar la X para borrar pais
* Sacar boton de separar por pais cuando hay un solo pais...

**Features**

* Probar en el gráfico de dirección agregar o reemplazar los colores por pequeños vectores. Puede hacerlo mas complejo pero permite poner mucha mas información.
* Probar como poner informacion de los periodos presidenciales en el grafico de direccion
* "Zoom" feature para pasar del small multiples al grafico grande. 
