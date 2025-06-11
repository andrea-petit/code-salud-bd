import { configurarBotonAgregarFamiliar } from './agregarFamiliar.js';



document.addEventListener('DOMContentLoaded', async function() {

    const personalContainer = document.getElementById('personal-container');
    const actualizarDatosContainer = document.getElementById('actualizar-datos-personales');
    const verFamiliaresContainer = document.getElementById('ver-familiares');
    const pagosContainer = document.getElementById('pagos-container');
    const reporte = document.getElementById('reporte');
    const verFamiliaresButton = document.getElementById('familia-button');

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

    const familyMembersDiv = document.getElementById('family-members');

    async function renderFamiliares(id_usuario) {

        const formEditar = document.getElementById('update-family-form');
        if (formEditar) formEditar.remove();

        while (familyMembersDiv.firstChild) {
            familyMembersDiv.removeChild(familyMembersDiv.firstChild);
        }


        const response = await fetch(`/api/users/familyMembers/${id_usuario}`);
        const data = await response.json();

        if (data && data.familyMembers && data.familyMembers.length > 0) {
            data.familyMembers.forEach(member => {
                const card = document.createElement('div');
                card.className = 'family-card';
                card.style.border = '1px solid #ccc';
                card.style.borderRadius = '8px';
                card.style.padding = '16px';
                card.style.margin = '16px 0';
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
                card.style.background = '#fff';

                card.innerHTML = `
                    <p><strong>Cédula:</strong> ${member.id_familiar}</p>
                    <p><strong>Nombres:</strong> ${member.nombre1} ${member.nombre2}</p>
                    <p><strong>Apellidos:</strong> ${member.apellido1} ${member.apellido2}</p>
                    <p><strong>Correo:</strong> ${member.correo || '-'}</p>
                    <p><strong>Teléfono:</strong> ${member.telefono || '-'}</p>
                    <p><strong>Parentesco:</strong> ${member.parentesco}</p>
                    <p><strong>Ocupación:</strong> ${member.ocupacion}</p>
                    <p><strong>Dirección:</strong> ${member.pais}, ${member.estado}, ${member.ciudad}</p>
                    <div style="margin-top:10px;">
                        <button class="update-family-member" data-id="${member.id_familiar}">Actualizar</button>
                        <button class="delete-family-member" data-id="${member.id_familiar}">Eliminar</button>
                    </div>
                `;
                familyMembersDiv.appendChild(card);
            });
                const volverBtn = document.createElement('button');
        volverBtn.textContent = 'Volver';
        volverBtn.style.marginBottom = '20px';
        volverBtn.onclick = function() {
            verFamiliaresContainer.style.display = 'none';
            personalContainer.style.display = 'block';
        };
        familyMembersDiv.appendChild(volverBtn);

        const addFamBtn = document.createElement('button');
        
        addFamBtn.textContent = 'Añadir familiar';
        addFamBtn.style.margin = '0 0 20px 10px';
        configurarBotonAgregarFamiliar(addFamBtn, familyMembersDiv, id_usuario, renderFamiliares);
        familyMembersDiv.appendChild(addFamBtn);

            
            const updateButtons = document.querySelectorAll('.update-family-member');
            updateButtons.forEach(button => {
                button.addEventListener('click', async function() {
                    const id_familiar = this.getAttribute('data-id');

                    const response = await fetch(`/api/users/familyMembers/${id_usuario}`);
                    const data = await response.json();
                    const familiar = data.familyMembers.find(f => f.id_familiar == id_familiar);

                    familyMembersDiv.innerHTML = '';

                    const card = document.createElement('div');
                    card.className = 'family-card';
                    card.style.border = '1px solid #ccc';
                    card.style.borderRadius = '8px';
                    card.style.padding = '16px';
                    card.style.margin = '16px 0';
                    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
                    card.style.background = '#fff';
                    card.innerHTML = `
                        <h3>Actualizar Familiar</h3><hr id="hr-update">
                        <p><strong>Cédula:</strong> ${familiar.id_familiar}</p>
                        <p><strong>Nombre:</strong> ${familiar.nombre1} ${familiar.nombre2}</p>
                        <p><strong>Apellido:</strong> ${familiar.apellido1} ${familiar.apellido2}</p>
                        <p><strong>Correo:</strong> ${familiar.correo || '-'}</p>
                        <p><strong>Teléfono:</strong> ${familiar.telefono || '-'}</p>
                        <p><strong>Parentesco:</strong> ${familiar.parentesco}</p>
                        <p><strong>Ocupación:</strong> ${familiar.ocupacion}</p>
                        <p><strong>Dirección:</strong> ${familiar.pais}, ${familiar.estado}, ${familiar.ciudad}</p>
                    `;
                    familyMembersDiv.appendChild(card);

                    const formDiv = document.createElement('div');
                    formDiv.id = 'update-family-form';
                    formDiv.innerHTML = `
                        <select id="campo-familiar">
                            <option value="nombre1">Primer nombre</option>
                            <option value="nombre2">Segundo nombre</option>
                            <option value="apellido1">Primer apellido</option>
                            <option value="apellido2">Segundo apellido</option>
                            <option value="correo">Correo</option>
                            <option value="telefono">Teléfono</option>
                            <option value="ocupacion">Ocupación</option>
                            <option value="fecha_nacimiento">Fecha de nacimiento</option>
                            <option value="direccion">Dirección</option>
                        </select>
                        <div id="input-familiar"></div>
                        <button type="button" id="guardar-update-familiar">Guardar</button>
                        <button type="button" id="cancelar-update-familiar">Cancelar</button>
                    `;
                    familyMembersDiv.appendChild(formDiv);

                    const campoSelect = formDiv.querySelector('#campo-familiar');
                    const inputDiv = formDiv.querySelector('#input-familiar');

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

                    function renderInput() {
                        inputDiv.innerHTML = '';
                        if (campoSelect.value === 'direccion') {
                            inputDiv.innerHTML = `
                                <input type="text" name="pais" placeholder="País">
                                <input type="text" name="estado" placeholder="Estado">
                                <input type="text" name="ciudad" placeholder="Ciudad">
                            `;
                        } else if (campoSelect.value === 'fecha_nacimiento') {
                            inputDiv.innerHTML = `<input type="date" name="fecha_nacimiento" placeholder="Fecha de nacimiento">`;
                        } else if (campoSelect.value === 'ocupacion') {
                            cargarOcupaciones().then(() => {
                                inputDiv.innerHTML = `
                                    <select name="ocupacion">
                                        <option value="">Selecciona ocupación</option>
                                        ${ocupacionesList.map(o => `<option value="${o}">${o}</option>`).join('')}
                                    </select>
                                `;
                            });
                        } else {
                            inputDiv.innerHTML = `<input type="text" name="${campoSelect.value}" placeholder="Nuevo valor">`;
                        }
                    }

                    campoSelect.addEventListener('change', renderInput);
                    renderInput();

                    formDiv.querySelector('#cancelar-update-familiar').onclick = async () => {
                        await renderFamiliares(id_usuario);
                    };

                    formDiv.querySelector('#guardar-update-familiar').onclick = async () => {
                        const campo = campoSelect.value;
                        let data = {};
                        if (campo === 'direccion') {
                            data = {
                                campo: 'direccion',
                                valor: {
                                    pais: inputDiv.querySelector('input[name="pais"]').value,
                                    estado: inputDiv.querySelector('input[name="estado"]').value,
                                    ciudad: inputDiv.querySelector('input[name="ciudad"]').value
                                }
                            };
                        } else if (campo === 'ocupacion') {
                            data = {
                                campo: 'ocupacion',
                                valor: inputDiv.querySelector('select[name="ocupacion"]').value
                            };
                        } else {
                            data = {
                                campo: campo,
                                valor: inputDiv.querySelector(`input[name="${campo}"]`).value
                            };
                        }

                        const seguro = confirm('¿Estás seguro de que deseas actualizar este dato del familiar?');
                        if (!seguro) return;

                        const response = await fetch(`/api/users/updateFamilyMember/${id_familiar}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });

                        if (response.ok) {
                            alert('¡Dato del familiar actualizado con éxito!');
                            formDiv.remove();
                            await renderFamiliares(id_usuario);
                        } else {
                            alert('Error al actualizar el dato del familiar.');
                        }
                    };
                });
            });

            const deleteButtons = familyMembersDiv.querySelectorAll('.delete-family-member');
            deleteButtons.forEach(button => {
                button.onclick = async function() {
                    const id_familiar = this.getAttribute('data-id');
                    const seguro = confirm('¿Estás seguro de que deseas eliminar este familiar?');
                    if (!seguro) return;

                    const response = await fetch(`/api/users/deleteFamilyMember/${id_familiar}`, {
                        method: 'POST'
                    });

                    if (response.ok) {
                        alert('Familiar eliminado con éxito');
                        await renderFamiliares(id_usuario);
                    } else {
                        alert('Error al eliminar el familiar.');
                    }
                };
            });
        }else {
            const noFam = document.createElement('p');
            noFam.textContent = 'No se encontraron familiares.';
            familyMembersDiv.appendChild(noFam);
        }
    }

    verFamiliaresButton.addEventListener('click', async function(e) {
        e.preventDefault();
        actualizarDatosContainer.style.display = 'none';
        pagosContainer.style.display = 'none';
        reporte.style.display = 'none';
        personalContainer.style.display = 'none';
        verFamiliaresContainer.style.display = 'block';
        await renderFamiliares(id_usuario);
    });

});