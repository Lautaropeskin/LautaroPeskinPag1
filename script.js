document.addEventListener('DOMContentLoaded', function() {
    const listaCarrito = document.querySelector('#lista-carrito');
    const totalPagar = document.querySelector('#total-pagar');
    const pagarBoton = document.querySelector('#pagar');
    const vaciarBoton = document.querySelector('#vaciar');

    let carrito = [];

    modificadorCarrito();

    function modificadorCarrito() {

        // Agrega producto al carrito
        document.querySelectorAll('.botonComprar').forEach(boton => {
            boton.addEventListener('click', agregarProducto);
        });

        // Elimina producto del carrito
        listaCarrito.addEventListener('click', evento => {
        //Contains, es como el in en python. El if es para chequear si el elemento que disparo el evento contiene la clase.
            if(evento.target.classList.contains('eliminar-producto')) {
                //Con el get attribute obtiene el valor del atributo data-nombre del elemento que se clickeo
                let nombreProducto = evento.target.getAttribute('data-nombre');
                //Con el filter creo un nuevo array con todos los elementos del carrito menos el de la variable nombreProducto
                //El filter crea nuevo array pero que cumpla con la condicion puesta.
                carrito = carrito.filter(producto => producto.nombre !== nombreProducto);
                carritoMostrado();
                guardarLocalCarrito();
                actualizarTotal();
            }
        });

        // Cambia cantidad de producto en el carrito
        listaCarrito.addEventListener('change', evento => {
            if(evento.target.classList.contains('cantidad-producto')) {
                const nombreProducto = evento.target.getAttribute('data-nombre');
                // El parseInt convierte en un entero, al valor del input de la cantidad de un producto, por eso se apunta al .value
                let cantidad = parseInt(evento.target.value);
                if(cantidad <= 0) {
                    // Con el filter se crea un nuevo array sin el producto del carrito, si la cantidad es menor o igual a 0
                    carrito = carrito.filter(producto => producto.nombre !== nombreProducto);
                } else {
                    // Con el map creo un nuevo array basado en el original, pero modificado por la funcion que se le pida.
                    //Con esto modifico las cantidades de un producto en el carrito
                    carrito = carrito.map(producto => {
                        if(producto.nombre === nombreProducto) {
                            //Modifico la cantidad del producto por la nueva cantidad
                            producto.cantidad = cantidad;
                        }
                        //Lo agrego al array modificado.
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
                //Swal.fire es para usar las alertas de sweetalert, es la forma puesta en su documentacion oficial. Alertas con mejor estetica.
                Swal.fire({
                    icon: 'success',
                    title: 'Pago realizado con éxito',
                    showConfirmButton: true,
//El .then tambien es usado en los ejemplos de sweetalert y es para manejar la respuesta del usuario despues de la alerta.
                }).then((result) => {
                    // Luego de tener la respuesta hay varias opciones tambien provenientes de los ejemplos de sweetalert, .isConfirmed o .isDismissed
                    // Si el usuario cierra la alerta haciando click en el boton se aplica el .isConfirmed
                    // Si el usuario cierra la alerta de otra forma ej: esc, se aplica el .isDismissed
                    if (result.isDismissed || result.isConfirmed) {
                        vaciarCarrito();
                    }
                });
            //Alerta por si el carrito esta vacio y se quiere pagar igual, ya que no es posible
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
        if(localStorage.getItem('carrito')) { //verificar si hay datos en el localStorage
            //Si existe, se obtiene el valor del item carrito en localStorage, que es una cadena JSON, y se convierte en un objeto JavaScript utilizando JSON.parse.
            carrito = JSON.parse(localStorage.getItem('carrito'));
            if (carrito.length > 0) {
            //Si el array carrito tiene elementos, se actualiza el total y la interfaz del usuario con carritoMostrado y actualizarTotal
                carritoMostrado();
                actualizarTotal();
            } else {
                //Si el array carrito está vacío, se llama a limpiarCarritoHtml() para limpiar la interfaz de usuario que muestra el carrito.
                limpiarCarritoHtml();
            }
        //Si no existe un item carrito en localStorage, se llama a limpiarCarritoHtml() para asegurar que la interfaz de usuario no muestre elementos del carrito.
        } else {
            limpiarCarritoHtml();
        }
    }

    function agregarProducto(evento) {
        // El parentElement sirve para navegar hacia arriba en la jerarquía del DOM.
        // Se usa dos veces porque el evento del boton agregar a bolsa, esta dentro de un div que esta dentro de otro que contiene la card
        // En producto seleccionado te queda la info de la card de un producto, precio, nombre, imagen.
        let productoSeleccionado = evento.target.parentElement.parentElement;
        // Se crea el objeto del producto, obteniendo la info de productoSeleccionado.
        const producto = {
            // Para obtner el src de la imagen del producto
            imagen: productoSeleccionado.querySelector('img').src,
            // Para obtener el nombre del producto
            nombre: productoSeleccionado.querySelector('p').textContent,
            // Para obtener el precio, se transforma de un formato de texto a un número float con el parseFloat. Procesando el texto para eliminar caracteres no numéricos como $ y ,.
            // Con split se divide el texto en un array, el primer elemnto es lo antes del : y el segundo lo de despues. Se toma el segundo elemento con el [1]
            // Queda el precio con el $ y un espacio, entonces con el trim se sacan los espacios en blanco. 
            // Y con el replace remplazo el "$" por "" y el "," por "", que son comillas vacias y asi saco estos simbolos del precio.
            precio: parseFloat(productoSeleccionado.querySelector('p').textContent.split(':')[1].trim().replace('$', '').replace(',', '')),
            // La cantidad se inicia en 1 porque se agrega un producto.
            cantidad: 1
        };
        //Se establece la variable existe que va a valer true or false.
        //Para esto se usa el .some que verifica si al menos un elemento de un arreglo cumple con una condición específica. Retornando true o false
        //En este caso si en el carrito hay algun item con el mismo nombre que el item que se esta agregando, el de la variable producto. Si hay devuleve true sino false
        let existe = carrito.some(item => item.nombre === producto.nombre);
        if(existe) {
            // Si el producto ya existe en el carrito, existe es true, se utiliza map para crear un nuevo array de productos con la cantidad del producto existente incrementada y manteniendo el resto.
            let productos = carrito.map(item => {
                if(item.nombre === producto.nombre) {
                    item.cantidad++;
                }
                return item;
            });
            //Se le asigna a carrito la nueva copia del array productos, se usa spread(...) porque asi creo un nuevo array de carrito que es independiente de productos.
            //Spread "(...)", crea copias superficiales que imitan a la origina pero se modifican independientemente,
            //Si no lo hacia de esta forma y directamente ponia carrito = [productos], no funcionaba correctamente por efectos secundarios
            carrito = [...productos];
        // Si el producto no existe en el carrito, existe es false, se agrega el nuevo producto al array del carrito.
        } else {
            //Se crea una nueva copia superficial con spread(...) del array carrito al que se le agrega un nuevo elemento producto al final.
            // Nuevamente fue necesario hacerlo de esta forma y no directo carrito = [carrito, producto], porque sino no funcionaba correctamente
            carrito = [...carrito, producto];
        }

        // Luego se actualiza la interfaz de usuario del carrito, se guarda en el localStorage y se actualiza el total del carrito.
        carritoMostrado();
        guardarLocalCarrito();
        actualizarTotal();
        //Alerta con sweetalert de que el producto se agrego al carrito.
        Swal.fire({
            icon: 'success',
            title: 'Producto Agregado',
            text: 'El producto se ha agregado al carrito',
        });
    }


    function carritoMostrado() {
        // Vaciar carrito
        limpiarCarritoHtml();

        // Arma el carrito recorriendolo. forEach es para recorrer cada objeto producto en el array carrito. No se usa for normal porque no se necesitan los indices.
        carrito.forEach(producto => {
            //Como se usa forEach y no for envez de poner producto.imagen, producto.nombre y etc. Se pone directo imagen, nombre y etc.
            //De esta forma tengo acceso a las propiedades de cada producto.
            const { imagen, nombre, precio, cantidad } = producto;
            //Se calcula el subtotal del producto
            let subtotal = precio * cantidad;
            //Luego se crea en el html un nuevo elemento de lista para representar cada producto en el carrito
            const contenidoProducto = document.createElement('li');
            //Luego completo el contendio de cada producto dentro del carrito. 
            //En el subtotal se usa el .toLocaleString() para que se exprese con "." en los miles, pero no es necesario para que funcione.
            //Se le pone nombre al boton para poder identificarlo cuando se necesario 
            contenidoProducto.innerHTML = `
                <img src="${imagen}" width="50">
                <p>${nombre} - Cantidad: <input class="cantidad-producto" type="number" min="0" value="${cantidad}" data-nombre="${nombre}"> - Subtotal: $${subtotal.toLocaleString()}</p>
                <button class="eliminar-producto" data-nombre="${nombre}">Eliminar</button>
            `;
            // Luego se agrega cada elemento de lista <li> (que representa un producto en el carrito) al <ul> con id listaCarrito en tu HTML. Para asi poder visualizarlo en el carrito.
            listaCarrito.appendChild(contenidoProducto);
        });
    }

    //Para vaciar el contenido HTML del elemento del DOM que representa el carrito de compras.
    function limpiarCarritoHtml() {
        while(listaCarrito.firstChild) {
            listaCarrito.removeChild(listaCarrito.firstChild);
        }
        //Elimina al primer hijo de listaCarrito mediante un while hasta que no queden mas, es decir cuando el firstChild de null.
    }

    //Funcion para calcular y mostrar el total a pagar en el carrito
    function actualizarTotal() {
        if (carrito.length === 0) {
            //Si el carrito esta vacio que se muestre que el total a pagar es 0
            totalPagar.textContent = 'Total a pagar: $0,00';
        } 
        //Si el carrito no esta vacio, calcular cuanto es el total sumando totales de cada producto usando forEach.
        else {
            let total = 0;
            carrito.forEach(producto => {
                const { precio, cantidad } = producto;
                total += precio * cantidad;
            });
            //Con el .textContent se pone cuanto es el total a pagar calculado.
            //El total.toLocaleString(undefined, {minimumFractionDigits: 2}) es para que se se muestre con al menos dos dígitos decimales y con separadores de miles. No ponerlo no arruinaria el funcionamiento
            //El undefined es para que los numeros en miles se pongan con "." en Argentina por ejemplo y "," en estados unidos, es decir que se adapte el formato de los numeros al pais.
            totalPagar.textContent = `Total a pagar: $${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        }
    }

    function vaciarCarrito() {
        carrito = [];
        limpiarCarritoHtml();
        guardarLocalCarrito();
        actualizarTotal();
    }

    //Esta funcion guarda el estado actual del carrito en el almacenamiento local del navegador (localStorage).
    function guardarLocalCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }
});