//aca agarramos los datos del arduino y hacemos dos cosas: 
// Convertir: pasar de texto a números y armar el objeto.
// Validar: rechazar lo que no tiene sentido, como una línea cortada, basura del arranque, un sensor que falló o un pH de 19.

import type { medicion } from "./tipos.ts";

export function parsear (linea: string): medicion | null {
    const partes = linea.trim().split(",");
    if (partes.length !== 6) {return null}

    const numeros: number[] = [];
    for (let i = 0; i < partes.length; i++) {
        const numero = Number(partes[i]);
        if (Number.isNaN(numero)) return null;
        numeros.push(numero);
    }

    const [suelo_hum, suelo_temp, aire_hum, aire_temp, luz, ph] = numeros;

    if (
        suelo_hum === undefined || suelo_temp === undefined ||
        aire_hum === undefined  || aire_temp === undefined  ||
        luz === undefined       || ph === undefined
    ) return null;

    return {
        timestamp: new Date().toISOString(),
        suelo: { humedad: suelo_hum, temperatura: suelo_temp },
        aire:  { humedad: aire_hum,  temperatura: aire_temp },
        luz,
        ph,
    };
}

