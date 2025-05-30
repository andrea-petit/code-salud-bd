document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const data = {
        nombre_usuario: form.id_usuario.value,
        contraseña: form.password.value
    };

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.user) {
                window.location.href = '/home';
            } else {
                alert('Usuario o contraseña incorrectos');
            }
            
        } else {
            alert(result.error);
        }
    } catch (err) {
        alert('Error de conexión con el servidor');
    }
});

document.getElementById('mostrarContrasena').addEventListener('change', function() {
    const passInput = document.querySelector('input[name="password"]');
    if (this.checked) {
        passInput.type = 'text';
    } else {
        passInput.type = 'password';
    }
});