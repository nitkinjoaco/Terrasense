
// en este archivo abrimos el puerto serie del arduino.
// cada vez que llega una línea completa, llamamos a la función que nos pasaron (alRecibir).
// no parsea ni guarda nada: de eso se encarga el index.

import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

const reintentar = 5000;

export function iniciarLector(ruta: string, alRecibir: (linea: string) => void, baudios = 9600) {

    function conectar() {
        const port = new SerialPort({
            path: ruta,
            baudRate: baudios,
            autoOpen: false,
        });

        const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

        parser.on("data", alRecibir);

        port.on("error", (err) => {
            console.error(`[lector] error: ${err.message}`);
        });

        port.on("close", () => {
            console.warn(`[lector] se desconectó ${ruta}, reintentando...`);
            setTimeout(conectar, reintentar);
        });

        port.open((err) => {
            if (err) {
                console.error(`[lector] no se pudo abrir ${ruta}: ${err.message}`);
                setTimeout(conectar, reintentar);
                return;
            }
            console.log(`[lector] conectado a ${ruta}`);
        });
    }

    conectar();
}