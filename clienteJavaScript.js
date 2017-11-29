/*
Cliente JavaScript
Rev: 0.3
Fecha: 29/11/2017
Autores: Alejandro Moya Moya
		 Jorge Valero Molina
UCLM - Escuela Superior de Ingeniería Informática Albacete
Sistemas Multiagentes 17/18
*/

var contadorMensajes;
var productos;
var tiendasConocidas;
// Producto: {Nombre: , Cantidad: }
// tiendasConocidas: {Direccion: , Visitado: (0 no visitada, 1 visitada)}
function main() {
	var idCliente = 0;
	var urlMonitor = 'clanjhoo.com:1880'; // OJO:Cambiar por la IP del monitor
	contadorMensajes = 0
	productos = [];
	tiendasConocidas = [];
	var ipCliente
	// Funcion jQuery que obtiene la ip de la maquina
	$.ajax({
		url: 'https://ipinfo.io/',
		async: false,
		dataType: 'json',
		contentType: 'application/j-son;charset=UTF-8',
		success: function (data) {
			ipCliente = data.ip
		}
	});

	
	console.log("Cliente iniciado... Enviando mensaje al monitor para arrancar");
	// Mensaje de inicio, Cliente --> Monitor
	//sender(urlMonitor, Create_CM1(contadorMensajes, idCliente, urlMonitor, ipCliente), urlMonitor);
/*
	var pepe = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><CM1><identificador>456</identificador><emisor>0</emisor><receptor>clanjhoo.com:1880</receptor><time><timestamp>1511871329825</timestamp><creador>161.67.174.38</creador></time><listaTiendas><tienda><id>1</id><ip>777</ip><tipo>4</tipo></tienda><tienda><id>2</id><ip>888</ip><tipo>6</tipo></tienda></listaTiendas><listaCompras><producto><nombre>patata</nombre><cantidad>3</cantidad></producto><producto><nombre>pafsd</nombre><cantidad>6</cantidad></producto></listaCompras></CM1><TC2/></root>'
	var parser = new DOMParser();
	var response_xml = parser.parseFromString(pepe,"text/xml");
	parser_MC2(response_xml);
	*/
}




