import { iniciarLector } from "./serial/lector.ts";
import { parsear } from "./parser.ts";
import { guardar, obtenerUltima } from "./storage.ts";
import { crearservidor } from "./api/rutas.ts";

const puerto = process.env.PUERTO ?? "COM3";

function alRecibir(linea: string) {
    const medicion = parsear(linea);
    if (medicion === null) {
        console.warn(`línea descartada: "${linea.trim()}"`);
        return;
    }
    guardar(medicion);
    console.log("última en memoria →", obtenerUltima());
}

iniciarLector(puerto, alRecibir);

crearservidor(3000);