document.addEventListener('DOMContentLoaded', async function() {

    const personalContainer = document.getElementById('personal-container');
    const actualizarDatosContainer = document.getElementById('actualizar-datos-personales');
    const verFamiliaresContainer = document.getElementById('ver-familiares');
    const pagosContainer = document.getElementById('pagos-container');
    const reporte = document.getElementById('reporte');
    const verFamiliaresButton = document.getElementById('familia-button');
    const reporteButton = document.getElementById('reporte-button');
    const pagoButton = document.getElementById('pago-button');

    async function getIdUsuario() {
        try {
            const response = await fetch('/api/users/userInfo');
            if (!response.ok) throw new Error('No se pudo obtener userInfo');
            const data = await response.json();
            if (data && data.userInfo && data.userInfo.id_usuario) {
                window.id_usuario = data.userInfo.id_usuario;
            }
        } catch (error) {
            console.error('Error obteniendo id_usuario:', error);
        }
    }

    await getIdUsuario();

    pagoButton.addEventListener('click', function() {
        personalContainer.style.display = 'none';
        actualizarDatosContainer.style.display = 'none';
        verFamiliaresContainer.style.display = 'none';
        pagosContainer.style.display = 'block';
        reporte.style.display = 'none';
    });
    
    async function mostrarPagoPendiente() {
        try {
            const response = await fetch(`/api/users/getPaymentPendiente/${window.id_usuario}`);
            const data = await response.json();
            const infoDiv = document.getElementById('pago-pendiente-info');
            if (data && data.paymentPendiente && data.paymentPendiente.estado === 'pendiente') {
                const pago = data.paymentPendiente;
                infoDiv.innerHTML = `
                    <div id="container-pay">
                        <strong>Periodo:</strong> ${pago.periodo || '-'}<br>
                        <strong>Monto:</strong> $${pago.monto}<br>
                        <strong>Estado:</strong> ${pago.estado}
                    </div>
                `;
                document.getElementById('submit-payment').dataset.idPago = pago.id;
                document.getElementById('submit-payment').disabled = false;
            } else {
                infoDiv.innerHTML = '<p>No tienes pagos pendientes.</p>';
                document.getElementById('submit-payment').disabled = true;
            }
        } catch (error) {
            console.error('Error mostrando pago pendiente:', error);
        }
    }

    const pagosBtns = document.createElement('div');
    pagosBtns.className = 'pagos-btns';

    const volverBtn = document.createElement('button');
    volverBtn.textContent = 'Volver';
    volverBtn.type = 'button';
    volverBtn.id = 'volver-btn';

    const pagarBtn = document.getElementById('submit-payment');
    pagosBtns.appendChild(volverBtn);
    pagosBtns.appendChild(pagarBtn);

    const paymentForm = document.getElementById('payment-form');
    paymentForm.appendChild(pagosBtns);

    volverBtn.addEventListener('click', function() {
        actualizarDatosContainer.style.display = 'none';
        verFamiliaresContainer.style.display = 'none';
        pagosContainer.style.display = 'none';
        reporte.style.display = 'none';
        personalContainer.style.display = 'block';
    });

    await mostrarPagoPendiente();

    document.getElementById('submit-payment').addEventListener('click', async function() {
        const idPago = this.dataset.idPago;
        if (!idPago) {
            alert('No hay pago pendiente seleccionado.');
            return;
        }
        try {
            const response = await fetch(`/api/users/payPendiente/${idPago}`, { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                alert('¡Pago realizado con éxito!');
                await mostrarPagoPendiente(); 
                actualizarDatosContainer.style.display = 'none';
                verFamiliaresContainer.style.display = 'none';
                pagosContainer.style.display = 'none';
                reporte.style.display = 'none';
                personalContainer.style.display = 'block';
            } else {
                alert(result.message || 'Error al realizar el pago.');
            }
        } catch (error) {
            alert('Error al conectar con el servidor.');
        }
    });
});