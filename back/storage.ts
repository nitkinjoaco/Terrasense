import type { medicion } from "./tipos.ts";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const carpeta = "./datos";
const archivo = join(carpeta, "mediciones.jsonl");

let ultima: medicion | null = null;

export function guardar(medicion: medicion) {
    if (!existsSync(carpeta)) {
        mkdirSync(carpeta, { recursive: true });
    }

    const linea = JSON.stringify(medicion) + "\n";
    appendFileSync(archivo, linea, "utf-8");

    ultima = medicion;
}

export function obtenerUltima(): medicion | null {
    if (ultima === null) {
        const historico = obtenerHistorico();
        ultima = historico[historico.length - 1] ?? null;
    }
    return ultima;
}

export function obtenerHistorico(): medicion[] {
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