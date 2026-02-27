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
        const etag = response.headers.get('ETag');
        if (etag) {
            localStorage.setItem('productETag', etag);
        }

        if (response.status === 304) {
            console.log('Producto no modificado. Usando datos en caché.');
            dataContainer.innerHTML += `
                <p style="color: green;">Producto no modificado. Usando datos en caché.</p>
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

document.getElementById('updateData').addEventListener('click', () => {
    const currentETag = localStorage.getItem('productETag');
    const newPriceValue = document.getElementById('newPrice').value;

    if (!currentETag) {
        alert('No se puede actualizar el producto. No se ha obtenido un ETag válido.');
        return;
    }

    fetch(`http://${urlBase}/product`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'If-Match': currentETag
        },
        body: JSON.stringify({ price: Number(newPriceValue) })
    })
    .then(response => {
        const updateStatus = document.getElementById('updateStatus');
        if (response.status === 412) {
            updateStatus.innerHTML = `
                <p style="color: red;">Error: El producto ha sido modificado por otro usuario. Por favor, actualice los datos antes de intentar nuevamente.</p>
            `;
        } else if (response.ok) {
            const newETag = response.headers.get('ETag');
            if (newETag) {
                localStorage.setItem('productETag', newETag);
            }
            localStorage.removeItem('lastModified');
            updateStatus.innerHTML = `<p style="color: green;">Producto actualizado exitosamente.</p>`;
        } else {
            updateStatus.innerHTML = `<p style="color: red;">Error al actualizar el producto. Código de estado: ${response.status}</p>`;
            throw new Error('Error en la solicitud: ' + response.status);
        }
    })
    .catch(error => {
        console.error('Error al actualizar el producto:', error);
    });
});