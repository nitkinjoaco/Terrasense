import express from "express"
import { obtenerHistorico, obtenerUltima } from "../storage.ts";
import { crearUsuario, verificarUsuario } from "../usuarios.ts";
import path from "node:path";

// true si es un texto con algo más que espacios
function esTexto(valor: unknown): valor is string {
    return typeof valor === "string" && valor.trim().length > 0;
}

export function crearservidor (port = 3000) {
    const app = express();
    app.use(express.static(path.join(import.meta.dirname, "..", ".." , "front")));
    // convierte el cuerpo JSON de los POST en req.body
    app.use(express.json());

    app.get('/api/actual', (req,res) => {
        const ultima = obtenerUltima();

        if (ultima === null) {
            res.status(404).json({ error: "todavía no hay mediciones" });
            return;
        }

        res.json(ultima);
    })

    app.get('/api/historico', (req,res) => {
        res.json(obtenerHistorico());
    })

    app.post('/api/usuarios', (req,res) => {
        const { nombre, correo, contrasena } = req.body ?? {};

        if (!esTexto(nombre) || !esTexto(correo) || !esTexto(contrasena)) {
            res.status(400).json({ error: "faltan campos: nombre, correo y contrasena son obligatorios" });
            return;
        }

        const creado = crearUsuario({ nombre, correo, contrasena });
        if (creado === null) {
            res.status(400).json({ error: "ya existe un usuario con ese correo" });
            return;
        }

        // nunca se devuelven la sal ni el hash
        res.status(201).json({ nombre: creado.nombre, correo: creado.correo });
    })

    app.post('/api/login', (req,res) => {
        const { correo, contrasena } = req.body ?? {};

        if (!esTexto(correo) || !esTexto(contrasena)) {
            res.status(400).json({ error: "faltan campos: correo y contrasena son obligatorios" });
            return;
        }

        const usuario = verificarUsuario(correo, contrasena);
        if (usuario === null) {
            // mismo mensaje si el correo no existe o si la contraseña está mal,
            // así no se puede averiguar qué correos están registrados
            res.status(401).json({ error: "correo o contraseña incorrectos" });
            return;
        }

        res.json({ nombre: usuario.nombre, correo: usuario.correo });
    })

    app.listen(port , () => {
        console.log(`Servidor corriendo en http://localhost:${port}`); 
    })
}