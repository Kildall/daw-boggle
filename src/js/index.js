"use strict";

var distribucionLetras = {
    A: 8.17,
    B: 1.49,
    C: 2.78,
    D: 4.25,
    E: 12.7,
    F: 2.23,
    G: 2.02,
    H: 6.09,
    I: 6.97,
    J: 0.15,
    K: 0.77,
    L: 4.03,
    M: 2.41,
    N: 6.75,
    O: 7.51,
    P: 1.93,
    Q: 0.1,
    R: 5.99,
    S: 6.33,
    T: 9.06,
    U: 2.76,
    V: 0.98,
    W: 2.36,
    X: 0.15,
    Y: 1.97,
    Z: 0.07,
};

// Constantes
var PENALIZACION_PALABRA_INCORRECTA = 1;

// Variables globales
var nombreJugador = "";
var puntuacion = 0;
var tiempoRestante = 180; // 3 minutos en segundos
var intervaloTemporizador;
var tablero = [];
var palabraActual = "";
var palabrasEncontradas = [];
var letrasSeleccionadas = [];
var palabrasIncorrectas = [];

// Elementos del DOM
var seccionInicio = document.getElementById("inicio-juego");
var seccionJuego = document.getElementById("juego");
var seccionFinJuego = document.getElementById("fin-juego");
var formNombreJugador = document.getElementById("form-nombre-jugador");
var inputNombreJugador = document.getElementById("nombre-jugador");
var spanNombreJugador = document.getElementById("nombre-jugador-display");
var spanPuntuacion = document.getElementById("puntuacion");
var spanTemporizador = document.getElementById("temporizador");
var divTablero = document.getElementById("tablero");
var spanPalabraActual = document.getElementById("palabra-actual");
var btnEnviarPalabra = document.getElementById("enviar-palabra");
var listapalabras = document.getElementById("lista-palabras");
var spanPuntuacionFinal = document.getElementById("puntuacion-final");
var btnNuevaPartida = document.getElementById("nueva-partida");
var modal = document.getElementById("modal");
var modalTitulo = document.getElementById("modal-titulo");
var modalMensaje = document.getElementById("modal-mensaje");
var btnCerrarModal = document.getElementById("modal-cerrar");
var listaPalabrasIncorrectas = document.getElementById(
    "lista-palabras-incorrectas"
);
var btnMostrarModalRanking = document.getElementById("mostrar-ranking");
var btnCerrarModalRanking = document.querySelector("#modal-ranking .cerrar");
var btnOrdenarRanking = document.getElementById("orden-ranking");

function limpiarSeleccion() {
    palabraActual = "";
    spanPalabraActual.textContent = "";
    letrasSeleccionadas = [];
    var casillasSeleccionadas = document.querySelectorAll(
        ".casilla.seleccionada"
    );
    casillasSeleccionadas.forEach(function (casilla) {
        casilla.classList.remove("seleccionada");
    });
    actualizarEstadoTablero();
}

function agregarPalabraIncorrectaALista(palabra) {
    var li = document.createElement("li");
    li.textContent = palabra;
    listaPalabrasIncorrectas.appendChild(li);
}

function mostrarPenalizacion() {
    var penalizacionElement = document.createElement("span");
    penalizacionElement.textContent = "-" + PENALIZACION_PALABRA_INCORRECTA;
    penalizacionElement.className = "penalizacion";
    spanPuntuacion.parentNode.appendChild(penalizacionElement);

    setTimeout(function () {
        penalizacionElement.remove();
    }, 1000);
}


function penalizarPalabraIncorrecta() {
    var puntuacionAnterior = puntuacion;
    puntuacion = Math.max(0, puntuacion - PENALIZACION_PALABRA_INCORRECTA);
    var puntosPerdidos = puntuacionAnterior - puntuacion;

    palabrasIncorrectas.push(palabraActual);
    agregarPalabraIncorrectaALista(palabraActual);

    actualizarPuntuacion();
    mostrarPenalizacion();

    var mensaje =
        'La palabra "' + palabraActual + '" no existe en el diccionario. ';
    if (puntosPerdidos > 0) {
        mensaje +=
            "Has perdido " +
            puntosPerdidos +
            " punto" +
            (puntosPerdidos > 1 ? "s" : "") +
            ".";
    } else {
        mensaje += "No has perdido puntos porque tu puntuación ya era 0.";
    }
    mostrarModal("Palabra inválida", mensaje);
}


