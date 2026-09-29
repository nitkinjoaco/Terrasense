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

// así queda un usuario en datos/usuarios.json: sin la contraseña, solo su hash
export interface usuarioGuardado {
    nombre: string;
    correo: string;
    sal: string;
    hash: string;
}