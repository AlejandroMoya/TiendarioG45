/*
Cliente JavaScript
Rev: 0.5
Fecha: 05/12/2017
Autores: Alejandro Moya Moya
		 Jorge Valero Molina
		 Francisco Martinez Esteso
		 Miguel Ángel Cantero Víllora
UCLM - Escuela Superior de Ingeniería Informática Albacete
Sistemas Multiagentes 17/18
*/

var productos;
var tiendasConocidas;
var idCliente;
// Contador para insertar mensajes en el log
var num = 0;

// Producto: {Nombre: , Cantidad: }
// tiendasConocidas: {Id: , Direccion: , Tipo: , Visitado: (0 no visitada, 1 visitada)}
function main() {
	idCliente = 0;
	var urlMonitor = '172.19.178.3:8080/monitor/Mensajes/recibir.php'; // OJO: ponerlo en el html
	//var urlMonitor = $("#MonitorInput").val();
	console.log("El monitor se encuentra en la direccion " + urlMonitor);
	AddRow("El monitor se encuentra en la direccion " + urlMonitor);
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

	
	console.log("Cliente iniciado... Enviando mensaje al monitor para arrancar (Mensaje CM1)");
	AddRow("Cliente iniciado... Enviando mensaje al monitor para arrancar (Mensaje CM1)");
	// Mensaje de inicio, Cliente --> Monitor
	var estado = sender(urlMonitor, Create_CM1(idCliente, urlMonitor, ipCliente), urlMonitor);
	var estoyEnTienda = -1;
	
	if (estado != 200){
		return 1;
	}
	
	console.log("Has recibido lo siguiente del monitor: ");
	console.log("IDCliente: " + idCliente);
	console.log("Listado de la compra:")
	console.log(productos)
	console.log("Listado de tiendas conocidas:")
	console.log(tiendasConocidas)
	
	if (productos.length == 0 || tiendasConocidas.length == 0){
		console.log("ERROR: el monitor no te ha dado bien la lista de productos o las tiendas que conoces.")
		return 1;
	}
	
	// DEBUG: Si falta el monitor descomentar lo siguiente 
	/*
	idCliente = 123
	productos.push({Nombre: "P1", Cantidad:10})
	productos.push({Nombre: "P2", Cantidad:20})
	tiendasConocidas.push({Id:"T1", Direccion:urlMonitor , Tipo:"php" , Visitado: 0})
	tiendasConocidas.push({Id:"T2", Direccion:"172.19.158.78:5000/sendXML" , Tipo:"py" , Visitado: 1})
	console.log(productos)
	AddRow(productos);
	console.log(tiendasConocidas)
	AddRow(tiendasConocidas);
	*/
	
	var i;
	
	while(productos.length!= 0){
		estoyEnTienda = -1;
		console.log("Tienes que comprar los siguiente productos")
		AddRow("Tienes que comprar los siguiente productos");
		console.log(productos)
		AddRow(productos);
		while(estoyEnTienda == -1){
			for (i = 0; i< tiendasConocidas.length; i++){
				if (tiendasConocidas[i].Visitado == 0){
					estado = sender(tiendasConocidas[i].Direccion, Create_CT1(idCliente, tiendasConocidas[i].Id, ipCliente), urlMonitor);
					if (estado==101){
						console.log("Has entrado en la tienda " + tiendasConocidas[i].Direccion)
						tiendasConocidas[i].Visitado = 1;
						estoyEnTienda=i;
						break;
					} else if (estado == 100){
						console.log("La tienda " + tiendasConocidas[i].Direccion + " esta ocupada, intentalo mas tarde");
					} else if (estado == 400){
						console.log("ERROR 400, XML mal formado")
					} else if (estado == 404){
						tiendasConocidas.splice(i,1);
						i--;
					}
				}
			}		
		}
		
		console.log("Tienes que comprar los siguientes productos: ")
		AddRow("Tienes que comprar los siguientes productos: ");
		console.log(productos)
		AddRow(productos);
		// Si quedan productos por comprar, preguntar por nuevas tiendas
		//if (productos.length != 0){
		//	var j = 0;
		//	while(quedanSinVisitar() == false){
		//		console.log("Preguntando nuevas tiendas...");
		//		AddRow("Preguntando nuevas tiendas...");
				estado = sender(tiendasConocidas[estoyEnTienda].Direccion, Create_CT4(idCliente, tiendasConocidas[estoyEnTienda].Id, ipCliente), urlMonitor);
		//		if (j == 20){
		//			console.log("ERROR: el sistema no ha sido capaz de proporcionar nuevas tiendas...");
		//			AddRow("ERROR: el sistema no ha sido capaz de proporcionar nuevas tiendas...");
		//			break;
		//		}
		//		j++;
		//	}
		//}
		console.log("Saliendo de la tienda: " + tiendasConocidas[estoyEnTienda].Id)
		estado = sender(tiendasConocidas[estoyEnTienda].Direccion, Create_CT6(idCliente, tiendasConocidas[estoyEnTienda].Id, ipCliente), urlMonitor);
		//if (j == 20){
		//	break;
		//}
		if (quedanSinVisitar() == false){
			break;
		}
	}
	
	
	console.log("Enviando mensaje al monitor para finalizar el cliente (Mensaje CM3)")
	AddRow("Enviando mensaje al monitor para finalizar el cliente (Mensaje CM3)");
	var estado = sender(urlMonitor, Create_CM3(idCliente, urlMonitor, ipCliente), urlMonitor);
	console.log("Cliente ha terminado satisfactoriamente: gracias por jugar");
	AddRow("Cliente ha terminado satisfactoriamente: gracias por jugar");
	return 0;
}

