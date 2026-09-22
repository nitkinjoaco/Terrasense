export interface medicion {
    timestamp: string;
    suelo : {
        humedad: number; 
        temperatura : number;
    }
    aire : {
        humedad: number; 
        temperatura : number;
    }
    luz: number;
    ph: number;
}


export interface usuario {
    nombre: string;
    correo: string;
    contrasena: string;
}