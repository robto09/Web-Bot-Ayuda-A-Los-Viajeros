/*global $ */
$('#espacioTabla').hide();
$('#myModalRsvConf').hide();
function initMap () {
	var uluruSJ = {lat: 9.9356124, lng: -84.1484503},
			uluruLI = {lat: 9.9917998, lng: -83.060758},
			uluruLB = {lat: 10.6295425, lng: -85.4567243},
			uluruTM = {lat: 10.3008886, lng: -85.842458};


	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 7,
		center: uluruSJ
	});
	var marker = new google.maps.Marker({
		position: uluruSJ,
		map: map
	});
	var marker2 = new google.maps.Marker({
		position: uluruLI,
		map: map
	});
	var marker3 = new google.maps.Marker({
		position: uluruLB,
		map: map
	});
	var marker4 = new google.maps.Marker({
		position: uluruTM,
		map: map
	});				
}

var url = 'https://protected-harbor-25428.herokuapp.com/'

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var options = {limon : 'Limón', tamarindo : 'Tamarindo', liberia : 'Liberia', SanJose : 'San José'}, $select = $('#InicioRutaUsers'), $select2 = $('#FinalRutaUsers'), defecto = 'San José', val, option;

function countRsvs(usuario) {
	return(
		$.ajax({
			type	:	"GET",
			url		:	url+"api/web-bot/getNumReservas/"+usuario
		})
	);
}


$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasAereas",
	success	: function (data, textStatus, jqXHR) {
		$(".numAirlinesUser").text(data.rdo)
	}
});

$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasTren",
	success	: function (data, textStatus, jqXHR) {
		$(".numTrainLinesUser").text(data.rdo)		
	}
});

$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasBus",
	success	: function (data, textStatus, jqXHR) {
		$(".numBusLinesUser").text(data.rdo)
	}
});

$.ajax({
	type 		: "GET",
	url  		: url+"api/web-bot/getNumLineasTaxi",
	success	: function (data, textStatus, jqXHR) {
		$(".numTaxiLinesUser").text(data.rdo)
	}
});

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

var usuario = getCookie("userModal")
if(usuario === "asd") {
	window.open("/", "_self");	
}

