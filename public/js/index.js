document.addEventListener('DOMContentLoaded', function() {

    
    const personalContainer = document.getElementById('personal-container');
    const personalDiv = document.createElement('div');
    personalDiv.id = 'personalData';
    personalDiv.className = 'personal-data';
    const actualizarDatosPersonales= document.getElementById('actualizar-datos-personales');
    const updatePersonalButton = document.getElementById('update-personal-button');
    const verFamiliaresContainer = document.getElementById('ver-familiares');
    const addServicesContainer = document.getElementById('add-services');
    const historial= document.getElementById('historial');


    async function fetchPersonalData() {
        try{
            
            const response = await fetch('api/users/UserInfo');
            if (!response.ok){
                throw new Error('Error al obtener los datos personales');
                console.error('Error al obtener los datos personales');
            }
        }catch (error) {
            console.error('Error:', error);
            return;
        }
    }

    personalData = fetchPersonalData();
    personalData.then(data => {
        if (data) {
            personalDiv.innerHTML = `
                <h2>Datos Personales</h2>
                <p>Nombre: ${data.nombre}</p>
                <p>Apellido: ${data.apellido}</p>
                <p>Email: ${data.email}</p>
                <p>Teléfono: ${data.telefono}</p>
                <p>Fecha de Nacimiento: ${data.fecha_nacimiento}</p>
                <p>Ocupación: ${data.ocupacion}</p>
                <p>Dirección: ${data.pais}, ${data.estado}, ${data.ciudad} </p>
                <p>Plan: ${data.plan}</p>
            `;
        } else {
            personalContainer.innerHTML = '<p>No se encontraron datos personales.</p>';
        }
    });

    personalContainer.appendChild(personalDiv);

    const personalButton = document.getElementById('actualizar-button');
    personalButton.addEventListener('click', function() {

        const form = document.getElementById('personal-form');
        const valor= form.querySelector('select[name="valor"]').value;
        if(valor === 'dirección'){
            const pais= form.createElement('input');
            pais.type = 'text';
            pais.name = 'pais';
            pais.placeholder = 'País';
            const estado = form.createElement('input');
            estado.type = 'text';
            estado.name = 'estado';
            estado.placeholder = 'Estado';
            const ciudad = form.createElement('input');
            ciudad.type = 'text';
            ciudad.name = 'ciudad';
            ciudad.placeholder = 'Ciudad';
            form.appendChild(pais);
            form.appendChild(estado);
            form.appendChild(ciudad);

        }else{
            const input = document.createElement('input');
            input.type = 'text';
            input.name = valor.toLowerCase();
            input.placeholder = 'Nuevo valor';
            form.appendChild(input);

        }
    });

    updatePersonalButton.addEventListener('click', async function() {
        if(campo === 'dirección'){
            const pais = document.querySelector('input[name="pais"]').value;
            const estado = document.querySelector('input[name="estado"]').value;
            const ciudad = document.querySelector('input[name="ciudad"]').value;
            data= {
                pais: pais,
                estado: estado,
                ciudad: ciudad
            };
            result= await fetch('api/users/updateUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

        }
    });
        

        
});