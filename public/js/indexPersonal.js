document.addEventListener('DOMContentLoaded', function() {

    
    const personalContainer = document.getElementById('personal-container');
    const personalDiv = document.createElement('div');
    personalDiv.id = 'personalData';
    personalDiv.className = 'personal-data';
    const actualizarDatosContainer= document.getElementById('actualizar-datos-personales');
    const updatePersonalButton = document.getElementById('update-personal-button');
    const verFamiliaresContainer = document.getElementById('ver-familiares');
    const pagosContainer = document.getElementById('pagos-container');
    const reporte= document.getElementById('reporte');


    
    async function fetchPersonalData() {
        try{
            const response = await fetch('api/users/UserInfo');
            if (!response.ok){
                throw new Error('Error al obtener los datos personales');
                console.error('Error al obtener los datos personales');
            }
            const data = await response.json();
            if (data && data.userInfo) {
                return data;
            } else {
                console.error('No se encontraron datos personales');
                return null;
            }
        }catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    personalData = fetchPersonalData();
    personalData.then(data => {
        if (data && data.userInfo) {
            const info = data.userInfo;
            personalDiv.innerHTML = `
                <h2>Datos Personales</h2>
                <p>Nombres: ${info.nombre1} ${info.nombre2}</p>
                <p>Apellidos: ${info.apellido1} ${info.apellido2}</p>
                <p>Email: ${info.correo}</p>
                <p>Teléfono: ${info.telefono}</p>
                <p>Fecha de Nacimiento: ${info.fecha_nacimiento}</p>
                <p>Ocupación: ${info.ocupacion}</p>
                <p>Dirección: ${info.pais}, ${info.estado}, ${info.ciudad}</p>
                <p>Plan: Capacidad ${info.capacidad_total}, No Directos ${info.max_no_directos}, Precio $${info.precio_mensual}</p>
            `;
            personalContainer.appendChild(personalDiv);

        } else {
            personalContainer.innerHTML = '<p>No se encontraron datos personales lll</p>';
        }
    });

    

    const personalButton = document.getElementById('actualizar-button');
    personalButton.addEventListener('click', async function(e) {
        e.preventDefault();
        actualizarDatosContainer.style.display = 'block';
        verFamiliaresContainer.style.display = 'none';
        pagosContainer.style.display = 'none';
        reporte.style.display = 'none';
        personalContainer.style.display = 'none';

        const form = document.getElementById('personal-form');
        while (form.firstChild) {
            form.removeChild(form.firstChild);
        }

        const volverBtn = document.createElement('button');
        volverBtn.type = 'button';
        volverBtn.textContent = 'Volver';
        volverBtn.style.marginRight = '10px';
        form.appendChild(volverBtn);

        volverBtn.addEventListener('click', function() {
            actualizarDatosContainer.style.display = 'none';
            verFamiliaresContainer.style.display = 'none';
            pagosContainer.style.display = 'none';
            reporte.style.display = 'none';
            personalContainer.style.display = 'block';
        });


        const select = document.createElement('select');
        select.name = 'valor';
        select.innerHTML = `
            <option value="nombre1">Primer nombre</option>
            <option value="nombre2">Segundo Nombre</option>
            <option value="apellido1">Primer Apellido</option>
            <option value="apellido2">Segundo Apellido</option>
            <option value="correo">Correo</option>
            <option value="telefono">Teléfono</option>
            <option value="ocupacion">Ocupación</option>
            <option value="fecha_nacimiento">Fecha de Nacimiento</option>
            <option value="direccion">Dirección</option>
        `;
        form.appendChild(select);

        
        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.textContent = 'Actualizar';
        form.appendChild(submitBtn);

        
        let ocupacionesList = [];
        async function cargarOcupaciones() {
            if (ocupacionesList.length === 0) {
                const res = await fetch('/api/users/ocupaciones');
                const data = await res.json();
                ocupacionesList = Array.isArray(data.ocupaciones)
                    ? data.ocupaciones.map(o => o.descripcion)
                    : [];
            }
        }

        select.addEventListener('change', async function() {
            Array.from(form.children).forEach(child => {
                if (child !== select && child !== submitBtn && child !== volverBtn) {
                    form.removeChild(child);
                }
            });

            if (select.value === 'direccion') {
                const pais = document.createElement('input');
                pais.type = 'text';
                pais.name = 'pais';
                pais.placeholder = 'País';

                const estado = document.createElement('input');
                estado.type = 'text';
                estado.name = 'estado';
                estado.placeholder = 'Estado';

                const ciudad = document.createElement('input');
                ciudad.type = 'text';
                ciudad.name = 'ciudad';
                ciudad.placeholder = 'Ciudad';

                form.insertBefore(pais, submitBtn);
                form.insertBefore(estado, submitBtn);
                form.insertBefore(ciudad, submitBtn);
            } else if (select.value === 'fecha_nacimiento') {
                const input = document.createElement('input');
                input.type = 'date';
                input.name = 'fecha_nacimiento';
                input.placeholder = 'Nueva fecha de nacimiento';
                form.insertBefore(input, submitBtn);
            } else if (select.value === 'ocupacion') {
                await cargarOcupaciones();
                const ocupacionSelect = document.createElement('select');
                ocupacionSelect.name = 'ocupacion';
                ocupacionSelect.innerHTML = `<option value="">Selecciona ocupación</option>` +
                    ocupacionesList.map(o => `<option value="${o}">${o}</option>`).join('');
                form.insertBefore(ocupacionSelect, submitBtn);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.name = select.value.toLowerCase();
                input.placeholder = 'Nuevo valor';
                form.insertBefore(input, submitBtn);
            }
        });

        select.dispatchEvent(new Event('change'));

        submitBtn.addEventListener('click', async function() {
            const campo = select.value;
            let data = {};
            if (campo === 'direccion') {
                data = {
                    campo: 'direccion',
                    valor: {
                        pais: form.querySelector('input[name="pais"]').value,
                        estado: form.querySelector('input[name="estado"]').value,
                        ciudad: form.querySelector('input[name="ciudad"]').value
                    }
                };
            } else if (campo === 'ocupacion') {
                data = {
                    campo: 'ocupacion',
                    valor: form.querySelector('select[name="ocupacion"]').value
                };
            } else {
                data = {
                    campo: campo,
                    valor: form.querySelector(`input[name="${campo}"]`).value
                };
            }

            const seguro = confirm('¿Estás seguro de que deseas actualizar este dato?');
            if (!seguro) return;

            const response = await fetch('api/users/updateUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('¡Dato actualizado con éxito!');
                while (form.firstChild) {
                    form.removeChild(form.firstChild);
                }
                actualizarDatosContainer.style.display = 'none';
                verFamiliaresContainer.style.display = 'none';
                pagosContainer.style.display = 'none';
                reporte.style.display = 'none';
                personalContainer.style.display = 'block';


                const dataPersonal = await fetchPersonalData();
                if (dataPersonal && dataPersonal.userInfo) {
                    const info = dataPersonal.userInfo;
                    personalDiv.innerHTML = `
                        <h2>Datos Personales</h2>
                        <p>Nombres: ${info.nombre1} ${info.nombre2}</p>
                        <p>Apellidos: ${info.apellido1} ${info.apellido2}</p>
                        <p>Email: ${info.correo}</p>
                        <p>Teléfono: ${info.telefono}</p>
                        <p>Fecha de Nacimiento: ${info.fecha_nacimiento}</p>
                        <p>Ocupación: ${info.ocupacion}</p>
                        <p>Dirección: ${info.pais}, ${info.estado}, ${info.ciudad}</p>
                        <p>Plan: Capacidad ${info.capacidad_total}, No Directos ${info.max_no_directos}, Precio $${info.precio_mensual}</p>
                    `;
                }
            } else {
                alert('Error al actualizar el dato.');
            }
        });
    });

});