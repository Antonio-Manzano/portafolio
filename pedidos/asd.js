let pedidos = [
    { id: 1, cliente: "Steve", producto: "Espada_de_Diamante", cantidad: 1 },
    { id: 2, cliente: "Alex", producto: "Pico_de_Hierro", cantidad: 3 }
];
let nextId = 3;

const form = document.getElementById('pedido-form');
const pedidoIdInput = document.getElementById('pedido-id');
const clienteInput = document.getElementById('cliente');
const productoSelect = document.getElementById('producto');
const cantidadInput = document.getElementById('cantidad');
const listaPedidosBody = document.getElementById('lista-pedidos');
const formTitulo = document.getElementById('form-titulo');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    guardarPedido();
});

function renderizarPedidos() {
    listaPedidosBody.innerHTML = '';

    pedidos.forEach(pedido => {
        const fila = listaPedidosBody.insertRow();
        
        fila.insertCell().textContent = pedido.id;
        fila.insertCell().textContent = pedido.cliente;
        fila.insertCell().textContent = pedido.producto.replace(/_/g, ' ');
        fila.insertCell().textContent = pedido.cantidad;

        const celdaAcciones = fila.insertCell();
        
        const btnModificar = document.createElement('button');
        btnModificar.textContent = 'Modificar';
        btnModificar.className = 'accion-btn modificar';
        btnModificar.onclick = () => cargarPedidoParaModificar(pedido.id);
        celdaAcciones.appendChild(btnModificar);

        const btnBorrar = document.createElement('button');
        btnBorrar.textContent = 'Borrar';
        btnBorrar.className = 'accion-btn borrar';
        btnBorrar.onclick = () => borrarPedido(pedido.id);
        celdaAcciones.appendChild(btnBorrar);
    });
}

function guardarPedido() {
    const id = pedidoIdInput.value;
    const cliente = clienteInput.value.trim();
    const producto = productoSelect.value;
    const cantidad = parseInt(cantidadInput.value);

    if (!cliente || !producto || isNaN(cantidad) || cantidad < 1) {
        alert('¡Error! Asegúrate de que todos los campos estén llenos y la cantidad sea válida.');
        return;
    }

    if (id) {
        const index = pedidos.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            pedidos[index] = { id: parseInt(id), cliente, producto, cantidad };
            alert(`¡Item ID ${id} actualizado en el inventario!`);
        }
    } else {
        const nuevoPedido = {
            id: nextId++,
            cliente: cliente,
            producto: producto,
            cantidad: cantidad
        };
        pedidos.push(nuevoPedido);
        alert(`¡${cantidad} ${nuevoPedido.producto.replace(/_/g, ' ')} añadido al inventario con ID ${nuevoPedido.id}!`);
    }

    limpiarFormulario();
    renderizarPedidos();
}

function cargarPedidoParaModificar(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        pedidoIdInput.value = pedido.id;
        clienteInput.value = pedido.cliente;
        productoSelect.value = pedido.producto;
        cantidadInput.value = pedido.cantidad;
        
        formTitulo.textContent = 'Modificar';
        submitButton.textContent = 'Actualizar Item';
        window.scrollTo(0, 0);
    }
}

function borrarPedido(id) {
    if (confirm(`¿Estás seguro de que quieres eliminar el item ID ${id} de tu inventario? ¡Esto es permanente!`)) {
        pedidos = pedidos.filter(p => p.id !== id);
        renderizarPedidos();
        limpiarFormulario();
        alert(`¡Item ID ${id} eliminado del inventario!`);
    }
}

function limpiarFormulario() {
    form.reset(); 
    pedidoIdInput.value = '';
    formTitulo.textContent = 'Registrar';
    submitButton.textContent = 'Guardar Pedido';
}

document.addEventListener('DOMContentLoaded', renderizarPedidos);