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

  enviarFormulario(nombre, email, mensaje);
}

function enviarFormulario(nombre, email, mensaje) {
  var destinatario = "boggle@daw.com"; // Cambia esto por tu dirección de correo
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
