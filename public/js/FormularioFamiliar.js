function crearFormularioFamiliar(
    planNoDirectos,
    planCapacidadTotal,
    allData,
    familiaresActuales = []
) {
   
    if (!Array.isArray(parentescosDirectos)) parentescosDirectos = [];
    if (!Array.isArray(parentescosNoDirectos)) parentescosNoDirectos = [];
    if (!Array.isArray(ocupaciones)) ocupaciones = [];

    
    const nombresParentescosDirectos = parentescosDirectos.map(p => typeof p === "string" ? p : p.descripcion);
    const nombresParentescosNoDirectos = parentescosNoDirectos.map(p => typeof p === "string" ? p : p.descripcion);
    const nombresOcupaciones = ocupaciones.map(o => typeof o === "string" ? o : o.descripcion);

    let noDirectosActuales = 0;
    let madreUsada = false;
    let padreUsado = false;
    familiaresActuales.forEach(fam => {
        if (nombresParentescosNoDirectos.includes(fam.parentesco)) {
            noDirectosActuales++;
        }
        if (fam.parentesco === "Madre") madreUsada = true;
        if (fam.parentesco === "Padre") padreUsado = true;
    });

    if (familiaresActuales.length >= planCapacidadTotal) {
        document.getElementById('add-family-form').innerHTML = '<p>Ya alcanzaste el máximo de familiares permitidos por tu plan.</p>';
        return;
    }

    let opcionesParentesco = [];
    if (!madreUsada) opcionesParentesco.push("Madre");
    if (!padreUsado) opcionesParentesco.push("Padre");
    opcionesParentesco = opcionesParentesco.concat(
        nombresParentescosDirectos.filter(p => !["Madre", "Padre"].includes(p)),
        (noDirectosActuales < planNoDirectos ? nombresParentescosNoDirectos : [])
    );

    if (opcionesParentesco.length === 0) {
        document.getElementById('add-family-form').innerHTML = '<p>No hay más tipos de familiares que puedas agregar.</p>';
        return;
    }

    const selectHtml = `
        <select name="parentesco" required>
            <option value="">Selecciona parentesco</option>
            ${opcionesParentesco.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
    `;
    const ocupacionSelectHtml = `
        <select name="ocupacion" required>
            <option value="">Selecciona ocupación</option>
            ${nombresOcupaciones.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>
    `;

    const familyForm = document.getElementById('add-family-form');
    familyForm.innerHTML = '';
    const familyMemberDiv = document.createElement('div');
    familyMemberDiv.className = 'family-member';
    familyMemberDiv.innerHTML = `
        <h4>Familiar</h4>
        <form>
            <input type="text" name="id_familiar" placeholder="Cédula del Familiar">
            <input type="text" name="nombre1" placeholder="Primer Nombre">
            <input type="text" name="nombre2" placeholder="Segundo Nombre">
            <input type="text" name="apellido1" placeholder="Primer Apellido">
            <input type="text" name="apellido2" placeholder="Segundo Apellido">
            <input type="email" name="correo" placeholder="Correo">
            <input type="text" name="telefono" placeholder="Teléfono">
            <input type="text" name="pais" placeholder="País">
            <input type="text" name="estado" placeholder="Estado">
            <input type="text" name="ciudad" placeholder="Ciudad">
            ${selectHtml}
            ${ocupacionSelectHtml}
            <button class="submit-family-member" type="button">Agregar Familiar</button>
        </form>
    `;

    familyForm.appendChild(familyMemberDiv);

    const finalizarBtn = document.createElement('button');
    finalizarBtn.textContent = 'Finalizar';
    finalizarBtn.type = 'button';
    finalizarBtn.className = 'finalizar-familiares';
    familyForm.appendChild(finalizarBtn);

    finalizarBtn.addEventListener('click', function() {
        alert('Registro de familiares finalizado.');
        window.location.href = '/login';
    });

    const submitFamilyMemberBtn = familyMemberDiv.querySelector('.submit-family-member');
    submitFamilyMemberBtn.addEventListener('click', async function() {
        const formData = new FormData(familyMemberDiv.querySelector('form'));
        const parentesco = formData.get('parentesco');
        if (!parentesco) {
            alert('Debes seleccionar un parentesco.');
            return;
        }

        if (parentesco === "Madre" && madreUsada) {
            alert('Solo puedes agregar una madre.');
            return;
        }
        if (parentesco === "Padre" && padreUsado) {
            alert('Solo puedes agregar un padre.');
            return;
        }
        if (nombresParentescosNoDirectos.includes(parentesco) && noDirectosActuales >= planNoDirectos) {
            alert(`Solo puedes agregar ${planNoDirectos} familiares no directos.`);
            return;
        }
        if (familiaresActuales.length >= planCapacidadTotal) {
            alert(`Solo puedes agregar ${planCapacidadTotal} familiares en total.`);
            return;
        }

        const familyMemberData = {
            id_familiar: formData.get('id_familiar') || "",
            nombre1: formData.get('nombre1') || "",
            nombre2: formData.get('nombre2') || "",
            apellido1: formData.get('apellido1') || "",
            apellido2: formData.get('apellido2') || "",
            correo: formData.get('correo') || "",
            telefono: formData.get('telefono') || "",
            pais: formData.get('pais') || "",
            estado: formData.get('estado') || "",
            ciudad: formData.get('ciudad') || "",
            parentesco,
            ocupacion: formData.get('ocupacion') || "",
            id_usuario: allData.id_usuario
        };

        fetch('/api/users/addFamilyMember', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(familyMemberData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error al agregar familiar');
            }
        })
        .then(data => {
            alert('Familiar agregado exitosamente');
            familiaresActuales.push({ parentesco });
            if (familiaresActuales.length < planCapacidadTotal) {
                crearFormularioFamiliar(planNoDirectos, planCapacidadTotal, allData, familiaresActuales);
            } else {
                familyForm.innerHTML = '<p>Ya alcanzaste el máximo de familiares permitidos por tu plan.</p>';
                const finalizarBtn = document.createElement('button');
                finalizarBtn.textContent = 'Finalizar';
                finalizarBtn.type = 'button';
                finalizarBtn.className = 'finalizar-familiares';
                finalizarBtn.addEventListener('click', function() {
                    alert('Registro de familiares finalizado.');
                    window.location.href = '/login';
                });
            }
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
    });
}

module.exports = crearFormularioFamiliar;