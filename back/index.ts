import  Express  from "express";
import { crearMedicion } from "./serial/mock.ts";
import { crearservidor } from "./api/rutas.ts";

crearservidor();