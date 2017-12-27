# TiendarioG45
Aplicación desarrollada en las prácticas de la asignatura de Sistemas Multiagentes.
Autores: Alejandro Moya Moya (https://www.linkedin.com/in/alejandro-moya-moya/ || https://github.com/AlejandroMoya)
		 Jorge Valero Molina (https://www.linkedin.com/in/jorge-valero-molina-0a2a0512b/ || https://github.com/JorgeValero)
		 Francisco Martinez Esteso
		 Miguel Ángel Cantero Víllora
UCLM - Escuela Superior de Ingeniería Informática Albacete
Sistemas Multiagentes 17/18 - 4º Computación

En esta aplicación se ha desarrollado un agente "Cliente" usando la tecnología JavaScript
que recibirá los datos necesarios del agente "Monitor" y realizará las compras en los agentes
"Tienda".


**FUNCIONAMIENTO**
Para hacer funcionar el agente, abrir el archivo clienteJavaScript.html en un navegador e introducir
la IP correspondiente al agente monitor. Por último, hacer click en "OK!" para que se inicie el agente.
Nota: para ver la ejecución del agente en tiempo real, iniciar el modo consola del navegador. En Chrome se
inicia pulsando las teclas: Ctrl + Mayus + I ; en Firefox es pulsando las teclas: Shift + F2 .
Sino, puede esperar a que el agente se ejecute por completo y muestre su ejecución en la misma web.
NOTA: para abrir varios agentes "Cliente", se debe de abrir tantas veces el fichero clienteJavaScript.html como
se desee.


**CÓDIGOS DURANTE EL ENVIO/RECEPCIÓN DE UN MENSAJE DEL SISTEMA**
 - Código -1: error genérico al enviar/recibir un mensaje.
 - Código 100: la tienda se encuentra ocupada, aforo completo.
 - Código 101: el agente "Cliente" ha podido entrar en la tienda.
 - Código 200: mensaje enviado/recibido correctamente.
 - Código 400: XML enviado mal formado, no reenviar el mensaje.
 - Código 404: tienda no encontrada, se borra la tienda del sistema.
 - Código 418: XML enviado erroneamente a un agente que no debería recibirlo.
 - Código 422: error semántico.
 - Código 429: XML erroneo, esperar un tiempo hasta volver a repetir el envio.
 - Código 415: no se ha enviado un XML.
 - Código 500: error interno en el agente emisor, si es una tienda, no enviar más mensajes.


**PROBLEMAS DURANTE EL DESARROLLO**
1. Al principo tuvimos problemas por la falta de familiarización con en lenguaje JavaScript en general.
2. Nos costó al principio entender como funciona la inclusión de JQuery en nuestro programa.
3. Una vez sabido como se envía un XML, nos costó mucho al enviarlo y al recibir la respuesta:
	3.1 Al enviarlo puesto que nos topamos con problemas con el CORS, problema que se solventó durante el desarrollo
		haciendo uso de una extensión en el navegador que lo desactivaba. Posteriormente descubrimos que era problema 
		de los otros agentes (Tienda y Monitor) y una vez lo solucionaron ellos, se pudo enviar sin hacer uso de la
		extensión.
	3.2 Al recibir, puesto que recibiamos la respuesta de manera asincrona, por lo tanto, tuvimos que definir el envio
		de manera sincrona, y nos costó dar con la solución.
4. Una vez con la respuesta, tuvimos un pequeño problema a la hora de saber como parsear un XML, pero una vez obtenida la
   raiz del XML recibido, parsealo fue extremádamente sencillo.
5. Como no tratabamos al principio los mensajes erroneos recibidos al enviar un mensaje, teníamos problemas en la ejecución
   del agente cuando se presentaba un problema, al final se solucionó interpretando los mensajes de error de manera adecuada.
6. Tuvimos problemas en la creación de los XML antes de enviarlo, puesto que se enviaban con caracteres extraños. Se solucionó,
creandolos de manera "fija" y evitando los saltos de línea y las tabulaciones.
   
**FALTO POR TESTEAR**
1. La inclusión de nuevas tiendas dadas por el agente "Tienda", puesto que el monitor siempre enviaba todas las tiendas que había
iniciado, y no dió tiempo a probar otro escenario.

**RESULTADO**
El agente funciona según lo esperado, tardando poco en conectar a las diferentes tiendas y en comprar todo lo que tiene que comprar.
El agente consigue finalizar su ejecución satisfactoriamente.
   