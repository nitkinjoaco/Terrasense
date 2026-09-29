// en este archivo guardamos y buscamos usuarios en "datos/usuarios.json".
// la contraseña nunca se guarda tal cual: se guarda un hash hecho con scrypt
// más una "sal" aleatoria por usuario, así dos contraseñas iguales no dan el mismo hash.
// es un array JSON y no un .jsonl como las mediciones: son pocos usuarios
// y más adelante hay que poder modificarlos (cambiar la contraseña).

import type { usuario, usuarioGuardado } from "./tipos.ts";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const carpeta = "./datos";
const archivo = join(carpeta, "usuarios.json");

function leerUsuarios(): usuarioGuardado[] {
    if (!existsSync(archivo)) {
        return [];
    }
    return JSON.parse(readFileSync(archivo, "utf-8")) as usuarioGuardado[];
}

function escribirUsuarios(usuarios: usuarioGuardado[]) {
    if (!existsSync(carpeta)) {
        mkdirSync(carpeta, { recursive: true });
    }
    writeFileSync(archivo, JSON.stringify(usuarios, null, 2), "utf-8");
}

function hashear(contrasena: string, sal: string): string {
    return scryptSync(contrasena, sal, 64).toString("hex");
}

// "Joaco@Gmail.com " y "joaco@gmail.com" son el mismo correo
function normalizarCorreo(correo: string): string {
    return correo.trim().toLowerCase();
}

function buscarUsuario(usuarios: usuarioGuardado[], correo: string): usuarioGuardado | null {
    for (let i = 0; i < usuarios.length; i++) {
        const u = usuarios[i];
        if (u && u.correo === correo) {
            return u;
        }
    }
    return null;
}

// devuelve el usuario creado, o null si el correo ya estaba registrado
export function crearUsuario(nuevo: usuario): usuarioGuardado | null {
    const usuarios = leerUsuarios();
    const correo = normalizarCorreo(nuevo.correo);

    if (buscarUsuario(usuarios, correo) !== null) {
        return null;
    }

    const sal = randomBytes(16).toString("hex");
    const guardado: usuarioGuardado = {
        nombre: nuevo.nombre.trim(),
        correo,
        sal,
        hash: hashear(nuevo.contrasena, sal),
    };

    usuarios.push(guardado);
    escribirUsuarios(usuarios);
    return guardado;
}

// devuelve el usuario si el correo existe y la contraseña coincide, o null si no
export function verificarUsuario(correo: string, contrasena: string): usuarioGuardado | null {
    const u = buscarUsuario(leerUsuarios(), normalizarCorreo(correo));
    if (u === null) {
        return null;
    }

    // se hashea la contraseña que llegó con la misma sal y se comparan los hashes.
    // timingSafeEqual tarda lo mismo acierte o no, así no se puede adivinar el hash midiendo tiempos
    const ingresado = Buffer.from(hashear(contrasena, u.sal), "hex");
    const guardado = Buffer.from(u.hash, "hex");
    if (ingresado.length !== guardado.length || !timingSafeEqual(ingresado, guardado)) {
        return null;
    }

    return u;
}
