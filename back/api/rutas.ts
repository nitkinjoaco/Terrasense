import express from "express"

export function crearservidor (port = 3000) {
    const app = express();
    

    app.get('/api/hola', (req,res) => {
        res.send("hola");
    })

    app.listen(port , () => {
        console.log(`Servidor corriendo en http://localhost:${port}`); 
    })
}