function verificarEnDiccionario(palabra) {
    return fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + palabra)
        .then(function (response) {
            return response.ok;
        })
        .catch(function () {
            return false;
        });
}

function mostrarRanking() {
    var modalRanking = document.getElementById("modal-ranking");
    modalRanking.style.display = "block";
    actualizarTablaRanking();
}

function actualizarTablaRanking() {
    var resultados = JSON.parse(localStorage.getItem("boogleResultados")) || [];
    var ordenSeleccionado = document.getElementById("orden-ranking").value;

    resultados.sort(function (a, b) {
        if (ordenSeleccionado === "puntuacion") {
            return b.puntuacion - a.puntuacion;
        } else {
            return new Date(b.fecha) - new Date(a.fecha);
        }
    });

    var tbody = document.querySelector("#tabla-ranking tbody");
    tbody.innerHTML = "";

    resultados.forEach(function (resultado) {
        var tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" +
            resultado.nombre +
            "</td>" +
            "<td>" +
            resultado.puntuacion +
            "</td>" +
            "<td>" +
            new Date(resultado.fecha).toLocaleString() +
            "</td>";
        tbody.appendChild(tr);
    });
}

function cerrarModalRanking() {
    var modalRanking = document.getElementById("modal-ranking");
    modalRanking.style.display = "none";
}

function reiniciarJuego() {
    seccionFinJuego.classList.add("oculto");
    seccionInicio.classList.remove("oculto");
    inputNombreJugador.value = "";
    listapalabras.innerHTML = "";
}

function mostrarModal(titulo, mensaje) {
    modalTitulo.textContent = titulo;
    modalMensaje.textContent = mensaje;
    modal.style.display = "block";
}

function cerrarModal() {
    modal.style.display = "none";
}

function actualizarPuntuacion() {
    spanPuntuacion.textContent = puntuacion;
}

function obtenerCasillasAdyacentes(fila, columna) {
    var adyacentes = [];
    for (var i = Math.max(0, fila - 1); i <= Math.min(3, fila + 1); i++) {
        for (var j = Math.max(0, columna - 1); j <= Math.min(3, columna + 1); j++) {
            if (i !== fila || j !== columna) {
                var casilla = document.querySelector(
                    '.casilla[data-fila="' + i + '"][data-columna="' + j + '"]'
                );
                if (casilla) {
                    adyacentes.push(casilla);
                }
            }
        }
    }
    return adyacentes;
}

function actualizarEstadoTablero() {
    var casillas = document.querySelectorAll(".casilla");

    // Primero, removemos todas las clases de estado
    casillas.forEach(function (casilla) {
        casilla.classList.remove("disponible", "deshabilitada");
    });

    if (letrasSeleccionadas.length > 0) {
        var ultimaLetra = letrasSeleccionadas[letrasSeleccionadas.length - 1];
        var adyacentes = obtenerCasillasAdyacentes(
            ultimaLetra.fila,
            ultimaLetra.columna
        );

        // Marcamos las casillas adyacentes como disponibles
        adyacentes.forEach(function (casilla) {
            if (!casilla.classList.contains("seleccionada")) {
                casilla.classList.add("disponible");
            }
        });

        // Deshabilitamos las casillas que no están seleccionadas ni son adyacentes
        casillas.forEach(function (casilla) {
            if (
                !casilla.classList.contains("seleccionada") &&
                !casilla.classList.contains("disponible")
            ) {
                casilla.classList.add("deshabilitada");
            }
        });
    } else {
        // Si no hay letras seleccionadas, todas las casillas están disponibles
        casillas.forEach(function (casilla) {
            casilla.classList.remove("deshabilitada");
        });
    }
}


function deseleccionarUltimaLetra() {
    if (letrasSeleccionadas.length > 0) {
        var ultimaLetra = letrasSeleccionadas.pop();
        palabraActual = palabraActual.slice(0, -1);
        spanPalabraActual.textContent = palabraActual;
        ultimaLetra.casilla.classList.remove("seleccionada");
    }
}

