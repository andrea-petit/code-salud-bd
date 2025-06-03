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

        console.log('Datos a enviar:', allData);
        fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error en el registro');
            }
        })
        .then(data => {
            return fetch('/api/users/payment/' + allData.id_usuario, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: allData.plan_id })
            });
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error en el pago');
            }
        })
        .then(paymentData => {
            alert('Registro y pago exitosos');
            window.location.href = '/login'; 
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
    });
});