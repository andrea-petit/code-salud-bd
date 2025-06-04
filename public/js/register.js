let ocupaciones = [];
let parentescosDirectos = [];
let parentescosNoDirectos = [];

async function getReferencias() {
    const { ocupaciones: o } = await fetch('api/users/ocupaciones')
        .then(res => res.json())
        .catch(err => {
            console.error('Error al obtener ocupaciones:', err);
            return { ocupaciones: [] };
        });
    const { parentescosDirectos: pd, parentescosNoDirectos: pnd } = await fetch('api/users/parentescos')
        .then(res => res.json())
        .catch(err => {
            console.error('Error al obtener parentescos:', err);
            return { parentescosDirectos: [], parentescosNoDirectos: [] };
        });
    ocupaciones = o || [];
    parentescosDirectos = pd || [];
    parentescosNoDirectos = pnd || [];
}

document.addEventListener('DOMContentLoaded', async function() {
    await getReferencias(); 

    const res = await fetch('/api/users/planes'); 
    const data = await res.json();
    const planes = data.planes; 

    const planesContainer = document.getElementById('planes-container');
    const planIdInput = document.getElementById('plan_id');
    const btnPersonalData = document.getElementById('submit-personal-data');
    const btnSelectPlan = document.getElementById('select-plan');
    const btnSubmitPayment = document.getElementById('submit-payment');
    let personalData = null; 

    planes.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'plan-card';
        card.dataset.planId = plan.id;
        card.innerHTML = `
            <h3>${plan.nombre}</h3>
            <p><li>Capacidad: ${plan.capacidad_total}</li></p>
            <p><li>No Directos: ${plan.max_no_directos}</li></p>
            <p><li>Precio: $${plan.precio_mensual}</li></p>
        `;
        card.addEventListener('click', function() {
            document.querySelectorAll('.plan-card.selected').forEach(el => el.classList.remove('selected'));
            card.classList.add('selected');
            planIdInput.value = plan.id;
        });
        planesContainer.appendChild(card);
    });

    btnPersonalData.addEventListener('click', function(e) {
        e.preventDefault();
        const form = document.getElementById('personal-data-form');
        personalData = {
            id_usuario: form.id_usuario.value,
            nombre1: form.nombre1.value,
            nombre2: form.nombre2.value,
            apellido1: form.apellido1.value,
            apellido2: form.apellido2.value,
            fecha_nacimiento: form.fecha_nacimiento.value,
            correo: form.correo.value,
            telefono: form.telefono.value,
            password: form.password.value,
            password2: form.password2.value,
            pais: form.pais.value,
            estado: form.estado.value,
            ciudad: form.ciudad.value,
            ocupacion: form.ocupacion.value,
        };

        document.getElementById('personal-data-container').style.display = 'none';
        document.getElementById('plan-selection').style.display = 'block';
    });

    btnSelectPlan.addEventListener('click', async function() {
        const selectedPlan = document.querySelector('.plan-card.selected');
        if (!selectedPlan) {
            alert('Por favor selecciona un plan.');
            return;
        }
        const planName = selectedPlan.querySelector('h3').textContent;
        if (!confirm(`¿Estás seguro de que deseas seleccionar el plan: ${planName}?`)) {
            return;
        }

        const planId = selectedPlan.dataset.planId;
        const planPrice = selectedPlan.querySelector('p:last-child').textContent;
         


        document.getElementById('plan-selection').style.display = 'none';
        document.getElementById('payment-container').style.display = 'block';
        const planInfoDiv = document.getElementById('plan-info');
        planInfoDiv.innerHTML = `
            <strong>Plan seleccionado:</strong> ${planName}<br>
            <strong>${planPrice}</strong>
        `;
    });

    btnSubmitPayment.addEventListener('click', async function(e) {
        e.preventDefault();

        const planId = planIdInput.value;
        const allData = {
            ...personalData,
            plan_id: Number(planId)
        };

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allData)
            });
            if (!response.ok) throw new Error('Error en el registro');
            await response.json();

            const paymentResponse = await fetch('/api/users/payment/' + allData.id_usuario, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: allData.plan_id })
            });
            if (!paymentResponse.ok) throw new Error('Error en el pago');
            await paymentResponse.json();

            alert('Registro y pago exitosos');
            document.getElementById('payment-container').style.display = 'none';
            document.getElementById('add-family-container').style.display = 'block';

            
            const userPlanData = await fetch(`/api/users/plan/${allData.id_usuario}`)
                .then(res => res.json())
                .then(data => data.plan)
            if (!userPlanData) {
                throw new Error('No se pudo obtener el plan del usuario');
            }
            const planNoDirectos = userPlanData.max_no_directos;
            const planCapacidadTotal = userPlanData.capacidad_total;

            crearFormularioFamiliar(
                planNoDirectos,
                planCapacidadTotal,
                allData,
                [] 
            );

        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
});

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
            }
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
    });
}