function seleccionarLetra(casilla, fila, columna) {
    palabraActual += casilla.textContent;
    spanPalabraActual.textContent = palabraActual;
    casilla.classList.add("seleccionada");
    letrasSeleccionadas.push({ fila: fila, columna: columna, casilla: casilla });
}

function esUltimaLetraSeleccionada(fila, columna) {
    if (letrasSeleccionadas.length === 0) return false;
    var ultimaLetra = letrasSeleccionadas[letrasSeleccionadas.length - 1];
    return ultimaLetra.fila === fila && ultimaLetra.columna === columna;
}

function esLetraAdyacente(fila, columna) {
    if (letrasSeleccionadas.length === 0) return true;

    var ultimaLetra = letrasSeleccionadas[letrasSeleccionadas.length - 1];
    return (
        Math.abs(fila - ultimaLetra.fila) <= 1 &&
        Math.abs(columna - ultimaLetra.columna) <= 1
    );
}

function manejarSeleccionLetra() {
    var fila = parseInt(this.dataset.fila);
    var columna = parseInt(this.dataset.columna);

    if (this.classList.contains("seleccionada")) {
        if (esUltimaLetraSeleccionada(fila, columna)) {
            deseleccionarUltimaLetra();
            actualizarEstadoTablero();
        }
        // Si no es la última letra seleccionada, no hacemos nada
    } else if (esLetraAdyacente(fila, columna)) {
        seleccionarLetra(this, fila, columna);
        actualizarEstadoTablero();
    }
}

function generarLetraAleatoria() {
    var totalPeso = Object.values(distribucionLetras).reduce(function (a, b) {
        return a + b;
    }, 0);
    var aleatorio = Math.random() * totalPeso;
    var sumaPeso = 0;

    for (var letra in distribucionLetras) {
        sumaPeso += distribucionLetras[letra];
        if (aleatorio <= sumaPeso) {
            return letra;
        }
    }

    // En caso de que algo salga mal, devolvemos una letra aleatoria
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
}

function generarTablero() {
    tablero = [];
    divTablero.innerHTML = "";

    for (var i = 0; i < 4; i++) {
        tablero[i] = [];
        for (var j = 0; j < 4; j++) {
            var letraAleatoria = generarLetraAleatoria();
            tablero[i][j] = letraAleatoria;

            var casilla = document.createElement("div");
            casilla.className = "casilla";
            casilla.textContent = letraAleatoria;
            casilla.dataset.fila = i;
            casilla.dataset.columna = j;
            casilla.addEventListener("click", manejarSeleccionLetra);
            divTablero.appendChild(casilla);
        }
    }
}

function actualizarTemporizador() {
    var minutos = Math.floor(tiempoRestante / 60);
    var segundos = tiempoRestante % 60;
    spanTemporizador.textContent =
        (minutos < 10 ? "0" : "") +
        minutos +
        ":" +
        (segundos < 10 ? "0" : "") +
        segundos;

    if (tiempoRestante <= 10) {
        spanTemporizador.style.color = "red";
    } else {
        spanTemporizador.style.color = "";
    }
}

function mostrarResumenPalabras() {
    var resumenElement = document.createElement("div");
    resumenElement.innerHTML =
        "<h3>Resumen de palabras</h3>" +
        "<p>Palabras correctas: " +
        palabrasEncontradas.length +
        "</p>" +
        "<p>Palabras incorrectas: " +
        palabrasIncorrectas.length +
        "</p>";

    if (palabrasIncorrectas.length > 0) {
        resumenElement.innerHTML +=
            "<p>Palabras incorrectas intentadas: " +
            palabrasIncorrectas.join(", ") +
            "</p>";
    }

    seccionFinJuego.appendChild(resumenElement);
}

function guardarResultado() {
    var resultados = JSON.parse(localStorage.getItem("boogleResultados")) || [];
    resultados.push({
        nombre: nombreJugador,
        puntuacion: puntuacion,
        fecha: new Date().toISOString(),
        palabrasEncontradas: palabrasEncontradas.length,
        palabrasIncorrectas: palabrasIncorrectas.length,
    });
    localStorage.setItem("boogleResultados", JSON.stringify(resultados));
}

