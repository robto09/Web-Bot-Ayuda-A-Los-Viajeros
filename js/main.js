/*global $ */
$("#alertError").hide();
console.log(document.cookie.indexOf("userModal"));
if (document.cookie.indexOf("userModal") >= 0) {	
	window.open("/admin.html", "_self","",false);
}


document.getElementById("btnRegistrarMe").onclick = function () {
	'use strict';
	$('#myModal').show();
	$('#userName').focus();
};

document.getElementById("btnRegistrar").onclick = function () {
	'use strict';
	var usuario = document.getElementById("userName").value, data, formData;
	$.ajax({
		type : "GET",
		url : "https://floating-river-23216.herokuapp.com/api/web-bot/existeUsuario?userName=" + usuario,
		success : function (response) {
			data = response;
			if (data.rdo === 'OK') {
				var myModalMsgs, panelType, btnModalAceptar;
				myModalMsgs = $('#myModalMsgs');
				panelType = $('#panelType');
				btnModalAceptar = $('#btnModalAceptar');
				panelType.removeClass('panel-success');
				panelType.addClass('panel-danger');
				btnModalAceptar.removeClass('btn-success');
				btnModalAceptar.addClass('btn-danger');
				myModalMsgs.find(".panel-title").text('Error al crear el usuario');
				myModalMsgs.find(".panel-body").text('Usuario ya existente');
				myModalMsgs.modal('show');
			} else {
				formData = {userName : $('#userName').val(), password : $('#password').val()};
				$.ajax({
					type : "POST",
					url : "https://floating-river-23216.herokuapp.com/api/web-bot/crearUsuario",
					data : formData,
					success : function (data, textStatus, jqXHR) {
						var myModalMsgs, panelType, btnModalAceptar;
						myModalMsgs = $('#myModalMsgs');
						panelType = $('#panelType');
						btnModalAceptar = $('#btnModalAceptar');
						panelType.removeClass('panel-danger');
						panelType.addClass('panel-success');
						btnModalAceptar.removeClass('btn-danger');
						btnModalAceptar.addClass('btn-success');
						myModalMsgs.find(".panel-title").text('Creación de usuario');
						myModalMsgs.find(".panel-body").text('Usuario creado correctamente');
						myModalMsgs.modal('show');
					},
					error : function (jqXHR, textStatus, errorThrown) {
						var myModalMsgs, panelType, btnModalAceptar;
						myModalMsgs = $('#myModalMsgs');
						panelType = $('#panelType');
						btnModalAceptar = $('#btnModalAceptar');
						panelType.removeClass('panel-success');
						panelType.addClass('panel-danger');
						btnModalAceptar.removeClass('btn-success');
						btnModalAceptar.addClass('btn-danger');
						myModalMsgs.find(".panel-title").text('Error de base de datos');
						myModalMsgs.find(".panel-body").text('No se ha podido registrar al usuario');
						myModalMsgs.modal('show');
					}
				});
			}
		},
		error : function (jqXHR, textStatus, errorThrown) {
			var myModalMsgs, panelType, btnModalAceptar;
			myModalMsgs = $('#myModalMsgs');
			panelType = $('#panelType');
			btnModalAceptar = $('#btnModalAceptar');
			panelType.removeClass('panel-success');
			panelType.addClass('panel-danger');
			btnModalAceptar.removeClass('btn-success');
			btnModalAceptar.addClass('btn-danger');
			myModalMsgs.find(".panel-title").text('Error de conexión');
			myModalMsgs.find(".panel-body").text('No se ha podido validar al usuario');
			myModalMsgs.modal('show');

		}
	});
};

document.getElementById("btnModalAceptar").onclick = function () {
	'use strict';
	$('.form-control').val('');
};

var cambiarClaseError = function (miTipoAlerta) {
	'use strict';
	miTipoAlerta.removeClass('alert-info');
	miTipoAlerta.addClass('alert-danger');
};

var cambiarClaseInfo = function (miTipoAlerta) {
	'use strict';
	miTipoAlerta.addClass('alert-info');
	miTipoAlerta.removeClass('alert-danger');
};

