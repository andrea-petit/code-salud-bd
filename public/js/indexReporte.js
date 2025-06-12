document.addEventListener('DOMContentLoaded', async function() {

    const personalContainer = document.getElementById('personal-container');
    const actualizarDatosContainer = document.getElementById('actualizar-datos-personales');
    const verFamiliaresContainer = document.getElementById('ver-familiares');
    const pagosContainer = document.getElementById('pagos-container');
    const reporte = document.getElementById('reporte');
    const verFamiliaresButton = document.getElementById('familia-button');
    const reporteButton = document.getElementById('reporte-button');

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

    async function getPersonalData(){
        try {
            const response = await fetch('api/users/userInfo');
            if (!response.ok) {
                throw new Error('Error al obtener los datos personales');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
        
    }

    async function getFamilyMembers() {
        try {
            const response = await fetch('api/users/familyMembers/' + window.id_usuario);
            if (!response.ok) {
                throw new Error('Error al obtener los familiares');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    async function getHistorial() {
        try {
            const response = await fetch('api/users/getPaymentHistory/' + window.id_usuario);
            if (!response.ok) {
                throw new Error('Error al obtener el historial de pagos');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    const personalData = getPersonalData();
    const familyMembers = getFamilyMembers();
    const historialData = getHistorial();

    reporteButton.addEventListener('click', async function() {
        reporte.innerHTML = '';

        if (personalContainer) personalContainer.style.display = 'none';
        if (actualizarDatosContainer) actualizarDatosContainer.style.display = 'none';
        if (verFamiliaresContainer) verFamiliaresContainer.style.display = 'none';
        if (pagosContainer) pagosContainer.style.display = 'none';
        reporte.style.display = 'block';

        

        const reporteDiv = document.createElement('div');
        reporteDiv.id = 'reporteData';
        reporteDiv.className = 'reporte-data';

        const fechaActual = new Date().toLocaleDateString();
        const headerDiv = document.createElement('div');
        headerDiv.id = 'reporte-header';
        headerDiv.innerHTML = `
            <img src="/img/logo4.png" alt="logo">
            <div>
                <h2>
                <span style="color: #5DB640;">CODE</span>
                <span>-</span>
                <span style="color: #195ba7;">SALUD</span>
                </h2>
                <p>RIF J-3082850-7</p>
                <p>Fecha de emisión: ${fechaActual}</p>
            </div>
        `;
        reporteDiv.appendChild(headerDiv);
        reporteDiv.innerHTML += `<hr style="margin: 10px 0;">`;

        const personalData = await getPersonalData();
        const familyMembers = await getFamilyMembers();
        const historialData = await getHistorial();

        if (personalData && personalData.userInfo) {
            const info = personalData.userInfo;
            reporteDiv.innerHTML += `
                <h2>Datos Personales</h2>
                <p><strong>Nombres:</strong> ${info.nombre1} ${info.nombre2}</p>
                <p><strong>Apellidos:</strong> ${info.apellido1} ${info.apellido2}</p>
                <p><strong>Email:</strong> ${info.correo}</p>
                <p><strong>Teléfono:</strong> ${info.telefono}</p>
                <p><strong>Fecha de Nacimiento:</strong> ${info.fecha_nacimiento}</p>
                <p><strong>Ocupación:</strong> ${info.ocupacion}</p>
                <p><strong>Dirección:</strong> ${info.pais}, ${info.estado}, ${info.ciudad}</p>
                <p><strong>Plan:</strong> Capacidad ${info.capacidad_total}, No Directos ${info.max_no_directos}, Precio $${info.precio_mensual}</p>
            `;
        } else {
            reporteDiv.innerHTML += '<p>No se encontraron datos personales</p>';
        }


        if (familyMembers && familyMembers.familyMembers) {
            const familyDiv = document.createElement('div');
            familyDiv.id = 'familyMembersData';
            familyDiv.className = 'family-members-data';
            familyDiv.innerHTML = '<h2>Familiares</h2>';
            familyMembers.familyMembers.forEach(member => {
                familyDiv.innerHTML += `
                    <p>${member.nombre1} ${member.apellido1} - ${member.parentesco}</p>
                `;
            });
            reporteDiv.appendChild(familyDiv);
        } else {
            reporteDiv.innerHTML += '<p>No se encontraron familiares</p>';
        }


        if (historialData && Array.isArray(historialData.paymentHistory) && historialData.paymentHistory.length > 0) {
            const historialDiv = document.createElement('div');
            historialDiv.id = 'historialData';
            historialDiv.className = 'historial-data';
            historialDiv.innerHTML = '<h2>Historial de Pagos</h2>';
            historialData.paymentHistory.forEach(pago => {
                historialDiv.innerHTML += `
                    <div class="pago-item">
                        <strong>Periodo:</strong> ${pago.periodo || '-'}<br>
                        <strong>Descripción:</strong> ${pago.descripcion || '-'}<br>
                        ${pago.estado === "pagado" ? `<strong>Fecha:</strong> ${pago.fecha}<br>` : ""}
                        <strong>Monto:</strong> $${pago.monto}<br>
                        <strong>Estado:</strong> ${pago.estado}
                        <br>
                    </div>
                    <hr>
                `;
            });
            reporteDiv.appendChild(historialDiv);
        } else {
            reporteDiv.innerHTML += '<p>No se encontró historial de pagos</p>';
        }

        reporte.appendChild(reporteDiv);
        const volverBtn = document.createElement('button');
        volverBtn.textContent = 'Volver';
        volverBtn.style.marginBottom = '20px';
        volverBtn.onclick = function() {
            reporte.style.display = 'none';
            if (personalContainer) personalContainer.style.display = 'block';
        };
        reporte.appendChild(volverBtn);
    });
        


});