function quedanSinVisitar(){
	for(var i=0; i < tiendasConocidas.length; i++){
		if (tiendasConocidas[i].Visitado == 0){
				return true;
			}
	}
	return false;
}


// Función que nos permite mandar un XML dada la URL de envio (direccion) y el mensaje (mensaje)
function sender(direccion, mensaje, dirMonitor) {
	// Mensaje enviado a la direccion deseada
	var estado=-1;
	$.ajax({
		url: 'http://' + direccion.replace("http://", "").replace(/\/\//g,"/"),
		data: mensaje,
		type: "POST",
		async: false,
		dataType: 'text',
		contentType: 'text/xml',

		beforeSend: function(request) {
			console.log("Mandando mensaje a: " + direccion);
			AddRow("Mandando mensaje a: " + direccion);
			console.log("Mensaje enviado: " + mensaje)
			AddRow("Mensaje enviado: " + mensaje);
		},

		success: function(response) {
			console.log("Mensaje recibido de " + direccion + ": " + response);
			AddRow("Mensaje recibido de " + direccion + ": " + response);
			estado=200; //Acierto, todo va bien
			// Dado que el mensaje se ha enviado correctamente, se replica al monitor
			// Solo se replicara si el destinatario del mensaje no era el monitor
			
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
				estado = 100; // Codigo de acierto 100: tienda ocupada 
			}
			else if (raiz == "TC3"){
				parser_TC3(response_xml);
				estado = 101; // Codigo de acierto 101: tienda no ocupada, has comprado 
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
				AddRow("ERROR: mensaje desconocido" + "Raiz Obtenida: " + raiz, "red");
				
				console.log("Mensaje: " + response);
				AddRow("Mensaje: " + response);
				console.log("Mensaje parseado: " + response_xml);
				AddRow("Mensaje parseado: " + response_xml);
			}
			if (direccion !== dirMonitor){
				var estadoMonitor = -1;
				while (estadoMonitor == -1){
					estadoMonitor = replicador(dirMonitor,mensaje);
				}

			}
			//El estado sigue a cero, por lo tanto todo va bien
			
		},

		error: function(response) {
			console.log("Error " + response.status + ": " + response.statusText);
			AddRow("Error " + response.status + ": " + response.statusText, "red");
			console.log(response.responseText);
			AddRow(response.responseText, "red");
			estado=response.status;
		}
	});
	return estado;
}

