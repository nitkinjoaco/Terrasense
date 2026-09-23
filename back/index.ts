import express from "express"
import { crearservidor } from "./api/rutas.ts";
import { crearMedicion } from "./serial/mock.ts";

crearMedicion()
crearservidor()