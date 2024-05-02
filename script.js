document.addEventListener('DOMContentLoaded', function() {
    const listaCarrito = document.querySelector('#lista-carrito');
    const totalPagar = document.querySelector('#total-pagar');
    const pagarBoton = document.querySelector('#pagar');
    const vaciarBoton = document.querySelector('#vaciar');

    let carrito = [];

    modificadorCarrito();

    function modificadorCarrito() {
        // Agrega el resto del código dentro de esta función

        // Agrega producto al carrito
        document.querySelectorAll('.botonComprar').forEach(boton => {
            boton.addEventListener('click', agregarProducto);
        });

        // Elimina producto del carrito
        listaCarrito.addEventListener('click', e => {
            if(e.target.classList.contains('eliminar-producto')) {
                const nombreProducto = e.target.getAttribute('data-nombre');
                carrito = carrito.filter(producto => producto.nombre !== nombreProducto);
                carritoMostrado();
                guardarLocalCarrito();
                actualizarTotal();
            }
        });

        // Cambia cantidad de producto en el carrito
        listaCarrito.addEventListener('change', e => {
            if(e.target.classList.contains('cantidad-producto')) {
                const nombreProducto = e.target.getAttribute('data-nombre');
                let cantidad = parseInt(e.target.value);

                if(cantidad <= 0) {
                    carrito = carrito.filter(producto => producto.nombre !== nombreProducto);
                } else {
                    carrito = carrito.map(producto => {
                        if(producto.nombre === nombreProducto) {
                            producto.cantidad = cantidad;
                        }
                        return producto;
                    });
                }

                carritoMostrado();
                guardarLocalCarrito();
                actualizarTotal();
            }
        });

        // Evento para pagar
        pagarBoton.addEventListener('click', () => {
            if (carrito.length > 0) {
                Swal.fire({
                    icon: 'success',
                    title: 'Pago realizado con éxito',
                    showConfirmButton: true,
                }).then((result) => {
                    if (result.isDismissed || result.isConfirmed) {
                        vaciarCarrito();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'El carrito está vacío',
                    text: 'Agrega productos antes de proceder al pago',
                });
            }
        });

        //Funcionamiento boton para vaciar el carrito
        vaciarBoton.addEventListener('click', vaciarCarrito);
        
        // Cargar los elementos del carrito del localStorage solo si el carrito no está vacío
        if(localStorage.getItem('carrito')) {
            carrito = JSON.parse(localStorage.getItem('carrito'));
            if (carrito.length > 0) {
                carritoMostrado();
                actualizarTotal();
            } else {
                limpiarCarritoHtml();
            }
        } else {
            limpiarCarritoHtml();
        }
    }

    function agregarProducto(e) {
        const productoSeleccionado = e.target.parentElement.parentElement;
        const producto = {
            imagen: productoSeleccionado.querySelector('img').src,
            nombre: productoSeleccionado.querySelector('p').textContent,
            precio: parseFloat(productoSeleccionado.querySelector('p').textContent.split(':')[1].trim().replace('$', '').replace(',', '')),
            cantidad: 1
        };

        const existe = carrito.some(item => item.nombre === producto.nombre);
        if(existe) {
            const productos = carrito.map(item => {
                if(item.nombre === producto.nombre) {
                    item.cantidad++;
                }
                return item;
            });
            carrito = [...productos];
        } else {
            carrito = [...carrito, producto];
        }

        carritoMostrado();
        guardarLocalCarrito();
        actualizarTotal();
        Swal.fire({
            icon: 'success',
            title: 'Producto Agregado',
            text: 'El producto se ha agregado al carrito',
        });
    }

    function carritoMostrado() {
        // Vaciar carrito
        limpiarCarritoHtml();

        // Arma el carrito recorriendolo
        carrito.forEach(producto => {
            const { imagen, nombre, precio, cantidad } = producto;
            const subtotal = precio * cantidad;

            const contenidoProducto = document.createElement('li');
            contenidoProducto.innerHTML = `
                <img src="${imagen}" width="50">
                <p>${nombre} - Cantidad: <input class="cantidad-producto" type="number" min="0" value="${cantidad}" data-nombre="${nombre}"> - Subtotal: $${subtotal.toLocaleString()}</p>
                <button class="eliminar-producto" data-nombre="${nombre}">Eliminar</button>
            `;
            listaCarrito.appendChild(contenidoProducto);
        });
    }

    function limpiarCarritoHtml() {
        while(listaCarrito.firstChild) {
            listaCarrito.removeChild(listaCarrito.firstChild);
        }
    }

    function actualizarTotal() {
        if (carrito.length === 0) {
            totalPagar.textContent = 'Total a pagar: $0';
        } else {
            let total = 0;
            carrito.forEach(producto => {
                const { precio, cantidad } = producto;
                total += precio * cantidad;
            });
            totalPagar.textContent = `Total a pagar: $${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        }
    }

    function vaciarCarrito() {
        carrito = [];
        limpiarCarritoHtml();
        guardarLocalCarrito();
        actualizarTotal();
    }

    function guardarLocalCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }
});