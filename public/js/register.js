async function getOcupaciones_Parentescos(){
    

}

async function validarCantidadFamilia(id_usuario, no_directos, cantidad) {
    const planData = await fetch(`/api/users/plan/${id_usuario}`);
    const plan = await planData.json();
    const maxNoDirectos = plan.max_no_directos;
    const capacidadTotal = plan.capacidad_total;


    if (no_directos > maxNoDirectos) {
        alert(`El plan seleccionado solo permite ${maxNoDirectos} familiares no directos.`);
        return false;
    }
    if (cantidad > capacidadTotal) {
        alert(`El plan seleccionado solo permite un total de ${capacidadTotal} familiares (incluyendo directos y no directos).`);
        return false;
    }
    return true;
}

async function getUserPlan(id_usuario) {
    const response = await fetch(`/api/users/plan/${id_usuario}`);
    if (!response.ok) {
        throw new Error('Error al obtener el plan del usuario');
    }
    return response.json();
}

document.addEventListener('DOMContentLoaded', async function() {
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
            <p>Capacidad: ${plan.capacidad_total}</p>
            <p>No Directos: ${plan.max_no_directos}</p>
            <p>Precio: $${plan.precio_mensual}</p>
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

        console.log('Datos a enviar:', allData);
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

            
            const userPlanData = await getUserPlan(allData.id_usuario);
            const planNoDirectos = userPlanData.max_no_directos;
            crearFormularioFamiliar(planNoDirectos, allData);

        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
});

function crearFormularioFamiliar(planNoDirectos, allData) {
    const familiares = document.querySelectorAll('.family-member');
    let noDirectosActuales = 0;
    familiares.forEach(fam => {
        const select = fam.querySelector('select[name="parentesco"]');
        if (select && parentescosNoDirectos.includes(select.value)) {
            noDirectosActuales++;
        }
    });

    let opcionesParentesco = parentescosDirectos.slice();
    if (noDirectosActuales < planNoDirectos) {
        opcionesParentesco = opcionesParentesco.concat(parentescosNoDirectos);
    }

    const selectHtml = `
        <select name="parentesco" required>
            ${opcionesParentesco.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
    `;
    const ocupacionSelectHtml = `
        <select name="ocupacion" required>
            ${ocupaciones.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>
    `;

    const familyForm = document.getElementById('add-family-form');
    familyForm.innerHTML = ''; // Limpia el formulario anterior
    const familyMemberDiv = document.createElement('div');
    familyMemberDiv.className = 'family-member';
    familyMemberDiv.innerHTML = `
        <h4>Familiar</h4>
        <form>
            <input type="text" name="id_familiar" placeholder="Cédula del Familiar" required>
            <input type="text" name="nombre1" placeholder="Primer Nombre" required>
            <input type="text" name="nombre2" placeholder="Segundo Nombre">
            <input type="text" name="apellido1" placeholder="Primer Apellido" required>
            <input type="text" name="apellido2" placeholder="Segundo Apellido">
            <input type="email" name="correo" placeholder="Correo" required>
            <input type="text" name="telefono" placeholder="Teléfono">
            <input type="text" name="pais" placeholder="País" required>
            <input type="text" name="estado" placeholder="Estado" required>
            <input type="text" name="ciudad" placeholder="Ciudad" required>
            ${selectHtml}
            ${ocupacionSelectHtml}
            <button class="submit-family-member" type="button">Agregar Familiar</button>
        </form>
    `;

    familyForm.appendChild(familyMemberDiv);

    const submitFamilyMemberBtn = familyMemberDiv.querySelector('.submit-family-member');
    submitFamilyMemberBtn.addEventListener('click', async function() {
        const formData = new FormData(familyMemberDiv.querySelector('form'));
        const familyMemberData = {
            id_familiar: formData.get('id_familiar'),
            nombre1: formData.get('nombre1'),
            nombre2: formData.get('nombre2'),
            apellido1: formData.get('apellido1'),
            apellido2: formData.get('apellido2'),
            correo: formData.get('correo'),
            telefono: formData.get('telefono'),
            pais: formData.get('pais'),
            estado: formData.get('estado'),
            ciudad: formData.get('ciudad'),
            parentesco: formData.get('parentesco'),
            ocupacion: formData.get('ocupacion'),
            id_usuario: allData.id_usuario
        };

        let noDirectos = 0;
        document.querySelectorAll('.family-member').forEach(fam => {
            const select = fam.querySelector('select[name="parentesco"]');
            if (select && parentescosNoDirectos.includes(select.value)) {
                noDirectos++;
            }
        });
        const cantidadFamiliares = document.querySelectorAll('.family-member').length + 1;

        if (!await validarCantidadFamilia(allData.id_usuario, noDirectos, cantidadFamiliares)) {
            return;
        }

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
            if(cantidadFamiliares =  )
            crearFormularioFamiliar(planNoDirectos, allData);
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
    });
}