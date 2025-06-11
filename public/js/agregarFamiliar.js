export async function configurarBotonAgregarFamiliar(addFamBtn, familyMembersDiv, id_usuario, renderFamiliares) {
  addFamBtn.onclick = async function () {
    if (document.getElementById("formulario-agregar-familiar")) return;

    familyMembersDiv.style.display = 'none';

    try {
      const [planDataRes, familiaresRes, parentescosRes] = await Promise.all([
        fetch(`/api/users/plan/${id_usuario}`),
        fetch(`/api/users/familyMembers/${id_usuario}`),
        fetch('/api/users/parentescos')
      ]);

      if (!planDataRes.ok || !familiaresRes.ok) {
        alert('Error al obtener datos del plan o familiares');
        return;
      }

      const planData = await planDataRes.json();
      const familiaresActuales = (await familiaresRes.json()).familyMembers || [];

      const plan = planData.plan || {};
      const capacidadTotal = plan.capacidad_total || 0;
      const maxNoDirectos = plan.max_no_directos || 0;
      const parentescosData = await parentescosRes.json();
      const allParentescos = parentescosData.parentescos || [];

      const parentescosDirectos = allParentescos.filter(p => p.es_directo).map(p => p.descripcion);
      const parentescosNoDirectos = allParentescos.filter(p => !p.es_directo).map(p => p.descripcion);

      let madreUsada = false, padreUsado = false, noDirectosActuales = 0;
      familiaresActuales.forEach(f => {
        if (f.parentesco === "Madre") madreUsada = true;
        if (f.parentesco === "Padre") padreUsado = true;
        if (parentescosNoDirectos.includes(f.parentesco)) noDirectosActuales++;
      });

      if (familiaresActuales.length >= capacidadTotal) {
        alert("Ya alcanzaste el máximo de familiares permitidos por tu plan.");
        return;
      }

      const posiblesParentescos = [];
      if (!madreUsada && parentescosDirectos.includes("Madre")) posiblesParentescos.push("Madre");
      if (!padreUsado && parentescosDirectos.includes("Padre")) posiblesParentescos.push("Padre");
      posiblesParentescos.push(
        ...parentescosDirectos.filter(p => !["Madre", "Padre"].includes(p))
          .filter(p => !familiaresActuales.some(f => f.parentesco === p))
      );
      if (noDirectosActuales < maxNoDirectos) {
        posiblesParentescos.push(
          ...parentescosNoDirectos.filter(p => !familiaresActuales.some(f => f.parentesco === p))
        );
      }

      const form = document.createElement("form");
      form.innerHTML = `
        <h3>Agregar Familiar</h3>
        <input name="id_familiar" placeholder="Cédula" required><br>
        <input name="nombre1" placeholder="Primer nombre" required><br>
        <input name="nombre2" placeholder="Segundo nombre"><br>
        <input name="apellido1" placeholder="Primer apellido" required><br>
        <input name="apellido2" placeholder="Segundo apellido"><br>
        <input name="correo" placeholder="Correo"><br>
        <input name="telefono" placeholder="Teléfono"><br>
        <input name="pais" placeholder="País" required><br>
        <input name="estado" placeholder="Estado" required><br>
        <input name="ciudad" placeholder="Ciudad" required><br>
        <select name="parentesco" required>
          <option value="">Selecciona parentesco</option>
          ${posiblesParentescos.map(p => `<option value="${p}">${p}</option>`).join("")}
        </select><br>
        <select name="ocupacion" required>
          <option value="">Cargando ocupaciones...</option>
        </select><br>
        <button type="submit">Guardar</button>
        <button type="button" id="cancelar-agregar-familiar">Cancelar</button>
      `;

      const ocupacionSelect = form.querySelector('select[name="ocupacion"]');

      try {
        const ocupacionesRes = await fetch('/api/users/ocupaciones');
        if (!ocupacionesRes.ok) throw new Error("Error cargando ocupaciones");
        const ocupacionesData = await ocupacionesRes.json();
        if (Array.isArray(ocupacionesData.ocupaciones) && ocupacionesData.ocupaciones.length) {
          const opcionesOcupacion = ocupacionesData.ocupaciones
            .map(o => `<option value="${o.descripcion}">${o.descripcion}</option>`)
            .join('');
          ocupacionSelect.innerHTML = `<option value="">Selecciona ocupación</option>` + opcionesOcupacion;
        } else {
          ocupacionSelect.innerHTML = `<option value="">No hay ocupaciones disponibles</option>`;
        }
      } catch {
        ocupacionSelect.innerHTML = `<option value="">Error al cargar ocupaciones</option>`;
      }

      const formContainer = document.createElement("div");
      formContainer.id = "formulario-agregar-familiar";
      formContainer.style.marginTop = "20px";
      formContainer.appendChild(form);
      // Muestra el formulario
      familyMembersDiv.parentNode.insertBefore(formContainer, familyMembersDiv);

      form.querySelector('#cancelar-agregar-familiar').onclick = () => {
        formContainer.remove();
        familyMembersDiv.style.display = '';
      };

      form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const parentesco = formData.get("parentesco");
        const id_familiar = formData.get("id_familiar");

        if (familiaresActuales.find(f => f.id_familiar === id_familiar)) {
          alert("Ya has afiliado a un familiar con esa cédula.");
          return;
        }

        if (parentesco === "Madre" && madreUsada) {
          alert("Ya has registrado una madre.");
          return;
        }
        if (parentesco === "Padre" && padreUsado) {
          alert("Ya has registrado un padre.");
          return;
        }
        if (parentescosNoDirectos.includes(parentesco) && noDirectosActuales >= maxNoDirectos) {
          alert(`Solo puedes agregar ${maxNoDirectos} familiares no directos.`);
          return;
        }

        const payload = {
          id_usuario,
          id_familiar,
          nombre1: formData.get("nombre1"),
          nombre2: formData.get("nombre2"),
          apellido1: formData.get("apellido1"),
          apellido2: formData.get("apellido2"),
          correo: formData.get("correo"),
          telefono: formData.get("telefono"),
          pais: formData.get("pais"),
          estado: formData.get("estado"),
          ciudad: formData.get("ciudad"),
          parentesco,
          ocupacion: formData.get("ocupacion")
        };

        const res = await fetch('/api/users/addFamilyMember', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert("Familiar agregado con éxito.");
          formContainer.remove();
          await renderFamiliares(id_usuario);
          familyMembersDiv.style.display = '';
        } else {
          alert("Error al agregar el familiar.");
        }
      };
    } catch (error) {
      alert('Error inesperado: ' + error.message);
      familyMembersDiv.style.display = '';
    }
  }
}
