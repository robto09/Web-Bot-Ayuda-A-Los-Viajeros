/*global $ */

$("#AirlinesErrors").hide();
$("#TrainlinesErrors").hide();
$("#BuslinesErrors").hide();
$("#TaxilinesErrors").hide();
$(".contenedorTabla2").hide();
$(".contenedorTabla3").hide();
$(".contenedorTabla4").hide();
var myTable, myTableTrains, myTableBuses, btnAviones, finalRuta, url='https://floating-river-23216.herokuapp.com/';
function returnNumLineasAereas(data) {
	'use strict';
	return data.rdo;
}

$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasAereas",
	success	: function (data, textStatus, jqXHR) {
		$(".numAirlines").text(data.rdo)
		myTable = $("#example").DataTable({
			"ajax":{
				"url":url+"api/web-bot/getLineasAereas",
				"type" :"GET",
				dataSrc : function(json) {
					console.log(json.rdo)
					return json.rdo
				}
			}
		});
	}
});

$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasTren",
	success	: function (data, textStatus, jqXHR) {
		$(".numTrainLines").text(data.rdo)
		myTableTrains = $("#tablaTrenes").DataTable({
			"ajax":{
				"url":url+"api/web-bot/getLineasTren",
				"type" :"GET",
				dataSrc : function(json) {
					console.log(json.rdo)
					return json.rdo
				}
			}
		});
	}
});

$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasBus",
	success	: function (data, textStatus, jqXHR) {
		$(".numBusLines").text(data.rdo)
		myTableBuses = $("#tablaBuses").DataTable({
			"ajax":{
				"url":url+"api/web-bot/getLineasBus",
				"type" :"GET",
				dataSrc : function(json) {
					console.log(json.rdo)
					return json.rdo
				}
			}
		});
	}
});

$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasTaxi",
	success	: function (data, textStatus, jqXHR) {
		$(".numTaxiLines").text(data.rdo)
		myTableTaxis = $("#tablaTaxis").DataTable({
			"ajax":{
				"url":url+"api/web-bot/getLineasTaxis",
				"type" :"GET",
				dataSrc : function(json) {
					console.log(json.rdo)
					return json.rdo
				}
			}
		});
	}
});

var convertirFecha = function(p_fecha) {
	l_fecha_hora = p_fecha.split(' ')
	l_fecha = l_fecha_hora[0].split('/');
	dia = l_fecha[1];
	mes = l_fecha[0];
	anio = l_fecha[2];
	return new Date(dia+'/'+mes+'/'+anio+' '+l_fecha_hora[1])
}

