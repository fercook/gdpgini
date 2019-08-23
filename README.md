# Cairo Charts
The Alberto Cairo chart for multiple countries  ([site](http://www.bsc.es/viz/gini/))

Hace falta ayuda para rellenar los períodos presidenciales para todos los países (actualmente solo están los 6 paises del cono sur). Para esto hay que arreglar/revisar/completar [este fichero](https://github.com/fercook/gdpgini/blob/master/data/presidents/presidents.csv)

To Do:

**Bugs**

* Arreglar el algoritmo de posicionamiento de etiquetas (de años) para que no se pisen entre ellos ni con la curva en caso de que le pase cerca
* Las etiquetas de años tambien podrían tener un color/tamaño diferente que los ticks de los ejes, se confunden.
* Buscar un algoritmo para posicionar las etiquetas de los PRESIDENTES de manera permanente (no con hover)
* Mejorar la diferencia de color entre periodos presidenciales para que se entienda y se pueda distinguir cuando estan todos los paises juntos.
* Intentar hacer mas visible/obvio el boton de agregar paises
* Arreglar la X para borrar pais
* Sacar boton de separar por pais cuando hay un solo pais...
* Cambiar imagen arriba "mas o menos" por "a medias" como la imagen de abajo.

**Features**

* Evaluar (entrevistas, comentarios, etc) si el gráfico de dirección funciona, y ver como mejorarlo.
* Probar en el gráfico de dirección agregar o reemplazar los colores por pequeños vectores. Puede hacerlo mas complejo pero permite poner mucha mas información.
* Probar como poner informacion de los periodos presidenciales en el grafico de direccion
   * Poner un boton para mostrar/ocultar presidentes
* "Zoom" feature para pasar del small multiples al grafico grande. 
* Etiqueta de % de cambio en el direction chart...
* Versión Ingles/Castellano
