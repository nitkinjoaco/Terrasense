// en esta archivo vamos a escribir datos falsos en un archivo llamado "datos/mediciones.jsonl"
// (un objeto JSON por línea) en un intervalo en 5 segundos

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { medicion } from "../tipos.ts";

let ultima: medicion | null = null;

export function crearMedicion() {
    const carpeta = "./datos";
    const archivo = join(carpeta, "mediciones.jsonl");

    if (!existsSync(carpeta)) {
        mkdirSync(carpeta, { recursive: true });
    }

    setInterval(() => {
        const timestamp = new Date().toISOString();

        const suelo = {
            humedad: Math.floor(Math.random() * 100),
            temperatura: parseFloat((15 + Math.random() * 15).toFixed(1))
        };
        const aire = {
            humedad: parseFloat((50 + Math.random() * 30).toFixed(1)),
            temperatura: parseFloat((18 + Math.random() * 12).toFixed(1))
        };

        const luz = Math.floor(Math.random() * 100);
        const ph = parseFloat((5 + Math.random() * 3).toFixed(1));

        const m: medicion = { timestamp, suelo, aire, luz, ph };

        ultima = m; 
        appendFileSync(archivo, JSON.stringify(m) + "\n", "utf-8");
    }, 5000);
}

export function obtenerUltima(): medicion | null {
    return ultima;
}

export function obtenerHistorico(): medicion[] {
    const archivo = join("./datos", "mediciones.jsonl");
    const historico: medicion[] = [];

    if (existsSync(archivo)) {
        const texto = readFileSync(archivo, "utf-8");
        const lineas = texto.trim().split("\n");

        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i];
            if (linea && linea.length > 0) {
                historico.push(JSON.parse(linea) as medicion);
            }
        }
    } 

    return historico;
}