document.getElementById("userName").onblur = function () {
	'use strict';
	var emailIntroducido, miTipoAlerta, mensajeAlerta, alertHtml, re, errorEmail;
	errorEmail = false;
	re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	emailIntroducido = $('#userName').val();
	miTipoAlerta = $('#tipoAlerta');
	if (emailIntroducido.length < 10) {
		cambiarClaseError(miTipoAlerta);
		alertHtml = '<strong>Error</strong> La longitud no concuerda con la de un email válido.';
		errorEmail = true;
	}
	if (errorEmail === false && re.test(emailIntroducido) === false) {
		cambiarClaseError(miTipoAlerta);
		alertHtml = '<strong>Error</strong> El formato no concuerda con la de un email válido.';
		errorEmail = true;
	}
	if (errorEmail === true) {
		mensajeAlerta = $('#mensajeAlerta').html(alertHtml);
		document.getElementById("userName").focus();
		miTipoAlerta.show();
	} else {
		cambiarClaseInfo(miTipoAlerta);
		alertHtml = "<strong>Todos los campos son requeridos.&nbsp;</strong>Las contraseñas han de tener una longitud mínima de 6 dígitos y han de coincidir";
		mensajeAlerta = $('#mensajeAlerta').html(alertHtml);
	}
	

};

var validarPassword = function (password) {
	'use strict';
	var reg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
	return reg.test(password);
};

document.getElementById("password").onblur = function () {
	'use strict';
	var passwordIntroducido, alertHtml, mensajeAlerta, miTipoAlerta;
	miTipoAlerta = $('#tipoAlerta');
	passwordIntroducido = $('#password').val();
	if (!validarPassword(passwordIntroducido)) {
		cambiarClaseError(miTipoAlerta);
		alertHtml = "<strong>Error </strong>Las contraseñas han de tener una longitud mínima de 6 dígitos, una máxima de 16 y han de incluir números, letras y carácteres especiales.";
		mensajeAlerta = $('#mensajeAlerta').html(alertHtml);
		document.getElementById("password").focus();
		miTipoAlerta.show();
		
	} else {
		cambiarClaseInfo(miTipoAlerta);
		alertHtml = "<strong>Todos los campos son requeridos.&nbsp;</strong>Las contraseñas han de tener una longitud mínima de 6 dígitos y han de coincidir";
		mensajeAlerta = $('#mensajeAlerta').html(alertHtml);
	}
};

document.getElementById("password1").onblur = function () {
	'use strict';
	var passwordIntroducido, passwordOriginal, alertHtml, mensajeAlerta, miTipoAlerta;
	miTipoAlerta = $('#tipoAlerta');
	passwordIntroducido = $('#password1').val();
	passwordOriginal = $('#password').val();
	if (!validarPassword(passwordIntroducido)) {
		cambiarClaseError(miTipoAlerta);
		alertHtml = "<strong>Error </strong>Las contraseñas han de tener una longitud mínima de 6 dígitos, una máxima de 16 y han de incluir números, letras y carácteres especiales";
		mensajeAlerta = $('#mensajeAlerta').html(alertHtml);
		document.getElementById("password1").focus();
		miTipoAlerta.show();
		
	} else {
		if (passwordIntroducido !== passwordOriginal) {
			cambiarClaseError(miTipoAlerta);
			alertHtml = "<strong>Error </strong>Las contraseñas no coinciden";
			mensajeAlerta = $('#mensajeAlerta').html(alertHtml);
			document.getElementById("password1").focus();
			miTipoAlerta.show();
		} else {
			cambiarClaseInfo(miTipoAlerta);
			alertHtml = "<strong>Todos los campos son requeridos.&nbsp;</strong>Las contraseñas han de tener una longitud mínima de 6 dígitos y han de coincidir";
			mensajeAlerta = $('#mensajeAlerta').html(alertHtml);
			$('#btnRegistrar').prop('disabled', false);
		}
	}
};

document.getElementById("btnLogin").onclick = function () {
	'use strict';
	var formData;
	formData = {userName : $('#userLogin').val(), password : $('#passwordLogin').val()};
	//window.console.log(formData);
	$.ajax({
		type : "POST",
		url : "https://floating-river-23216.herokuapp.com/api/web-bot/devolverUsuario",
		data : formData,
		success: function (data, textStatus, jqXHR) {
			if (data.hasOwnProperty("rdo")) {
				$("#alertText").text("Usuario no válido o contraseña incorrecta");
				$("#alertError").show();
			} else {
					var expiry = new Date(), expires;
					expiry.setTime(expiry.getTime() + ((1*60) * 60 * 1000)); // 1 hora 
					expires = "; expires="+expiry.toGMTString();
					document.cookie = "userModal=" + data.userName+expires+"; path=/";
				if (data.userMode === "ADMIN") {
					window.open("admin.html", "_self", "",false);
				} else {
					window.open("user.html", "_self",false);
				}
			}
		},
		error : function (jqXHR, textStatus, errorThrown) {
			
		}
		
	});
};

