// en esta archivo vamos a escribir datos falsos en un archivo llamado "datos/mediciones.json" 
// en un intervalo en 5 segundos 

import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function crearMedicion() { 
    const carpeta = "./datos";
    const archivo = join(carpeta, "mediciones.json"); 

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
        
        const linea = `Timestamp: ${timestamp}, Suelo: ${JSON.stringify(suelo)}, Aire: ${JSON.stringify(aire)}, Luz: ${luz}, Ph: ${ph} \n `;
        
        appendFileSync(archivo,linea, "utf-8");
    }, 5000);
}
crearMedicion();