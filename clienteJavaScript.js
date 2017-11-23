/*
Cliente JavaScript
Rev: 0.2
Fecha: 23/11/2017
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
	$.get("http://ipinfo.io", function(response) {
		ipCliente = response.ip;
		
		console.log("Cliente iniciado... Enviando mensaje al monitor para arrancar");
	
		// Mensaje de inicio, Cliente --> Monitor
		sender(urlMonitor, Create_CM1(contadorMensajes, idCliente, urlMonitor, ipCliente), urlMonitor);

	}, "jsonp");
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


main()