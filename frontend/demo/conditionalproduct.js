const urlBase = "localhost:3000";

document.getElementById('fetchData').addEventListener('click', () => {
    const lastModified = localStorage.getItem('lastModified');
    const headers = {};
    if (lastModified) {
        headers['If-Modified-Since'] = lastModified;
    }

    fetch(`http://${urlBase}/product`, {
        method: 'GET',
        headers: headers
    })
    .then(response => {
        const dataContainer = document.getElementById('dataContainer');
        if (response.status === 304) {
            console.log('Producto no modificado. Usando datos en caché.');
            dataContainer.innerHTML += `
                <p>Producto no modificado. Usando datos en caché.</p>
            `;
            return null;
        } else if (response.ok) {
            const newLastModified = response.headers.get('Last-Modified');
            if (newLastModified) {
                localStorage.setItem('lastModified', newLastModified);
                console.log(`Last-Modified actualizado a: ${newLastModified}`);
            }
            return response.json();
        } else {
            throw new Error('Error en la solicitud: ' + response.status);
        }
    })
    .then(data => {
        if (data) {
            const dataContainer = document.getElementById('dataContainer');
            dataContainer.innerHTML += `
                <hr>
                <h3>${data.name}</h3>
                <p><b>Precio:</b> $${data.price}</p>
                <p><i>${data.message}</i></p>
            `;
        }
    })
    .catch(error => {
        console.error('Error al obtener los datos del producto:', error);
    });
});