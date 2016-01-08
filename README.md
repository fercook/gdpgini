# Cairo Charts
The Alberto Cairo chart for multiple countries (work in progress) [Test site] (http://www.bsc.es/viz/gini/)

Hasta ahora funciona: 
* Tomar datos de los ficheros CSV para cualquier pais en la lista de paises
* Graficar estos datos de forma conjunta (en un solo gráfico) o en varios gráficos separados
* Graficar valores absolutos o normalizados a un año en particular (hardcoded a 2000, podría ser una opción pero no le veo mucho valor)
* Calcular y graficar cambio porcentual año a año de PBI o GINI.
* Las etiquetas de años se ubican automáticamente intentando evitar la curva que pasa cerca. El algoritmo es super barato pero malo.
* Graficar con colores diferentes los períodos presidenciales.

He puesto otro gráfico que creo funciona bien: tomando el gráfico de cambio porcentual año a año, graficar la dirección del cambio para cada país y para cada año. Asi vemos mas fácil como a partir de 2003 los países del cono sur se mueven en la mejor dirección del gráfico (abajo a la derecha). Lo llamo gráfico de dirección. 

To Do:
* Arreglar el algoritmo de posicionamiento de etiquetas (de años) para que no se pisen entre ellos ni con la curva en caso de que le pase cerca (posibilidad: user algoritmo de fuerzas tipo [d3.layout.force] (https://github.com/mbostock/d3/wiki/Force-Layout)
* Pensar e implementar un algoritmo para posicionar las etiquetas de los presidentes.
* Rellenar los períodos presidenciales para todos los países (actualmente solo están los 6 paises del cono sur)
* Evaluar (entrevistas, comentarios, etc) si el gráfico de dirección funciona, y ver como mejorarlo.
* Ideas para interfaz general: 
  - Si se ponen mas países en el fichero countries.js estos aparecen automáticamente en el gráfico, tal como está. Se podría cambiar esto para que el usuario tenga un combo box y vaya eligiendo países para que aparezcan en el orden que toca.
  - Dejar que el usuario elija si quiere ver valores absolutos, normalizados, o diferencias de año a año.
* Decidir si las escalas de colores son buenas
* Arreglar etiquetas/nombres para el direction chart (los dos mejor?)
* Agregar ejes a la leyenda del direction chart (GINI y PBIpc)
* Arreglar bugs:
  - Los años del gráfico de dirección deberían acomodarse de manera responsive, es decir que si el ancho de la ventana se hace pequeño deberían desaparecer algunos (idea: usar el d3.svg.axis para pintarlos !)
  - Faltan los nombres de los ejes en TODOS los charts
