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

    

});