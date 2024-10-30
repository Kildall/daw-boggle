"use strict";

var configuracionCampos = {
  nombre: {
    id: 'nombre',
    errorId: 'nombre-error',
    validacion: function (valor) {
      return valor.length >= 3;
    },
    mensajeError: 'El nombre debe tener al menos 3 caracteres'
  },
  email: {
    id: 'email',
    errorId: 'email-error',
    validacion: function (valor) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    },
    mensajeError: 'Por favor, introduce un email válido'
  },
  mensaje: {
    id: 'mensaje',
    errorId: 'mensaje-error',
    validacion: function (valor) {
      return valor.length >= 5;
    },
    mensajeError: 'El mensaje debe tener al menos 5 caracteres'
  }
};

var manipularClase = {
  agregar: function (elemento, clase) {
    if (elemento.className.indexOf(clase) === -1) {
      elemento.className += ' ' + clase;
    }
  },
  remover: function (elemento, clase) {
    elemento.className = elemento.className.replace(new RegExp('(?:^|\\s)' + clase + '(?!\\S)'), '');
  }
};

function crearElementosError() {
  for (var campo in configuracionCampos) {
    if (configuracionCampos.hasOwnProperty(campo)) {
      var config = configuracionCampos[campo];
      var elemento = document.getElementById(config.id);
      var contenedor = elemento.parentNode;

      var mensajeError = document.createElement('span');
      mensajeError.id = config.errorId;
      mensajeError.className = 'mensaje-error';
      contenedor.appendChild(mensajeError);
    }
  }
}

function validarCampo(campoId) {
  var config = configuracionCampos[campoId];
  var elemento = document.getElementById(config.id);
  var valor = elemento.value.trim();
  var contenedor = elemento.parentNode;
  var mensajeError = document.getElementById(config.errorId);

  manipularClase.remover(contenedor, 'error');
  manipularClase.remover(contenedor, 'success');
  mensajeError.textContent = '';

  if (!config.validacion(valor)) {
    manipularClase.agregar(contenedor, 'error');
    mensajeError.textContent = config.mensajeError;
    return false;
  }

  manipularClase.agregar(contenedor, 'success');
  return true;
}

function mostrarNotificacion(mensaje, tipo) {
  var notificacion = document.createElement('div');
  notificacion.className = 'mensaje-notificacion ' + tipo;
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);

  setTimeout(function () {
    if (notificacion.parentNode) {
      notificacion.parentNode.removeChild(notificacion);
    }
  }, 3000);
}

function enviarFormulario(formulario) {
  var datosFormulario = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    mensaje: document.getElementById('mensaje').value.trim()
  };

  var mailtoLink = 'mailto:boggle@daw.com' +
    '?subject=' + encodeURIComponent('Contacto desde Boogle') +
    '&body=' + encodeURIComponent(
      'Nombre: ' + datosFormulario.nombre + '\n' +
      'Email: ' + datosFormulario.email + '\n\n' +
      'Mensaje:\n' + datosFormulario.mensaje
    );

  window.location.href = mailtoLink;
  formulario.reset();

  for (var campo in configuracionCampos) {
    if (configuracionCampos.hasOwnProperty(campo)) {
      var elemento = document.getElementById(configuracionCampos[campo].id);
      var contenedor = elemento.parentNode;
      manipularClase.remover(contenedor, 'success');
    }
  }

  mostrarNotificacion('Mensaje enviado', 'exito');
}

function inicializarFormulario() {
  var formulario = document.getElementById('formulario-contacto');

  crearElementosError();

  formulario.addEventListener('input', function (e) {
    var campoId = e.target.id;
    if (configuracionCampos.hasOwnProperty(campoId)) {
      validarCampo(campoId);
    }
  });

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    var todosValidos = true;
    for (var campo in configuracionCampos) {
      if (configuracionCampos.hasOwnProperty(campo)) {
        if (!validarCampo(configuracionCampos[campo].id)) {
          todosValidos = false;
        }
      }
    }

    if (todosValidos) {
      enviarFormulario(formulario);
    }
  });
}


document.addEventListener('DOMContentLoaded', inicializarFormulario);