function replicador(urlMonitor, mensaje){
	var estado = -1;
	$.ajax({
		url: 'http://' + urlMonitor.replace("http://", "").replace(/\/\//g,"/"),                   
		data: mensaje,
		type: "POST",
		async: false,
		dataType: 'text',
		contentType: 'text/xml',

		beforeSend: function(request) {
			console.log("Mandando mensaje replica a Monitor: " + urlMonitor);
			AddRow("Mandando mensaje replica a Monitor: " + urlMonitor);
			console.log("Mensaje replicado enviado: " + mensaje);
			AddRow("Mensaje replicado enviado: " + mensaje);
		},

		success: function(response) {
			console.log("Exito mensaje Monitor: " + response);
			AddRow("Exito mensaje Monitor: " + response);
			estado = 0;
		},

		error: function(response) {
			console.log("Fallo envio monitor!")
			AddRow("Fallo envio monitor!", "red");
			console.log("Error " + response.status + ": " + response.statusText);
			AddRow("Error " + response.status + ": " + response.statusText, "red");
			console.log(response.responseText);
			AddRow(response.responseText, "red");
			estado=2; //Código de error 2: el mensaje no ha llegado al monitor
			//return estado;
		}
	});
	return estado;
	
}


// Funciones de creacion de mensajes XML
// Mensajes Cliente -> Monitor
// Mensaje de inicio
function Create_CM1(idCliente, urlMonitor, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<CM1>\
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
function Create_CM3(idCliente, urlMonitor, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<CM3>\
<emisor>' + idCliente + '</emisor> <!-- Codigo 0 no hay emisor -->\
<receptor>' + urlMonitor + '</receptor> <!-- IP del monitor -->\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<creador>' + ipCliente + '</creador> <!-- IP del cliente -->\
</time>\
</CM3>';
	return xml.replace('\t','').replace('\n','');
}


// Mensajes Cliente -> Tienda
// Mensaje de inicio
function Create_CT1(idCliente, idTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<CT1>\
<emisor>' + idCliente + '</emisor>\
<receptor>' + idTienda + '</receptor>\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<creador>' + ipCliente + '</creador>\
</time>\
<listaP>';
	var i;
	for (i=0; i< productos.length; i++){
		xml = xml + '<producto>\
<nombre>' + productos[i].Nombre + '</nombre>\
<cantidad>' + productos[i].Cantidad + '</cantidad>\
</producto>';
	}
	
	xml = xml + '</listaP>\
<listaT>';
	var i;
	for (i=0; i< tiendasConocidas.length; i++){
		xml = xml + '<tienda>\
<idTienda>' + tiendasConocidas[i].Id + '</idTienda>\
<direccion>' + tiendasConocidas[i].Direccion + '</direccion>\
<tipo>' + tiendasConocidas[i].Tipo + '</tipo>\
</tienda>';
	}
	
	xml = xml + '</listaT>\
</CT1>';

	return xml.replace('\t','').replace('\n','');
}

function Create_CT4(idCliente, idTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<CT4>\
<emisor>' + idCliente + '</emisor>\
<receptor>' + idTienda + '</receptor>\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<creador>' + ipCliente + '</creador>\
</time>\
</CT4>';

	return xml.replace('\t','').replace('\n','');
}


function Create_CT6(idCliente, idTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<CT6>\
<emisor>' + idCliente + '</emisor>\
<receptor>' + idTienda + '</receptor>\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<creador>' + ipCliente + '</creador>\
</time>\
</CT6>';

	return xml.replace('\t','').replace('\n','');
}

/* Este mensaje ya no se encuentra en la especificacion, se deberia de borrar ya
// Mensajes Cliente -> Cliente (Es Tienda!!!)
// Un cliente le pide a otro (una tienda!!!!) que le de el listado de tiendas
function Create_CC1(idCliente, urlTienda, ipCliente){
	xml = '<?xml version="1.0" encoding="UTF-8"?>\
<CC1>\
<emisor>' + idCliente + '</emisor>\
<receptor>' + urlTienda + '</receptor>\
<time>\
<timestamp>' + Date.now() + '</timestamp>\
<generador>' + ipCliente + '</generador>\
</time>\
</CC1>';

	return xml.replace('\t','').replace('\n','');
}
*/

// Este mensaje se recibirá cuando enviemos el mensaje CM1 (mensaje de inicialización)
// Este mensaje es una respuesta del monitor y con este mensaje se obtendrán las tiendas que conocemos y los productos que tenemos que comprar.
function parser_MC2(xml){
	// Obtenemos la ID asignada por el Monitor
	idCliente = xml.getElementsByTagName("receptor")[0].childNodes[0].nodeValue;
	// Obtenemos las tiendas que el monitor nos pasa, para ello localizamos la etiqueta "tienda"
	tiendas = xml.getElementsByTagName("tienda");
	var tienda;
	// Recorremos las veces que aparezca la etiqueta "tienda" en el XML, para así ir añadiendolo al Array de tiendasConocidas.
	for (var i=0; i < tiendas.length; i++){
		tienda = {Id: tiendas[i].getElementsByTagName("idTienda")[0].childNodes[0].nodeValue, Direccion: tiendas[i].getElementsByTagName("direccion")[0].childNodes[0].nodeValue, Tipo: tiendas[i].getElementsByTagName("tipo")[0].childNodes[0].nodeValue, Visitado: 0};
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
	
	// Codigo de acierto 0: todo se ha parseado correctamente.
	return 0;
}
// Este mensaje se recibirá cuando enviemos el mensaje CM3 (mensaje de finalización)
// Este mensaje es una respuesta del monitor.
function parser_MC4(xml){
	
	// Codigo de acierto 0: todo se ha parseado correctamente.
	return 0;
}
// Este mensaje se recibirá cuando enviemos el mensaje CT1 (mensaje de quiero entrar y estos son los productos que quiero)
// Este mensaje es una respuesta de la tienda para decirnos que no puede atendernos, esta llena.
function parser_TC2(xml){

	// Codigo de acierto 0: todo se ha parseado correctamente.
	return 0;
}

// Este mensaje se recibirá cuando enviemos el mensaje CT1 (mensaje de quiero entrar y estos son los productos que quiero)
// Este mensaje es una respuesta de la tienda para decirnos que hemos comprado X productos.
function parser_TC3(xml){
	
	// Obtenemos las productos que hemos comprado, para ello localizamos la etiqueta "producto"
	var productosComprados = xml.getElementsByTagName("producto");
	var producto;
	// Recorremos las veces que aparezca la etiqueta "producto" en el XML, para así ir descontando los productos que necesitamos.
	for (var i=0; i < productosComprados.length; i++){
		producto = {Nombre: productosComprados[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue, Cantidad: parseInt(productosComprados[i].getElementsByTagName("cantidad")[0].childNodes[0].nodeValue)};
		//Obtenemos la posicion donde se encontraria el producto que hemos comprado en nuestra lista de compra
		//var posicion = productos.indexOf(producto); NO FUNCIONA
		var posicion = -1;
		for(var j=0; j< productos.length; j++){
			if (productos[j].Nombre = producto.Nombre){
				posicion = j;
				break;
			}
		}
		//Procedemos a restar la cantidad comprada a la que necesitabamos.
		productos[posicion].Cantidad=productos[posicion].Cantidad-producto.Cantidad;
		// Si ya hemos comprado todo lo que necesitabamos, lo borramos de nuestro array
		if (productos[posicion].Cantidad == 0) {
			//Borramos esa posicion y recolocamos el vector
			productos.splice(posicion,1);
		}
	}
	
	// Codigo de acierto 0: todo se ha parseado correctamente.
	return 0;
	
}

// Este mensaje se recibirá cuando enviemos el mensaje CT4 (Dame Tiendas conocidas)
// Este mensaje es una respuesta de la tienda.
function parser_TC5(xml)
{

	var tiendas = [];
	// De la lista de clientes 'listaC' obtengo todos los elementos con etiqueta 'cliente'
	var nodoListaT = xml.getElementsByTagName("listaT")[0].getElementsByTagName("tienda");
	// Por cada nodo 'cliente' de la lista, obtengo el identificador y lo añado a la lista 'clientes'
	for (var i = 0; i < nodoListaT.length; i++)
	{
		var nom = nodoListaT[i].getElementsByTagName("idTienta")[0].innerHTML;
		var cant = nodoListaT[i].getElementsByTagName("direccion")[0].innerHTML;
		var cant = nodoListaT[i].getElementsByTagName("tipo")[0].innerHTML;
		var art = {nombre: nom, cantidad: cant}
		tiendas.push(art);
	}
	// Sustituyo el contenido de 'tiendasConocidas' por el de 'tiendas'
	tiendasConocidas = tiendas;

	// Codigo de acierto 0: todo se ha parseado correctamente.
	return 0;
}

// Este mensaje se recibe al enviar CT6 (Adiós)
// Confirmación de FIN (compra realizada y terminada)
function parser_TC7(xml)
{

	// Codigo de acierto 0: todo se ha parseado correctamente.
	return 0;
}

/* ACTUALMENTE EL CLIENTE NO PUEDE RECIBIR MENSAJES DE OTROS CLIENTES!!!!
// Respuesta de CC1 (Dame lista de tiendas conocidas)
function parser_CC2(xml)
{


	var tiendas = [];
	// De la lista de clientes 'tiendasConocidas' obtengo todos los elementos con etiqueta 'tienda'
	var nodoListaT = xml.getElementsByTagName("tiendasConocidas")[0].getElementsByTagName("tienda");
	// Por cada nodo 'tienda' de la lista, obtengo sus datos y lo guardo en la lista 'tiendas'
	for (var i = 0; i < nodoListaT.length; i++)
	{
		var id = nodoListaT[i].getElementsByTagName("id")[0].innerHTML;
		var ip = nodoListaT[i].getElementsByTagName("ip")[0].innerHTML;
		var tipo = nodoListaT[i].getElementsByTagName("tipo")[0].innerHTML;
		var nodoListaC = nodoListaT[i].getElementsByTagName("listaCompras")[0].getElementsByTagName("producto");
		var articulos = [];
		// Obtengo la lista de productos en 'listaCompras'
		for (var i = 0; i < nodoListaC.length; i++)
		{
			var nom = nodoListaC[i].getElementsByTagName("nombre")[0].innerHTML;
			var cant = nodoListaC[i].getElementsByTagName("cantidad")[0].innerHTML;
			var art = {nombre: nom, cantidad: cant}
			articulos.push(art);
		}
		tiendas.push({id:id,ip:ip,tipo:tipo,listaCompra:articulos});
	}
	// Sustituyo el contenido de 'tiendasConocidas' por el de 'tiendas'
	tiendasConocidas = tiendas;
	// Codigo de acierto 0: todo se ha parseado correctamente.
	return 0;
}
*/

// Función encargadad de añadir rows(filas o entradas) en la tabla 'log' de la interfaz.
// Parámetros:
// 		- text (string)

function AddRow(text, danger="black")
{
	var tableRef = document.getElementById('tablalog').getElementsByTagName('tbody')[0];
	
	// Insert a row in the table at the last row
	var newRow   = tableRef.insertRow(0);
	
	if (danger == "red") {
		newRow.className = "bg-danger";
	}
	if (danger == "yellow") {
		newRow.className = "bg-warning";
	}
	
	// Insert a cell in the row at index 0
	var newCellnumber  = newRow.insertCell(0);
	var newCell  = newRow.insertCell(1);

	// Append a text node to the cell
	var newNumber = document.createTextNode(num++);
	var newText  = document.createTextNode(text);
	newCellnumber.appendChild(newNumber);
	newCell.appendChild(newText);
}
