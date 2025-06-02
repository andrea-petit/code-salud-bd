document.addEventListener('DOMContentLoaded', async function() {
    const res = await fetch('/api/users/planes'); 
    const data = await res.json();
    const planes = data.planes; 
    console.log('planes:', planes);

    const planesContainer = document.getElementById('planes-container');
    const planIdInput = document.getElementById('plan_id');
    const btnPersonalData = document.getElementById('submit-personal-data');
    const btnSelectPlan = document.getElementById('select-plan');
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

    
    btnSelectPlan.addEventListener('click', function() {
        if (!planIdInput.value) {
            alert('Por favor selecciona un plan.');
            return;
        }
        
        const allData = {
            ...personalData,
            plan_id: Number(planIdInput.value)
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
            alert('Registro exitoso');
            window.location.href = '/login';
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
    });
});