function finalizarJuego() {
    clearInterval(intervaloTemporizador);
    seccionJuego.classList.add("oculto");
    seccionFinJuego.classList.remove("oculto");
    spanPuntuacionFinal.textContent = puntuacion;
    mostrarResumenPalabras();
    guardarResultado();
}

function iniciarTemporizador() {
    actualizarTemporizador();
    intervaloTemporizador = setInterval(function () {
        tiempoRestante--;
        actualizarTemporizador();
        if (tiempoRestante <= 0) {
            finalizarJuego();
        }
    }, 1000);
}

function limpiarListaPalabrasIncorrectas() {
    listaPalabrasIncorrectas.innerHTML = "";
}

function iniciarPartida() {
    puntuacion = 0;
    tiempoRestante = parseInt(document.getElementById("selector-tiempo").value);
    palabrasEncontradas = [];
    palabrasIncorrectas = [];
    letrasSeleccionadas = [];
    actualizarPuntuacion();
    generarTablero();
    iniciarTemporizador();
    limpiarListaPalabrasIncorrectas();
}


function calcularPuntos(palabra) {
    var longitud = palabra.length;
    if (longitud <= 4) return 1;
    if (longitud === 5) return 2;
    if (longitud === 6) return 3;
    if (longitud === 7) return 5;
    return 11;
}

function agregarPalabraALista(palabra, puntos) {
    var li = document.createElement("li");
    li.textContent = palabra + " (" + puntos + " puntos)";
    listapalabras.appendChild(li);
}


function verificarPalabra() {
    if (palabraActual.length < 3) {
        mostrarModal(
            "Palabra inválida",
            "La palabra debe tener al menos 3 letras."
        );
        return;
    }

    if (palabrasEncontradas.indexOf(palabraActual) !== -1) {
        mostrarModal("Palabra repetida", "Ya has encontrado esta palabra.");
        return;
    }

    if (palabrasIncorrectas.indexOf(palabraActual) !== -1) {
        mostrarModal(
            "Palabra inválida",
            "Ya has intentado esta palabra antes y no es válida."
        );
        limpiarSeleccion();
        return;
    }

    verificarEnDiccionario(palabraActual.toLowerCase())
        .then(function (esValida) {
            if (esValida) {
                var puntosPalabra = calcularPuntos(palabraActual);
                puntuacion += puntosPalabra;
                palabrasEncontradas.push(palabraActual);
                actualizarPuntuacion();
                agregarPalabraALista(palabraActual, puntosPalabra);
                mostrarModal(
                    "¡Palabra válida!",
                    "Has ganado " + puntosPalabra + " puntos."
                );
                limpiarSeleccion();
            } else {
                penalizarPalabraIncorrecta();
                limpiarSeleccion();
            }
        })
        .catch(function (error) {
            console.error("Error al verificar la palabra:", error);
            mostrarModal(
                "Error",
                "Hubo un problema al verificar la palabra. Inténtalo de nuevo."
            );
        });
}

function iniciarJuego() {
    formNombreJugador.addEventListener("submit", manejarInicioJuego);
    btnEnviarPalabra.addEventListener("click", verificarPalabra);
    btnNuevaPartida.addEventListener("click", reiniciarJuego);
    btnCerrarModal.addEventListener("click", cerrarModal);
    btnMostrarModalRanking.addEventListener("click", mostrarRanking);
    btnCerrarModalRanking.addEventListener("click", cerrarModalRanking);
    btnOrdenarRanking.addEventListener("change", actualizarTablaRanking);
}

function manejarInicioJuego(evento) {
    evento.preventDefault();
    nombreJugador = inputNombreJugador.value.trim();
    if (nombreJugador.length < 3) {
        mostrarModal("Error", "El nombre debe tener al menos 3 caracteres.");
        return;
    }
    spanNombreJugador.textContent = nombreJugador;
    seccionInicio.classList.add("oculto");
    seccionJuego.classList.remove("oculto");
    iniciarPartida();
}

window.addEventListener("load", iniciarJuego);
