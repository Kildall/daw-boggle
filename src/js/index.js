"use strict";

// Constants and global variables (unchanged)
var distribucionLetras = { /* ... */ };
var PENALIZACION_PALABRA_INCORRECTA = 1;
var nombreJugador = "";
var puntuacion = 0;
var tiempoRestante = 180;
var intervaloTemporizador;
var tablero = [];
var palabraActual = "";
var palabrasEncontradas = [];
var letrasSeleccionadas = [];
var palabrasIncorrectas = [];

// DOM elements (unchanged)
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
var listaPalabrasIncorrectas = document.getElementById("lista-palabras-incorrectas");
var btnMostrarModalRanking = document.getElementById("mostrar-ranking");
var btnCerrarModalRanking = document.querySelector("#modal-ranking .cerrar");
var btnOrdenarRanking = document.getElementById("orden-ranking");

// Utility functions
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

function generarLetraAleatoria() {
    var totalPeso = Object.values(distribucionLetras).reduce((a, b) => a + b, 0);
    var aleatorio = Math.random() * totalPeso;
    var sumaPeso = 0;

    for (var letra in distribucionLetras) {
        sumaPeso += distribucionLetras[letra];
        if (aleatorio <= sumaPeso) {
            return letra;
        }
    }

    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
}

function calcularPuntos(palabra) {
    var longitud = palabra.length;
    if (longitud <= 4) return 1;
    if (longitud === 5) return 2;
    if (longitud === 6) return 3;
    if (longitud === 7) return 5;
    return 11;
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

// Game logic functions
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

    casillas.forEach(function (casilla) {
        casilla.classList.remove("disponible", "deshabilitada");
    });

    if (letrasSeleccionadas.length > 0) {
        var ultimaLetra = letrasSeleccionadas[letrasSeleccionadas.length - 1];
        var adyacentes = obtenerCasillasAdyacentes(
            ultimaLetra.fila,
            ultimaLetra.columna
        );

        adyacentes.forEach(function (casilla) {
            if (!casilla.classList.contains("seleccionada")) {
                casilla.classList.add("disponible");
            }
        });

        casillas.forEach(function (casilla) {
            if (
                !casilla.classList.contains("seleccionada") &&
                !casilla.classList.contains("disponible")
            ) {
                casilla.classList.add("deshabilitada");
            }
        });
    } else {
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
    } else if (esLetraAdyacente(fila, columna)) {
        seleccionarLetra(this, fila, columna);
        actualizarEstadoTablero();
    }
}

function limpiarSeleccion() {
    palabraActual = "";
    spanPalabraActual.textContent = "";
    letrasSeleccionadas = [];
    var casillasSeleccionadas = document.querySelectorAll(".casilla.seleccionada");
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

    var mensaje = 'La palabra "' + palabraActual + '" no existe en el diccionario. ';
    if (puntosPerdidos > 0) {
        mensaje += "Has perdido " + puntosPerdidos + " punto" + (puntosPerdidos > 1 ? "s" : "") + ".";
    } else {
        mensaje += "No has perdido puntos porque tu puntuación ya era 0.";
    }
    mostrarModal("Palabra inválida", mensaje);
}

function agregarPalabraALista(palabra, puntos) {
    var li = document.createElement("li");
    li.textContent = palabra + " (" + puntos + " puntos)";
    listapalabras.appendChild(li);
}

function verificarPalabra() {
    if (palabraActual.length < 3) {
        mostrarModal("Palabra inválida", "La palabra debe tener al menos 3 letras.");
        return;
    }

    if (palabrasEncontradas.indexOf(palabraActual) !== -1) {
        mostrarModal("Palabra repetida", "Ya has encontrado esta palabra.");
        return;
    }

    if (palabrasIncorrectas.indexOf(palabraActual) !== -1) {
        mostrarModal("Palabra inválida", "Ya has intentado esta palabra antes y no es válida.");
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
                mostrarModal("¡Palabra válida!", "Has ganado " + puntosPalabra + " puntos.");
                limpiarSeleccion();
            } else {
                penalizarPalabraIncorrecta();
                limpiarSeleccion();
            }
        })
        .catch(function (error) {
            console.error("Error al verificar la palabra:", error);
            mostrarModal("Error", "Hubo un problema al verificar la palabra. Inténtalo de nuevo.");
        });
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
    try {
        var resultados = JSON.parse(localStorage.getItem("boogleResultados")) || [];
        resultados.push({
            nombre: nombreJugador,
            puntuacion: puntuacion,
            fecha: new Date().toISOString(),
            palabrasEncontradas: palabrasEncontradas.length,
            palabrasIncorrectas: palabrasIncorrectas.length,
        });
        localStorage.setItem("boogleResultados", JSON.stringify(resultados));
    } catch (error) {
        console.error("Error al guardar el resultado:", error);
        mostrarModal("Error", "No se pudo guardar el resultado del juego.");
    }
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

function reiniciarJuego() {
    seccionFinJuego.classList.add("oculto");
    seccionInicio.classList.remove("oculto");
    inputNombreJugador.value = "";
    listapalabras.innerHTML = "";
}

function actualizarTablaRanking() {
    try {
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
                "<td>" + resultado.nombre + "</td>" +
                "<td>" + resultado.puntuacion + "</td>" +
                "<td>" + new Date(resultado.fecha).toLocaleString() + "</td>";
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al actualizar la tabla de ranking:", error);
        mostrarModal("Error", "No se pudo cargar la tabla de ranking.");
    }
}

function mostrarRanking() {
    var modalRanking = document.getElementById("modal-ranking");
    if (modalRanking) {
        modalRanking.style.display = "block";
        actualizarTablaRanking();
    } else {
        console.error("Elemento modal-ranking no encontrado");
        mostrarModal("Error", "No se pudo mostrar el ranking.");
    }
}

function cerrarModalRanking() {
    var modalRanking = document.getElementById("modal-ranking");
    if (modalRanking) {
        modalRanking.style.display = "none";
    } else {
        console.error("Elemento modal-ranking no encontrado");
    }
}

function iniciarJuego() {
    if (formNombreJugador) {
        formNombreJugador.addEventListener("submit", manejarInicioJuego);
    } else {
        console.error("Elemento form-nombre-jugador no encontrado");
    }

    if (btnEnviarPalabra) {
        btnEnviarPalabra.addEventListener("click", verificarPalabra);
    } else {
        console.error("Elemento enviar-palabra no encontrado");
    }

    if (btnNuevaPartida) {
        btnNuevaPartida.addEventListener("click", reiniciarJuego);
    } else {
        console.error("Elemento nueva-partida no encontrado");
    }

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener("click", cerrarModal);
    } else {
        console.error("Elemento modal-cerrar no encontrado");
    }

    if (btnMostrarModalRanking) {
        btnMostrarModalRanking.addEventListener("click", mostrarRanking);
    } else {
        console.error("Elemento mostrar-ranking no encontrado");
    }

    if (btnCerrarModalRanking) {
        btnCerrarModalRanking.addEventListener("click", cerrarModalRanking);
    } else {
        console.error("Elemento para cerrar modal-ranking no encontrado");
    }

    if (btnOrdenarRanking) {
        btnOrdenarRanking.addEventListener("change", actualizarTablaRanking);
    } else {
        console.error("Elemento orden-ranking no encontrado");
    }
}

window.addEventListener("load", iniciarJuego);