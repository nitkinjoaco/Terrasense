import express from "express"

export function crearservidor() {
    const app = express();
    const PORT = Number(process.env.PORT) || 3000
    
    app.use(express.static("front"));

    app.get('/a' , (req,res) => {
        console.log("hola desde express");
    })  

    app.listen(PORT, () => {
        console.log(`Servidor en http://localhost:${PORT}`)
    })
}