function getCookie(cname) {
	'use strict';
	var name, decodedCookie, ca, i, c;
	name = cname + "=";
	decodedCookie = decodeURIComponent(document.cookie);
	ca = decodedCookie.split(';');
	for (i = 0; i < ca.length; i += 1) {
		c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "asd";
}
$("label[for='usuario']").html(getCookie("userModal"));

var options = {limon : 'Limón', tamarindo : 'Tamarindo', liberia : 'Liberia', SanJose : 'San José'}, $select = $('#InicioRuta'), $select2 = $('#FinalRuta'), $select3 = $('#InicioRutaTren'), $select4 = $("#FinalRutaTren"), $select5 = $("#InicioRutaBus"), $select6 = $('#FinalRutaBus'), $select7 = $("#InicioRutaTaxi"), $select8 = $('#FinalRutaTaxi'), defecto = 'San José', val, $option;

for (val in options) {
  $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
  if (val === defecto) {
    $option.attr('selected', 'selected');
  }
  //console.log($option);
  $select.append($option);
}
for (val in options){
    $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
    if (val == defecto) {
            $option.attr('selected', 'selected');
    }
    console.log($option);
    $select2.append($option);
}

for (val in options) {
  $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
  if (val === defecto) {
    $option.attr('selected', 'selected');
  }
  //console.log($option);
  $select3.append($option);
}
for (val in options){
    $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
    if (val == defecto) {
            $option.attr('selected', 'selected');
    }
    console.log($option);
    $select4.append($option);
}

for (val in options) {
  $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
  if (val === defecto) {
    $option.attr('selected', 'selected');
  }
  //console.log($option);
  $select5.append($option);
}
for (val in options){
    $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
    if (val == defecto) {
            $option.attr('selected', 'selected');
    }
    console.log($option);
    $select6.append($option);
}

for (val in options){
    $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
    if (val == defecto) {
            $option.attr('selected', 'selected');
    }
    console.log($option);
    $select7.append($option);
}

for (val in options){
    $option = $('<option value="' + options[val] + '">' + options[val] + '</option>');
    if (val == defecto) {
            $option.attr('selected', 'selected');
    }
    console.log($option);
    $select8.append($option);
}


if(getCookie("userModal") === "asd") {
	window.open("/", "_self","",false);
}

btnAviones = document.getElementById('btnAviones')
if (btnAviones != null) {

		btnAviones.onclick = function() {
			'use strict';
			$("#coloresPanel").addClass('panel-primary');
			$("#coloresPanel").removeClass('panel-green');
			$("#coloresPanel").removeClass('panel-red');
			$("#coloresPanel").removeClass('panel-yellow');
			$(".titlistados").text("Listado de líneas aereas");
			$(".contenedorTabla1").show();
			$(".contenedorTabla2").hide();
			$(".contenedorTabla3").hide();
			$(".contenedorTabla4").hide();
	}
}

var comprobarHabilitar = function() {
	'use strict';
	var aeroName, pasajeros, intervalo, inicioRuta, finalRuta, intervalo, precio;
	aeroName = $('#aeroName');
	pasajeros = $('#Pasajeros');
	inicioRuta = $('#InicioRuta').val();
	finalRuta = $('#FinalRuta').val();
	intervalo = $('#Intervalo');
	precio = $('#PrecioAvion');
	if (aeroName.val() != '' && pasajeros.val() != '' && intervalo.val() != '' && precio.val() != '' && inicioRuta != finalRuta) {
		$('#btnGrabarSeguir').prop('disabled',false);
	}

}

finalRuta = document.getElementById('FinalRuta');
if (finalRuta != null) {
	finalRuta.onchange = function () {
		'use strict';
		if( $("#InicioRuta").val() === $("#FinalRuta").val()) {
			$("#AirlinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
			$("#AirlinesErrors").show();
		} else {
			$("#AirlinesErrors").hide();
		}
	}	
	finalRuta.onblur = function () {
		'use strict';
		if( $("#InicioRuta").val() === $("#FinalRuta").val()) {
			$("#AirlinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
			$("#AirlinesErrors").show();
			$("#FinalRuta").select();
		} else {
			$("#AirlinesErrors").hide();
		}
	}
}


document.getElementById('InicioRuta').onblur = function () {
	'use strict';
	if( $("#InicioRuta").val() === $("#FinalRuta").val()) {
		$("#AirlinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#AirlinesErrors").show();
		$("#FinalRuta").select();
	} else {
		$("#AirlinesErrors").hide();
	}
}

document.getElementById('aeroName').onblur = function () {
	comprobarHabilitar();
}

document.getElementById('Intervalo').onblur = function () {
	'use strict';
	comprobarHabilitar();
}

document.getElementById('PrecioAvion').onblur = function () {
	'use strict';
	comprobarHabilitar();
}


document.getElementById('Pasajeros').onblur = function () {
	'use strict';
	comprobarHabilitar();
}

document.getElementById('btnGrabarSeguir').onclick = function () {
	'use strict';
	var aeroLinea 	= $("#aeroName").val(),
			inicioRuta 	= $("#InicioRuta").val(),
			finalRuta 	= $("#FinalRuta").val(),
			pasajeros 	= $("#Pasajeros").val(),
			intervalo 	= $("#Intervalo").val(),
			precio		 	= $("#PrecioAvion").val(),
			numAirlines = $(".numAirlines"),
			newNumberAL	= parseInt($(".numAirlines").text()),
			formData;
	
	formData = {aeroLinea : aeroLinea, inicioRuta : inicioRuta,
						 finalRuta : finalRuta, pasajeros : pasajeros, intervalo : intervalo,
						 precio:precio}
	$.ajax({
		type 		: "POST",
		url  		: url+"api/web-bot/creaAerolinea",
		data 		: formData,
		success	: function (data, textStatus, jqXHR) {
			$("#AirlinesErrors").hide();
			$('.form-control').val('');			
			newNumberAL += 1;
			numAirlines.text(newNumberAL)
			$('#aeroName').select();
			$('#btnGrabarSeguir').prop('disable',true)			
			myTable.ajax.reload();
		},
		error		: function (jqXHR, textStatus, errorThrown) {
			$("#AirlinesErrors").text("No se ha podido realizar la inserción");
			$("#AirlinesErrors").show();			
		}		
	})
	
}

//Controles modal Líneas Ferroviarias
document.getElementById('btnTrenes').onclick = function() {
	'use strict';
	$("#coloresPanel").removeClass('panel-primary');
	$("#coloresPanel").addClass('panel-green');
	$("#coloresPanel").removeClass('panel-red');
	$("#coloresPanel").removeClass('panel-yellow');
	$(".titlistados").text("Listado de líneas ferroviarias");
	$(".contenedorTabla1").hide();
	$(".contenedorTabla2").show();
	$(".contenedorTabla3").hide();
	$(".contenedorTabla4").hide();
}
document.getElementById('modalTrain').onclick = function () {
	'use strict';
	$('#btnTrenes').click();
}

var comprobarHabilitarTrenes = function() {
	'use strict';
	var trainName, pasajeros, intervalo, precio, inicioRuta, finalRuta, intervalo
	trainName = $('#trainName');
	inicioRuta = $('#InicioRutaTren').val();
	finalRuta = $('#FinalRutaTren').val();
	intervalo = $('#IntervaloTren');
	precio	  = $('#PrecioTren');
	if (trainName.val() != ''  && intervalo.val() != '' && precio.val() != '' && inicioRuta != finalRuta) {
		$('#btnGrabarSeguirTren').prop('disabled',false);
	}

}

document.getElementById('trainName').onblur = function () {
	comprobarHabilitarTrenes();
}

document.getElementById('IntervaloTren').onblur = function () {
	'use strict';
	comprobarHabilitarTrenes();
}

document.getElementById('PrecioTren').onblur = function () {
	'use strict';
	comprobarHabilitarTrenes();
}


document.getElementById('FinalRutaTren').onchange = function () {
	'use strict';
	if( $("#InicioRutaTren").val() === $("#FinalRutaTren").val()) {
		$("#TrainlinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#TrainlinesErrors").show();
	} else {
		$("#TrainlinesErrors").hide();
		comprobarHabilitarTrenes();
	}
}

document.getElementById('FinalRutaTren').onblur = function () {
	'use strict';
	if( $("#InicioRutaTren").val() === $("#FinalRutaTren").val()) {
		$("#TrainlinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#TrainlinesErrors").show();
	} else {
		$("#TrainlinesErrors").hide();
		comprobarHabilitarTrenes
	}
}

document.getElementById('InicioRutaTren').onblur = function () {
	'use strict';
	if( $("#InicioRutaTren").val() === $("#FinalRutaTren").val()) {
		$("#TrainlinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#TrainlinesErrors").show();
	} else {
		$("#TrainlinesErrors").hide();
		comprobarHabilitarTrenes();
	}
}


document.getElementById('btnGrabarSeguirTren').onclick = function () {
	'use strict';
	var agenciaTren 	= $("#trainName").val(),
			inicioRuta 	= $("#InicioRutaTren").val(),
			finalRuta 	= $("#FinalRutaTren").val(),
			intervalo		= $("#IntervaloTren").val(),
			precio	  	= $("#PrecioTren").val(),
			numTrainLines = $(".numTrainLines"),
			newNumberAL	= parseInt($(".numTrainLines").text()),			
			formData, myAjax;
	
	formData = {agenciaTren : agenciaTren, inicioRutaTren : inicioRuta,
						 finalRutaTren : finalRuta, precioTren : precio, intervaloTren : intervalo}
	
	console.log(formData);
	myAjax = $.ajax({
		type 		: "POST",
		url  		: url+"api/web-bot/creaLineaTren",
		data 		: formData,
		success	: function (data, textStatus, jqXHR) {
			console.log('Todo ha ido bien...')
			$("#TrainlinesErrors").hide();
			$('.form-control').val('');			
			newNumberAL += 1;
			numTrainLines.text(newNumberAL)
			$('#TrainName').select();
			$('#btnGrabarSeguirTren').prop('disable',true)			
			myTableTrains.ajax.reload();
		},
		error		: function (jqXHR, textStatus, errorThrown) {
			$("#TrainlinesErrors").text("No se ha podido realizar la inserción");
			$("#TrainlinesErrors").show();			
		}		
	});
	myAjax = null;
	
}

//Controles modal Líneas de Autobus
document.getElementById('btnBus').onclick = function() {
	'use strict';
	$("#coloresPanel").removeClass('panel-primary');
	$("#coloresPanel").removeClass('panel-green');
	$("#coloresPanel").addClass('panel-red');
	$("#coloresPanel").removeClass('panel-yellow');
	$(".titlistados").text("Listado de líneas de Bus");
	$(".contenedorTabla1").hide();
	$(".contenedorTabla2").hide();
	$(".contenedorTabla3").show();
	$(".contenedorTabla4").hide();
}
document.getElementById('modalBus').onclick = function () {
	'use strict';
	$('#btnBus').click();
}

var comprobarHabilitarBuses = function() {
	'use strict';
	var busName, driver, inicioRuta, finalRuta, intervalo, precio, capacidad, asignacion
	busName  = $('#busName');
	driver 		 = $('#driverName');
	inicioRuta = $('#InicioRutaBus').val();
	finalRuta  = $('#FinalRutaBus').val();
	intervalo  = $('#IntervaloBus');
	precio	   = $('#PrecioBus');
	capacidad  = $('#CapacidadBus');
	asignacion = $('#AsignacionBus');
	if (busName.val() != '' && driver.val()  && intervalo.val() != '' && precio.val() != '' && capacidad.val() != '' && asignacion.val() != '' && inicioRuta != finalRuta) {
		$('#btnGrabarSeguirBus').prop('disabled',false);
	}

}

document.getElementById('busName').onblur = function () {
	'use strict';
	comprobarHabilitarBuses();
}

document.getElementById('driverName').onblur = function () {
	'use strict';
	comprobarHabilitarBuses();
}


document.getElementById('IntervaloBus').onblur = function () {
	'use strict';
	comprobarHabilitarBuses();
}

document.getElementById('PrecioBus').onblur = function () {
	'use strict';
	comprobarHabilitarBuses();
}

document.getElementById('CapacidadBus').onblur = function () {
	'use strict';
	comprobarHabilitarBuses();
}

document.getElementById('AsignacionBus').onblur = function () {
	'use strict';
	comprobarHabilitarBuses();
}


document.getElementById('FinalRutaBus').onchange = function () {
	'use strict';
	if( $("#InicioRutaBus").val() === $("#FinalRutaBus").val()) {
		$("#BuslinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#BuslinesErrors").show();
	} else {
		$("#BuslinesErrors").hide();
		comprobarHabilitarBuses();
	}
}

document.getElementById('FinalRutaBus').onblur = function () {
	'use strict';
	if( $("#InicioRutaBus").val() === $("#FinalRutaBus").val()) {
		$("#BuslinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#BuslinesErrors").show();
	} else {
		$("#BuslinesErrors").hide();
		comprobarHabilitarBuses();
	}
}

document.getElementById('InicioRutaBus').onblur = function () {
	'use strict';
	if( $("#InicioRutaBus").val() === $("#FinalRutaBus").val()) {
		$("#BuslinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#BuslinesErrors").show();
	} else {
		$("#BuslinesErrors").hide();
		comprobarHabilitarBuses();
	}
}


document.getElementById('btnGrabarSeguirBus').onclick = function () {
	'use strict';
	var agenciaBus 	= $("#busName").val(),
			conductor 	= $("#driverName").val(),
			inicioRuta 	= $("#InicioRutaBus").val(),
			finalRuta 	= $("#FinalRutaBus").val(),
			intervalo		= $("#IntervaloBus").val(),
			precio	  	= $("#PrecioBus").val(),
			capacidad   = $('#CapacidadBus').val(),
			asignacion  = $('#AsignacionBus').val(),
			numBusLines = $(".numBusLines"),
			newNumberAL	= parseInt($(".numBusLines").text()),			
			formData;
	
	formData = {agenciaBus : agenciaBus, inicioRuta : inicioRuta,
						 finalRuta : finalRuta, precio : precio, intervalo : intervalo,
						 conductor: conductor, capacidad:capacidad, asignacion:asignacion}
	
	console.log(formData);
	$.ajax({
		type 		: "POST",
		url  		: url+"api/web-bot/creaLineaBus",
		data 		: formData,
		success	: function (data, textStatus, jqXHR) {
			console.log('Todo ha ido bien...')
			$("#BuslinesErrors").hide();
			$('.form-control').val('');			
			newNumberAL += 1;
			numBusLines.text(newNumberAL)
			$('#BusName').select();
			$('#btnGrabarSeguirTren').prop('disable',true)			
			myTableBuses.ajax.reload();
		},
		error		: function (jqXHR, textStatus, errorThrown) {
			$("#BuslinesErrors").text("No se ha podido realizar la inserción");
			$("#BuslinesErrors").show();			
		}		
	});
	
}

//Controles modal Líneas de Taxis
document.getElementById('btnTaxi').onclick = function() {
	'use strict';
	$("#coloresPanel").removeClass('panel-primary');
	$("#coloresPanel").removeClass('panel-green');
	$("#coloresPanel").removeClass('panel-red');
	$("#coloresPanel").addClass('panel-yellow');
	$(".titlistados").text("Listado de líneas de Taxi");
	$(".contenedorTabla1").hide();
	$(".contenedorTabla2").hide();
	$(".contenedorTabla3").hide();
	$(".contenedorTabla4").show();
}
document.getElementById('modalTaxi').onclick = function () {
	'use strict';
	$('#btnTaxi').click();
}

var comprobarHabilitarTaxis = function() {
	'use strict';
	var taxiName, iddriver, taxidrivername, taxidriverln, inicioRuta, finalRuta,precio, placa;
	
	taxiName   = $('#TaxiName');
	iddriver 	 = $('#idDriver');
	taxidrivername 	 = $('#taxiDriverName');
	taxidriverln 	 = $('#taxiDriveLastName');
	inicioRuta = $('#InicioRutaTaxi').val();
	finalRuta  = $('#FinalRutaTaxi').val();
	precio	   = $('#PrecioTaxi');
	placa			 = $('#PlacaTaxi');
	if (taxiName.val() != '' && iddriver.val()  && taxidrivername.val() != '' && taxidriverln.val() != '' && precio.val() != '' && placa != '' && inicioRuta != finalRuta) {
		$('#btnGrabarSeguirTaxi').prop('disabled',false);
	}

}

document.getElementById('TaxiName').onblur = function () {
	'use strict';
	comprobarHabilitarTaxis();
}

document.getElementById('idDriver').onblur = function () {
	'use strict';
	comprobarHabilitarTaxis();
}

document.getElementById('taxiDriverName').onblur = function () {
	'use strict';
	comprobarHabilitarTaxis();
}

document.getElementById('taxiDriverLastName').onblur = function () {
	'use strict';
	comprobarHabilitarTaxis();
}

document.getElementById('PrecioTaxi').onblur = function () {
	'use strict';
	comprobarHabilitarTaxis();
}

document.getElementById('PlacaTaxi').onblur = function () {
	'use strict';
	comprobarHabilitarTaxis();
}



document.getElementById('FinalRutaTaxi').onchange = function () {
	'use strict';
	if( $("#InicioRutaTaxi").val() === $("#FinalRutaTaxi").val()) {
		$("#TaxilinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#TaxilinesErrors").show();
	} else {
		$("#TaxilinesErrors").hide();
		comprobarHabilitarTaxis();
	}
}

document.getElementById('FinalRutaTaxi').onblur = function () {
	'use strict';
	if( $("#InicioRutaTaxi").val() === $("#FinalRutaTaxi").val()) {
		$("#TaxilinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#TaxilinesErrors").show();
	} else {
		$("#TaxilinesErrors").hide();
		comprobarHabilitarTaxis();
	}
}

document.getElementById('InicioRutaTaxi').onblur = function () {
	'use strict';
	if( $("#InicioRutaTaxi").val() === $("#FinalRutaTaxi").val()) {
		$("#TaxilinesErrors").text("El inicio y el final de la ruta no pueden ser el mismo");
		$("#TaxilinesErrors").show();
	} else {
		$("#TaxilinesErrors").hide();
		comprobarHabilitarTaxis();
	}
}


document.getElementById('btnGrabarSeguirTaxi').onclick = function () {
	'use strict';	
	var agenciaTaxi 	= $('#TaxiName').val(),
			idConductor 	= $("#idDriver").val(),
			nombreCond		= $('#taxiDriverName').val(),
			apellidoCond = $('#taxiDriverLastName').val(),
			inicioRuta 		= $("#InicioRutaTaxi").val(),
			finalRuta 		= $("#FinalRutaTaxi").val(),
			precioKms	  	= $("#PrecioTaxi").val(),
			placaTaxi			= $('#PlacaTaxi').val(),
			numTaxiLines = $(".numTaxiLines"),
			newNumberAL	= parseInt($(".numBusLines").text()),			
			formData;
	
	formData = {agenciaTaxi : agenciaTaxi, idConductor : idConductor,
							nombreCond : nombreCond, apellidoCond : apellidoCond,
							inicioRuta : inicioRuta, finalRuta : finalRuta, 
							precioKms : precioKms, placaVehic : placaTaxi}
	
	console.log(formData);
	$.ajax({
		type 		: "POST",
		url  		: url+"api/web-bot/creaLineaTaxi",
		data 		: formData,
		success	: function (data, textStatus, jqXHR) {
			console.log('Todo ha ido bien...')
			$("#TaxilinesErrors").hide();
			$('.form-control').val('');			
			newNumberAL += 1;
			numTaxiLines.text(newNumberAL)
			$('#TaxiName').select();
			$('#btnGrabarSeguirTaxi').prop('disable',true)			
			myTableTaxis.ajax.reload();
		},
		error		: function (jqXHR, textStatus, errorThrown) {
			$("#TaxilinesErrors").text("No se ha podido realizar la inserción");
			$("#TaxilinesErrors").show();			
		}		
	});
	
}

function delete_cookie(name) {
	var cookies = document.cookie.split(";");
	var expiry = new Date(), expires;
	expiry.setTime(expiry.getTime() - ((1*60) * 60 * 1000)); // 1 hora 
	expires = "; expires="+expiry.toGMTString();	
	document.cookie = name+"="+""+expires+"; path=/";
	window.location.reload(true);
}

document.getElementById('closeAdmin').onclick = function ()
{
	delete_cookie("userModal");
	window.open("/", "_self","",false);	
}
