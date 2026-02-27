const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Etag', 'Last-Modified']
};

app.use(cors(corsOptions));

app.get('/data', (req, res) => {
    const data = {
        message: "Hola, este es la información en tu Caché :("
    };

    const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`;
    console.log(`etag ${etag}`);
    
    if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
    } else {
        
        res.setHeader('ETag', etag);
        res.json(data);
    }
});

const productLastModified = new Date();
productLastModified.setMilliseconds(0);

const productData = {
    id: 101,
    name: "Nintendo Switch 2",
    price: 15000.00,
    message: "¡Nuevo producto disponible! La Nintendo Switch 2 ofrece una experiencia de juego mejorada con gráficos de alta calidad, mayor duración de batería y nuevas funciones para los jugadores. ¡No te pierdas esta increíble consola que revolucionará tu forma de jugar!"
};

app.get('/product', (req, res) => {
    const clientDateString = req.headers['if-modified-since'];
    if (clientDateString) {
        const clientDate = new Date(clientDateString);
        if (clientDate >= productLastModified) {
            console.log('Producto no modificado desde la última solicitud.');
            res.status(304).end();
        }
    }

    console.log('Enviando datos del producto actualizado.');
    res.setHeader('Last-Modified', productLastModified.toUTCString());
    res.json(productData);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