if($(document).ready() && usuario !== "asd")
{
	countRsvs(usuario).done(function(data){
		if(data.rdo == 0){
			console.log('disablando...')
			$('#btnVerReservas').attr('disabled',true);
		}
		else {
			console.log('enablando...')
			$('#btnVerReservas').attr('disabled',false);
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

document.getElementById('closeUser').onclick = function ()
{
	delete_cookie("userModal");
	window.open("/", "_self","",false);	
}


/*var options = {limon : 'Limón', tamarindo : 'Tamarindo', liberia : 'Liberia', SanJose : 'San José'}, $select = $('#InicioRuta'), $select2 = $('#FinalRuta'), $select3 = $('#InicioRutaTren'), $select4 = $("#FinalRutaTren"), $select5 = $("#InicioRutaBus"), $select6 = $('#FinalRutaBus'), $select7 = $("#InicioRutaTaxi"), $select8 = $('#FinalRutaTaxi'), defecto = 'San José', val, $option;*/

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
    //console.log($option);
    $select2.append($option);
}

document.getElementById('InicioRutaUsers').onchange = function () {
	'use strict';
	if( $("#InicioRutaUsers").val() === $("#FinalRutaUsers").val()) {
		$('#BtnProcesar').prop('disabled',true)
	} else {
		$('#BtnProcesar').prop('disabled',false)
	}
}

document.getElementById('FinalRutaUsers').onchange = function () {
	'use strict';
	if( $("#InicioRutaUsers").val() === $("#FinalRutaUsers").val()) {
		$('#BtnProcesar').prop('disabled',true)
	} else {
		$('#BtnProcesar').prop('disabled',false)
	}
}

var convertirFecha = function(p_fecha) {
	l_fecha_hora = p_fecha.split('T')
	l_fecha = l_fecha_hora[0].split('-');
	dia = l_fecha[2];
	mes = l_fecha[1];
	anio = l_fecha[0];
	return (dia+'/'+mes+'/'+anio+' '+l_fecha_hora[1])
}

document.getElementById('BtnProcesar').onclick = function() {
	'use strict'
	var fecha = $('#fechaViaje').val(),
			dict_medios = '',
			opcion = $("#RadioTime").prop('checked'),
			formData, inicio, fin;
	$('#tablaRecorridos tbody').empty();
	if (fecha != '')
	{
		fecha = convertirFecha(fecha)
		inicio = $("#InicioRutaUsers").val()
		fin = $("#FinalRutaUsers").val()
		if ($('#chkAv').prop('checked'))
		{
			dict_medios = dict_medios+',"avion":1';
		} else {
			dict_medios = dict_medios+',"avion":0';
		}
		if ($('#chkTr').prop('checked'))
		{
			dict_medios = dict_medios+',"tren":1';
		} else {
			dict_medios = dict_medios+',"tren":0';
		}
		if ($('#chkBus').prop('checked'))
		{
			dict_medios = dict_medios+',"bus":1';
		} else {
			dict_medios = dict_medios+',"bus":0';
		}
		if ($('#chkTaxi').prop('checked'))
		{
			dict_medios = dict_medios+',"taxi":1';
		} else {
			dict_medios = dict_medios+',"taxi":0';
		}
		if (dict_medios.charAt(0) == ',')
			dict_medios = dict_medios.substr(1,dict_medios.length)
		dict_medios = '{'+dict_medios+'}'
		if (opcion)
			opcion = 'tiempo';
		else
			opcion = 'precio';
		console.log(fecha);
		console.log(dict_medios);		
		formData = {dict_medios:dict_medios,opcion:opcion,fecha:fecha,
							 inicio:inicio, fin:fin}
		$.ajax({
		type 		: "POST",
		url  		: url+"api/web-bot/obtenerAgencias",
		data 		: formData,
		success	: function (data, textStatus, jqXHR) {
			var i = 0, j=0, filas = data.rdo, fila, col1, row='',rows='',recorrido,checker;
			console.log(filas.length)
			if (filas.length > 0)
			{
				while (i <= 4 && i<filas.length){
					fila = filas[i]
					row = '<tr>';
					recorrido = fila['Ruta']
					if (fila['Medio'] == 'avion')
						recorrido = recorrido.replaceAll('-','&nbsp;<i class="fa fa-plane"></i>&nbsp;');
					if (fila['Medio'] == 'tren')
						recorrido = recorrido.replaceAll('-','&nbsp;<i class="fa fa-train"></i>&nbsp;');
					if (fila['Medio'] == 'bus'){
						console.log('Tratando bus');
						recorrido = recorrido.replaceAll('-','&nbsp;<i class="fa fa-bus"></i>&nbsp;');
					}
					if (fila['Medio'] == 'taxi')
						recorrido = recorrido.replaceAll('-','&nbsp;<i class="fa fa-taxi"></i>&nbsp;');
					if (i == 0){
						checker = '<input id="chkRsv'+i+'" type="radio" name="RadioRsv" checked/>'
					}
					else{
						checker = '<input id="chkRsv'+i+'" type="radio" name="RadioRsv"/>'
					}
					col1 = '<td>'+fila['Agencia']+'</td><td>'+recorrido+'</td><td class="text-right col-xs-1">'+fila['Precio']+'</td><td class="col-xs-1 text-center">'+checker+'</td>';
					row = row+col1+'</tr>'
					$('#tablaRecorridos tbody').append(row);
					console.log(fila)
					i++;
				}

				$('#espacioTabla').show();				
			}
			else {
				$('#espacioTabla').hide();				
			}
			
		},
		error		: function (jqXHR, textStatus, errorThrown) {
			console.log("Se ha producido un error")
		}		
	})
			
	}
	else{
		$('#fechaViaje').select();
	}
}

document.getElementById('btnReservar').onclick = function() {
	var i=1,tabla, numRows, row, agencia, recorrido, fecha, encontrado=false, 
			checker, td, medio, fecha,  numRsvs, formData, usuario;
	tabla = document.getElementById('tablaRecorridos')
	numRows = tabla.rows.length;
	//i empieza en 1 para ignorar la cabecera
	while (i < numRows && encontrado == false){
		row = tabla.rows[i];
		td = row.cells[3]
		checker = $(td).children();
		if(checker.prop('checked') == true) {
			agencia = $(row.cells[0]).children().context.innerHTML
			recorrido = $(row.cells[1]).children().context.innerHTML
			if (recorrido.indexOf('fa-plane') > 0){
				medio = 'avion';
				recorrido = recorrido.replaceAll('&nbsp;<i class="fa fa-plane"></i>&nbsp;','-')
			}			
			if (recorrido.indexOf('fa-train') > 0){
				medio = 'tren';
				recorrido = recorrido.replaceAll('&nbsp;<i class="fa fa-train"></i>&nbsp;','-')
			}						
			if (recorrido.indexOf('fa-bus') > 0){
				medio = 'bus';
				recorrido = recorrido.replaceAll('&nbsp;<i class="fa fa-bus"></i>&nbsp;','-')
			}									
			if (recorrido.indexOf('fa-taxi') > 0){
				medio = 'taxi';
				recorrido = recorrido.replaceAll('&nbsp;<i class="fa fa-taxi"></i>&nbsp;','-')
			}												
			encontrado = true;
			fecha = convertirFecha($('#fechaViaje').val())
			numRsvs = $('#numPasajes').val();
			usuario = getCookie("userModal");
			console.log(agencia);console.log(medio);
			console.log(recorrido);console.log(fecha);				
			console.log(numRsvs);
			console.log(usuario);
			
			console.log('Valor de i:'+i)
		}
		
		i = i+1
	}	
	formData = {agencia:agencia,recorrido:recorrido,
							medio:medio,numRsvas:numRsvs, fecha:fecha,
							usuario: usuario}

	$.ajax({
		type 		: "POST",
		url  		: url+"api/web-bot/reservar",
		data 		: formData,
		success	: function (data, textStatus, jqXHR) {
						var myModalMsgs, panelType, btnModalAceptar;
						myModalMsgs = $('#myModalRsvConf');
									myModalMsgs.find(".panel-title").text('Reserva Confirmada');
						myModalMsgs.find(".panel-body").text('Se ha confirmado la reserva. Recibirá un cargo en su cuenta de $'+data.rdo);
						myModalMsgs.show();
						
		},
		error		: function (jqXHR, textStatus, errorThrown) {										console.log(formData);}
	});


	
	
}

document.getElementById('fechaViaje').onblur = function() {
	if ($('#fechaViaje').val() == '') $('#fechaViaje').select();
}

document.getElementById('btnModalConfRsv').onclick = function() {
	$('#BtnProcesar').click();
	
}


document.getElementById('btnVerReservas').onclick = function() {
	$('#tablaVerReservas tbody').empty();
	$.ajax({
		type		:	"GET",
		url			: url+"api/web-bot/devolverReservas/"+usuario,
		success	:	function(data,textStatus, jqXHR) {			
				var i = 0, j=0, filas = data.rdo, fila, col1, row='',rows='',recorrido,checker;
				while (i<filas.length){
					fila = filas[i]
					row = '<tr>';
					col1 = '<td>'+fila['Agencia']+'</td>';
					col1 = col1+'<td>'+fila['InicioRuta']+'</td>'
					col1 = col1+'<td>'+fila['FinRuta']+'</td>'
					col1 = col1+'<td class="text-right col-xs-2">'+fila['NumPasajeros']+'</td>'
					col1 = col1+'<td class="text-right">'+fila['Precio']+'</td>'
					i++;
					row = row+col1+'</tr';
					$('#tablaVerReservas tbody').append(row);
					console.log('Agencia: '+fila['Agencia'])
				}
		}})};


