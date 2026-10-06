export interface medicion {
    timestamp: string;
    suelo : {
        humedad: number | null; 
        temperatura : number | null;
    }
    aire : {
        humedad: number | null; 
        temperatura : number | null;
    }
    luz: number | null;
    ph: number | null;
}


export interface usuario {
    nombre: string;
    correo: string;
    contrasena: string;
}