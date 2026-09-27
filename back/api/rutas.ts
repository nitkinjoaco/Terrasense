import express from "express"
import { obtenerUltima, obtenerHistorico } from "../serial/mock.ts";

export function crearservidor (port = 3000) {
    const app = express();
    

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

    app.listen(port , () => {
        console.log(`Servidor corriendo en http://localhost:${port}`); 
    })
}