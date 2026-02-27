const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());

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

let productData = {
    id: 101,
    name: "Nintendo Switch 2",
    price: 15000.00,
    message: "¡Nuevo producto disponible! La Nintendo Switch 2 ofrece una experiencia de juego mejorada con gráficos de alta calidad, mayor duración de batería y nuevas funciones para los jugadores. ¡No te pierdas esta increíble consola que revolucionará tu forma de jugar!"
};

const generateETag = (data) => {
    return `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`;
}

app.get('/product', (req, res) => {
    const clientDateString = req.headers['if-modified-since'];
    const currentETag = generateETag(productData);

    if (clientDateString) {
        const clientDate = new Date(clientDateString);
        if (clientDate >= productLastModified) {
            console.log('Producto no modificado desde la última solicitud.');
            res.setHeader('ETag', currentETag);
            return res.status(304).end();
        }
    }

    console.log('Enviando datos del producto actualizado.');
    res.setHeader('Last-Modified', productLastModified.toUTCString());
    res.setHeader('ETag', currentETag);
    res.json(productData);
});

app.put('/product', (req, res) => {
    const clientETag = req.headers['if-match'];
    const currentETag = generateETag(productData);

    if (!clientETag) {
        return res.status(428).json({ error: 'ETag requerido para actualizar el producto.' });
    }

    if (clientETag !== currentETag) {
        console.log('ETag no coincide. El producto ha sido modificado por otro cliente.');
        return res.status(412).json({ error: 'ETag no coincide. El producto ha sido modificado por otro cliente.' });
    }

    if (req.body.price) {
        productData.price = req.body.price;
    }

    const newETag = generateETag(productData);
    productLastModified.setTime(Date.now());
    productLastModified.setMilliseconds(0);

    res.setHeader('ETag', newETag);
    res.setHeader('Last-Modified', productLastModified.toUTCString());
    res.json({ message: 'Producto actualizado exitosamente.', data: productData });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
