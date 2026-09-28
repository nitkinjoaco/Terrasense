import type { medicion } from "./tipos.ts";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

let ultima: medicion | null = null;


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