// Función que nos permite mandar un XML dada la URL de envio (direccion) y el mensaje (mensaje)
function sender(direccion, mensaje, dirMonitor) {
	// Mensaje enviado a la direccion deseada
	console.log(direccion)
	$.ajax({
		url: 'http://' + direccion.replace("http://", "").replace(/\/\//g,"/"),             
		data: mensaje,
		type: "POST",
		dataType: 'text',
		contentType: 'text/xml',

		beforeSend: function(request) {
			console.log("Mandando mensaje a: " + direccion);
		},

		success: function(response) {
			console.log("Mensaje recibido: " + response);
			contadorMensajes++;
			
			// Dado que el mensaje se ha enviado correctamente, se replica al monitor
			// Mensaje replica para el monitor
			if (direccion !== dirMonitor){
				$.ajax({
					url: dirMonitor,                   
					type: "POST",               
					data: mensaje,                                                      
					contentType: "text/xml",

					beforeSend: function(request) {
						console.log("Mandando mensaje a Monitor: " + dirMonitor);
					},

					success: function(response) {
						console.log("Monitor: " + response);
						var parser = new DOMParser();
						var response_xml = parser.parseFromString(response,"text/xml");
						var raiz = response_xml.documentElement.tagName
						if (raiz == "MC2"){
							parser_MC2(response_xml);
						}
						else if (raiz == "MC4"){
							parser_MC4(response_xml);
						}
						else if (raiz == "TC2"){
							parser_TC2(response_xml);
						}
						else if (raiz == "TC3"){
							parser_TC3(response_xml);
						}
						else if (raiz == "TC5"){
							parser_TC5(response_xml);
						}
						else if (raiz == "TC7"){
							parser_TC7(response_xml);
						}
						else if (raiz == "CC2"){
							parser_CC2(response_xml);
						}
						else {
							console.log("ERROR: mensaje desconocido" + "Raiz Obtenida: " + raiz);
							console.log("Mensaje: " + response);
							console.log("Mensaje parseado: " + response_xml);
						}
						
						
					},

					error: function(response) {
						console.log("Monitor:" + response);
					}
				});
			}
			else {
				var parser = new DOMParser();
				var response_xml = parser.parseFromString(response,"text/xml");
				var raiz = response_xml.documentElement.tagName;
				if (raiz == "MC2"){
					parser_MC2(response_xml);
				}
				else if (raiz == "MC4"){
					parser_MC4(response_xml);
				}
				else if (raiz == "TC2"){
					parser_TC2(response_xml);
				}
				else if (raiz == "TC3"){
					parser_TC3(response_xml);
				}
				else if (raiz == "TC5"){
					parser_TC5(response_xml);
				}
				else if (raiz == "TC7"){
					parser_TC7(response_xml);
				}
				else if (raiz == "CC2"){
					parser_CC2(response_xml);
				}
				else {
					console.log("ERROR: mensaje desconocido --" + " Raiz Obtenida: " + raiz);
					console.log("Mensaje: " + response);
					console.log("Mensaje parseado: " + response_xml);
				}
			}
			
		},

		error: function(response) {
			console.log(response);
		}
	});
}


// Funciones de creacion de mensajes XML
// Mensajes Cliente -> Monitor
// Mensaje de inicio
function Create_CM1(contadorMensajes, idCliente, urlMonitor, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8"?>\
<CM1>\
<identificador>' + contadorMensajes + '</identificador>\
<emisor>' + idCliente + '</emisor>\
<receptor>' + urlMonitor + '</receptor>\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<creador>' + ipCliente + '</creador>\
</time>\
</CM1>';
	return xml.replace('\t','').replace('\n','');
}

// Mensaje de fin
function Create_CM3(contadorMensajes, idCliente, urlMonitor, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8"?>\
<CM3>\
<identificador>' + contadorMensajes + '</identificador> <!-- Identificador del mensaje-->\
<emisor>' + idCliente + '</emisor> <!-- Codigo 0 no hay emisor -->\
<receptor>' + urlMonitor + '</receptor> <!-- IP del monitor -->\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<creador>' + ipCliente + '</creador> <!-- IP del cliente -->\
</time>\
</CM3>';

	return xml;
}


// Mensajes Cliente -> Tienda
// Mensaje de inicio
function Create_CT1(contadorMensajes, idCliente, urlTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8"?>\
<CT1>\
<idMensaje>' + contadorMensajes + '</idMensaje> <!-- Identificador del mensaje-->\
<emisor>' + idCliente + '</emisor> <!-- Codigo 0 no hay emisor -->\
<receptor>' + urlTienda + '</receptor> <!-- IP del monitor -->\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<creador>' + ipCliente + '</creador> <!-- IP del cliente -->\
</time>\
<listaP>';
	var i;
	for (i=0; i< productos.length; i++){
		xml = xml + '<producto>\
<nombre>' + productos[i].nombre + '</nombre>\
<cantidad>' + produtos[i].cantidad + '</cantidad>\
</producto>';
	}
	
	xml = xml + '</listaP>\
</CT1>';

	return xml;
}

function Create_CT4(contadorMensajes, idCliente, urlTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8"?>\
<mensajeCT4>\
<identificador>' + contadorMensajes + '</identificador> <!-- Identificador del mensaje-->\
<emisor>' + idCliente + '</emisor> <!-- Codigo 0 no hay emisor -->\
<receptor>' + urlMonitor + '</receptor> <!-- IP del monitor -->\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<generador>' + ipCliente + '</generador> <!-- IP del cliente -->\
</time>\
</mensajeCT4>';

	return xml;
}


function Create_CT6(contadorMensajes, idCliente, urlTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8"?>\
<mensajeCT6>\
<identificador>' + contadorMensajes + '</identificador> <!-- Identificador del mensaje-->\
<emisor>' + idCliente + '</emisor> <!-- Codigo 0 no hay emisor -->\
<receptor>' + urlMonitor + '</receptor> <!-- IP del monitor -->\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<generador>' + ipCliente + '</generador> <!-- IP del cliente -->\
</time>\
</mensajeCT6>';

	return xml;
}

// Mensajes Cliente -> Cliente
// Un cliente le pide a otro que le de el listado de tiendas
function Create_CC1(contadorMensajes, idCliente, urlTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8"?>\
<CC1>\
<identificador>' + contadorMensajes + '</identificador> <!-- Identificador del mensaje-->\
<emisor>' + idCliente + '</emisor> <!-- Codigo 0 no hay emisor -->\
<receptor>' + urlMonitor + '</receptor> <!-- IP del monitor -->\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<generador>' + ipCliente + '</generador> <!-- IP del cliente -->\
</time>\
</CC1>';

	return xml;
}

// Este mensaje se recibirá cuando enviemos el mensaje CM1 (mensaje de inicialización)
// Este mensaje es una respuesta del monitor y con este mensaje se obtendrán las tiendas que conocemos y los productos que tenemos que comprar.
function parser_MC2(xml){
	
	var contadorMensajesR = xml.getElementsByTagName("identificador")[0].childNodes[0].nodeValue;
	if (contadorMensajesR == (contadorMensajes+1)){
		contadorMensajes++;
	}else{
		// Codigo de error 0: el contador de mensajes no coincide con la respuesta.
		return 0;
	}
	
	// Obtenemos las tiendas que el monitor nos pasa, para ello localizamos la etiqueta "tienda"
	tiendas = xml.getElementsByTagName("tienda");
	var tienda;
	// Recorremos las veces que aparezca la etiqueta "tienda" en el XML, para así ir añadiendolo al Array de tiendasConocidas.
	for (var i=0; i < tiendas.length; i++){
		tienda = {Id: tiendas[i].getElementsByTagName("id")[0].childNodes[0].nodeValue, Direccion: tiendas[i].getElementsByTagName("ip")[0].childNodes[0].nodeValue, Tipo: tiendas[i].getElementsByTagName("tipo")[0].childNodes[0].nodeValue, Visitado: 0};
		tiendasConocidas.push(tienda);
	}
	
	// Obtenemos los productos a comprar que el monitor nos indica, para ello localizamos la etiqueta "producto"
	compras = xml.getElementsByTagName("producto");
	var compra;
	// Recorremos las veces que aparezca la etiqueta "producto" en el XML, para así ir añadiendolo al Array de productos.
	for (var i=0; i < compras.length; i++){
		compra = {Nombre: compras[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue, Cantidad: compras[i].getElementsByTagName("cantidad")[0].childNodes[0].nodeValue};
		productos.push(compra);
	}
	
	// Codigo de acierto 1: todo se ha parseado correctamente.
	return 1;
}
// Este mensaje se recibirá cuando enviemos el mensaje CM3 (mensaje de finalización)
// Este mensaje es una respuesta del monitor.
function parser_MC4(xml){

	var contadorMensajesR = xml.getElementsByTagName("identificador")[0].childNodes[0].nodeValue;
	if (contadorMensajesR == (contadorMensajes+1)){
		contadorMensajes++;
	}else{
		// Codigo de error 0: el contador de mensajes no coincide con la respuesta.
		return 0;
	}
	// Codigo de acierto 1: todo se ha parseado correctamente.
	return 1;
}
// Este mensaje se recibirá cuando enviemos el mensaje CT1 (mensaje de quiero entrar y estos son los productos que quiero)
// Este mensaje es una respuesta de la tienda para decirnos que no puede atendernos, esta llena.
function parser_TC2(xml){
	var contadorMensajesR = xml.getElementsByTagName("idMensaje")[0].childNodes[0].nodeValue;
	if (contadorMensajesR == (contadorMensajes+1)){
		contadorMensajes++;
	}else{
		// Codigo de error 0: el contador de mensajes no coincide con la respuesta.
		return 0;
	}
	// Codigo de acierto 1: todo se ha parseado correctamente.
	return 1;
}
// Este mensaje se recibirá cuando enviemos el mensaje CT1 (mensaje de quiero entrar y estos son los productos que quiero)
// Este mensaje es una respuesta de la tienda para decirnos que hemos comprado X productos.
function parser_TC3(xml){
	
	var contadorMensajesR = xml.getElementsByTagName("idMensaje")[0].childNodes[0].nodeValue;
	if (contadorMensajesR == (contadorMensajes+1)){
		contadorMensajes++;
	}else{
		// Codigo de error 0: el contador de mensajes no coincide con la respuesta.
		return 0;
	}
	
	// Obtenemos las productos que hemos comprado, para ello localizamos la etiqueta "producto"
	productosComprados = xml.getElementsByTagName("producto");
	var producto;
	// Recorremos las veces que aparezca la etiqueta "producto" en el XML, para así ir descontando los productos que necesitamos.
	for (var i=0; i < productos.length; i++){
		producto = {Nombre: productosComprados[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue, Cantidad: productosComprados[i].getElementsByTagName("cantidad")[0].childNodes[0].nodeValue};
		//Obtenemos la posicion donde se encontraria el producto que hemos comprado en nuestra lista de compra
		var posicion = productos.indexOf(producto);
		//Procedemos a restar la cantidad comprada a la que necesitabamos.
		productos[posicion].Cantidad=productos[posicion].Cantidad-producto.Cantidad;
		// Si ya hemos comprado todo lo que necesitabamos, lo borramos de nuestro array
		if (productos[posicion].Cantidad == 0) {
			//Borramos esa posicion y recolocamos el vector
			productos.splice(posicion,1);
		}
	}
	
	// Codigo de acierto 1: todo se ha parseado correctamente.
	return 1;
	
}

main()