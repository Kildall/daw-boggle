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

