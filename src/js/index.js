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

// Inicialización
function iniciarJuego() {
    formNombreJugador.addEventListener("submit", manejarInicioJuego);
    btnEnviarPalabra.addEventListener("click", verificarPalabra);
    btnNuevaPartida.addEventListener("click", reiniciarJuego);
    btnCerrarModal.addEventListener("click", cerrarModal);
    btnMostrarModalRanking.addEventListener("click", mostrarRanking);
    btnCerrarModalRanking.addEventListener("click", cerrarModalRanking);
    btnOrdenarRanking.addEventListener("change", actualizarTablaRanking);
}