"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var formulario = document.getElementById("formulario-contacto");
  formulario.addEventListener("submit", manejarEnvioFormulario);
});

function manejarEnvioFormulario(evento) {
  evento.preventDefault();

  var nombre = document.getElementById("nombre").value.trim();
  var email = document.getElementById("email").value.trim();
  var mensaje = document.getElementById("mensaje").value.trim();

  if (validarFormulario(nombre, email, mensaje)) {
    enviarFormulario(nombre, email, mensaje);
  }
}

function validarFormulario(nombre, email, mensaje) {
  if (nombre.length < 2) {
    alert("El nombre debe tener al menos 2 caracteres.");
    return false;
  }

  if (!validarEmail(email)) {
    alert("Por favor, introducí una dirección de correo electrónico válida.");
    return false;
  }

  if (mensaje.length < 5) {
    alert("El mensaje debe tener al menos 5 caracteres.");
    return false;
  }

  return true;
}

function validarEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function enviarFormulario(nombre, email, mensaje) {
  var destinatario = "boggle@daw.com"; // Cambiar esto por dirección válida / (se deja una de ejemplo porque actualmente no tenemos una)
  var asunto = "Contacto desde Boogle";
  var cuerpoMensaje =
    "Nombre: " + nombre + "\nEmail: " + email + "\n\nMensaje:\n" + mensaje;

  var mailtoLink =
    "mailto:" +
    encodeURIComponent(destinatario) +
    "?subject=" +
    encodeURIComponent(asunto) +
    "&body=" +
    encodeURIComponent(cuerpoMensaje);

  window.location.href = mailtoLink;
}